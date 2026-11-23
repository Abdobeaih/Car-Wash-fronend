import {screen,waitFor} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {beforeEach,describe,expect,it,vi} from 'vitest';
import EnrollmentsPanel from '@/components/EnrollmentsPanel';
import AdminEnrollments from '@/components/AdminEnrollments';
import {renderWithIntl} from '../test-utils';
const h=vi.hoisted(()=>({api:vi.fn()}));
vi.mock('@/lib/api',()=>({apiRequest:h.api}));
vi.mock('@/i18n/navigation',()=>({Link:({href,children,...rest}:{href:string;children:React.ReactNode})=><a href={href} {...rest}>{children}</a>}));
const vehicle={_id:'v1',brand:'Toyota',model:'Corolla',plateNumber:'ABC123'};
const plan={_id:'p1',name:'Monthly Exterior',nameAr:'الخارجية الشهرية',price:750,endsAt:'2030-12-01',status:'ACTIVE',vehicleId:vehicle,remaining:{'exterior-car-wash':4},serviceIds:{'exterior-car-wash':'s1'}};
describe('Enrollment controls',()=>{
 beforeEach(()=>{h.api.mockReset();vi.spyOn(window,'confirm').mockReturnValue(true);});
 it('shows customer allowance and uses explicit period-end cancellation',async()=>{h.api.mockResolvedValue([plan]);const user=userEvent.setup();renderWithIntl(<EnrollmentsPanel/>);expect(await screen.findByRole('link',{name:'Book a visit'})).toHaveAttribute('href','/book?plan=p1&service=s1');await user.click(screen.getByRole('button',{name:'End plan at period end'}));await waitFor(()=>expect(h.api).toHaveBeenCalledWith('/plans/enrollments/p1/cancel',{method:'POST',auth:true}));expect(window.confirm).toHaveBeenCalled();});
 it('does not show an action for an expired plan',async()=>{h.api.mockResolvedValue([{...plan,endsAt:'2020-01-01'}]);renderWithIntl(<EnrollmentsPanel/>);await screen.findByText('Plan expired');expect(screen.queryByRole('link',{name:'Book a visit'})).not.toBeInTheDocument();});
 it('requires payment checkbox and binds admin activation to a selected owner vehicle',async()=>{h.api.mockImplementation((path:string)=>{if(path==='/admin/customers')return Promise.resolve([{_id:'c1',name:'Customer',email:'fixture@example.test'}]);if(path==='/plans/admin/enrollments')return Promise.resolve([]);if(path==='/plans/admin/summary')return Promise.resolve({recordedPlanPayments:0});if(path==='/plans/admin/customers/c1/vehicles')return Promise.resolve([vehicle]);return Promise.resolve(plan);});const user=userEvent.setup();renderWithIntl(<AdminEnrollments/>);expect(await screen.findByRole('button',{name:'Confirm activation'})).toBeDisabled();await user.selectOptions(screen.getByLabelText('Customer'),'c1');await screen.findByRole('option',{name:'Toyota Corolla · ABC123'});await user.selectOptions(screen.getByLabelText('Vehicle'),'v1');expect(screen.getByRole('button',{name:'Confirm activation'})).toBeDisabled();await user.click(screen.getByRole('checkbox'));await user.click(screen.getByRole('button',{name:'Confirm activation'}));await waitFor(()=>expect(h.api).toHaveBeenCalledWith('/plans/admin/enrollments',expect.objectContaining({method:'POST',body:expect.objectContaining({customerId:'c1',vehicleId:'v1',planCode:'monthlyExterior',paymentReceived:true,activationKey:expect.any(String)})})));});
});
