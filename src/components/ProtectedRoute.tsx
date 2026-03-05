import { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { createClient } from '../lib/supabase';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const [redirecting, setRedirecting] = useState(false);
  const [subscriptionChecked, setSubscriptionChecked] = useState(false);
  const [subscriptionActive, setSubscriptionActive] = useState<boolean | null>(null);

  useEffect(() => {
    if (!loading && !user && !redirecting) {
      setRedirecting(true);
      setTimeout(() => {
        window.location.href = '/login';
      }, 100);
    }
  }, [user, loading, redirecting]);

  useEffect(() => {
    if (!user || subscriptionChecked) return;
    let cancelled = false;
    (async () => {
      try {
        const { data: { session } } = await createClient().auth.getSession();
        if (!session?.access_token || cancelled) return;
        const res = await fetch('/api/subscription-status', {
          headers: { Authorization: `Bearer ${session.access_token}` },
        });
        const data = await res.json().catch(() => ({ active: false }));
        if (!cancelled) {
          setSubscriptionActive(data.active === true);
          setSubscriptionChecked(true);
        }
      } catch {
        if (!cancelled) {
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

  if (!subscriptionChecked || subscriptionActive === null) {
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

