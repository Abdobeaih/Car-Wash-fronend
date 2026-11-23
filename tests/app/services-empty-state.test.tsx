import { Children, cloneElement, isValidElement, Suspense, type ReactNode, type ReactElement } from 'react';
import { screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { CarService } from '@/lib/types';
import enMessages from '../../messages/en.json';
import arMessages from '../../messages/ar.json';
import { renderWithIntl } from '../test-utils';

const catalogs = { en: enMessages, ar: arMessages } as const;
type TestLocale = keyof typeof catalogs;

const h = vi.hoisted(() => ({ locale: 'en' as TestLocale }));

vi.mock('next-intl/server', () => ({
  getLocale: async () => h.locale,
  getTranslations: async (arg: unknown) => {
    const namespace = typeof arg === 'string' ? arg : (arg as { namespace: string }).namespace;
    return (key: string) =>
      ((catalogs[h.locale] as unknown as Record<string, Record<string, string>>)[namespace]?.[
        key
      ] ?? `${namespace}.${key}`);
  },
  setRequestLocale: () => undefined,
}));

vi.mock('next/image', () => ({
  default: (props: Record<string, unknown>) => {
    const { fill: _f, priority: _p, placeholder: _ph, ...imgProps } = props;
    void _f;
    void _p;
    void _ph;
    // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
    return <img {...imgProps} />;
  },
}));

vi.mock('@/i18n/navigation', () => ({
  Link: ({ href, children, ...rest }: { href: string; children: ReactNode }) => (
    <a href={typeof href === 'string' ? href : '#'} {...rest}>
      {children}
    </a>
  ),
}));

const svc: CarService = {
  _id: 's1',
  name: 'Exterior Car Wash',
  slug: 'exterior-car-wash',
  description: 'desc',
  image: '/x.jpg',
  basePrice: 200,
  duration: 60,
  isActive: true,
};

function fetchWith(result: 'fail' | 'empty' | 'services') {
  vi.stubGlobal(
    'fetch',
    vi.fn(() => {
      if (result === 'fail') return Promise.reject(new Error('network down'));
      const body = result === 'empty' ? [] : [svc];
      return Promise.resolve({ ok: true, json: () => Promise.resolve(body) } as Response);
    }),
  );
}

// Resolve async server children before handing the tree to the client-only test renderer.
async function resolveServerTree(node: ReactNode): Promise<ReactNode> {
  if (!isValidElement(node)) return node;
  const element = node as ReactElement<{children?:ReactNode}>;
  if (typeof element.type === 'function' && element.type.constructor.name === 'AsyncFunction') {
    const component = element.type as (props:unknown)=>Promise<ReactNode>;
    return resolveServerTree(await component(element.props));
  }
  if (element.props.children === undefined) return element;
  const children = await Promise.all(Children.toArray(element.props.children).map(resolveServerTree));
  return cloneElement(element, undefined, ...children);
}

describe('public services empty state', () => {
  beforeEach(() => {
    h.locale = 'en';
    vi.unstubAllGlobals();
  });

  it('returns the hero and a services Suspense boundary without waiting on the API', async () => {
    vi.stubGlobal('fetch', vi.fn(() => new Promise(() => {})));
    const { default: HomePage } = await import('@/app/[locale]/page');
    const tree = await HomePage();
    const children = Children.toArray(tree.props.children);
    const boundary = children.find(child => isValidElement(child) && child.type === Suspense);
    expect(boundary).toBeDefined();
    expect(fetch).not.toHaveBeenCalled();
    const hero = children[0];
    renderWithIntl(<>{hero}</>);
    expect(screen.getByRole('heading', {level:1})).toHaveTextContent(enMessages.Home.title);
  });

  it('home shows a clear unavailable message with a retry action when the fetch fails', async () => {
    fetchWith('fail');
    const { default: HomePage } = await import('@/app/[locale]/page');
    renderWithIntl(<>{await resolveServerTree(await HomePage())}</>);
    expect(screen.getByText(enMessages.Services.emptyTitle)).toBeInTheDocument();
    expect(screen.getByText(enMessages.Services.emptyDescription)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: enMessages.Common.tryAgain })).toBeInTheDocument();
    expect(screen.queryByText('Exterior Car Wash')).not.toBeInTheDocument();
  });

  it('home renders service cards when the fetch succeeds', async () => {
    fetchWith('services');
    const { default: HomePage } = await import('@/app/[locale]/page');
    renderWithIntl(<>{await resolveServerTree(await HomePage())}</>);
    expect(screen.getByText('Exterior Car Wash')).toBeInTheDocument();
    expect(screen.queryByText(enMessages.Services.emptyTitle)).not.toBeInTheDocument();
  });

  it('home shows the Arabic unavailable message when the fetch fails in ar', async () => {
    h.locale = 'ar';
    fetchWith('fail');
    const { default: HomePage } = await import('@/app/[locale]/page');
    renderWithIntl(<>{await resolveServerTree(await HomePage())}</>, 'ar');
    expect(screen.getByText(arMessages.Services.emptyTitle)).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: arMessages.Common.tryAgain }),
    ).toBeInTheDocument();
  });

  it('services index shows the unavailable message with a retry action on zero results', async () => {
    fetchWith('empty');
    const { default: ServicesPage } = await import('@/app/[locale]/services/page');
    renderWithIntl(await ServicesPage());
    expect(screen.getByText(enMessages.Services.emptyTitle)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: enMessages.Common.tryAgain })).toBeInTheDocument();
  });

  it('services index lists services when the fetch succeeds', async () => {
    fetchWith('services');
    const { default: ServicesPage } = await import('@/app/[locale]/services/page');
    renderWithIntl(await ServicesPage());
    expect(screen.getByText('Exterior Car Wash')).toBeInTheDocument();
    expect(screen.queryByText(enMessages.Services.emptyTitle)).not.toBeInTheDocument();
  });
});
