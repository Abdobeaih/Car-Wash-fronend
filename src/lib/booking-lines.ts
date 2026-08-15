import type { Booking } from './types';

export interface BookingLine {
  service: { name: string; basePrice?: number };
  addOns: Array<{ name: string; price?: number }>;
  duration?: number;
  subtotal?: number;
}

export function bookingLines(booking: Booking): BookingLine[] {
  if (Array.isArray(booking.services) && booking.services.length > 0) {
    return booking.services.map((item) => {
      const svc = item.serviceId as { name?: string; basePrice?: number } | string;
      const addOns = (Array.isArray(item.addOnIds) ? item.addOnIds : []) as Array<{
        name?: string;
        price?: number;
      }>;
      return {
        service: {
          name: typeof svc === 'object' && svc?.name ? svc.name : 'Service',
          basePrice: typeof svc === 'object' ? svc?.basePrice : undefined,
        },
        addOns: addOns.map((a) => ({ name: a?.name ?? 'Add-on', price: a?.price })),
        duration: item.duration,
        subtotal: item.subtotal,
      };
    });
  }

  const svc = booking.serviceId as { name?: string } | string;
  const addOns = (Array.isArray(booking.addOnIds) ? booking.addOnIds : []) as Array<{
    name?: string;
    price?: number;
  }>;
  return [
    {
      service: {
        name: typeof svc === 'object' && svc?.name ? svc.name : 'Service',
        basePrice: undefined,
      },
      addOns: addOns.map((a) => ({ name: a?.name ?? 'Add-on', price: a?.price })),
      duration: booking.duration,
      subtotal: booking.subtotal,
    },
  ];
}