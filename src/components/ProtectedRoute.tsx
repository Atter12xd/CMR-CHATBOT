import { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { createClient } from '../lib/supabase';
import { Loader2 } from 'lucide-react';
import {
  readSubscriptionAccessCache,
  writeSubscriptionAccessCache,
} from '../lib/subscription-access-cache';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const [redirecting, setRedirecting] = useState(false);
  const [subscriptionChecked, setSubscriptionChecked] = useState(false);
  const [subscriptionActive, setSubscriptionActive] = useState<boolean | null>(null);

  const cachedSubOk = Boolean(user?.id && readSubscriptionAccessCache(user.id));

  useEffect(() => {
    if (!loading && !user && !redirecting) {
      setRedirecting(true);
      setTimeout(() => {
        window.location.href = '/login';
      }, 100);
    }
  }, [user, loading, redirecting]);

  useEffect(() => {
    if (!user?.id) {
      setSubscriptionChecked(false);
      setSubscriptionActive(null);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const {
          data: { session },
        } = await createClient().auth.getSession();
        if (!session?.access_token || cancelled) return;
        const res = await fetch('/api/subscription-status', {
          headers: { Authorization: `Bearer ${session.access_token}` },
        });
        const data = await res.json().catch(() => ({ active: false }));
        const active = data.active === true;
        if (!cancelled) {
          writeSubscriptionAccessCache(user.id, active);
          setSubscriptionActive(active);
          setSubscriptionChecked(true);
        }
      } catch {
        if (!cancelled) {
          writeSubscriptionAccessCache(user.id, false);
          setSubscriptionActive(false);
          setSubscriptionChecked(true);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [user?.id]);

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

  const allowApp = subscriptionActive === true || cachedSubOk;

  if (!allowApp) {
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
