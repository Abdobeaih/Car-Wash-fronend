import {screen} from '@testing-library/react';
import {beforeEach,describe,it,vi,expect} from 'vitest';
import CustomerDetail from '@/app/[locale]/dashboard/bookings/[id]/page';
import AdminDetail from '@/app/[locale]/admin/bookings/[id]/page';
import {renderWithIntl} from '../test-utils';
const h=vi.hoisted(()=>({api:vi.fn()}));
vi.mock('@/lib/api',()=>({apiRequest:h.api}));
vi.mock('next/navigation',()=>({useParams:()=>({id:'history-1'})}));
vi.mock('@/i18n/navigation',()=>({useRouter:()=>({push:vi.fn()}),Link:({children,href}:{children:React.ReactNode;href:string})=><a href={href}>{children}</a>}));
beforeEach(()=>h.api.mockReset());
describe('historical bookings with deleted relations',()=>{
 for(const [name,Page] of [['customer',CustomerDetail],['admin',AdminDetail]] as const){
  for(const locale of ['en','ar'] as const){
   it(`${name} detail stays readable in ${locale}`,async()=>{
    h.api.mockResolvedValue({_id:'history-1',customerId:null,vehicleId:null,serviceId:null,addOnIds:[],date:'2026-11-24',startTime:'10:00',endTime:'11:00',duration:60,subtotal:200,total:200,status:'COMPLETED',paymentStatus:'PAID',location:{address:'Test address',city:'Cairo',country:'Egypt'}});
    renderWithIntl(<Page/>,locale);
    expect(await screen.findByText(locale==='ar'?'بيانات السيارة غير متاحة':'Vehicle details unavailable')).toBeInTheDocument();
    expect(screen.getAllByText(locale==='ar'?'بيانات الخدمة غير متاحة':'Service details unavailable').length).toBeGreaterThan(0);
    expect(screen.getByText('Test address')).toBeInTheDocument();
    if(name==='admin')expect(screen.getByText(locale==='ar'?'بيانات العميل غير متاحة':'Customer details unavailable')).toBeInTheDocument();
   });
  }
 }
});
