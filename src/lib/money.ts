import type { AppLocale } from '@/i18n/routing';

export const DEFAULT_CURRENCY = 'USD';

const MONEY_CONFIG: Record<AppLocale, { numberingSystem?: string; labelPosition: 'before' | 'after' }> = {
  en: { labelPosition: 'before' },
  ar: { numberingSystem: 'arab', labelPosition: 'after' },
};

function numberOptions(locale: AppLocale) {
  const { numberingSystem } = MONEY_CONFIG[locale];
  return {
    style: 'decimal' as const,
    numberingSystem,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  };
}

export function formatMoney(locale: AppLocale, value: number, currencyLabel: string): string {
  const amount = new Intl.NumberFormat(locale, numberOptions(locale)).format(value);
  return MONEY_CONFIG[locale].labelPosition === 'before'
    ? `${currencyLabel}${amount}`
    : `${amount} ${currencyLabel}`;
}