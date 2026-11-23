import {describe,expect,it} from 'vitest';
import ar from '../../messages/ar.json';
import en from '../../messages/en.json';

describe('Natural bilingual copy',()=>{
 it('keeps cancellation and payment explanations explicit',()=>{
  expect(en.BookingDetail.keepIt).toBe('Keep booking');
  expect(ar.BookingDetail.keepIt).toBe('الاحتفاظ بالحجز');
  expect(ar.PaymentRecord.confirmPending).toContain('لا يؤدي إلى رد أي مبلغ');
 });
 it('does not claim notification delivery after a status save',()=>{
  expect(en.AdminBookingDetail.marked).toBe('Booking status changed to {status}.');
  expect(ar.AdminBookingDetail.marked).toBe('تم تغيير حالة الحجز إلى {status}.');
 });
 it('keeps both language catalogs structurally aligned',()=>{
  function leaves(value:unknown,prefix=''):string[]{
   if(value && typeof value==='object')return Object.entries(value).flatMap(([k,v])=>leaves(v,`${prefix}.${k}`));
   return [prefix];
  }
  expect(leaves(ar)).toEqual(leaves(en));
 });
});
