import type { MetadataRoute } from 'next';
import { API_URL } from '@/lib/api';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = 'http://localhost:3000';

  const staticPages = [
    '',
    '/services',
    '/about',
    '/how-it-works',
    '/contact',
    '/faq',
  ].map((path) => ({
    url: `${base}${path}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: path === '' ? 1 : 0.8,
  }));

  let servicePages: MetadataRoute.Sitemap = [];
  try {
    const res = await fetch(`${API_URL}/services`, { next: { revalidate: 3600 } });
    if (res.ok) {
      const services = (await res.json()) as Array<{ slug: string; updatedAt?: string }>;
      servicePages = services.map((service) => ({
        url: `${base}/services/${service.slug}`,
        lastModified: service.updatedAt ? new Date(service.updatedAt) : new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.9,
      }));
    }
  } catch {
    // keep static pages even if the API is temporarily unavailable
  }

  return [...staticPages, ...servicePages];
}