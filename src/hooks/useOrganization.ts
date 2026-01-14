import { useState, useEffect } from 'react';
import { createClient } from '../lib/supabase';
import { useAuth } from './useAuth';

export function useOrganization() {
  const { user } = useAuth();
  const [organizationId, setOrganizationId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    if (!user) {
      setOrganizationId(null);
      setLoading(false);
      return;
    }

    loadOrganization();
  }, [user]);

  const loadOrganization = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('organizations')
        .select('id')
        .eq('owner_id', user?.id)
        .single();

      if (error) {
        console.error('Error loading organization:', error);
        setOrganizationId(null);
      } else {
        setOrganizationId(data?.id || null);
      }
    } catch (err) {
      console.error('Error loading organization:', err);
      setOrganizationId(null);
    } finally {
      setLoading(false);
    }
  };

  return { organizationId, loading, refetch: loadOrganization };
}

