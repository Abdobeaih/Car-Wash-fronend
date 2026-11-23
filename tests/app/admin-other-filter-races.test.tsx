import {act,fireEvent,screen} from '@testing-library/react';
import {describe,it,vi,expect} from 'vitest';
import Customers from '@/app/[locale]/admin/customers/page';
import Calendar from '@/app/[locale]/admin/calendar/page';
import {renderWithIntl} from '../test-utils';
const h=vi.hoisted(()=>({api:vi.fn()}));
vi.mock('@/lib/api',()=>({apiRequest:h.api}));
vi.mock('@/i18n/navigation',()=>({Link:({children,href}:{children:React.ReactNode;href:string})=><a href={href}>{children}</a>}));
function deferred<T>(){let resolve!:(v:T)=>void;let reject!:(e:Error)=>void;const promise=new Promise<T>((res,rej)=>{resolve=res;reject=rej});return {resolve,reject,promise};}
describe('Other admin filter response ordering',()=>{
 for(const failure of [false,true])it(`customer search ignores obsolete ${failure?'errors':'data'}`,async()=>{
  const older=deferred<unknown[]>(),newer=deferred<unknown[]>();
  h.api.mockReset().mockResolvedValueOnce([]).mockReturnValueOnce(older.promise).mockReturnValueOnce(newer.promise);
  renderWithIntl(<Customers/>);await screen.findByText('No customers found');
  const input=screen.getByPlaceholderText('Search by name or email');
  fireEvent.change(input,{target:{value:'old'}});fireEvent.submit(input.closest('form')!);
  fireEvent.change(input,{target:{value:'new'}});fireEvent.submit(input.closest('form')!);
  await act(async()=>newer.resolve([{_id:'new',name:'Newest Customer',email:'new@example.test',role:'CUSTOMER',bookingCount:2}]));
  await act(async()=>failure?older.reject(new Error('obsolete failure')):older.resolve([]));
  expect(screen.getAllByText('Newest Customer').length).toBeGreaterThan(0);
  expect(screen.queryByText('obsolete failure')).not.toBeInTheDocument();
 });
 for(const failure of [false,true])it(`calendar ignores obsolete ${failure?'errors':'data'}`,async()=>{
  const older=deferred<unknown[]>(),newer=deferred<unknown[]>();
  h.api.mockReset().mockResolvedValueOnce([]).mockReturnValueOnce(older.promise).mockReturnValueOnce(newer.promise);
  renderWithIntl(<Calendar/>);await screen.findByRole('heading',{name:'Calendar'});
  fireEvent.click(screen.getByRole('button',{name:'Next'}));
  fireEvent.click(screen.getByRole('button',{name:'Next'}));
  const url=h.api.mock.calls[2][0] as string;
  const date=new URLSearchParams(url.split('?')[1]).get('start');
  await act(async()=>newer.resolve([{_id:'latest-booking',date,startTime:'10:00',serviceId:{name:'Latest Service'},customerId:{name:'Test'},total:20}]));
  await act(async()=>failure?older.reject(new Error('obsolete failure')):older.resolve([]));
  expect(screen.getByText(/Latest Service/)).toBeInTheDocument();
  expect(screen.queryByText('obsolete failure')).not.toBeInTheDocument();
 });
});
