import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/login', '/register', '/dashboard', '/admin', '/book'],
      },
    ],
    sitemap: 'http://localhost:3000/sitemap.xml',
  };
}