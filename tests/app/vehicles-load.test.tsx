import {screen,fireEvent} from '@testing-library/react';
import {beforeEach,describe,it,vi,expect} from 'vitest';
import Vehicles from '@/app/[locale]/dashboard/vehicles/page';
import {renderWithIntl} from '../test-utils';
const h=vi.hoisted(()=>({api:vi.fn()}));
vi.mock('@/lib/api',()=>({apiRequest:h.api}));
beforeEach(()=>h.api.mockReset());
describe('vehicle load recovery',()=>{
 it('shows failure and retries instead of spinning forever',async()=>{
  h.api.mockRejectedValueOnce(new Error('offline')).mockResolvedValueOnce([]);
  renderWithIntl(<Vehicles/>);expect(await screen.findByText('offline')).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button',{name:'Try again'}));
  expect(await screen.findByRole('heading',{name:'My Vehicles'})).toBeInTheDocument();
 });
});
