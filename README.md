# Mobile Car Care | Frontend

The customer and admin web app for **Mobile Car Care**, a full-stack platform for booking car care services that come to the customer's location.

**Live:** https://mobilecarcare.vercel.app

> Note: the repo name keeps the original `fronend` spelling; the API lives in [Car-Wash-backend](https://github.com/Abdobeaih/Car-Wash-backend), and a combined overview with full documentation is in [Car-Wash](https://github.com/Abdobeaih/Car-Wash).

## Current interface

![Mobile Car Care homepage](https://raw.githubusercontent.com/Abdobeaih/Abdobeaih/main/assets/mobile-carcare.svg)

- Black and lime visual theme with a car-and-curtain intro
- English and Arabic pages with RTL support
- Customer booking flow, vehicles and booking history
- Admin dashboard and date-filtered analytics for bookings and manually recorded payments
- Payments are recorded by an admin, not processed through an online payment gateway

## Stack

- Next.js + React + TypeScript
- next-intl for bilingual English/Arabic (RTL) pages
- Motion for animations
- world-countries data for location handling

## Getting started

```bash
npm install
npm run dev
```
