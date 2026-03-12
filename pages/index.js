import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { getAuthToken, getStoredUser, isPublicSignupEnabled } from '../utils/auth';
import { getApiBaseUrl } from '../utils/api';

const platforms = [
  { name: 'Facebook', provider: 'facebook', accent: '#2563eb' },
  { name: 'Instagram', provider: 'instagram', accent: '#db2777' },
  { name: 'Twitter / X', provider: 'twitter', accent: '#0f172a' },
  { name: 'LinkedIn', provider: 'linkedin', accent: '#1d4ed8' },
];

export default function Home() {
  const router = useRouter();
  const [isExpanded, setIsExpanded] = useState(false);
  const [message, setMessage] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userName, setUserName] = useState('');
  const signupEnabled = isPublicSignupEnabled();

  useEffect(() => {
    setIsAuthenticated(Boolean(getAuthToken()));
    const storedUser = getStoredUser();
    setUserName(storedUser?.email || '');
  }, []);

  useEffect(() => {
    const { connected, success, reason } = router.query;
    if (!connected) return;

    if (success === '1') {
      setMessage(`${connected} connected successfully.`);
      setTimeout(() => setMessage(''), 3200);
      return;
    }

    if (success === '0') {
      const extra = reason ? ` (${String(reason)})` : '';
      setMessage(`Failed to connect ${connected}. Please try again.${extra}`);
      setTimeout(() => setMessage(''), 4200);
    }
  }, [router.query]);

  const handleConnect = (provider) => {
    const apiBase = getApiBaseUrl();
    const user = getStoredUser();
    const organizationId = user?.memberships?.[0]?.organization?.id || '';
    const params = new URLSearchParams();
    if (organizationId) {
      params.set('organizationId', organizationId);
    }
    if (provider === 'twitter') {
      const raw = window.prompt('Enter the Twitter/X handle for this account (without @).');
      const accountLabel = String(raw || '').trim().replace(/^@+/, '');
      if (!accountLabel) return;
      params.set('accountLabel', accountLabel);
    }
    const query = params.toString() ? `?${params.toString()}` : '';
    const connectUrl = `${apiBase}/api/social/connect/${provider}${query}`;
    window.location.href = connectUrl;
  };

  const messageIsSuccess = message.toLowerCase().includes('successfully');

  return (
    <div className="brand-shell">
      <div style={{ maxWidth: '1240px', margin: '0 auto', display: 'grid', gap: '24px' }}>
        <div className="brand-surface" style={{ padding: '34px', overflow: 'hidden', position: 'relative' }}>
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(120deg, rgba(8,47,73,0.04), rgba(14,165,233,0.08) 42%, rgba(255,255,255,0.12) 100%)' }} />
          <div style={{ position: 'relative', display: 'grid', gridTemplateColumns: 'minmax(0, 1.4fr) minmax(280px, 0.8fr)', gap: '26px', alignItems: 'center' }}>
            <div>
              <div className="brand-pill">GrowthInfra Control Hub</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '18px', marginTop: '18px', flexWrap: 'wrap' }}>
                <img src="/growthinfra-logo.png" alt="GrowthInfra" style={{ width: '240px', maxWidth: '100%', height: 'auto', filter: 'drop-shadow(0 18px 28px rgba(15,23,42,0.12))' }} />
              </div>
              <h1 style={{ fontSize: '48px', lineHeight: 1.02, margin: '18px 0 12px', color: '#0f172a' }}>GrowthInfra Social Operations</h1>
              <p style={{ margin: 0, maxWidth: '700px', color: '#475569', fontSize: '18px', lineHeight: 1.7 }}>
                Bring Facebook, Instagram, LinkedIn, and X into one branded workspace for publishing, reporting, and account governance.
              </p>
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginTop: '24px' }}>
                {isAuthenticated ? (
                  <>
                    <button onClick={() => router.push('/dashboard')} style={{ padding: '14px 22px', borderRadius: '999px', border: 'none', background: '#0f172a', color: '#fff', fontSize: '15px', fontWeight: 700, cursor: 'pointer', boxShadow: '0 16px 28px rgba(15,23,42,0.16)' }}>
                      Open Dashboard
                    </button>
                    <button onClick={() => router.push('/accounts')} style={{ padding: '14px 22px', borderRadius: '999px', border: '1px solid rgba(14,165,233,0.2)', background: '#fff', color: '#0369a1', fontSize: '15px', fontWeight: 700, cursor: 'pointer' }}>
                      Manage Accounts
                    </button>
                  </>
                ) : (
                  <>
                    <button onClick={() => router.push('/login')} style={{ padding: '14px 22px', borderRadius: '999px', border: 'none', background: '#0f172a', color: '#fff', fontSize: '15px', fontWeight: 700, cursor: 'pointer', boxShadow: '0 16px 28px rgba(15,23,42,0.16)' }}>
                      Login
                    </button>
                    {signupEnabled && (
                      <button onClick={() => router.push('/signup')} style={{ padding: '14px 22px', borderRadius: '999px', border: '1px solid rgba(14,165,233,0.2)', background: '#fff', color: '#0369a1', fontSize: '15px', fontWeight: 700, cursor: 'pointer' }}>
                        Create Account
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>

            <div className="brand-grid">
              <div className="brand-stat">
                <p className="brand-stat-label">Connected Platforms</p>
                <p className="brand-stat-value">4</p>
              </div>
              <div className="brand-stat">
                <p className="brand-stat-label">Workspace Status</p>
                <p className="brand-stat-value">Live</p>
              </div>
              <div className="brand-stat">
                <p className="brand-stat-label">Publishing Mode</p>
                <p className="brand-stat-value">Multi-Channel</p>
              </div>
              <div className="brand-stat">
                <p className="brand-stat-label">Signed In</p>
                <p className="brand-stat-value" style={{ fontSize: '18px', lineHeight: 1.4 }}>{userName || 'Ready to onboard'}</p>
              </div>
            </div>
          </div>
        </div>

        {message && (
          <div className="brand-surface" style={{ padding: '16px 20px', borderColor: messageIsSuccess ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)', color: messageIsSuccess ? '#065f46' : '#991b1b', background: messageIsSuccess ? 'rgba(209,250,229,0.9)' : 'rgba(254,226,226,0.92)' }}>
            <strong>{message}</strong>
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.25fr) minmax(280px, 0.75fr)', gap: '24px' }}>
          <div className="brand-surface" style={{ padding: '26px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px', marginBottom: '18px', flexWrap: 'wrap' }}>
              <div>
                <div className="brand-pill">Connection Console</div>
                <h2 style={{ margin: '14px 0 8px', fontSize: '30px' }}>Connect channel infrastructure</h2>
                <p style={{ margin: 0, color: '#475569', lineHeight: 1.6 }}>
                  Activate the platforms you need today and expand the account base as your operations grow.
                </p>
              </div>
              <button onClick={() => setIsExpanded(!isExpanded)} style={{ padding: '12px 18px', borderRadius: '999px', border: '1px solid rgba(14,165,233,0.2)', background: '#fff', color: '#0f172a', fontWeight: 700, cursor: 'pointer' }}>
                {isExpanded ? 'Hide Connectors' : 'Open Connectors'}
              </button>
            </div>

            {isExpanded && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '14px' }}>
                {platforms.map((platform) => (
                  <button
                    key={platform.provider}
                    onClick={() => handleConnect(platform.provider)}
                    style={{
                      padding: '18px',
                      borderRadius: '22px',
                      border: `1px solid ${platform.accent}22`,
                      background: `linear-gradient(180deg, ${platform.accent}10, #ffffff)`,
                      color: '#0f172a',
                      cursor: 'pointer',
                      textAlign: 'left',
                      boxShadow: '0 10px 28px rgba(15,23,42,0.06)',
                    }}
                  >
                    <div style={{ fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#64748b', fontWeight: 700 }}>Provider</div>
                    <div style={{ fontSize: '22px', fontWeight: 800, margin: '10px 0 4px' }}>{platform.name}</div>
                    <div style={{ color: '#475569', fontSize: '14px' }}>Authorize and route into your GrowthInfra workspace.</div>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="brand-surface" style={{ padding: '26px' }}>
            <div className="brand-pill">Why this workspace</div>
            <div style={{ display: 'grid', gap: '18px', marginTop: '18px' }}>
              <div>
                <h3 style={{ margin: '0 0 8px', fontSize: '20px' }}>One view for every brand lane</h3>
                <p style={{ margin: 0, color: '#475569', lineHeight: 1.65 }}>Separate business pages, Instagram profiles, and X accounts without losing operational control.</p>
              </div>
              <div>
                <h3 style={{ margin: '0 0 8px', fontSize: '20px' }}>Built for managed access</h3>
                <p style={{ margin: 0, color: '#475569', lineHeight: 1.65 }}>Use role-based admin tooling to onboard teammates, assign rights, and keep publishing secure.</p>
              </div>
              <div>
                <h3 style={{ margin: '0 0 8px', fontSize: '20px' }}>Ready for campaigns</h3>
                <p style={{ margin: 0, color: '#475569', lineHeight: 1.65 }}>Move from account connections to workflow, publishing, and reports from the same interface.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
