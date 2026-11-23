import { Suspense } from 'react';
import WashScene from '@/components/WashScene';
import PremiumGarage from '@/components/PremiumGarage';
import type { Metadata } from 'next';
import Image from 'next/image';
import { getLocale, getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { API_URL } from '@/lib/api';
import { formatDuration } from '@/lib/duration';
import { formatMoney } from '@/lib/money';
import { serviceImagePath } from '@/lib/service-images';
import heroCairo from '../../../public/images/hero-cairo.jpg';
import { EmptyState } from '@/components/States';
import type { AppLocale } from '@/i18n/routing';
import type { CarService } from '@/lib/types';
import { localizeContent } from '@/lib/localize-content';

export const dynamic = 'force-dynamic';

async function getServices(): Promise<CarService[]> {
  try {
    const res = await fetch(`${API_URL}/services`, { next: { revalidate: 60 } });
    if (!res.ok) return [];
    return (await res.json()) as CarService[];
  } catch {
    return [];
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'Metadata' });
  return {
    title: t('defaultTitle'),
    description: t('defaultDescription'),
  };
}

function ArrowIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      className="rtl:-scale-x-100"
      aria-hidden="true"
    >
      <path
        d="M4 12h16m-6-6 6 6-6 6"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default async function HomePage() {
  const locale = (await getLocale()) as AppLocale;
  const t = await getTranslations('Home');

  const features = [t('feature1'), t('feature2'), t('feature3')];

  const howSteps = [
    { step: '01', title: t('howStep1Title'), text: t('howStep1Text') },
    { step: '02', title: t('howStep2Title'), text: t('howStep2Text') },
    { step: '03', title: t('howStep3Title'), text: t('howStep3Text') },
  ];

  const why = [
    { title: t('why1Title'), text: t('why1Text') },
    { title: t('why2Title'), text: t('why2Text') },
    { title: t('why3Title'), text: t('why3Text') },
    { title: t('why4Title'), text: t('why4Text') },
  ];


  return (
    <>
      
      {/* ── Hero ─────────────────────────────────────────────── */}
      <section className="relative overflow-hidden border-b border-gray-200 bg-gray-900">
        <Image
          src={heroCairo}
          alt=""
          fill
          priority
          placeholder="blur"
          sizes="100vw"
          className="object-cover object-center"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/60 to-black/25 rtl:bg-gradient-to-l"
        />
        <div className="container-page relative py-20 sm:py-24 lg:py-32">
          <div className="max-w-2xl">
            <p className="eyebrow text-brand-400">
              {locale === 'ar' ? 'موبايل كار كير · القاهرة' : 'Mobile Car Care · Cairo'}
            </p>
            <h1 className="display-title mt-5 text-4xl leading-[1.05] text-white sm:text-5xl xl:text-6xl">
              {t('title')}
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-gray-200">{t('subtitle')}</p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/book"
                className="btn btn-lg bg-brand-600 text-white shadow-sm shadow-brand-600/30 hover:bg-brand-700"
              >
                {t('book')}
              </Link>
              <Link
                href="/services"
                className="btn-secondary btn-lg border-white/50 bg-white/10 text-white hover:border-white hover:bg-white hover:text-gray-900"
              >
                {t('browse')}
              </Link>
            </div>
            <ul className="mt-10 flex flex-col gap-3 border-t border-white/25 pt-6 text-sm font-medium text-gray-100 sm:flex-row sm:gap-8">
              {features.map((f) => (
                <li key={f} className="flex items-center gap-2">
                  <span className="flex h-4 w-4 items-center justify-center rounded-full bg-aqua-500 text-gray-900">
                    <svg width="9" height="9" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                      <path
                        d="M5 13l4 4L19 7"
                        stroke="currentColor"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </span>
                  {f}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <PremiumGarage locale={locale} />

      {/* ── Services index ───────────────────────────────────── */}
      <Suspense fallback={<section className="container-page py-16" aria-busy="true"><p className="eyebrow">Mobile Car Care</p><div className="mt-5 h-48 rounded-xl bg-gray-100" /></section>}>
        <HomeServices locale={locale} />
      </Suspense>

      <PremiumGarage locale={locale} wide />
   <WashScene locale={locale} />

      {/* ── How it works ─────────────────────────────────────── */}
      <section className="border-b border-gray-200 bg-gray-50 py-16 sm:py-20">
        <div className="container-page">
          <h2 className="display-title text-3xl text-gray-900 sm:text-4xl">{t('howTitle')}</h2>
          <ol className="mt-14 grid gap-10 sm:grid-cols-3 sm:gap-10">
            {howSteps.map((item) => (
              <li key={item.step}>
                <div className="flex items-center gap-5">
                  <span className="font-display text-5xl font-semibold text-brand-600">
                    {item.step}
                  </span>
                  <span className="h-px flex-1 bg-gray-300" aria-hidden="true" />
                </div>
                <h3 className="mt-6 font-display text-lg font-semibold text-gray-900">
                  {item.title}
                </h3>
                <p className="mt-2 max-w-xs text-sm leading-relaxed text-gray-600">{item.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ── Why ──────────────────────────────────────────────── */}
      <section className="bg-white py-16 sm:py-20">
        <div className="container-page">
          <p className="eyebrow">Mobile Car Care</p>
          <h2 className="display-title mt-4 max-w-2xl text-3xl text-gray-900 sm:text-4xl">
            {t('whyTitle')}
          </h2>
          <div className="mt-12 grid gap-px overflow-hidden rounded-2xl border border-gray-200 bg-gray-200 shadow-card sm:grid-cols-2 lg:grid-cols-4">
            {why.map((item, i) => (
              <div key={item.title} className="bg-white p-7">
                <span className="flex h-10 w-10 items-center justify-center rounded-md border border-gray-300 text-brand-700">
                  <WhyIcon index={i} />
                </span>
                <h3 className="mt-6 font-display text-lg font-semibold text-gray-900">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-gray-600">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────── */}
      <section className="border-t border-gray-200 bg-black py-16 sm:py-24">
        <div className="container-page">
          <div className="grid items-center gap-10 lg:grid-cols-2">
            <div>
              <p className="eyebrow text-brand-400">Mobile Car Care</p>
              <h2 className="display-title mt-4 max-w-xl text-3xl text-white sm:text-4xl">
                {t('ctaTitle')}
              </h2>
              <p className="mt-4 max-w-lg leading-relaxed text-gray-400">{t('ctaText')}</p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/book"
                  className="btn btn-lg bg-brand-600 text-white shadow-sm shadow-black/40 hover:bg-brand-700"
                >
                  {t('ctaBook')}
                </Link>
                <Link
                  href="/register"
                  className="btn btn-lg border border-gray-700 bg-transparent text-gray-100 transition hover:border-gray-500 hover:bg-white/5"
                >
                  {t('ctaRegister')}
                </Link>
              </div>
            </div>
            <div
              className="hidden select-none justify-self-center text-center font-display text-[9rem] font-semibold leading-none text-white/10 lg:block"
              aria-hidden="true"
            >
              <span className="block text-aqua-400/80">Car</span>
              <span className="block">Care</span>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

function WhyIcon({ index }: { index: number }) {
  const icons = [
    <path
      key="1"
      d="M3 12l2-7h14l2 7m-18 0v7m18-7v7M3 12h18M5 19h14"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />,
    <path
      key="2"
      d="M12 14a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4 20a8 8 0 0 1 16 0"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
    />,
    <path
      key="3"
      d="M4 20V9l8-5 8 5v11M9 20v-6h6v6"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />,
    <rect
      key="4"
      x="4"
      y="5"
      width="16"
      height="14"
      rx="3"
      stroke="currentColor"
      strokeWidth="1.8"
    />,
  ];
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      {icons[index % icons.length]}
    </svg>
  );
}
// Stream the catalogue independently: a cold API must not hold back the hero.
async function HomeServices({locale}:{locale:AppLocale}) {
 const [services,t,ts,tc]=await Promise.all([getServices(),getTranslations('Home'),getTranslations('Services'),getTranslations('Common')]);
 return (      <section className="border-b border-gray-200 bg-white py-16 sm:py-20">
        <div className="container-page">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="eyebrow">Mobile Car Care</p>
              <h2 className="display-title mt-4 text-3xl text-gray-900 sm:text-4xl">
                {ts('title')}
              </h2>
              <p className="mt-4 max-w-xl leading-relaxed text-gray-600">{ts('subtitle')}</p>
            </div>
          </div>

          {services.length === 0 ? (
            <div className="mt-12">
              <EmptyState
                title={ts('emptyTitle')}
                description={ts('emptyDescription')}
                action={
                  <a href={`/${locale}`} className="btn-secondary">
                    {tc('tryAgain')}
                  </a>
                }
              />
            </div>
          ) : (
            <>
          <div className="mt-12 grid gap-6 sm:grid-cols-2">
            {services.slice(0, 4).map((service) => (
              <Link
                key={service._id}
                href={`/services/${service.slug}`}
                className="group card overflow-hidden p-0 transition-shadow duration-300 hover:shadow-lift"
              >
                <div className="relative overflow-hidden">
                  <Image
                    src={serviceImagePath(service.image)}
                    alt={localizeContent(locale, service.name)}
                    width={640}
                    height={400}
                    className="aspect-[16/10] w-full object-cover transition duration-500 group-hover:scale-[1.04]"
                  />
                </div>
                <div className="flex items-center justify-between gap-4 p-5">
                  <div className="min-w-0">
                    <h3 className="truncate font-display text-base font-semibold text-gray-900 transition group-hover:text-brand-700 sm:text-lg">
                      {localizeContent(locale, service.name)}
                    </h3>
                    <p className="mt-0.5 text-sm text-gray-500">
                      {formatDuration(tc, service.duration)}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-3">
                    <p className="font-display text-base font-semibold sm:text-lg">
                      {formatMoney(locale, service.basePrice, tc('currencyLabel'))}
                    </p>
                    <span className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-300 text-gray-500 transition group-hover:border-brand-600 group-hover:bg-brand-600 group-hover:text-white">
                      <ArrowIcon />
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          <div className="mt-8 flex justify-end">
            <Link href="/services" className="btn-secondary">
              {t('browse')}
            </Link>
          </div>
            </>
          )}
        </div>
      </section>);
}
