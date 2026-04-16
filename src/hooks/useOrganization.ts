import { useState, useEffect, useLayoutEffect } from 'react';
import { createClient } from '../lib/supabase';
import { readOrganizationCache, writeOrganizationCache } from '../lib/organization-cache';
import { useAuth } from './useAuth';

export function useOrganization() {
  const { user } = useAuth();
  const [organizationId, setOrganizationId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useLayoutEffect(() => {
    if (!user?.id) {
      setOrganizationId(null);
      setLoading(false);
      return;
    }
    const cached = readOrganizationCache(user.id);
    if (cached !== undefined) {
      setOrganizationId(cached);
      setLoading(false);
    } else {
      setOrganizationId(null);
      setLoading(true);
    }
  }, [user?.id]);

  useEffect(() => {
    if (!user?.id) {
      setOrganizationId(null);
      setLoading(false);
      return;
    }

    let cancelled = false;

    (async () => {
      try {
        const { data, error } = await supabase
          .from('organizations')
          .select('id')
          .eq('owner_id', user.id)
          .maybeSingle();

        if (cancelled) return;

        if (error) {
          console.error('Error loading organization:', error);
          setOrganizationId(null);
          writeOrganizationCache(user.id, null);
        } else {
          const id = data?.id ?? null;
          setOrganizationId(id);
          writeOrganizationCache(user.id, id);
        }
      } catch (err) {
        console.error('Error loading organization:', err);
        if (!cancelled) {
          setOrganizationId(null);
          writeOrganizationCache(user.id, null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [user?.id, supabase]);

  const loadOrganization = async () => {
    if (!user?.id) return;
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('organizations')
        .select('id')
        .eq('owner_id', user.id)
        .maybeSingle();

      if (error) {
        console.error('Error loading organization:', error);
        setOrganizationId(null);
        writeOrganizationCache(user.id, null);
      } else {
        const id = data?.id ?? null;
        setOrganizationId(id);
        writeOrganizationCache(user.id, id);
      }
    } catch (err) {
      console.error('Error loading organization:', err);
      setOrganizationId(null);
      writeOrganizationCache(user.id, null);
    } finally {
      setLoading(false);
    }
  };

  return { organizationId, loading, refetch: loadOrganization };
}
