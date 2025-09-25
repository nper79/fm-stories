import { useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';

export function useAuthedFetch() {
  const { getAccessToken } = useAuth();

  return useCallback(
    async (input: RequestInfo | URL, init?: RequestInit) => {
      const token = await getAccessToken();
      const headers = new Headers(init?.headers ?? {});
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      return fetch(input, { ...init, headers });
    },
    [getAccessToken],
  );
}
