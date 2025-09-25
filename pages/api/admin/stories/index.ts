import type { NextApiRequest, NextApiResponse } from 'next';
import { verifyRequest } from '@/lib/authServer';
import { getSupabaseAdminClient, supabaseAdminConfigured } from '@/lib/supabaseAdmin';
import { adminDb, hasFirebaseAdmin } from '@/lib/firebaseAdmin';
import { Story } from '@/types/index';

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
        const { data, error } = await supabase.from('stories').select('*').order('title');
        if (error) {
          throw error;
        }
        res.status(200).json({ stories: data });
        return;
      }

      if (req.method === 'POST') {
        const story = req.body as Partial<Story>;
        if (!story.title || !story.author || !story.audioUrl) {
          res.status(400).json({ error: 'Missing required story fields' });
          return;
        }
        const payload = {
          title: story.title,
          author: story.author,
          description: story.description ?? '',
          cover_url: story.coverImageUrl ?? '',
          audio_url: story.audioUrl,
          tags: story.tags ?? [],
          is_premium: story.isPremium ?? false,
          duration_minutes: story.durationMinutes ?? 0,
        };
        const { data, error } = await supabase.from('stories').insert(payload).select('id').single();
        if (error) {
          throw error;
        }
        res.status(201).json({ id: data?.id });
        return;
      }
    } else if (hasFirebaseAdmin && adminDb) {
      if (req.method === 'GET') {
        const snapshot = await adminDb.collection('stories').orderBy('title').get();
        const stories = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        res.status(200).json({ stories });
        return;
      }

      if (req.method === 'POST') {
        const story = req.body as Partial<Story>;
        if (!story.title || !story.author || !story.audioUrl) {
          res.status(400).json({ error: 'Missing required story fields' });
          return;
        }
        const payload = {
          title: story.title,
          author: story.author,
          description: story.description ?? '',
          coverImageUrl: story.coverImageUrl ?? '',
          audioUrl: story.audioUrl,
          tags: story.tags ?? [],
          isPremium: story.isPremium ?? false,
          durationMinutes: story.durationMinutes ?? 0,
          createdAt: new Date().toISOString(),
        };
        const docRef = await adminDb.collection('stories').add(payload);
        res.status(201).json({ id: docRef.id });
        return;
      }
    } else {
      res.status(500).json({ error: 'No admin backend configured' });
      return;
    }

    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end('Method Not Allowed');
  } catch (error) {
    console.error('Admin stories handler error', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
