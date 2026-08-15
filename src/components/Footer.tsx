import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-white">
      <div className="container-page grid gap-8 py-10 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <p className="text-lg font-bold text-gray-900">
            Mobile<span className="text-brand-600">CarCare</span>
          </p>
          <p className="mt-2 text-sm text-gray-500">
            Professional mobile car care services delivered to your location.
          </p>
        </div>
        <div>
          <h3 className="text-sm font-semibold text-gray-900">Explore</h3>
          <ul className="mt-3 space-y-2 text-sm text-gray-500">
            <li><Link className="hover:text-gray-900" href="/services">Services</Link></li>
            <li><Link className="hover:text-gray-900" href="/how-it-works">How It Works</Link></li>
            <li><Link className="hover:text-gray-900" href="/about">About</Link></li>
            <li><Link className="hover:text-gray-900" href="/faq">FAQ</Link></li>
          </ul>
        </div>
        <div>
          <h3 className="text-sm font-semibold text-gray-900">Account</h3>
          <ul className="mt-3 space-y-2 text-sm text-gray-500">
            <li><Link className="hover:text-gray-900" href="/register">Register</Link></li>
            <li><Link className="hover:text-gray-900" href="/login">Login</Link></li>
            <li><Link className="hover:text-gray-900" href="/dashboard">Dashboard</Link></li>
            <li><Link className="hover:text-gray-900" href="/book">Book a Service</Link></li>
          </ul>
        </div>
        <div>
          <h3 className="text-sm font-semibold text-gray-900">Contact</h3>
          <ul className="mt-3 space-y-2 text-sm text-gray-500">
            <li><Link className="hover:text-gray-900" href="/contact">Contact Us</Link></li>
            <li>Monday – Sunday</li>
            <li>09:00 – 18:00</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-gray-200 py-5">
        <p className="container-page text-center text-xs text-gray-400">
          © {new Date().getFullYear()} Mobile CarCare. All rights reserved.
        </p>
      </div>
    </footer>
  );
}