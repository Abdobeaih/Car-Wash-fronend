import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { AuthProvider } from '@/lib/auth-context';

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });

export const metadata: Metadata = {
  metadataBase: new URL('http://localhost:3000'),
  title: {
    default: 'Mobile CarCare — Professional Mobile Car Care Services',
    template: '%s | Mobile CarCare',
  },
  description:
    'Book professional mobile car care services — exterior wash, interior cleaning and full detailing — delivered to your location. Simple online booking.',
  keywords: [
    'mobile car wash',
    'car detailing',
    'interior cleaning',
    'car care booking',
    'mobile detailing',
  ],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: '/',
    siteName: 'Mobile CarCare',
    title: 'Mobile CarCare — Professional Mobile Car Care Services',
    description:
      'Book professional mobile car care services delivered to your location. Simple online booking.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Mobile CarCare — Professional Mobile Car Care Services',
    description:
      'Book professional mobile car care services delivered to your location. Simple online booking.',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={inter.variable} data-scroll-behavior="smooth">
      <body className="flex min-h-screen flex-col">
        <AuthProvider>
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}