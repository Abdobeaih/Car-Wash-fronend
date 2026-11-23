import { fireEvent, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import BookingFlow from '@/app/[locale]/book/BookingFlow';
import type { AuthContextValue } from '@/lib/auth-context';
import type { AddOn, Booking, CarService, TimeSlot, User, Vehicle } from '@/lib/types';
import { renderWithIntl } from '../test-utils';

const h = vi.hoisted(() => ({
  search: new URLSearchParams(),
  push: vi.fn(),
  apiRequest: vi.fn(),
  user: { _id: 'u1', name: 'Abdo', email: 'abdo@test.com', role: 'CUSTOMER' } as User | null,
}));

vi.mock('@/lib/auth-context', () => ({
  useAuth: () => ({ user: h.user }) as unknown as AuthContextValue,
}));
vi.mock('@/lib/api', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/api')>();
  return { ...actual, apiRequest: h.apiRequest };
});
vi.mock('@/i18n/navigation', () => ({
  useRouter: () => ({ push: h.push, replace: vi.fn() }),
  Link: ({ href, children, ...rest }: { href: string; children: React.ReactNode }) => (
    <a href={href} {...rest}>{children}</a>
  ),
}));
vi.mock('next/navigation', () => ({
  useSearchParams: () => h.search,
}));

const svc1: CarService = {
  _id: 's1', name: 'Exterior Car Wash', slug: 'exterior-car-wash', description: '',
  image: '', basePrice: 200, duration: 60, isActive: true,
};
const svc2: CarService = {
  _id: 's2', name: 'Interior Cleaning', slug: 'interior-cleaning', description: '',
  image: '', basePrice: 150, duration: 45, isActive: true,
};
const addon1: AddOn = { _id: 'a1', name: 'Tire Cleaning', description: 'Shiny tires', price: 50, isActive: true };
const veh1: Vehicle = {
  _id: 'v1', userId: 'u1', brand: 'Toyota', model: 'Corolla', year: 2022,
  color: 'White', plateNumber: 'ABC123', vehicleType: 'SEDAN',
};
const slots: TimeSlot[] = [
  { start: '10:00', end: '11:00', available: true },
  { start: '11:00', end: '12:00', available: false },
];
const createdBooking: Booking = {
  _id: 'b1', customerId: 'u1', vehicleId: veh1, serviceId: svc1, addOnIds: [addon1],
  services: [{ serviceId: svc1, addOnIds: [addon1], duration: 60, subtotal: 250 }],
  date: '2026-11-30', startTime: '10:00', endTime: '11:00', duration: 60,
  subtotal: 250, total: 250, status: 'PENDING', paymentStatus: 'PENDING',
  location: { country: 'Egypt', city: 'Cairo', address: '12 Abbas El Akkad' },
};

function routeApi() {
  h.apiRequest.mockImplementation((path: string) => {
    if (path === '/services') return Promise.resolve([svc1, svc2]);
    if (path === '/add-ons') return Promise.resolve([addon1]);
    if (path === '/vehicles') return Promise.resolve([veh1]);
    if (path.startsWith('/availability')) return Promise.resolve(slots);
    if (path === '/bookings') return Promise.resolve(createdBooking);
    return Promise.reject(new Error(`unexpected call ${path}`));
  });
}

describe('BookingFlow', () => {
  beforeEach(() => {
    h.search=new URLSearchParams();
    h.push.mockReset();
    h.apiRequest.mockReset();
    h.user = { _id: 'u1', name: 'Abdo', email: 'abdo@test.com', role: 'CUSTOMER' };
  });

  it('walks the full wizard and submits the composed booking', async () => {
    routeApi();
    const user = userEvent.setup();
    renderWithIntl(<BookingFlow />);

    await screen.findByText('Exterior Car Wash');
    await user.click(screen.getByRole('button', { name: 'Continue' }));

    await user.click(await screen.findByText('Toyota Corolla'));
    await user.click(screen.getByRole('button', { name: 'Continue' }));

    await user.click(await screen.findByText('Tire Cleaning'));
    await user.click(screen.getByRole('button', { name: 'Continue' }));

    await user.type(await screen.findByLabelText('Country'), 'Egypt');
    await user.type(screen.getByLabelText('City'), 'Cairo');
    await user.type(screen.getByLabelText('Address'), '12 Abbas El Akkad');
    await user.click(screen.getByRole('button', { name: 'Continue' }));

    fireEvent.change(await screen.findByLabelText('Date'), { target: { value: '2026-11-30' } });
    await user.click(screen.getByRole('button', { name: 'Continue' }));

    const available = await screen.findByRole('button', { name: /^10:00/ });
    expect(screen.getByRole('button', { name: /^11:00/ })).toBeDisabled();
    await user.click(available);
    await user.click(screen.getByRole('button', { name: 'Review booking' }));

    expect((await screen.findAllByText('EGP 250')).length).toBeGreaterThan(0);
    await user.click(screen.getByRole('button', { name: 'Confirm booking' }));

    await waitFor(() =>
      expect(h.apiRequest).toHaveBeenCalledWith('/bookings', {
        method: 'POST',
        auth: true,
        body: {
          vehicleId: 'v1',
          services: [{ serviceId: 's1', addOnIds: ['a1'] }],
          date: '2026-11-30',
          startTime: '10:00',
          location: { country: 'Egypt', city: 'Cairo', address: '12 Abbas El Akkad', notes: undefined },
        },
      }),
    );
    expect(await screen.findByText('Booking request received')).toBeInTheDocument();
    expect(screen.getByText(/Booking ID: b1/)).toBeInTheDocument();
  });

  it('sends anonymous visitors to login before the vehicle step', async () => {
    h.user = null;
    routeApi();
    const user = userEvent.setup();
    renderWithIntl(<BookingFlow />);
    await screen.findByText('Exterior Car Wash');
    await user.click(screen.getByRole('button', { name: 'Continue' }));
    expect(h.push).toHaveBeenCalledWith('/login?next=/book');
    expect(screen.queryByText('Toyota Corolla')).not.toBeInTheDocument();
  });

  it('shows the load error when services cannot be fetched', async () => {
    h.apiRequest.mockRejectedValue(new Error('API down'));
    renderWithIntl(<BookingFlow />);
    expect(await screen.findByRole('alert')).toHaveTextContent('API down');
  });
 it('redeems a plan through normal location and availability, not ordinary booking',async()=>{
  h.search=new URLSearchParams('plan=p1&service=s1');
  h.apiRequest.mockImplementation((path:string)=>{
   if(path==='/plans/enrollments')return Promise.resolve([{_id:'p1',vehicleId:veh1,name:'Monthly Exterior',nameAr:'الخارجية الشهرية',endsAt:'2030-12-01',remaining:{'exterior-car-wash':4},serviceIds:{'exterior-car-wash':'s1'}}]);
   if(path==='/services')return Promise.resolve([svc1,svc2]);
   if(path==='/add-ons')return Promise.resolve([addon1]);
   if(path==='/vehicles')return Promise.resolve([veh1]);
   if(path.startsWith('/availability'))return Promise.resolve(slots);
   if(path==='/plans/enrollments/p1/visits')return Promise.resolve({...createdBooking,total:0});
   return Promise.reject(Error(path));
  });
  const user=userEvent.setup();renderWithIntl(<BookingFlow plansEnabled/>);
  await screen.findByText('Exterior Car Wash');
  expect(screen.queryByText('Interior Cleaning')).not.toBeInTheDocument();
  await user.click(screen.getByRole('button',{name:'Continue'}));
  await screen.findByText('Covered visits include the selected service only, without add-ons.');
  expect(screen.queryByText('Tire Cleaning')).not.toBeInTheDocument();
  await user.click(screen.getByRole('button',{name:'Continue'}));
  await user.type(screen.getByLabelText('Country'),'Egypt');
  await user.type(screen.getByLabelText('City'),'Cairo');
  await user.type(screen.getByLabelText('Address'),'12 Test Street');
  await user.click(screen.getByRole('button',{name:'Continue'}));
  fireEvent.change(screen.getByLabelText('Date'),{target:{value:'2026-11-30'}});
  await user.click(screen.getByRole('button',{name:'Continue'}));
  await user.click(await screen.findByRole('button',{name:'10:00 – 11:00'}));
  await user.click(screen.getByRole('button',{name:'Review booking'}));
  expect(screen.queryByRole('button',{name:'Add another service'})).not.toBeInTheDocument();
  await user.click(screen.getByRole('button',{name:'Confirm booking'}));
  await waitFor(()=>expect(h.apiRequest).toHaveBeenCalledWith('/plans/enrollments/p1/visits',expect.objectContaining({method:'POST',body:expect.objectContaining({requestKey:expect.any(String),booking:expect.objectContaining({vehicleId:'v1',services:[{serviceId:'s1',addOnIds:[]}]})})})));
  expect(h.apiRequest.mock.calls.some(call=>call[0]==='/bookings')).toBe(false);
 });

 describe('interior plan rescheduling',()=>{
  function interiorRoute(){
   // A stale/malicious exterior query must not change the original visit.
   h.search=new URLSearchParams('plan=p1&reschedule=b1&service=s1');
   h.apiRequest.mockImplementation((path:string)=>{
    if(path==='/services')return Promise.resolve([svc1,svc2]);
    if(path==='/add-ons')return Promise.resolve([addon1]);
    if(path==='/vehicles')return Promise.resolve([veh1]);
    if(path==='/plans/enrollments')return Promise.resolve([{_id:'p1',vehicleId:veh1,name:'Interior & Exterior',endsAt:'2030-12-01',remaining:{exterior:4,interior:0},serviceIds:{exterior:'s1',interior:'s2'}}]);
    if(path==='/bookings/b1')return Promise.resolve({...createdBooking,enrollmentId:'p1',serviceId:svc2,services:[{serviceId:svc2,addOnIds:[]}]});
    if(path.startsWith('/availability'))return Promise.resolve(slots);
    if(path==='/plans/enrollments/p1/visits/b1/reschedule')return Promise.resolve({...createdBooking,serviceId:svc2,total:0});
    return Promise.reject(Error(path));
   });
  }
  it('keeps the interior service when navigating back through service selection',async()=>{
   interiorRoute();const user=userEvent.setup();renderWithIntl(<BookingFlow plansEnabled/>);
   await screen.findByLabelText('Date');
   await user.click(screen.getByRole('button',{name:'Back'})); // location
   await user.click(screen.getByRole('button',{name:'Back'})); // add-ons
   await user.click(screen.getByRole('button',{name:'Back'})); // must return to service, not loop
   const radio=await screen.findByRole('radio',{name:/Interior Cleaning/});
   expect(radio).toBeChecked();expect(screen.queryByText('Exterior Car Wash')).not.toBeInTheDocument();
   await user.click(screen.getByRole('button',{name:'Continue'}));
   await user.click(screen.getByRole('button',{name:'Continue'}));
   await user.click(screen.getByRole('button',{name:'Continue'}));
   fireEvent.change(await screen.findByLabelText('Date'),{target:{value:'2026-11-30'}});
   await user.click(screen.getByRole('button',{name:'Continue'}));
   await user.click(await screen.findByRole('button',{name:'10:00 – 11:00'}));
   await user.click(screen.getByRole('button',{name:'Review booking'}));
   await user.click(screen.getByRole('button',{name:'Confirm booking'}));
   await waitFor(()=>expect(h.apiRequest).toHaveBeenCalledWith('/plans/enrollments/p1/visits/b1/reschedule',expect.objectContaining({body:expect.objectContaining({booking:expect.objectContaining({services:[{serviceId:'s2',addOnIds:[]}]})})})));
  });
  it('reschedules an exhausted interior allowance without using the exterior service',async()=>{
   interiorRoute();const user=userEvent.setup();renderWithIntl(<BookingFlow plansEnabled/>);
   fireEvent.change(await screen.findByLabelText('Date'),{target:{value:'2026-11-30'}});
   await user.click(screen.getByRole('button',{name:'Continue'}));
   await user.click(await screen.findByRole('button',{name:'10:00 – 11:00'}));
   await user.click(screen.getByRole('button',{name:'Review booking'}));
   expect(screen.getByText('Interior Cleaning')).toBeInTheDocument();
   await user.click(screen.getByRole('button',{name:'Confirm booking'}));
   await waitFor(()=>expect(h.apiRequest).toHaveBeenCalledWith('/plans/enrollments/p1/visits/b1/reschedule',expect.objectContaining({body:expect.objectContaining({booking:expect.objectContaining({services:[{serviceId:'s2',addOnIds:[]}]})})})));
  });
 });

});
