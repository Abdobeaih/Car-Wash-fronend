import {act,fireEvent,screen} from '@testing-library/react';
import {describe,it,vi,expect} from 'vitest';
import AdminBookings from '@/app/[locale]/admin/bookings/page';
import {renderWithIntl} from '../test-utils';
const h=vi.hoisted(()=>({api:vi.fn()}));
vi.mock('@/lib/api',()=>({apiRequest:h.api}));
vi.mock('@/i18n/navigation',()=>({Link:({children,href}:{children:React.ReactNode;href:string})=><a href={href}>{children}</a>}));
function deferred<T>(){let resolve!:(v:T)=>void;let reject!:(e:Error)=>void;const promise=new Promise<T>((res,rej)=>{resolve=res;reject=rej});return {resolve,reject,promise};}
const row={_id:'new-row',customerId:{name:'Filtered Customer'},vehicleId:null,serviceId:null,addOnIds:[],date:'2030-01-01',startTime:'10:00',total:200,status:'PENDING'};
describe('Admin booking filter responses',()=>{
 for(const failure of [false,true])it(`ignores an obsolete ${failure?'failed':'successful'} request`,async()=>{
  const older=deferred<unknown[]>(),newer=deferred<unknown[]>();
  h.api.mockReset().mockResolvedValueOnce([]).mockReturnValueOnce(older.promise).mockReturnValueOnce(newer.promise);
  renderWithIntl(<AdminBookings/>);await screen.findByText('No bookings found');
  fireEvent.change(screen.getByRole('combobox',{name:'Status'}),{target:{value:'CONFIRMED'}});
  fireEvent.change(screen.getByRole('combobox',{name:'Status'}),{target:{value:'PENDING'}});
  await act(async()=>newer.resolve([row]));
  expect(screen.getAllByText('Filtered Customer').length).toBeGreaterThan(0);
  await act(async()=>failure?older.reject(new Error('old request failed')):older.resolve([]));
  expect(screen.getAllByText('Filtered Customer').length).toBeGreaterThan(0);
  expect(screen.queryByText('old request failed')).not.toBeInTheDocument();
 });
});
