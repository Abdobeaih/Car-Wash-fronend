import type { MetadataRoute } from 'next';
import { routing } from '@/i18n/routing';

export default function robots(): MetadataRoute.Robots {
  const restricted = ['/login', '/register', '/dashboard', '/admin', '/book'];
  const disallow = routing.locales.flatMap((locale) =>
    restricted.map((path) => `/${locale}${path}`),
  );

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow,
      },
    ],
    sitemap: `${process.env.SITE_URL ?? 'http://localhost:3000'}/sitemap.xml`,
  };
}