# unoduo

A pay-to-rank leaderboard of apps built for iPhone Duo. Listing is free; developers boost their app with any amount, boosts add up and never expire, and the leaderboard is ordered by total boosted. Ties go to whoever reached the total first.

## How it works

- **List**: paste an App Store link and a tagline. The name, developer and icon come from Apple's iTunes Search API, so every listing is a real App Store app, and each app can be listed only once.
- **Boost**: pick an amount on an app's page (the form suggests how much it takes to pass the app above and to take #1). Payment runs through Stripe Checkout.
- **Rank**: Stripe's `checkout.session.completed` webhook calls the `record_boost` database function, which records the payment once per Checkout session and adds it to the app's total, then the leaderboard cache is refreshed.

Stack: Next.js 16 (App Router, Cache Components), Supabase Postgres, Stripe Checkout, Tailwind CSS.

## Setup

1. Create a Supabase project and run `supabase/migrations/0001_init.sql` (SQL editor, or `supabase db push`).
2. Copy `.env.example` to `.env.local` and fill it in.
3. In Stripe, add a webhook endpoint at `https://<your-domain>/api/stripe/webhook` for `checkout.session.completed` and `checkout.session.async_payment_succeeded`, and put its signing secret in `STRIPE_WEBHOOK_SECRET`. Locally: `stripe listen --forward-to localhost:3000/api/stripe/webhook`.
4. `npm install && npm run dev`.

## Moderation

Listings publish straight away unless `REQUIRE_APPROVAL=true`, which holds them as `pending`. To approve or take down a listing, set `apps.status` to `approved` or `hidden` in the Supabase table editor.
