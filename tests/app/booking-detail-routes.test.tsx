import {NextIntlClientProvider} from 'next-intl';
import messages from '../../messages/en.json';
import {act,screen} from '@testing-library/react';
import {beforeEach,describe,it,vi,expect} from 'vitest';
import CustomerDetail from '@/app/[locale]/dashboard/bookings/[id]/page';
import AdminDetail from '@/app/[locale]/admin/bookings/[id]/page';
import {renderWithIntl} from '../test-utils';
const h=vi.hoisted(()=>({api:vi.fn(),id:'first'}));
vi.mock('@/lib/api',()=>({apiRequest:h.api}));
vi.mock('next/navigation',()=>({useParams:()=>({id:h.id})}));
vi.mock('@/i18n/navigation',()=>({useRouter:()=>({push:vi.fn()}),Link:({children,href}:{children:React.ReactNode;href:string})=><a href={href}>{children}</a>}));
function deferred(){let resolve!:(v:unknown)=>void;const promise=new Promise(res=>resolve=res);return {resolve,promise};}
const row=(id:string)=>({_id:id,customerId:null,vehicleId:null,serviceId:null,addOnIds:[],date:'2030-01-01',startTime:'10:00',endTime:'11:00',duration:60,subtotal:200,total:200,status:'PENDING',paymentStatus:'PENDING',location:{address:'Address '+id,city:'Cairo',country:'Egypt'}});
beforeEach(()=>{h.api.mockReset();h.id='first';});
describe('Detail route changes',()=>{
 for(const [name,Page] of [['customer',CustomerDetail],['admin',AdminDetail]] as const){
  it(`${name} hides previous record while next record loads`,async()=>{
   const next=deferred();h.api.mockResolvedValueOnce(row('first')).mockReturnValueOnce(next.promise);
   const view=renderWithIntl(<Page/>);await screen.findByText('Address first');
   h.id='second';view.rerender(<NextIntlClientProvider locale="en" messages={messages} timeZone="Africa/Cairo"><Page/></NextIntlClientProvider>);
   expect(screen.queryByText('Address first')).not.toBeInTheDocument();
   await act(async()=>next.resolve(row('second')));
   expect(await screen.findByText('Address second')).toBeInTheDocument();
  });
  it(`${name} ignores late previous-route response`,async()=>{
   const first=deferred(),second=deferred();h.api.mockReturnValueOnce(first.promise).mockReturnValueOnce(second.promise);
   const view=renderWithIntl(<Page/>);h.id='second';view.rerender(<NextIntlClientProvider locale="en" messages={messages} timeZone="Africa/Cairo"><Page/></NextIntlClientProvider>);
   await act(async()=>second.resolve(row('second')));await screen.findByText('Address second');
   await act(async()=>first.resolve(row('first')));
   expect(screen.getByText('Address second')).toBeInTheDocument();expect(screen.queryByText('Address first')).not.toBeInTheDocument();
  });
 }
});
