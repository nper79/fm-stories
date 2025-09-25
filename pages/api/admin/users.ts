import type { NextApiRequest, NextApiResponse } from 'next';
import { verifyRequest } from '@/lib/authServer';
import { getSupabaseAdminClient, supabaseAdminConfigured } from '@/lib/supabaseAdmin';
import { adminDb, adminAuth, hasFirebaseAdmin } from '@/lib/firebaseAdmin';

const ADMIN_EMAIL = process.env.ADMIN_EMAIL?.toLowerCase();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const auth = await verifyRequest(req);
    if (!auth || (ADMIN_EMAIL && auth.email?.toLowerCase() !== ADMIN_EMAIL)) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    if (supabaseAdminConfigured) {
      const supabase = getSupabaseAdminClient();
      if (!supabase) {
        res.status(500).json({ error: 'Supabase admin client unavailable' });
        return;
      }

      if (req.method === 'GET') {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .order('created_at', { ascending: false });
        if (error) {
          throw error;
        }
        res.status(200).json({ users: data });
        return;
      }

      if (req.method === 'PATCH') {
        const { uid, subscriptionTier } = req.body as { uid?: string; subscriptionTier?: string; isAdmin?: boolean };
        if (!uid || !subscriptionTier) {
          res.status(400).json({ error: 'Missing uid or subscriptionTier' });
          return;
        }
        const payload: Record<string, any> = { subscription_tier: subscriptionTier };
        if (typeof req.body.isAdmin === 'boolean') {
          payload.is_admin = req.body.isAdmin;
        }
        const { error } = await supabase.from('profiles').update(payload).eq('id', uid);
        if (error) {
          throw error;
        }
        res.status(200).json({ success: true });
        return;
      }

      if (req.method === 'DELETE') {
        const { uid } = req.body as { uid?: string };
        if (!uid) {
          res.status(400).json({ error: 'Missing uid' });
          return;
        }
        const { error } = await supabase.from('profiles').delete().eq('id', uid);
        if (error) {
          throw error;
        }
        await supabase.auth.admin.deleteUser(uid);
        res.status(200).json({ success: true });
        return;
      }
    } else if (hasFirebaseAdmin && adminDb && adminAuth) {
      if (req.method === 'GET') {
        const snapshot = await adminDb.collection('users').orderBy('createdAt', 'desc').get();
        const users = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        res.status(200).json({ users });
        return;
      }

      if (req.method === 'PATCH') {
        const { uid, subscriptionTier } = req.body as { uid?: string; subscriptionTier?: string };
        if (!uid || !subscriptionTier) {
          res.status(400).json({ error: 'Missing uid or subscriptionTier' });
          return;
        }
        await adminDb.collection('users').doc(uid).set({ subscriptionTier }, { merge: true });
        res.status(200).json({ success: true });
        return;
      }

      if (req.method === 'DELETE') {
        const { uid } = req.body as { uid?: string };
        if (!uid) {
          res.status(400).json({ error: 'Missing uid' });
          return;
        }
        await adminDb.collection('users').doc(uid).delete();
        await adminAuth.deleteUser(uid);
        res.status(200).json({ success: true });
        return;
      }
    } else {
      res.status(500).json({ error: 'No admin backend configured' });
      return;
    }

    res.setHeader('Allow', ['GET', 'PATCH', 'DELETE']);
    res.status(405).end('Method Not Allowed');
  } catch (error) {
    console.error('Admin users handler error', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
