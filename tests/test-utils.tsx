import type { ReactElement } from 'react';
import { render } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import enMessages from '../messages/en.json';
import arMessages from '../messages/ar.json';

const catalogs = { en: enMessages, ar: arMessages } as const;

export function renderWithIntl(ui: ReactElement, locale: 'en' | 'ar' = 'en') {
  return render(
    <NextIntlClientProvider locale={locale} messages={catalogs[locale]} timeZone="Africa/Cairo">
      {ui}
    </NextIntlClientProvider>,
  );
}
