import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { useOrganization } from '../hooks/useOrganization';
import WhatsAppIntegration from './WhatsAppIntegration';
import CreateOrganizationButton from './CreateOrganizationButton';

export default function ConfigPage() {
  const { organizationId, loading, refetch: loadOrganization } = useOrganization();

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-6 w-6 animate-spin text-primary-600" />
      </div>
    );
  }

  if (!organizationId) {
    return (
      <div className="space-y-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Configuración</h1>
          <p className="text-gray-600 mt-2">Gestiona la configuración de tu CMR</p>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-medium text-blue-800 mb-2">
                Organización no encontrada
              </h3>
              <p className="text-sm text-blue-700 mb-4">
                Necesitas crear una organización para usar las integraciones. Esto se hace automáticamente al registrarte, pero parece que no se creó.
              </p>
              <CreateOrganizationButton onCreated={loadOrganization} />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Configuración</h1>
        <p className="text-gray-600 mt-2">Gestiona la configuración de tu CMR</p>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">WhatsApp Business</h2>
          <p className="text-sm text-gray-600">
            Conecta tu número de WhatsApp Business para recibir y enviar mensajes desde tu CMR
          </p>
        </div>

        {/* WhatsApp Integration */}
        <WhatsAppIntegration organizationId={organizationId} />
      </div>
    </div>
  );
}

