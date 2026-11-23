import { describe, expect, it } from 'vitest';
import { bookingLines } from '@/lib/booking-lines';
import type { Booking } from '@/lib/types';

function baseBooking(overrides: Partial<Booking>): Booking {
  return {
    _id: 'b1',
    customerId: 'u1',
    vehicleId: 'v1',
    serviceId: 's1',
    addOnIds: [],
    date: '2026-11-25',
    startTime: '10:00',
    endTime: '11:00',
    duration: 60,
    subtotal: 200,
    total: 200,
    status: 'PENDING',
    paymentStatus: 'PENDING',
    location: { country: 'EG', city: 'Cairo', address: '1 Street' },
    ...overrides,
  };
}

describe('bookingLines', () => {
  it('maps every entry of a multi-service booking', () => {
    const booking = baseBooking({
      services: [
        {
          serviceId: { name: 'Exterior Car Wash' } as never,
          addOnIds: [{ name: 'Tire Cleaning', price: 50 }] as never,
          duration: 45,
          subtotal: 250,
        },
        { serviceId: 's2', addOnIds: [], duration: 30, subtotal: 100 },
      ],
    });
    const lines = bookingLines(booking);
    expect(lines).toHaveLength(2);
    expect(lines[0]).toEqual({
      service: { name: 'Exterior Car Wash', basePrice: undefined },
      addOns: [{ name: 'Tire Cleaning', price: 50 }],
      duration: 45,
      subtotal: 250,
    });
    expect(lines[1].service.name).toBe('Service');
  });

  it('keeps populated basePrice when available', () => {
    const booking = baseBooking({
      services: [
        {
          serviceId: { name: 'Full Car Detailing', basePrice: 900 } as never,
          addOnIds: [],
        },
      ],
    });
    expect(bookingLines(booking)[0].service.basePrice).toBe(900);
  });

  it('falls back to the legacy single-service shape when services is empty', () => {
    const booking = baseBooking({
      services: [],
      serviceId: { name: 'Interior Cleaning' } as never,
      addOnIds: [{ name: 'Odor Treatment', price: 80 }] as never,
    });
    const lines = bookingLines(booking);
    expect(lines).toHaveLength(1);
    expect(lines[0].service.name).toBe('Interior Cleaning');
    expect(lines[0].subtotal).toBe(200);
  });

  it('labels unknown add-ons instead of leaking undefined', () => {
    const booking = baseBooking({ addOnIds: ['a1', 'a2'] as never });
    const lines = bookingLines(booking);
    expect(lines[0].addOns).toEqual([
      { name: 'Add-on', price: undefined },
      { name: 'Add-on', price: undefined },
    ]);
  });
});
