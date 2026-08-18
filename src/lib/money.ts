import type { AppLocale } from '@/i18n/routing';

export const DEFAULT_CURRENCY = 'USD';

const MONEY_CONFIG: Record<AppLocale, { currency: string; numberingSystem?: string }> = {
  en: { currency: DEFAULT_CURRENCY },
  ar: { currency: DEFAULT_CURRENCY, numberingSystem: 'arab' },
};

export function moneyOptions(locale: AppLocale) {
  const { currency, numberingSystem } = MONEY_CONFIG[locale];
  return {
    style: 'currency' as const,
    currency,
    numberingSystem,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  };
}

export function formatMoney(locale: AppLocale, value: number): string {
  return new Intl.NumberFormat(locale, moneyOptions(locale)).format(value);
}