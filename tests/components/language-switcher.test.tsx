import {describe,it,vi,expect} from 'vitest';
import {replaceLocaleLocation} from '@/components/LanguageSwitcher';

describe('LanguageSwitcher browser navigation',()=>{
 it('round-trips nested path, query and fragment without duplication',()=>{
  const location={href:'https://mobilecarcare.vercel.app/en/dashboard/profile?filter=active#details',replace:vi.fn()};
  replaceLocaleLocation(location,'ar');
  expect(location.replace).toHaveBeenLastCalledWith('https://mobilecarcare.vercel.app/ar/dashboard/profile?filter=active#details');
  location.href=location.replace.mock.calls[0][0];
  replaceLocaleLocation(location,'en');
  expect(location.replace).toHaveBeenLastCalledWith('https://mobilecarcare.vercel.app/en/dashboard/profile?filter=active#details');
 });
 it('keeps repeated query values, encoding and a locale-like path segment',()=>{
  const location={href:'https://mobilecarcare.vercel.app/en/dashboard/ar?a=1&a=2&q=a%20b#part%202',replace:vi.fn()};
  replaceLocaleLocation(location,'ar');
  expect(location.replace).toHaveBeenCalledWith('https://mobilecarcare.vercel.app/ar/dashboard/ar?a=1&a=2&q=a%20b#part%202');
 });
});
