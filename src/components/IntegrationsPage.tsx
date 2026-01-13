import { useState } from 'react';
import { CheckCircle, XCircle, Settings, MessageSquare, Facebook, Instagram, Mail } from 'lucide-react';

interface Integration {
  id: string;
  name: string;
  description: string;
  icon: typeof MessageSquare;
  status: 'connected' | 'disconnected' | 'error';
  connectedAt?: string;
  lastSync?: string;
}

export default function IntegrationsPage() {
  const [integrations] = useState<Integration[]>([
    {
      id: '1',
      name: 'WhatsApp Business API',
      description: 'Connect your WhatsApp Business account to receive and send messages',
      icon: MessageSquare,
      status: 'connected',
      connectedAt: '2024-01-15',
      lastSync: '2 minutes ago',
    },
    {
      id: '2',
      name: 'Facebook Messenger',
      description: 'Integrate with Facebook Messenger for customer support',
      icon: Facebook,
      status: 'connected',
      connectedAt: '2024-01-10',
      lastSync: '5 minutes ago',
    },
    {
      id: '3',
      name: 'Instagram Direct',
      description: 'Connect Instagram Direct messages to your CRM',
      icon: Instagram,
      status: 'disconnected',
    },
    {
      id: '4',
      name: 'Email SMTP',
      description: 'Configure SMTP settings for email notifications',
      icon: Mail,
      status: 'connected',
      connectedAt: '2024-01-08',
      lastSync: '1 hour ago',
    },
  ]);

  const getStatusIcon = (status: Integration['status']) => {
    switch (status) {
      case 'connected':
        return <CheckCircle size={20} className="text-success" />;
      case 'error':
        return <XCircle size={20} className="text-danger" />;
      default:
        return <XCircle size={20} className="text-gray-400" />;
    }
  };

  const getStatusColor = (status: Integration['status']) => {
    switch (status) {
      case 'connected':
        return 'bg-green-100 text-green-700';
      case 'error':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-[#0F172A] mb-2">Integrations</h1>
        <p className="text-[#64748B]">Connect your favorite tools and platforms</p>
      </div>

      {/* Integrations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {integrations.map((integration) => {
          const Icon = integration.icon;
          
          return (
            <div
              key={integration.id}
              className="bg-white border border-[#E2E8F0] rounded-lg p-5 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Icon size={24} className="text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-[#0F172A] mb-1">{integration.name}</h3>
                    <p className="text-sm text-[#64748B]">{integration.description}</p>
                  </div>
                </div>
                {getStatusIcon(integration.status)}
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-[#E2E8F0]">
                <div>
                  <span className={`px-2 py-1 rounded text-xs font-semibold ${getStatusColor(integration.status)}`}>
                    {integration.status === 'connected' ? 'Connected' : integration.status === 'error' ? 'Error' : 'Not Connected'}
                  </span>
                  {integration.connectedAt && (
                    <p className="text-xs text-[#64748B] mt-1">
                      Connected on {new Date(integration.connectedAt).toLocaleDateString()}
                    </p>
                  )}
                  {integration.lastSync && (
                    <p className="text-xs text-[#64748B]">
                      Last sync: {integration.lastSync}
                    </p>
                  )}
                </div>
                <button className="px-3 py-1.5 border border-[#E2E8F0] rounded-md text-sm text-[#0F172A] hover:bg-[#F8FAFC] flex items-center gap-2">
                  <Settings size={14} />
                  Configure
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Additional Info */}
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-semibold text-[#0F172A] mb-2">Need help setting up integrations?</h3>
        <p className="text-sm text-[#64748B]">
          Check our documentation or contact support for assistance with connecting your platforms.
        </p>
      </div>
    </div>
  );
}

