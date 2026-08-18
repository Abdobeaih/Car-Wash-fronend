'use client';

import { useTranslations } from 'next-intl';
import { Link, useRouter } from '@/i18n/navigation';
import { useEffect, useMemo, useRef, useState, type FormEvent, type KeyboardEvent } from 'react';
import { useSearchParams } from 'next/navigation';
import { apiRequest } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import type { AddOn, Booking, CarService, TimeSlot, Vehicle } from '@/lib/types';
import Button from '@/components/Button';
import Input, { Select } from '@/components/Input';
import TimeInput, { currentTime, isValidTime } from '@/components/TimeInput';
import { LoadingState, Alert } from '@/components/States';
import { useDate, useMoney } from '@/lib/format';
import { bookingLines } from '@/lib/booking-lines';

type Step = 'service' | 'vehicle' | 'addons' | 'location' | 'date' | 'time' | 'review';

const stepOrder: Step[] = ['service', 'vehicle', 'addons', 'location', 'date', 'time', 'review'];

export default function BookingFlow() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const t = useTranslations('Book');
  const tc = useTranslations('Common');
  const formatDate = useDate();
  const formatMoney = useMoney();

  const steps: { key: Step; label: string }[] = [
    { key: 'service', label: t('stepService') },
    { key: 'vehicle', label: t('stepVehicle') },
    { key: 'addons', label: t('stepAddons') },
    { key: 'location', label: t('stepLocation') },
    { key: 'date', label: t('stepDate') },
    { key: 'time', label: t('stepTime') },
    { key: 'review', label: t('stepReview') },
  ];

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
        setError(err instanceof Error ? err.message : t('loadFailed'));
      } finally {
        setLoading(false);
        loadedOnce.current = true;
      }
    }
    void init();
  }, [user, searchParams, t]);

  const availableStarts = useMemo(
    () => (slots ? slots.filter((s) => s.available).map((s) => s.start) : []),
    [slots],
  );

  const timeError = useMemo(() => {
    if (timeInput === '') return undefined;
    if (!isValidTime(timeInput)) {
      return t('timeInvalid');
    }
    if (availableStarts.length > 0 && !availableStarts.includes(timeInput)) {
      return t('timeUnavailable');
    }
    return undefined;
  }, [timeInput, availableStarts, t]);

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
      .catch((err) => setError(err instanceof Error ? err.message : t('availabilityFailed')))
      .finally(() => setLoadingSlots(false));
  }, [step, cartServiceIds, cart.length, date, t]);

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
      setError(err instanceof Error ? err.message : t('createFailed'));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || !services || !addOns) {
    return <LoadingState label={t('loading')} />;
  }

  if (createdBooking) {
    const lineNames = bookingLines(createdBooking)
      .map((l) => l.service.name)
      .join(' & ');
    return (
      <div className="container-page max-w-2xl py-16">
        <div className="card overflow-hidden p-0 text-center">
          <div className="bg-gradient-to-b from-green-50 to-white px-6 pt-10">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-green-600 ring-8 ring-green-50">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <h1 className="mt-5 text-2xl font-bold text-gray-900">{t('confirmedTitle')}</h1>
            <p className="mt-2 leading-relaxed text-gray-600">
              {t('confirmedText', {
                services: lineNames,
                date: formatDate(createdBooking.date),
                time: createdBooking.startTime,
              })}
            </p>
          </div>
          <div className="mx-auto max-w-md px-6 pb-8">
            <p className="mt-4 inline-flex items-center gap-2 rounded-full bg-gray-100 px-4 py-1.5 text-sm font-medium text-gray-700">
              <span className="text-gray-400">{t('bookingId', { id: createdBooking._id, total: formatMoney(createdBooking.total) })}</span>
            </p>
            <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
              <Link href={`/dashboard/bookings/${createdBooking._id}`} className="btn-primary">
                {t('viewDetails')}
              </Link>
              <Link href="/dashboard" className="btn-secondary">
                {t('goToDashboard')}
              </Link>
            </div>
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
      name: svc?.name ?? tc('service'),
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
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">{t('title')}</h1>
        <Link href="/dashboard" className="btn-secondary whitespace-nowrap">
          {t('backToDashboard')}
        </Link>
      </div>

      <ol className="mt-6 flex flex-wrap items-center gap-y-3" aria-label={t('title')}>
        {steps.map((s, i) => {
          const done = i < currentIndex;
          const active = i === currentIndex;
          return (
            <li key={s.key} className="flex items-center">
              {i > 0 && (
                <span
                  aria-hidden="true"
                  className={`mx-1.5 h-0.5 w-5 rounded-full sm:mx-2 sm:w-8 ${done ? 'bg-brand-500' : 'bg-gray-200'}`}
                />
              )}
              <span
                aria-current={active ? 'step' : undefined}
                className={`flex items-center gap-2 rounded-full px-2 py-1 text-xs font-medium transition sm:px-2.5 sm:text-sm ${
                  active
                    ? 'bg-brand-600 text-white shadow-md shadow-brand-600/25'
                    : done
                      ? 'bg-green-50 text-green-700 ring-1 ring-inset ring-green-600/20'
                      : 'bg-gray-100 text-gray-500'
                }`}
              >
                <span
                  className={`flex h-5 w-5 items-center justify-center rounded-full text-[11px] font-bold ${
                    active
                      ? 'bg-white/20 text-white'
                      : done
                        ? 'bg-green-600 text-white'
                        : 'bg-white text-gray-500 ring-1 ring-inset ring-gray-300'
                  }`}
                >
                  {done ? (
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                      <path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  ) : (
                    i + 1
                  )}
                </span>
                <span className="hidden sm:inline">{s.label}</span>
              </span>
            </li>
          );
        })}
      </ol>

      {error && <div className="mt-6"><Alert type="error">{error}</Alert></div>}

      <form onSubmit={handleConfirm} onKeyDown={preventImplicitSubmit} className="card mt-6">
        {step === 'service' && (
          <div>
            <h2 className="font-semibold text-gray-900">{t('chooseService')}</h2>
            <ul className="mt-4 space-y-3">
              {services.map((s) => (
                <li key={s._id}>
                  <label
                    className={`flex cursor-pointer items-center justify-between gap-4 rounded-xl border-2 p-4 transition focus-within:border-brand-500 focus-within:ring-2 focus-within:ring-brand-500/20 ${
                      serviceId === s._id
                        ? 'border-brand-600 bg-brand-50/60'
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
                        className="h-4 w-4 accent-brand-600"
                      />
                      <span>
                        <span className="block font-medium text-gray-900">{s.name}</span>
                        <span className="block text-sm text-gray-500">
                          {t('minutes', { value: s.duration })}
                        </span>
                      </span>
                    </span>
                    <span className="flex shrink-0 items-center gap-3">
                      <span className="font-semibold text-gray-900">{formatMoney(s.basePrice)}</span>
                      {serviceId === s._id && (
                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-brand-600 text-white">
                          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                            <path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </span>
                      )}
                    </span>
                  </label>
                </li>
              ))}
            </ul>
            <div className="mt-6 flex justify-end">
              <Button type="button" onClick={() => goTo('vehicle')} disabled={!serviceId}>
                {t('continue')}
              </Button>
            </div>
          </div>
        )}

        {step === 'vehicle' && (
          <div>
            <h2 className="font-semibold text-gray-900">{t('chooseVehicle')}</h2>
            {vehicles === null ? (
              <LoadingState label={t('loadingVehicles')} />
            ) : vehicles.length === 0 ? (
              <div className="mt-4 rounded-xl bg-gray-50 p-6 text-center">
                <p className="text-sm text-gray-600">
                  {t('noVehicles')}
                </p>
                <Link href="/dashboard/vehicles" className="btn-primary mt-4">
                  {t('addVehicle')}
                </Link>
              </div>
            ) : (
              <>
                <ul className="mt-4 space-y-3">
                  {vehicles.map((v) => (
                    <li key={v._id}>
                      <label
                        className={`flex cursor-pointer items-center justify-between gap-4 rounded-xl border-2 p-4 transition focus-within:border-brand-500 focus-within:ring-2 focus-within:ring-brand-500/20 ${
                          vehicleId === v._id
                            ? 'border-brand-600 bg-brand-50/60'
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
                            className="h-4 w-4 accent-brand-600"
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
                        {vehicleId === v._id && (
                          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-600 text-white">
                            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                              <path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          </span>
                        )}
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
                    {t('selectAnotherVehicle')}
                  </button>
                )}
              </>
            )}
            <div className="mt-6 flex justify-between">
              <Button type="button" variant="secondary" onClick={() => goTo('service')}>
                {t('back')}
              </Button>
              <Button type="button" onClick={() => goTo('addons')} disabled={!vehicleId}>
                {t('continue')}
              </Button>
            </div>
          </div>
        )}

        {step === 'addons' && (
          <div>
            <h2 className="font-semibold text-gray-900">{t('addExtras')}</h2>
            <ul className="mt-4 space-y-3">
              {addOns.map((a) => (
                <li key={a._id}>
                  <label
                    className={`flex cursor-pointer items-center justify-between gap-4 rounded-xl border-2 p-4 transition focus-within:border-brand-500 focus-within:ring-2 focus-within:ring-brand-500/20 ${
                      selectedAddOns.includes(a._id)
                        ? 'border-brand-600 bg-brand-50/60'
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
                        className="h-4 w-4 rounded accent-brand-600"
                      />
                      <span>
                        <span className="block font-medium text-gray-900">{a.name}</span>
                        <span className="block text-sm text-gray-500">{a.description}</span>
                      </span>
                    </span>
                    <span className="flex shrink-0 items-center gap-3">
                      <span className="font-semibold text-gray-900">+{formatMoney(a.price)}</span>
                      {selectedAddOns.includes(a._id) && (
                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-brand-600 text-white">
                          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                            <path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </span>
                      )}
                    </span>
                  </label>
                </li>
              ))}
            </ul>
            <div className="mt-6 flex justify-between">
              <Button type="button" variant="secondary" onClick={() => goTo('vehicle')}>
                {t('back')}
              </Button>
              <Button type="button" onClick={handleCommitLine}>
                {t('continue')}
              </Button>
            </div>
          </div>
        )}

        {step === 'location' && (
          <div>
            <h2 className="font-semibold text-gray-900">{t('whereShouldWeCome')}</h2>
            <div className="mt-4 grid gap-x-4 sm:grid-cols-2">
              <Input
                label={t('country')}
                name="country"
                required
                minLength={2}
                placeholder="e.g. United States"
                value={location.country}
                onChange={(e) => setLocation((l) => ({ ...l, country: e.target.value }))}
              />
              <Input
                label={t('city')}
                name="city"
                required
                minLength={2}
                placeholder="e.g. Austin"
                value={location.city}
                onChange={(e) => setLocation((l) => ({ ...l, city: e.target.value }))}
              />
            </div>
            <Input
              label={t('address')}
              name="address"
              required
              minLength={5}
              placeholder={t('addressPlaceholder')}
              value={location.address}
              onChange={(e) => setLocation((l) => ({ ...l, address: e.target.value }))}
            />
            <Input
              label={t('notesOptional')}
              name="notes"
              placeholder={t('notesPlaceholder')}
              value={location.notes}
              onChange={(e) => setLocation((l) => ({ ...l, notes: e.target.value }))}
            />
            <div className="mt-6 flex justify-between">
              <Button type="button" variant="secondary" onClick={() => goTo('addons')}>
                {t('back')}
              </Button>
              <Button
                type="button"
                onClick={() => goTo('date')}
                disabled={!location.country || !location.city || !location.address}
              >
                {t('continue')}
              </Button>
            </div>
          </div>
        )}

        {step === 'date' && (
          <div>
            <h2 className="font-semibold text-gray-900">{t('pickDate')}</h2>
            <p className="mt-1 text-sm text-gray-500">
              {t('workingHours')}
            </p>
            <Input
              label={t('date')}
              name="date"
              type="date"
              required
              min={new Date().toISOString().split('T')[0]}
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
            <div className="mt-6 flex justify-between">
              <Button type="button" variant="secondary" onClick={() => goTo('location')}>
                {t('back')}
              </Button>
              <Button type="button" onClick={() => goTo('time')} disabled={!date}>
                {t('continue')}
              </Button>
            </div>
          </div>
        )}

        {step === 'time' && (
          <div>
            <h2 className="font-semibold text-gray-900">{t('pickTime')}</h2>
            <p className="mt-1 text-sm text-gray-500">
              {t('timeSubtitle', {
                date: formatDate(date),
                services: cartSummary.map((c) => c.name).join(' + '),
                duration: cartDuration,
              })}
            </p>
            {loadingSlots ? (
              <LoadingState label={t('checkingAvailability')} />
            ) : !slots ? (
              <p className="mt-4 text-sm text-gray-500">{t('selectDateHint')}</p>
            ) : slots.filter((s) => s.available).length === 0 ? (
              <div className="mt-4 rounded-xl bg-amber-50 p-5 text-sm text-amber-800">
                {t('noSlots')}
              </div>
            ) : (
              <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                {slots.map((slot) => (
                  <button
                    key={slot.start}
                    type="button"
                    disabled={!slot.available}
                    onClick={() => {
                      setTime(slot.start);
                      setTimeInput(slot.start);
                    }}
                    aria-pressed={time === slot.start}
                    className={`min-h-[52px] rounded-xl border-2 px-3 py-2.5 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-40 ${
                      time === slot.start
                        ? 'border-brand-600 bg-brand-600 text-white shadow-md shadow-brand-600/25'
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
                label={t('orEnterTime')}
                name="manual-time"
                value={timeInput}
                onChange={handleTimeInputChange}
                onNow={handleUseCurrentTime}
                error={timeError}
              />
            </div>
            <div className="mt-6 flex justify-between">
              <Button type="button" variant="secondary" onClick={() => goTo('date')}>
                {t('back')}
              </Button>
              <Button type="button" onClick={() => goTo('review')} disabled={!time}>
                {t('review')}
              </Button>
            </div>
          </div>
        )}

        {step === 'review' && (
          <div>
            <h2 className="font-semibold text-gray-900">{t('reviewBooking')}</h2>
            <dl className="mt-4 divide-y divide-gray-100 rounded-xl border border-gray-100">
              <div className="p-4">
                <dt className="text-xs font-semibold uppercase tracking-wide text-gray-500">{t('services')}</dt>
                <div className="mt-2 space-y-2">
                  {cartSummary.map((line, i) => (
                    <div key={i} className="flex items-start justify-between gap-3 rounded-lg bg-gray-50 p-3">
                      <div className="min-w-0">
                        <p className="font-medium text-gray-900">{line.name}</p>
                        <p className="text-sm text-gray-500">
                          {line.addOns.length > 0 ? line.addOns.join(', ') : tc('noExtras')} ·{' '}
                          {tc('minutes', { value: line.duration })}
                        </p>
                      </div>
                      <span className="shrink-0 font-medium text-gray-900">{formatMoney(line.total)}</span>
                    </div>
                  ))}
                  {addingService ? (
                    <div className="space-y-3 rounded-lg border border-brand-200 bg-brand-50 p-3">
                      <Select
                        label={t('serviceToAdd')}
                        name="add-service"
                        value={serviceId}
                        onChange={(e) => {
                          setServiceId(e.target.value);
                          setSelectedAddOns([]);
                        }}
                      >
                        <option value="" disabled>
                          {t('selectService')}
                        </option>
                        {services.map((s) => (
                          <option key={s._id} value={s._id}>
                            {s.name} · {formatMoney(s.basePrice)}
                          </option>
                        ))}
                      </Select>
                      {serviceId && (
                        <div>
                          <p className="text-sm font-medium text-gray-700">{t('extras')}</p>
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
                                  className="h-3.5 w-3.5 rounded accent-brand-600"
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
                          {t('addToCart')}
                        </Button>
                        <Button type="button" variant="secondary" onClick={() => setAddingService(false)}>
                          {t('cancel')}
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setAddingService(true)}
                      className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm font-medium text-gray-700 transition hover:border-brand-300 hover:text-brand-600"
                    >
                      {t('addAnotherService')}
                    </button>
                  )}
                </div>
              </div>
              <div className="flex flex-wrap items-center justify-between gap-3 p-4">
                <dt className="text-xs font-semibold uppercase tracking-wide text-gray-500">{t('vehicle')}</dt>
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
                    {t('change')}
                  </button>
                </dd>
              </div>
              <div className="flex flex-wrap justify-between gap-3 p-4">
                <dt className="text-xs font-semibold uppercase tracking-wide text-gray-500">{t('location')}</dt>
                <dd className="font-medium text-gray-900">
                  {location.address}, {location.city}, {location.country}
                </dd>
              </div>
              <div className="flex flex-wrap justify-between gap-3 p-4">
                <dt className="text-xs font-semibold uppercase tracking-wide text-gray-500">{t('when')}</dt>
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
                      {t('pickTimeLink')}
                    </button>
                  )}
                </dd>
              </div>
              <div className="flex justify-between bg-gray-50/70 p-4 text-base">
                <dt className="font-semibold text-gray-900">{t('total')}</dt>
                <dd className="font-bold text-brand-600">{formatMoney(cartTotal)}</dd>
              </div>
            </dl>
            <div className="mt-6 flex justify-between">
              <Button type="button" variant="secondary" onClick={() => goTo('time')}>
                {t('back')}
              </Button>
              <Button type="submit" loading={submitting} disabled={submitting || !time}>
                {t('confirm')}
              </Button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}