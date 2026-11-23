import {act,renderHook,waitFor} from '@testing-library/react';
import {beforeEach,describe,it,vi,expect} from 'vitest';
import {useAvailability} from '@/lib/use-availability';
const h=vi.hoisted(()=>({api:vi.fn()}));
vi.mock('@/lib/api',()=>({apiRequest:h.api}));
beforeEach(()=>h.api.mockReset());
describe('booking availability',()=>{
 it('rechecks the same date when returning to the time step',async()=>{
  h.api.mockResolvedValue([]);const r=renderHook(({on})=>useAvailability(on,'2030-01-01','s1'),{initialProps:{on:true}});
  await waitFor(()=>expect(r.result.current.loading).toBe(false));r.rerender({on:false});r.rerender({on:true});
  await waitFor(()=>expect(h.api).toHaveBeenCalledTimes(2));
 });
 it('ignores an older date response that arrives after the latest date',async()=>{
  let old!:(v:unknown)=>void;h.api.mockImplementationOnce(()=>new Promise(r=>old=r)).mockResolvedValueOnce([{start:'12:00',end:'13:00',available:true}]);
  const r=renderHook(({date})=>useAvailability(true,date,'s1'),{initialProps:{date:'2030-01-01'}});r.rerender({date:'2030-01-02'});
  await waitFor(()=>expect(r.result.current.slots?.[0].start).toBe('12:00'));
  await act(async()=>old([{start:'09:00',end:'10:00',available:true}]));expect(r.result.current.slots?.[0].start).toBe('12:00');
 });
 it('allows a failed availability lookup to be retried without changing the date',async()=>{
  h.api.mockRejectedValueOnce(new Error('offline')).mockResolvedValueOnce([]);const r=renderHook(()=>useAvailability(true,'2030-01-01','s1'));
  await waitFor(()=>expect(r.result.current.error).toBe('offline'));act(()=>r.result.current.retry());await waitFor(()=>expect(r.result.current.slots).toEqual([]));expect(r.result.current.error).toBeNull();
 });
 it('does not fetch while outside the time step',()=>{
  renderHook(()=>useAvailability(false,'2030-01-01','s1'));expect(h.api).not.toHaveBeenCalled();
 });
});
