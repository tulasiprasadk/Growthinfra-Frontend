import { useEffect, useState } from 'react';
import { authFetch } from '../../utils/auth';

const platformIcons = {
  twitter: 'X',
  facebook: 'f',
  instagram: 'IG',
  linkedin: 'in',
  reddit: 'r',
};

export default function SocialAccountList() {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const gridStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: '18px',
    width: '100%',
  };

  const cardStyle = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    background: 'linear-gradient(180deg, rgba(255,255,255,0.96), rgba(248,250,252,0.96))',
    borderRadius: '24px',
    padding: '20px',
    border: '1px solid rgba(148, 163, 184, 0.18)',
    boxShadow: '0 18px 40px rgba(15, 23, 42, 0.08)',
    textAlign: 'center',
  };

  const iconStyle = {
    width: '64px',
    height: '64px',
    borderRadius: '9999px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#fff',
    marginBottom: '14px',
  };

  const buttonStyle = {
    width: '100%',
    padding: '10px 14px',
    borderRadius: '999px',
    border: '1px solid #fecaca',
    color: '#dc2626',
    background: '#fff7f7',
    fontWeight: 600,
    cursor: 'pointer',
  };

  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        setLoading(true);
        const response = await authFetch('/api/social/pages');

        if (!response.ok) {
          throw new Error(`Failed to fetch accounts: ${response.statusText}`);
        }

        const data = await response.json();
        setAccounts(Array.isArray(data) ? data : []);
      } catch (err) {
        setError(err.message);
        setAccounts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAccounts();
  }, []);

  const handleDelete = async (accountId) => {
    if (!confirm('Are you sure you want to disconnect this account?')) return;

    try {
      const response = await authFetch(`/api/social/pages/${accountId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error(`Failed to delete account: ${response.statusText}`);
      }

      setAccounts((current) => current.filter((acc) => acc.id !== accountId));
    } catch (err) {
      alert(`Error disconnecting account: ${err.message}`);
    }
  };

  const getDisplayLabel = (account) => {
    const platform = account.platform || 'unknown';
    const rawLabel = String(account.label || '').trim();
    const providerLabel = String(account.provider || '').split(':')[1] || '';

    if (platform === 'twitter') {
      const twitterLabel = rawLabel || providerLabel;
      if (twitterLabel && twitterLabel !== 'default' && !/^account_\d+$/.test(twitterLabel)) {
        return twitterLabel.startsWith('@') ? twitterLabel : `@${twitterLabel}`;
      }
      return 'Connected X account';
    }

    if (rawLabel) return rawLabel;
    return 'Connected account';
  };

  const getMetaLine = (account) => {
    const platform = account.platform || 'unknown';
    const parts = [platform.charAt(0).toUpperCase() + platform.slice(1)];
    if (account.organizationName) {
      parts.push(account.organizationName);
    }
    return parts.join(' | ');
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="text-gray-600">Loading GrowthInfra accounts...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        Error: {error}
      </div>
    );
  }

  if (accounts.length === 0) {
    return (
      <div className="brand-surface" style={{ padding: '28px', textAlign: 'center' }}>
        <p className="text-gray-600 mb-4">No social accounts connected yet</p>
        <p className="text-sm text-gray-500">Connect your GrowthInfra channels to start publishing.</p>
      </div>
    );
  }

  return (
    <div style={gridStyle} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 w-full">
      {accounts.map((account) => {
        const platform = account.platform || 'unknown';
        const icon = platformIcons[platform] || '?';
        const iconBg = {
          twitter: '#60a5fa',
          facebook: '#2563eb',
          instagram: '#ec4899',
          linkedin: '#1e40af',
          reddit: '#f97316',
        }[platform] || '#6b7280';

        return (
          <div key={account.id} style={cardStyle} className="flex flex-col items-center rounded-2xl p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group">
            <div
              style={{
                ...iconStyle,
                background: iconBg,
                fontSize: platform === 'instagram' ? '18px' : '26px',
                fontWeight: 800,
                letterSpacing: platform === 'linkedin' ? '-0.04em' : 'normal',
              }}
              className="text-white rounded-full w-20 h-20 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300"
            >
              {icon}
            </div>
            <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#64748b', fontWeight: 700, marginBottom: '10px' }}>
              {platform}
            </div>
            <h3 className="font-bold text-slate-900 capitalize text-lg text-center mb-1">
              {getDisplayLabel(account)}
            </h3>
            <p className="text-xs text-slate-500 mb-5 break-words text-center max-w-full h-10 flex items-center justify-center">
              {getMetaLine(account)}
            </p>
            <button
              onClick={() => handleDelete(account.id)}
              style={buttonStyle}
              className="w-full px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg border border-red-300 transition duration-200 text-sm font-semibold hover:text-red-700 hover:border-red-400"
            >
              Disconnect
            </button>
          </div>
        );
      })}
    </div>
  );
}
