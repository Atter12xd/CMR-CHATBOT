import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { useOrganization } from '../hooks/useOrganization';
import WhatsAppIntegration from './WhatsAppIntegration';

export default function ConfigPage() {
  const { organizationId, loading } = useOrganization();

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
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <p className="text-yellow-800">
            No se encontró una organización. Por favor, contacta al administrador.
          </p>
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

