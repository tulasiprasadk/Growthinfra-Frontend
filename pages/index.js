import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

export default function Home() {
  const router = useRouter();
  const [isExpanded, setIsExpanded] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const { connected, success, reason } = router.query;
    if (connected) {
      if (success === '1') {
        setMessage(`✅ ${connected} connected successfully!`);
        setTimeout(() => setMessage(''), 3000);
      } else if (success === '0') {
        const extra = reason ? ` (${String(reason)})` : '';
        setMessage(`❌ Failed to connect ${connected}. Please try again.${extra}`);
        setTimeout(() => setMessage(''), 3000);
      }
    }
  }, [router.query]);

  const platforms = [
    { name: 'Facebook', provider: 'facebook', icon: '🔵' },
    { name: 'Instagram', provider: 'instagram', icon: '📸' },
    { name: 'Twitter', provider: 'twitter', icon: '🐦' },
    { name: 'LinkedIn', provider: 'linkedin', icon: '💼' },
  ];

  const handleConnect = (provider) => {
    const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:6001';
    const connectUrl = `${apiBase}/api/social/connect/${provider}`;
    window.location.href = connectUrl;
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      <h1 style={{ fontSize: '32px', marginBottom: '10px' }}>🚀 SignalFlow</h1>
      <p style={{ fontSize: '16px', color: '#666', marginBottom: '30px' }}>Connect and manage your social accounts with SignalFlow</p>

      {message && (
        <div style={{
          padding: '12px 16px',
          marginBottom: '20px',
          borderRadius: '6px',
          background: message.includes('✅') ? '#d1fae5' : '#fee2e2',
          color: message.includes('✅') ? '#065f46' : '#991b1b',
          border: `1px solid ${message.includes('✅') ? '#6ee7b7' : '#fca5a5'}`,
          fontSize: '14px',
          fontWeight: '600'
        }}>
          {message}
        </div>
      )}

      {/* Connect Panel */}
      <div style={{ border: '1px solid #ddd', borderRadius: '8px', padding: '20px', marginBottom: '20px', background: '#fff' }}>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          style={{
            width: '100%',
            padding: '12px',
            fontSize: '18px',
            fontWeight: 'bold',
            border: 'none',
            background: 'transparent',
            cursor: 'pointer',
            textAlign: 'left',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <span>🔗 Connect Social Accounts</span>
          <span style={{ transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.3s' }}>▼</span>
        </button>

        {isExpanded && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '10px', marginTop: '15px' }}>
            {platforms.map((p) => (
              <button
                key={p.provider}
                onClick={() => handleConnect(p.provider)}
                style={{
                  padding: '15px',
                  border: '2px solid #ddd',
                  borderRadius: '8px',
                  background: '#f9f9f9',
                  cursor: 'pointer',
                  fontSize: '16px',
                  fontWeight: '600',
                  transition: 'all 0.2s',
                }}
                onHover={(e) => e.target.style.borderColor = '#2563eb'}
              >
                {p.icon} {p.name}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
        <button
          onClick={() => router.push('/workflow')}
          style={{
            padding: '12px 24px',
            borderRadius: '6px',
            border: 'none',
            background: '#2563eb',
            color: '#fff',
            fontSize: '16px',
            fontWeight: 'bold',
            cursor: 'pointer',
          }}
        >
          ➜ Create Workflow
        </button>
        <button
          onClick={() => router.push('/dashboard')}
          style={{
            padding: '12px 24px',
            borderRadius: '6px',
            border: '1px solid #ddd',
            background: '#fff',
            color: '#333',
            fontSize: '16px',
            fontWeight: 'bold',
            cursor: 'pointer',
          }}
        >
          📊 Dashboard
        </button>
      </div>
    </div>
  );
}
