import {fireEvent,screen} from '@testing-library/react';
import {describe,it,vi,expect} from 'vitest';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import {renderWithIntl} from '../test-utils';
const h=vi.hoisted(()=>({replace:vi.fn()}));
vi.mock('@/i18n/navigation',()=>({useRouter:()=>({replace:h.replace}),usePathname:()=>'/dashboard/profile'}));
describe('LanguageSwitcher',()=>{
 it('keeps the current page, query, hash and scroll when changing locale',()=>{
  window.history.replaceState({},'','/en/dashboard/profile?filter=active#details');
  renderWithIntl(<LanguageSwitcher/>);
  fireEvent.click(screen.getByRole('button',{name:'Switch to Arabic'}));
  expect(h.replace).toHaveBeenCalledWith('/dashboard/profile?filter=active#details',{locale:'ar',scroll:false});
 });
});
