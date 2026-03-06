import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { getAuthToken } from '../utils/auth';

export default function Home() {
  const router = useRouter();
  const [isExpanded, setIsExpanded] = useState(false);
  const [message, setMessage] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    setIsAuthenticated(Boolean(getAuthToken()));
  }, []);

  useEffect(() => {
    const { connected, success, reason } = router.query;
    if (!connected) return;

    if (success === '1') {
      setMessage(`${connected} connected successfully.`);
      setTimeout(() => setMessage(''), 3000);
      return;
    }

    if (success === '0') {
      const extra = reason ? ` (${String(reason)})` : '';
      setMessage(`Failed to connect ${connected}. Please try again.${extra}`);
      setTimeout(() => setMessage(''), 3000);
    }
  }, [router.query]);

  const platforms = [
    { name: 'Facebook', provider: 'facebook' },
    { name: 'Instagram', provider: 'instagram' },
    { name: 'Twitter', provider: 'twitter' },
    { name: 'LinkedIn', provider: 'linkedin' },
  ];

  const handleConnect = (provider) => {
    const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || '';
    const connectUrl = `${apiBase}/api/social/connect/${provider}`;
    window.location.href = connectUrl;
  };

  const messageIsSuccess = message.toLowerCase().includes('successfully');

  return (
    <div
      style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '20px',
        fontFamily: 'system-ui, -apple-system, sans-serif',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '12px',
          marginBottom: '24px',
          flexWrap: 'wrap',
        }}
      >
        <div>
          <div style={{ fontSize: '12px', fontWeight: '700', letterSpacing: '0.08em', color: '#64748b', textTransform: 'uppercase' }}>
            GrowthInfra
          </div>
          <h1 style={{ fontSize: '32px', margin: '6px 0 10px' }}>SignalFlow</h1>
          <p style={{ fontSize: '16px', color: '#475569', margin: 0 }}>
            Connect and manage your social accounts with SignalFlow
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          {!isAuthenticated && (
            <>
              <button
                onClick={() => router.push('/login')}
                style={{
                  padding: '10px 18px',
                  borderRadius: '999px',
                  border: '1px solid #cbd5e1',
                  background: '#fff',
                  color: '#0f172a',
                  fontSize: '14px',
                  fontWeight: '700',
                  cursor: 'pointer',
                }}
              >
                Login
              </button>
              <button
                onClick={() => router.push('/signup')}
                style={{
                  padding: '10px 18px',
                  borderRadius: '999px',
                  border: 'none',
                  background: '#0f172a',
                  color: '#fff',
                  fontSize: '14px',
                  fontWeight: '700',
                  cursor: 'pointer',
                }}
              >
                Sign Up
              </button>
            </>
          )}

          {isAuthenticated && (
            <button
              onClick={() => router.push('/dashboard')}
              style={{
                padding: '10px 18px',
                borderRadius: '999px',
                border: 'none',
                background: '#0f172a',
                color: '#fff',
                fontSize: '14px',
                fontWeight: '700',
                cursor: 'pointer',
              }}
            >
              Open Dashboard
            </button>
          )}
        </div>
      </div>

      {!isAuthenticated && (
        <div
          style={{
            marginBottom: '20px',
            border: '1px solid #dbeafe',
            background: '#eff6ff',
            borderRadius: '12px',
            padding: '16px 18px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '14px',
            flexWrap: 'wrap',
          }}
        >
          <div>
            <div style={{ fontSize: '16px', fontWeight: '700', color: '#1e3a8a', marginBottom: '4px' }}>
              Start with your account
            </div>
            <div style={{ fontSize: '14px', color: '#1d4ed8' }}>
              Login if you already have access, or create a new account before connecting social platforms.
            </div>
          </div>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <button
              onClick={() => router.push('/login')}
              style={{
                padding: '12px 18px',
                borderRadius: '8px',
                border: '1px solid #2563eb',
                background: '#ffffff',
                color: '#1d4ed8',
                fontSize: '15px',
                fontWeight: '700',
                cursor: 'pointer',
              }}
            >
              Login
            </button>
            <button
              onClick={() => router.push('/signup')}
              style={{
                padding: '12px 18px',
                borderRadius: '8px',
                border: 'none',
                background: '#2563eb',
                color: '#fff',
                fontSize: '15px',
                fontWeight: '700',
                cursor: 'pointer',
              }}
            >
              Create Account
            </button>
          </div>
        </div>
      )}

      {message && (
        <div
          style={{
            padding: '12px 16px',
            marginBottom: '20px',
            borderRadius: '6px',
            background: messageIsSuccess ? '#d1fae5' : '#fee2e2',
            color: messageIsSuccess ? '#065f46' : '#991b1b',
            border: `1px solid ${messageIsSuccess ? '#6ee7b7' : '#fca5a5'}`,
            fontSize: '14px',
            fontWeight: '600',
          }}
        >
          {message}
        </div>
      )}

      <div
        style={{
          border: '1px solid #ddd',
          borderRadius: '8px',
          padding: '20px',
          marginBottom: '20px',
          background: '#fff',
        }}
      >
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
          <span>Connect Social Accounts</span>
          <span
            style={{
              transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
              transition: 'transform 0.3s',
            }}
          >
            v
          </span>
        </button>

        {isExpanded && (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
              gap: '10px',
              marginTop: '15px',
            }}
          >
            {platforms.map((platform) => (
              <button
                key={platform.provider}
                onClick={() => handleConnect(platform.provider)}
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
              >
                {platform.name}
              </button>
            ))}
          </div>
        )}
      </div>

      <div style={{ display: 'flex', gap: '10px', marginTop: '20px', flexWrap: 'wrap' }}>
        {!isAuthenticated && (
          <>
            <button
              onClick={() => router.push('/login')}
              style={{
                padding: '12px 24px',
                borderRadius: '6px',
                border: '1px solid #2563eb',
                background: '#eff6ff',
                color: '#1d4ed8',
                fontSize: '16px',
                fontWeight: 'bold',
                cursor: 'pointer',
              }}
            >
              Login
            </button>
            <button
              onClick={() => router.push('/signup')}
              style={{
                padding: '12px 24px',
                borderRadius: '6px',
                border: '1px solid #0f172a',
                background: '#fff',
                color: '#0f172a',
                fontSize: '16px',
                fontWeight: 'bold',
                cursor: 'pointer',
              }}
            >
              Sign Up
            </button>
          </>
        )}
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
          Create Workflow
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
          Dashboard
        </button>
      </div>
    </div>
  );
}
