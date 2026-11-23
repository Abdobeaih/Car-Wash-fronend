import {fireEvent,screen} from '@testing-library/react';
import {describe,it,vi,expect} from 'vitest';
import Header from '@/components/Header';
import {renderWithIntl} from '../test-utils';
const h=vi.hoisted(()=>({auth:{user:null,loading:true,logout:vi.fn()} as {user:null|{role:string};loading:boolean;logout:ReturnType<typeof vi.fn>}}));
vi.mock('@/lib/auth-context',()=>({useAuth:()=>h.auth}));
vi.mock('@/i18n/navigation',()=>({Link:({href,children,...rest}:{href:string;children:React.ReactNode})=><a href={href} {...rest}>{children}</a>,useRouter:()=>({push:vi.fn(),replace:vi.fn()}),usePathname:()=>'/'}));
describe('Header dashboard destination',()=>{
 it.each([['ADMIN','/admin'],['CUSTOMER','/dashboard']])('directly routes signed-in %s on desktop and mobile',(role,href)=>{
  h.auth={user:{role},loading:false,logout:vi.fn()};renderWithIntl(<Header/>);
  expect(screen.getByRole('link',{name:'Dashboard'})).toHaveAttribute('href',href);
  fireEvent.click(screen.getByRole('button',{name:'Open menu'}));
  expect(screen.getAllByRole('link',{name:'Dashboard'})).toHaveLength(2);
  for(const link of screen.getAllByRole('link',{name:'Dashboard'}))expect(link).toHaveAttribute('href',href);
 });
 it('does not offer dashboard or login while restoration is in progress',()=>{
  h.auth={user:null,loading:true,logout:vi.fn()};renderWithIntl(<Header/>);
  fireEvent.click(screen.getByRole('button',{name:'Open menu'}));
  expect(screen.queryByRole('link',{name:'Dashboard'})).toBeNull();
  expect(screen.queryByRole('link',{name:'Log in'})).toBeNull();
 });
});
