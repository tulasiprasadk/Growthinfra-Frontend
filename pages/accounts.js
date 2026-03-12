import { useState, useCallback } from 'react';
import { useRouter } from 'next/router';
import SocialAccountList from '../components/Social/SocialAccountList';
import SocialConnectPanel from '../components/Social/SocialConnectPanel';
import { authFetch, getStoredUser } from '../utils/auth';
import { getApiBaseUrl } from '../utils/api';

function buildOAuthUrl(provider) {
  const apiBase = getApiBaseUrl();
  const user = getStoredUser();
  const organizationId = user?.memberships?.[0]?.organization?.id || '';
  const params = new URLSearchParams();
  if (organizationId) {
    params.set('organizationId', organizationId);
  }

  if (provider === 'twitter' && typeof window !== 'undefined') {
    const raw = window.prompt('Enter the Twitter/X handle for this account (without @).');
    const accountLabel = String(raw || '').trim().replace(/^@+/, '');
    if (!accountLabel) return '';
    params.set('accountLabel', accountLabel);
  }

  const query = params.toString() ? `?${params.toString()}` : '';
  return `${apiBase}/api/social/connect/${provider}${query}`;
}

export default function AccountsPage() {
  const router = useRouter();
  const [refreshKey, setRefreshKey] = useState(0);
  const [syncing, setSyncing] = useState(false);
  const [message, setMessage] = useState(null);

  const handleAccountAdded = useCallback(() => {
    setRefreshKey((prev) => prev + 1);
  }, []);

  const handleSyncInstagram = async () => {
    try {
      setSyncing(true);
      setMessage(null);
      const response = await authFetch('/api/social/refresh/instagram', {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to sync Instagram accounts');
      }

      const data = await response.json();
      setMessage({
        type: 'success',
        text: `Synced ${data.count} Instagram account(s) from Facebook pages.`,
      });
      setRefreshKey((prev) => prev + 1);
    } catch (error) {
      setMessage({
        type: 'error',
        text: `Failed to sync Instagram: ${error.message}`,
      });
    } finally {
      setSyncing(false);
    }
  };

  const handleConnect = (provider) => {
    const url = buildOAuthUrl(provider);
    if (url) {
      window.location.href = url;
    }
  };

  return (
    <div className="brand-shell">
      <div style={{ maxWidth: '1340px', margin: '0 auto', display: 'grid', gap: '24px' }}>
        <div className="brand-surface" style={{ padding: '28px 30px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: '18px', alignItems: 'center', flexWrap: 'wrap' }}>
            <div>
              <div className="brand-pill">GrowthInfra Account Layer</div>
              <h1 style={{ margin: '16px 0 8px', fontSize: '40px', lineHeight: 1.05 }}>Social Account Management</h1>
              <p style={{ margin: 0, color: '#475569', maxWidth: '760px', lineHeight: 1.7 }}>
                Manage brand pages, Instagram profiles, X accounts, and LinkedIn identity from one GrowthInfra operations surface.
              </p>
            </div>
            <img src="/growthinfra-logo.png" alt="GrowthInfra" style={{ width: '220px', maxWidth: '100%', height: 'auto' }} />
          </div>
        </div>

        {message && (
          <div
            className="brand-surface"
            style={{
              padding: '16px 20px',
              borderColor: message.type === 'success' ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)',
              color: message.type === 'success' ? '#065f46' : '#991b1b',
              background: message.type === 'success' ? 'rgba(209,250,229,0.92)' : 'rgba(254,226,226,0.92)',
            }}
          >
            <strong>{message.text}</strong>
          </div>
        )}

        <div className="brand-surface" style={{ padding: '28px' }}>
          <div className="brand-pill">Quick Actions</div>
          <h2 style={{ margin: '14px 0 8px', fontSize: '30px' }}>Add or sync channels</h2>
          <p style={{ margin: '0 0 22px', color: '#475569', lineHeight: 1.6 }}>Use these shortcuts to onboard additional platforms or refresh connected Instagram profiles from Facebook.</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
            <button onClick={() => handleConnect('facebook')} style={{ padding: '20px', borderRadius: '22px', border: '1px solid rgba(37,99,235,0.18)', background: 'linear-gradient(180deg, rgba(37,99,235,0.08), #fff)', cursor: 'pointer' }}>
              <div style={{ fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#64748b', fontWeight: 700 }}>Facebook</div>
              <div style={{ marginTop: '10px', fontSize: '22px', fontWeight: 800 }}>Connect Pages</div>
            </button>
            <button onClick={handleSyncInstagram} disabled={syncing} style={{ padding: '20px', borderRadius: '22px', border: '1px solid rgba(219,39,119,0.18)', background: 'linear-gradient(180deg, rgba(219,39,119,0.08), #fff)', cursor: 'pointer' }}>
              <div style={{ fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#64748b', fontWeight: 700 }}>Instagram</div>
              <div style={{ marginTop: '10px', fontSize: '22px', fontWeight: 800 }}>{syncing ? 'Syncing...' : 'Sync Profiles'}</div>
            </button>
            <button onClick={() => handleConnect('twitter')} style={{ padding: '20px', borderRadius: '22px', border: '1px solid rgba(15,23,42,0.18)', background: 'linear-gradient(180deg, rgba(15,23,42,0.08), #fff)', cursor: 'pointer' }}>
              <div style={{ fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#64748b', fontWeight: 700 }}>Twitter / X</div>
              <div style={{ marginTop: '10px', fontSize: '22px', fontWeight: 800 }}>Connect Account</div>
            </button>
            <button onClick={() => handleConnect('linkedin')} style={{ padding: '20px', borderRadius: '22px', border: '1px solid rgba(29,78,216,0.18)', background: 'linear-gradient(180deg, rgba(29,78,216,0.08), #fff)', cursor: 'pointer' }}>
              <div style={{ fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#64748b', fontWeight: 700 }}>LinkedIn</div>
              <div style={{ marginTop: '10px', fontSize: '22px', fontWeight: 800 }}>Connect Identity</div>
            </button>
          </div>
        </div>

        <div className="brand-surface" style={{ padding: '28px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: '16px', alignItems: 'center', flexWrap: 'wrap', marginBottom: '18px' }}>
            <div>
              <div className="brand-pill">Connected Inventory</div>
              <h2 style={{ margin: '14px 0 8px', fontSize: '30px' }}>Connected Accounts</h2>
              <p style={{ margin: 0, color: '#475569', lineHeight: 1.6 }}>Review every active brand connection and remove stale access when needed.</p>
            </div>
            {refreshKey > 0 && <span style={{ color: '#059669', fontWeight: 700 }}>Updated</span>}
          </div>
          <SocialAccountList key={refreshKey} />
        </div>

        <div className="brand-surface" style={{ padding: '28px' }}>
          <div className="brand-pill">Expansion Panel</div>
          <h2 style={{ margin: '14px 0 8px', fontSize: '30px' }}>Add More Accounts</h2>
          <p style={{ margin: '0 0 20px', color: '#475569', lineHeight: 1.6 }}>Use the expansion panel when you want to continue onboarding channel coverage for new brands.</p>
          <SocialConnectPanel onAccountAdded={handleAccountAdded} />
        </div>
      </div>
    </div>
  );
}
