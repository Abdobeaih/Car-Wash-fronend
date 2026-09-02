import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';

export default async function AuthShell({ children }: { children: React.ReactNode }) {
  const t = await getTranslations('Home');
  const features = [t('feature1'), t('feature2'), t('feature3')];

  return (
    <div className="py-8 sm:py-12 lg:py-16">
      <div className="container-page">
        <div className="grid overflow-hidden rounded-xl border border-gray-200 bg-white lg:grid-cols-2">
          <aside className="relative hidden bg-black lg:flex">
            <div className="flex min-h-full w-full flex-col justify-between gap-20 p-10 xl:p-14">
              <Link href="/" className="flex items-center gap-2.5">
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-600 text-white">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path
                      d="M5 13l1.5-4.5A2 2 0 0 1 8.4 7h7.2a2 2 0 0 1 1.9 1.5L19 13m-14 0h14m-14 0v3m14-3v3"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
                <span className="font-display text-base font-semibold uppercase tracking-[0.08em] text-white">
                  Mobile <span className="text-brand-500">CarCare</span>
                </span>
              </Link>

              <div>
                <p className="eyebrow text-brand-400">Mobile Car Care</p>
                <h2 className="display-title mt-5 max-w-sm text-3xl text-white xl:text-4xl">
                  {t('title')}
                </h2>
                <ul className="mt-9 space-y-4">
                  {features.map((f) => (
                    <li key={f} className="flex items-center gap-3">
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-600 text-white">
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                          <path
                            d="M5 13l4 4L19 7"
                            stroke="currentColor"
                            strokeWidth="3.2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </span>
                      <span className="text-xs font-semibold uppercase tracking-[0.12em] text-gray-300">
                        {f}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              <div
                aria-hidden="true"
                className="select-none font-display text-8xl font-semibold uppercase leading-[0.8] text-gray-900"
              >
                Car
                <br />
                Care
              </div>
            </div>
          </aside>

          <div className="flex flex-col justify-center p-6 sm:p-10 lg:p-12">{children}</div>
        </div>
      </div>
    </div>
  );
}