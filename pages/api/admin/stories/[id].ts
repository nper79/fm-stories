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

    const { id } = req.query;
    if (typeof id !== 'string') {
      res.status(400).json({ error: 'Invalid story id' });
      return;
    }

    if (supabaseAdminConfigured) {
      const supabase = getSupabaseAdminClient();
      if (!supabase) {
        res.status(500).json({ error: 'Supabase admin client unavailable' });
        return;
      }

      if (req.method === 'GET') {
        const { data, error } = await supabase.from('stories').select('*').eq('id', id).maybeSingle();
        if (error) {
          throw error;
        }
        if (!data) {
          res.status(404).json({ error: 'Story not found' });
          return;
        }
        res.status(200).json({ story: data });
        return;
      }

      if (req.method === 'PUT') {
        const story = req.body as Partial<Story>;
        const payload: Record<string, any> = {};
        if (story.title !== undefined) payload.title = story.title;
        if (story.author !== undefined) payload.author = story.author;
        if (story.description !== undefined) payload.description = story.description;
        if (story.coverImageUrl !== undefined) payload.cover_url = story.coverImageUrl;
        if (story.audioUrl !== undefined) payload.audio_url = story.audioUrl;
        if (story.tags !== undefined) payload.tags = story.tags;
        if (story.isPremium !== undefined) payload.is_premium = story.isPremium;
        if (story.durationMinutes !== undefined) payload.duration_minutes = story.durationMinutes;
        const { error } = await supabase.from('stories').update(payload).eq('id', id);
        if (error) {
          throw error;
        }
        res.status(200).json({ success: true });
        return;
      }

      if (req.method === 'DELETE') {
        const { error } = await supabase.from('stories').delete().eq('id', id);
        if (error) {
          throw error;
        }
        res.status(200).json({ success: true });
        return;
      }
    } else if (hasFirebaseAdmin && adminDb) {
      const docRef = adminDb.collection('stories').doc(id);

      if (req.method === 'GET') {
        const snapshot = await docRef.get();
        if (!snapshot.exists) {
          res.status(404).json({ error: 'Story not found' });
          return;
        }
        res.status(200).json({ story: { id: snapshot.id, ...snapshot.data() } });
        return;
      }

      if (req.method === 'PUT') {
        const story = req.body as Partial<Story>;
        await docRef.set(story, { merge: true });
        res.status(200).json({ success: true });
        return;
      }

      if (req.method === 'DELETE') {
        await docRef.delete();
        res.status(200).json({ success: true });
        return;
      }
    } else {
      res.status(500).json({ error: 'No admin backend configured' });
      return;
    }

    res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
    res.status(405).end('Method Not Allowed');
  } catch (error) {
    console.error('Admin story detail error', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
