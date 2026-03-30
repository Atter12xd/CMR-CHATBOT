import { useState } from 'react';
import { Loader2, Plus } from 'lucide-react';
import { createClient } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';

interface CreateOrganizationButtonProps {
  onCreated: () => void;
}

export default function CreateOrganizationButton({ onCreated }: CreateOrganizationButtonProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const supabase = createClient();

  const handleCreate = async () => {
    if (!user) {
      setError('No hay usuario autenticado');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Obtener nombre del usuario o email
      const userName = user.user_metadata?.name || user.email?.split('@')[0] || 'Mi Organización';

      const { data, error: createError } = await supabase
        .from('organizations')
        .insert({
          name: userName,
          owner_id: user.id,
        })
        .select()
        .single();

      if (createError) {
        throw createError;
      }

      // Recargar organización
      onCreated();
    } catch (err: any) {
      console.error('Error creating organization:', err);
      setError(err.message || 'Error al crear la organización');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <button
        onClick={handleCreate}
        disabled={loading}
        className="inline-flex items-center gap-2 px-5 py-2.5 bg-app-charcoal text-white text-sm font-semibold rounded-full hover:bg-black shadow-md transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? (
          <>
            <Loader2 size={16} className="animate-spin" />
            <span>Creando...</span>
          </>
        ) : (
          <>
            <Plus size={16} />
            <span>Crear Organización</span>
          </>
        )}
      </button>
      {error && (
        <p className="mt-2 text-sm text-rose-600">{error}</p>
      )}
    </div>
  );
}

