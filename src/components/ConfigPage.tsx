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
        <h2 className="text-lg font-semibold text-gray-900 mb-6">Integraciones</h2>
        
        {/* Facebook Messenger - Placeholder */}
        <div className="mb-6 pb-6 border-b border-gray-200">
          <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold">f</span>
              </div>
              <div>
                <h3 className="font-medium text-gray-900">Facebook Messenger</h3>
                <p className="text-sm text-gray-500">Conecta tu página de Facebook</p>
              </div>
            </div>
            <button className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors">
              Conectar
            </button>
          </div>
        </div>

        {/* WhatsApp Integration */}
        <div>
          <WhatsAppIntegration organizationId={organizationId} />
        </div>
      </div>
    </div>
  );
}

