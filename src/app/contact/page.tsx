import type { Metadata } from 'next';
import ContactForm from './ContactForm';

export const metadata: Metadata = {
  title: 'Contact',
  description:
    'Get in touch with Mobile CarCare — we are happy to answer your questions about our mobile car care services.',
};

export default function ContactPage() {
  return (
    <div className="container-page max-w-3xl py-14">
      <h1 className="text-3xl font-bold text-gray-900">Contact Us</h1>
      <p className="mt-3 text-gray-600">
        Questions about our services or a booking? Send us a message and we will get back to you.
      </p>

      <ContactForm />

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <div className="card text-center">
          <p className="font-semibold text-gray-900">Working hours</p>
          <p className="mt-1 text-sm text-gray-500">Daily · 09:00 – 18:00</p>
        </div>
        <div className="card text-center">
          <p className="font-semibold text-gray-900">Service area</p>
          <p className="mt-1 text-sm text-gray-500">Your city and neighborhood</p>
        </div>
        <div className="card text-center">
          <p className="font-semibold text-gray-900">Booking</p>
          <p className="mt-1 text-sm text-gray-500">Online, anytime</p>
        </div>
      </div>
    </div>
  );
}