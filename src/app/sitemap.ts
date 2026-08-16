import type { MetadataRoute } from 'next';
import { API_URL } from '@/lib/api';
import { routing } from '@/i18n/routing';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = 'http://localhost:3000';

  const staticPaths = [
    '',
    '/services',
    '/about',
    '/how-it-works',
    '/contact',
    '/faq',
  ];

  const staticPages = routing.locales.flatMap((locale) =>
    staticPaths.map((path) => ({
      url: `${base}/${locale}${path}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: path === '' ? 1 : 0.8,
    })),
  );

  let servicePages: MetadataRoute.Sitemap = [];
  try {
    const res = await fetch(`${API_URL}/services`, { next: { revalidate: 3600 } });
    if (res.ok) {
      const services = (await res.json()) as Array<{ slug: string; updatedAt?: string }>;
      servicePages = routing.locales.flatMap((locale) =>
        services.map((service) => ({
          url: `${base}/${locale}/services/${service.slug}`,
          lastModified: service.updatedAt ? new Date(service.updatedAt) : new Date(),
          changeFrequency: 'weekly' as const,
          priority: 0.9,
        })),
      );
    }
  } catch {
    // keep static pages even if the API is temporarily unavailable
  }

  return [...staticPages, ...servicePages];
}