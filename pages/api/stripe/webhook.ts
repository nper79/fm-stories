import type { NextApiRequest, NextApiResponse } from 'next';
import Stripe from 'stripe';
import { stripe } from '@/lib/stripe';
import { adminDb } from '@/lib/firebaseAdmin';

export const config = {
  api: {
    bodyParser: false,
  },
};

async function readBuffer(readable: NextApiRequest): Promise<Buffer> {
  const chunks: Uint8Array[] = [];
  for await (const chunk of readable) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
  }
  return Buffer.concat(chunks);
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const firebaseUid = session.metadata?.firebaseUid;
  if (!firebaseUid || !adminDb) {
    return;
  }
  const customerId = typeof session.customer === 'string' ? session.customer : session.customer?.id;
  const subscriptionId = typeof session.subscription === 'string' ? session.subscription : session.subscription?.id;
  const userRef = adminDb.collection('users').doc(firebaseUid);
  await userRef.set(
    {
      subscriptionTier: 'premium',
      stripeCustomerId: customerId,
      stripeSubscriptionId: subscriptionId,
      premiumSince: new Date().toISOString(),
    },
    { merge: true },
  );
}

async function handleSubscriptionEnded(subscription: Stripe.Subscription) {
  if (!adminDb) {
    return;
  }
  
  let firebaseUid = subscription.metadata?.firebaseUid;
  if (!firebaseUid) {
    const customerId = typeof subscription.customer === 'string' ? subscription.customer : subscription.customer?.id;
    if (customerId) {
      const snapshot = await adminDb
        .collection('users')
        .where('stripeCustomerId', '==', customerId)
        .limit(1)
        .get();
      if (!snapshot.empty) {
        firebaseUid = snapshot.docs[0].id;
      }
    }
  }

  if (!firebaseUid) {
    return;
  }

  await adminDb.collection('users').doc(firebaseUid).set(
    {
      subscriptionTier: 'free',
      stripeSubscriptionId: null,
    },
    { merge: true },
  );
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    res.status(405).end('Method Not Allowed');
    return;
  }

  const signature = req.headers['stripe-signature'];
  if (!signature || !process.env.STRIPE_WEBHOOK_SECRET) {
    res.status(400).json({ error: 'Missing webhook signature' });
    return;
  }

  try {
    const body = await readBuffer(req);
    const event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET);

    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session);
        break;
      case 'customer.subscription.deleted':
        await handleSubscriptionEnded(event.data.object as Stripe.Subscription);
        break;
      default:
        break;
    }

    res.status(200).json({ received: true });
  } catch (error) {
    console.error('Stripe webhook error', error);
    res.status(400).json({ error: 'Webhook error' });
  }
}
