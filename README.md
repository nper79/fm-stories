# Pocket FM Clone

A Pocket FM inspired web application built with Next.js 14, Firebase, and Stripe. Listeners can stream free audio stories, upgrade to premium via Stripe Checkout, and administrators can manage users and story content using a Firebase-backed dashboard.

## Features

- Google OAuth via Firebase Authentication
- Firestore-backed user profiles with playback metadata
- Free vs premium story catalog, with gated playback
- Responsive audio player experience
- Admin console for managing stories and user subscription tiers
- Stripe Checkout billing with webhook-driven entitlement updates

## Tech Stack

- Next.js 14 (App Router disabled for simplicity)
- React 18 + TypeScript
- Firebase (Auth, Firestore, Storage ready)
- Stripe for payments

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Firebase setup

1. Create a Firebase project and enable **Google Sign-In** under Authentication providers.
2. Create a Firestore database in production mode.
3. (Optional) Enable Firebase Storage if you intend to upload cover art or audio files through the Firebase console or admin tools.
4. Generate a web app in the Firebase console and copy the client credentials into `.env.local` using the template below.
5. Create a service account (Project Settings ? Service accounts) and download the JSON key. Use its values for the Admin credentials in `.env.local`.

### 3. Stripe setup

1. Create a Stripe account and set up a recurring **Price** (Product ? Pricing ? Recurring). Copy the Price ID.
2. Populate the publishable, secret, and webhook signing keys in `.env.local`.
3. Expose the local webhook endpoint while developing:

```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

### 4. Environment variables

Create `.env.local` with the following values:

```
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=
FIREBASE_ADMIN_PROJECT_ID=
FIREBASE_ADMIN_CLIENT_EMAIL=
FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----
...
-----END PRIVATE KEY-----
"
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
NEXT_PUBLIC_STRIPE_PRICE_ID=
ADMIN_EMAIL=
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

> Ensure the private key preserves newline escape sequences (`
`).

### 5. Run the development server

```bash
npm run dev
```

Open `http://localhost:3000` in your browser.

## Admin Console

- Sign in with the email defined in `ADMIN_EMAIL` to unlock `/admin`.
- Create new stories (supply existing cover/audio URLs) and adjust user subscription tiers directly.
- Changes persist immediately in Firestore collections `stories` and `users`.

## Stripe Webhooks

- `checkout.session.completed` upgrades the corresponding Firebase user to premium.
- `customer.subscription.deleted` downgrades the user back to free.

Ensure the webhook endpoint is reachable from Stripe (via the Stripe CLI during local development or a deployed URL in production).

## Project Structure

```
/pages              # Next.js page routes (auth, admin, library, API)
/src/components     # UI components (layout, story cards, audio player)
/src/context        # Firebase auth context provider
/src/hooks          # Shared React hooks (premium access, authed fetch)
/src/lib            # Firebase/Stripe helpers
/src/styles         # CSS modules and global styles
/src/types          # Shared TypeScript types
```

## Notes

- The catalog currently expects audio URLs that are already hosted (Firebase Storage, Cloud Storage, etc.). Extend the admin panel to upload files if needed.
- Always deploy the Stripe webhook handler to a secure environment and restrict admin access with both Firebase rules and server-side checks.
- Add additional analytics, recommendation engines, or offline features as future enhancements.

Enjoy building your own audio storytelling platform!

