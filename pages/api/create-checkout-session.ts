import type { NextApiRequest, NextApiResponse } from 'next';
import { verifyRequest } from '@/lib/authServer';
import { stripe } from '@/lib/stripe';
import { adminDb } from '@/lib/firebaseAdmin';

const priceId = process.env.NEXT_PUBLIC_STRIPE_PRICE_ID;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    res.status(405).end('Method Not Allowed');
    return;
  }

  try {
    const auth = await verifyRequest(req);
    if (!auth?.uid) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    if (!priceId) {
      res.status(500).json({ error: 'Stripe price configuration missing' });
      return;
    }

    if (!adminDb) {
      res.status(500).json({ error: 'Database not available' });
      return;
    }

    const userRef = adminDb.collection('users').doc(auth.uid);
    const snapshot = await userRef.get();
    if (!snapshot.exists) {
      res.status(404).json({ error: 'User profile not found' });
      return;
    }

    const userData = snapshot.data() as { stripeCustomerId?: string; email?: string };
    let customerId = userData.stripeCustomerId;

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: userData.email ?? auth.email ?? undefined,
        metadata: { firebaseUid: auth.uid },
      });
      customerId = customer.id;
      await userRef.set({ stripeCustomerId: customerId }, { merge: true });
    }

    const origin = req.headers.origin ?? process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      customer: customerId,
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${origin}/account?checkout=success`,
      cancel_url: `${origin}/account?checkout=cancel`,
      metadata: {
        firebaseUid: auth.uid,
      },
      subscription_data: {
        metadata: {
          firebaseUid: auth.uid,
        },
      },
    });

    res.status(200).json({ checkoutUrl: session.url });
  } catch (error) {
    console.error('Create checkout session error', error);
    res.status(500).json({ error: 'Unable to create checkout session' });
  }
}
