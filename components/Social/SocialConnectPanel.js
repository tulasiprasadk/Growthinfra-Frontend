import SocialConnectButton from './SocialConnectButton';
import { useState } from 'react';

export default function SocialConnectPanel({ onAccountAdded }) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const platforms = [
    { name: 'Facebook', provider: 'facebook', icon: '🔵' },
    { name: 'Instagram', provider: 'instagram', icon: '📸' },
    { name: 'Twitter', provider: 'twitter', icon: '🐦' },
    { name: 'LinkedIn', provider: 'linkedin', icon: '💼' },
  ];

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center justify-between w-full mb-4"
      >
        <h3 className="text-lg font-semibold text-gray-900">Connect Social Accounts</h3>
        <span className={`transform transition ${isExpanded ? 'rotate-180' : ''}`}>▼</span>
      </button>
      
      {isExpanded && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {platforms.map((p) => (
            <SocialConnectButton 
              key={p.provider} 
              provider={p.provider} 
              name={p.name}
              icon={p.icon}
              onConnect={() => onAccountAdded && onAccountAdded()}
            />
          ))}
        </div>
      )}
    </div>
  );
}
