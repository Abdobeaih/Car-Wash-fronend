'use client';

import Link from 'next/link';
import { useEffect, useMemo, useRef, useState, type FormEvent, type KeyboardEvent } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { apiRequest } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import type { AddOn, Booking, CarService, TimeSlot, Vehicle } from '@/lib/types';
import Button from '@/components/Button';
import Input, { Select } from '@/components/Input';
import TimeInput, { currentTime, isValidTime } from '@/components/TimeInput';
import { LoadingState, Alert } from '@/components/States';
import { formatDate, formatMoney } from '@/components/Badges';
import { bookingLines } from '@/lib/booking-lines';

type Step = 'service' | 'vehicle' | 'addons' | 'location' | 'date' | 'time' | 'review';

const steps: { key: Step; label: string }[] = [
  { key: 'service', label: 'Service' },
  { key: 'vehicle', label: 'Vehicle' },
  { key: 'addons', label: 'Add-ons' },
  { key: 'location', label: 'Location' },
  { key: 'date', label: 'Date' },
  { key: 'time', label: 'Time' },
  { key: 'review', label: 'Review' },
];

const stepOrder: Step[] = ['service', 'vehicle', 'addons', 'location', 'date', 'time', 'review'];

export default function BookingFlow() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();

  const [services, setServices] = useState<CarService[] | null>(null);
  const [addOns, setAddOns] = useState<AddOn[] | null>(null);
  const [vehicles, setVehicles] = useState<Vehicle[] | null>(null);
  const [slots, setSlots] = useState<TimeSlot[] | null>(null);

  const [step, setStep] = useState<Step>('service');
  const [serviceId, setServiceId] = useState<string>(searchParams.get('service') ?? '');
  const [vehicleId, setVehicleId] = useState<string>('');
  const [selectedAddOns, setSelectedAddOns] = useState<string[]>([]);
  const [cart, setCart] = useState<{ serviceId: string; addOnIds: string[] }[]>([]);
  const [location, setLocation] = useState({ country: '', city: '', address: '', notes: '' });
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [timeInput, setTimeInput] = useState('');
  const [addingService, setAddingService] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [createdBooking, setCreatedBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);

  const loadedOnce = useRef(false);
  const slotsKey = useRef<string | null>(null);

  useEffect(() => {
    async function init() {
      try {
        const [svcs, ads] = await Promise.all([
          apiRequest<CarService[]>('/services'),
          apiRequest<AddOn[]>('/add-ons'),
        ]);
        setServices(svcs);
        setAddOns(ads);
        if (!searchParams.get('service') && svcs.length > 0) {
          setServiceId(svcs[0]._id);
        }
        if (user) {
          try {
            const v = await apiRequest<Vehicle[]>('/vehicles', { auth: true });
            setVehicles(v);
          } catch {
            setVehicles([]);
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load booking options.');
      } finally {
        setLoading(false);
        loadedOnce.current = true;
      }
    }
    void init();
  }, [user, searchParams]);

  const availableStarts = useMemo(
    () => (slots ? slots.filter((s) => s.available).map((s) => s.start) : []),
    [slots],
  );

  const timeError = useMemo(() => {
    if (timeInput === '') return undefined;
    if (!isValidTime(timeInput)) {
      return 'Enter a valid time in HH:MM format (e.g. 09:30).';
    }
    if (availableStarts.length > 0 && !availableStarts.includes(timeInput)) {
      return 'That time is not available. Pick an available slot below.';
    }
    return undefined;
  }, [timeInput, availableStarts]);

  const handleTimeInputChange = (value: string) => {
    setTimeInput(value);
    if (isValidTime(value) && availableStarts.includes(value)) {
      setTime(value);
    } else {
      setTime('');
    }
  };

  const handleUseCurrentTime = () => {
    handleTimeInputChange(currentTime());
  };

  const cartServiceIds = cart.map((line) => line.serviceId).join(',');

  useEffect(() => {
    if (step !== 'time' || cart.length === 0 || !date) return;
    const key = `${cartServiceIds}:${date}`;
    if (slotsKey.current === key) return;
    slotsKey.current = key;
    setSlots(null);
    setTime('');
    setTimeInput('');
    setLoadingSlots(true);
    setError(null);
    apiRequest<TimeSlot[]>(`/availability?date=${date}&serviceIds=${cartServiceIds}`)
      .then(setSlots)
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load availability.'))
      .finally(() => setLoadingSlots(false));
  }, [step, cartServiceIds, cart.length, date]);

  const goTo = (target: Step) => {
    setError(null);
    if (target === 'vehicle' && !user) {
      router.push(`/login?next=/book`);
      return;
    }
    setStep(target);
  };

  const preventImplicitSubmit = (e: KeyboardEvent<HTMLFormElement>) => {
    if (e.key === 'Enter' && (e.target as HTMLElement).tagName === 'INPUT') {
      e.preventDefault();
    }
  };

  const handleConfirm = async (e: FormEvent) => {
    e.preventDefault();
    if (!user) {
      router.push(`/login?next=/book`);
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      const booking = await apiRequest<Booking>('/bookings', {
        method: 'POST',
        auth: true,
        body: {
          vehicleId,
          services: cart.map(({ serviceId: sId, addOnIds }) => ({ serviceId: sId, addOnIds })),
          date,
          startTime: time,
          location: {
            country: location.country,
            city: location.city,
            address: location.address,
            notes: location.notes || undefined,
          },
        },
      });
      setCreatedBooking(booking);
      setStep('review');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create booking.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || !services || !addOns) {
    return <LoadingState label="Loading booking…" />;
  }

  if (createdBooking) {
    return (
      <div className="container-page max-w-2xl py-16">
        <div className="card text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-green-100 text-green-700">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <h1 className="mt-4 text-2xl font-bold text-gray-900">Booking confirmed!</h1>
          <p className="mt-2 text-gray-600">
            Your{' '}
            {bookingLines(createdBooking)
              .map((l) => l.service.name)
              .join(' & ')}{' '}
            {bookingLines(createdBooking).length > 1 ? 'are' : 'is'} scheduled for{' '}
            <strong>{formatDate(createdBooking.date)}</strong> at{' '}
            <strong>{createdBooking.startTime}</strong>.
          </p>
          <p className="mt-1 text-sm text-gray-500">
            Booking ID: {createdBooking._id} · Total {formatMoney(createdBooking.total)}
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Link href={`/dashboard/bookings/${createdBooking._id}`} className="btn-primary">
              View booking details
            </Link>
            <Link href="/dashboard" className="btn-secondary">
              Go to dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const currentIndex = stepOrder.indexOf(step);

  const cartSummary = cart.map((line) => {
    const svc = services.find((s) => s._id === line.serviceId);
    const lineAddOns = addOns.filter((a) => line.addOnIds.includes(a._id));
    return {
      name: svc?.name ?? 'Service',
      duration: svc?.duration ?? 0,
      addOns: lineAddOns.map((a) => a.name),
      total: (svc?.basePrice ?? 0) + lineAddOns.reduce((sum, a) => sum + a.price, 0),
    };
  });
  const cartTotal = cartSummary.reduce((sum, line) => sum + line.total, 0);
  const cartDuration = cartSummary.reduce((sum, line) => sum + line.duration, 0);

  const handleCommitLine = () => {
    setCart((prev) => [...prev, { serviceId, addOnIds: selectedAddOns }]);
    goTo('location');
  };

  const handleAddServiceInline = () => {
    if (!serviceId) return;
    setCart((prev) => [...prev, { serviceId, addOnIds: selectedAddOns }]);
    setServiceId('');
    setSelectedAddOns([]);
    setTime('');
    setTimeInput('');
  };

  return (
    <div className="container-page max-w-3xl py-12">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-3xl font-bold text-gray-900">Book a Service</h1>
        <Link href="/dashboard" className="btn-secondary whitespace-nowrap">
          Back to dashboard
        </Link>
      </div>

      <ol className="mt-6 flex flex-wrap items-center gap-2 text-sm" aria-label="Booking steps">
        {steps.map((s, i) => (
          <li key={s.key} className="flex items-center gap-2">
            {i > 0 && <span className="text-gray-300">→</span>}
            <span
              className={`rounded-full px-3 py-1 font-medium ${
                i < currentIndex
                  ? 'bg-green-100 text-green-700'
                  : i === currentIndex
                    ? 'bg-brand-600 text-white'
                    : 'bg-gray-100 text-gray-400'
              }`}
            >
              {s.label}
            </span>
          </li>
        ))}
      </ol>

      {error && <div className="mt-6"><Alert type="error">{error}</Alert></div>}

      <form onSubmit={handleConfirm} onKeyDown={preventImplicitSubmit} className="card mt-6">
        {step === 'service' && (
          <div>
            <h2 className="font-semibold text-gray-900">Choose a service</h2>
            <ul className="mt-4 space-y-3">
              {services.map((s) => (
                <li key={s._id}>
                  <label
                    className={`flex cursor-pointer items-center justify-between gap-4 rounded-xl border-2 p-4 transition ${
                      serviceId === s._id
                        ? 'border-brand-600 bg-brand-50'
                        : 'border-gray-200 hover:border-brand-300'
                    }`}
                  >
                    <span className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="service"
                        value={s._id}
                        checked={serviceId === s._id}
                        onChange={() => setServiceId(s._id)}
                        className="h-4 w-4 text-brand-600"
                      />
                      <span>
                        <span className="block font-medium text-gray-900">{s.name}</span>
                        <span className="block text-sm text-gray-500">{s.duration} minutes</span>
                      </span>
                    </span>
                    <span className="font-semibold text-gray-900">{formatMoney(s.basePrice)}</span>
                  </label>
                </li>
              ))}
            </ul>
            <div className="mt-6 flex justify-end">
              <Button type="button" onClick={() => goTo('vehicle')} disabled={!serviceId}>
                Continue
              </Button>
            </div>
          </div>
        )}

        {step === 'vehicle' && (
          <div>
            <h2 className="font-semibold text-gray-900">Choose a vehicle</h2>
            {vehicles === null ? (
              <LoadingState label="Loading vehicles…" />
            ) : vehicles.length === 0 ? (
              <div className="mt-4 rounded-xl bg-gray-50 p-6 text-center">
                <p className="text-sm text-gray-600">
                  You don&apos;t have any vehicles yet. Add one to continue.
                </p>
                <Link href="/dashboard/vehicles" className="btn-primary mt-4">
                  Add a vehicle
                </Link>
              </div>
            ) : (
              <>
                <ul className="mt-4 space-y-3">
                  {vehicles.map((v) => (
                    <li key={v._id}>
                      <label
                        className={`flex cursor-pointer items-center justify-between gap-4 rounded-xl border-2 p-4 transition ${
                          vehicleId === v._id
                            ? 'border-brand-600 bg-brand-50'
                            : 'border-gray-200 hover:border-brand-300'
                        }`}
                      >
                        <span className="flex items-center gap-3">
                          <input
                            type="radio"
                            name="vehicle"
                            value={v._id}
                            checked={vehicleId === v._id}
                            onChange={() => setVehicleId(v._id)}
                            className="h-4 w-4 text-brand-600"
                          />
                          <span>
                            <span className="block font-medium text-gray-900">
                              {v.brand} {v.model}
                            </span>
                            <span className="block text-sm text-gray-500">
                              {v.year} · {v.color} · {v.plateNumber} · {v.vehicleType}
                            </span>
                          </span>
                        </span>
                      </label>
                    </li>
                  ))}
                </ul>
                {vehicleId && (
                  <button
                    type="button"
                    onClick={() => setVehicleId('')}
                    className="mt-4 rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 transition hover:border-brand-300 hover:text-brand-600"
                  >
                    Select another vehicle
                  </button>
                )}
              </>
            )}
            <div className="mt-6 flex justify-between">
              <Button type="button" variant="secondary" onClick={() => goTo('service')}>
                Back
              </Button>
              <Button type="button" onClick={() => goTo('addons')} disabled={!vehicleId}>
                Continue
              </Button>
            </div>
          </div>
        )}

        {step === 'addons' && (
          <div>
            <h2 className="font-semibold text-gray-900">Add extras (optional)</h2>
            <ul className="mt-4 space-y-3">
              {addOns.map((a) => (
                <li key={a._id}>
                  <label
                    className={`flex cursor-pointer items-center justify-between gap-4 rounded-xl border-2 p-4 transition ${
                      selectedAddOns.includes(a._id)
                        ? 'border-brand-600 bg-brand-50'
                        : 'border-gray-200 hover:border-brand-300'
                    }`}
                  >
                    <span className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={selectedAddOns.includes(a._id)}
                        onChange={() =>
                          setSelectedAddOns((prev) =>
                            prev.includes(a._id)
                              ? prev.filter((id) => id !== a._id)
                              : [...prev, a._id],
                          )
                        }
                        className="h-4 w-4 rounded text-brand-600"
                      />
                      <span>
                        <span className="block font-medium text-gray-900">{a.name}</span>
                        <span className="block text-sm text-gray-500">{a.description}</span>
                      </span>
                    </span>
                    <span className="font-semibold text-gray-900">+{formatMoney(a.price)}</span>
                  </label>
                </li>
              ))}
            </ul>
            <div className="mt-6 flex justify-between">
              <Button type="button" variant="secondary" onClick={() => goTo('vehicle')}>
                Back
              </Button>
              <Button type="button" onClick={handleCommitLine}>
                Continue
              </Button>
            </div>
          </div>
        )}

        {step === 'location' && (
          <div>
            <h2 className="font-semibold text-gray-900">Where should we come?</h2>
            <div className="mt-4 grid sm:grid-cols-2">
              <Input
                label="Country"
                name="country"
                required
                minLength={2}
                placeholder="e.g. United States"
                value={location.country}
                onChange={(e) => setLocation((l) => ({ ...l, country: e.target.value }))}
              />
              <Input
                label="City"
                name="city"
                required
                minLength={2}
                placeholder="e.g. Austin"
                value={location.city}
                onChange={(e) => setLocation((l) => ({ ...l, city: e.target.value }))}
              />
            </div>
            <Input
              label="Address"
              name="address"
              required
              minLength={5}
              placeholder="Street address where the car is located"
              value={location.address}
              onChange={(e) => setLocation((l) => ({ ...l, address: e.target.value }))}
            />
            <Input
              label="Notes (optional)"
              name="notes"
              placeholder="e.g. Gate code, parking instructions"
              value={location.notes}
              onChange={(e) => setLocation((l) => ({ ...l, notes: e.target.value }))}
            />
            <div className="mt-6 flex justify-between">
              <Button type="button" variant="secondary" onClick={() => goTo('addons')}>
                Back
              </Button>
              <Button
                type="button"
                onClick={() => goTo('date')}
                disabled={!location.country || !location.city || !location.address}
              >
                Continue
              </Button>
            </div>
          </div>
        )}

        {step === 'date' && (
          <div>
            <h2 className="font-semibold text-gray-900">Pick a date</h2>
            <p className="mt-1 text-sm text-gray-500">
              Working hours: 09:00 – 18:00. Dates in the past cannot be booked.
            </p>
            <Input
              label="Date"
              name="date"
              type="date"
              required
              min={new Date().toISOString().split('T')[0]}
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
            <div className="mt-6 flex justify-between">
              <Button type="button" variant="secondary" onClick={() => goTo('location')}>
                Back
              </Button>
              <Button type="button" onClick={() => goTo('time')} disabled={!date}>
                Continue
              </Button>
            </div>
          </div>
        )}

        {step === 'time' && (
          <div>
            <h2 className="font-semibold text-gray-900">Pick an available time</h2>
            <p className="mt-1 text-sm text-gray-500">
              {formatDate(date)} · {cartSummary.map((c) => c.name).join(' + ')} ({cartDuration} min total)
            </p>
            {loadingSlots ? (
              <LoadingState label="Checking availability…" />
            ) : !slots ? (
              <p className="mt-4 text-sm text-gray-500">Select a date to see available slots.</p>
            ) : slots.filter((s) => s.available).length === 0 ? (
              <div className="mt-4 rounded-xl bg-amber-50 p-5 text-sm text-amber-800">
                No available slots on this day. Please choose another date.
              </div>
            ) : (
              <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
                {slots.map((slot) => (
                  <button
                    key={slot.start}
                    type="button"
                    disabled={!slot.available}
                    onClick={() => {
                      setTime(slot.start);
                      setTimeInput(slot.start);
                    }}
                    className={`rounded-xl border-2 px-3 py-3 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-40 ${
                      time === slot.start
                        ? 'border-brand-600 bg-brand-600 text-white'
                        : 'border-gray-200 bg-white text-gray-700 hover:border-brand-300'
                    }`}
                  >
                    {slot.start} – {slot.end}
                  </button>
                ))}
              </div>
            )}
            <div className="mt-6 border-t border-gray-100 pt-4">
              <TimeInput
                label="Or enter a time"
                name="manual-time"
                value={timeInput}
                onChange={handleTimeInputChange}
                onNow={handleUseCurrentTime}
                error={timeError}
              />
            </div>
            <div className="mt-6 flex justify-between">
              <Button type="button" variant="secondary" onClick={() => goTo('date')}>
                Back
              </Button>
              <Button type="button" onClick={() => goTo('review')} disabled={!time}>
                Review booking
              </Button>
            </div>
          </div>
        )}

        {step === 'review' && (
          <div>
            <h2 className="font-semibold text-gray-900">Review your booking</h2>
            <dl className="mt-4 space-y-3 text-sm">
              <div>
                <dt className="text-gray-500">Services</dt>
                <div className="mt-1 space-y-2">
                  {cartSummary.map((line, i) => (
                    <div key={i} className="flex items-start justify-between gap-3 rounded-lg bg-gray-50 p-3">
                      <div>
                        <p className="font-medium text-gray-900">{line.name}</p>
                        <p className="text-sm text-gray-500">
                          {line.addOns.length > 0 ? line.addOns.join(', ') : 'No extras'} · {line.duration} min
                        </p>
                      </div>
                      <span className="font-medium text-gray-900">{formatMoney(line.total)}</span>
                    </div>
                  ))}
                  {addingService ? (
                    <div className="space-y-3 rounded-lg border border-brand-200 bg-brand-50 p-3">
                      <Select
                        label="Service to add"
                        name="add-service"
                        value={serviceId}
                        onChange={(e) => {
                          setServiceId(e.target.value);
                          setSelectedAddOns([]);
                        }}
                      >
                        <option value="" disabled>
                          Select a service…
                        </option>
                        {services.map((s) => (
                          <option key={s._id} value={s._id}>
                            {s.name} · {formatMoney(s.basePrice)}
                          </option>
                        ))}
                      </Select>
                      {serviceId && (
                        <div>
                          <p className="text-sm font-medium text-gray-700">Extras</p>
                          <div className="mt-1 flex flex-wrap gap-2">
                            {addOns.map((a) => (
                              <label
                                key={a._id}
                                className={`flex cursor-pointer items-center gap-2 rounded-lg border bg-white px-3 py-1.5 text-sm ${
                                  selectedAddOns.includes(a._id)
                                    ? 'border-brand-600'
                                    : 'border-gray-200 hover:border-brand-300'
                                }`}
                              >
                                <input
                                  type="checkbox"
                                  checked={selectedAddOns.includes(a._id)}
                                  onChange={() =>
                                    setSelectedAddOns((prev) =>
                                      prev.includes(a._id)
                                        ? prev.filter((id) => id !== a._id)
                                        : [...prev, a._id],
                                    )
                                  }
                                  className="h-3.5 w-3.5 rounded text-brand-600"
                                />
                                <span>
                                  {a.name}{' '}
                                  <span className="text-gray-500">+{formatMoney(a.price)}</span>
                                </span>
                              </label>
                            ))}
                          </div>
                        </div>
                      )}
                      <div className="flex items-center gap-3">
                        <Button type="button" onClick={handleAddServiceInline} disabled={!serviceId}>
                          Add to cart
                        </Button>
                        <Button type="button" variant="secondary" onClick={() => setAddingService(false)}>
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setAddingService(true)}
                      className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm font-medium text-gray-700 transition hover:border-brand-300 hover:text-brand-600"
                    >
                      + Add another service
                    </button>
                  )}
                </div>
              </div>
              <div className="flex items-center justify-between gap-3">
                <dt className="text-gray-500">Vehicle</dt>
                <dd className="flex items-center gap-3">
                  <span className="font-medium text-gray-900">
                    {(() => {
                      const v = vehicles?.find((x) => x._id === vehicleId);
                      return v ? `${v.brand} ${v.model} (${v.plateNumber})` : '—';
                    })()}
                  </span>
                  <button
                    type="button"
                    onClick={() => goTo('vehicle')}
                    className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm font-medium text-gray-700 transition hover:border-brand-300 hover:text-brand-600"
                  >
                    Change
                  </button>
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">Location</dt>
                <dd className="font-medium text-gray-900">
                  {location.address}, {location.city}, {location.country}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">When</dt>
                <dd className="font-medium text-gray-900">
                  {time ? (
                    <>
                      {formatDate(date)} · {time}
                    </>
                  ) : (
                    <button
                      type="button"
                      onClick={() => goTo('time')}
                      className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm font-medium text-gray-700 transition hover:border-brand-300 hover:text-brand-600"
                    >
                      Pick a time
                    </button>
                  )}
                </dd>
              </div>
              <div className="flex justify-between border-t border-gray-100 pt-3 text-base">
                <dt className="font-semibold text-gray-900">Total</dt>
                <dd className="font-bold text-brand-600">{formatMoney(cartTotal)}</dd>
              </div>
            </dl>
            <div className="mt-6 flex justify-between">
              <Button type="button" variant="secondary" onClick={() => goTo('time')}>
                Back
              </Button>
              <Button type="submit" loading={submitting} disabled={submitting || !time}>
                Confirm booking
              </Button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}