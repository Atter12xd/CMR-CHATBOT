import { useEffect, useState, useRef } from 'react';
import { useAuth } from '../hooks/useAuth';
import { createClient } from '../lib/supabase';
import { Loader2 } from 'lucide-react';

const CACHE_KEY_PREFIX = 'subscription_ok_';

function getCachedSubscription(userId: string): boolean {
  if (typeof window === 'undefined') return false;
  try {
    return sessionStorage.getItem(`${CACHE_KEY_PREFIX}${userId}`) === '1';
  } catch {
    return false;
  }
}

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const [redirecting, setRedirecting] = useState(false);
  const [subscriptionChecked, setSubscriptionChecked] = useState(false);
  const [subscriptionActive, setSubscriptionActive] = useState<boolean | null>(null);
  const fetchStarted = useRef(false);

  const hasCachedSubscription = user ? getCachedSubscription(user.id) : false;

  useEffect(() => {
    if (!loading && !user && !redirecting) {
      setRedirecting(true);
      setTimeout(() => {
        window.location.href = '/login';
      }, 100);
    }
  }, [user, loading, redirecting]);

  useEffect(() => {
    if (!user) return;
    const cacheKey = `${CACHE_KEY_PREFIX}${user.id}`;
    if (fetchStarted.current) return;
    fetchStarted.current = true;
    let cancelled = false;
    (async () => {
      try {
        const { data: { session } } = await createClient().auth.getSession();
        if (!session?.access_token || cancelled) return;
        const res = await fetch('/api/subscription-status', {
          headers: { Authorization: `Bearer ${session.access_token}` },
        });
        const data = await res.json().catch(() => ({ active: false }));
        if (cancelled) return;
        const active = data.active === true;
        if (active) {
          try { sessionStorage.setItem(cacheKey, '1'); } catch { /* ignore */ }
        } else {
          try { sessionStorage.removeItem(cacheKey); } catch { /* ignore */ }
        }
        setSubscriptionActive(active);
        setSubscriptionChecked(true);
      } catch {
        if (!cancelled) {
          try { sessionStorage.removeItem(cacheKey); } catch { /* ignore */ }
          setSubscriptionActive(false);
          setSubscriptionChecked(true);
        }
      }
    })();
    return () => { cancelled = true; };
  }, [user, subscriptionChecked]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary-600 mx-auto mb-4" />
          <p className="text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  if (redirecting || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary-600 mx-auto mb-4" />
          <p className="text-gray-600">Redirigiendo...</p>
        </div>
      </div>
    );
  }

  if (subscriptionChecked && subscriptionActive === false) {
    window.location.href = '/precios?suscribir=1';
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary-600 mx-auto mb-4" />
          <p className="text-gray-600">Redirigiendo a planes...</p>
        </div>
      </div>
    );
  }

  if (subscriptionActive === null && !hasCachedSubscription) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary-600 mx-auto mb-4" />
          <p className="text-gray-600">Verificando suscripción...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

