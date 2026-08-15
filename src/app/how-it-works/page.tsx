import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'How It Works',
  description:
    'See how easy it is to book a mobile car care service with Mobile CarCare in just a few steps.',
};

const steps = [
  {
    title: 'Browse services',
    text: 'Choose from exterior wash, interior cleaning, full detailing or premium detailing packages.',
  },
  {
    title: 'Create an account',
    text: 'Register with your email and add your vehicle details so booking is fast every time.',
  },
  {
    title: 'Select your vehicle',
    text: 'Pick one of your saved vehicles or add a new one during the booking flow.',
  },
  {
    title: 'Pick add-ons',
    text: 'Add extras like tire cleaning, engine bay cleaning, leather conditioning or odor treatment.',
  },
  {
    title: 'Choose location & time',
    text: 'Tell us where your car is and select an available date and time that works for you.',
  },
  {
    title: 'We come to you',
    text: 'A professional arrives at your location, completes the service and you are done.',
  },
];

export default function HowItWorksPage() {
  return (
    <div className="container-page max-w-4xl py-14">
      <h1 className="text-3xl font-bold text-gray-900">How It Works</h1>
      <p className="mt-3 text-gray-600">
        Booking a mobile car care service takes less than two minutes.
      </p>
      <ol className="mt-10 space-y-6">
        {steps.map((step, index) => (
          <li key={step.title} className="card flex gap-4">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-600 font-bold text-white">
              {index + 1}
            </span>
            <div>
              <h2 className="font-semibold text-gray-900">{step.title}</h2>
              <p className="mt-1 text-sm text-gray-600">{step.text}</p>
            </div>
          </li>
        ))}
      </ol>
      <div className="mt-10 text-center">
        <Link href="/book" className="btn-primary px-6 py-3 text-base">
          Book a Service
        </Link>
      </div>
    </div>
  );
}