import { NextApiRequest } from 'next';
import { getSupabaseAdminClient, supabaseAdminConfigured } from '@/lib/supabaseAdmin';
import { adminAuth, hasFirebaseAdmin } from '@/lib/firebaseAdmin';

export interface AuthenticatedRequest {
  uid: string;
  email?: string;
}

export async function verifyRequest(req: NextApiRequest): Promise<AuthenticatedRequest | null> {
  const authorization = req.headers.authorization;
  if (!authorization?.startsWith('Bearer ')) {
    return null;
  }

  const token = authorization.replace('Bearer ', '').trim();
  if (!token) {
    return null;
  }

  if (supabaseAdminConfigured) {
    const supabase = getSupabaseAdminClient();
    if (!supabase) {
      return null;
    }
    const { data, error } = await supabase.auth.getUser(token);
    if (error || !data?.user) {
      return null;
    }
    return { uid: data.user.id, email: data.user.email ?? undefined };
  }

  if (hasFirebaseAdmin && adminAuth) {
    const decoded = await adminAuth.verifyIdToken(token);
    return { uid: decoded.uid, email: decoded.email ?? undefined };
  }

  return null;
}
