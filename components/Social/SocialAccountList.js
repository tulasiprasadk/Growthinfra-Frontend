import { useEffect, useState } from 'react';

const platformIcons = {
  twitter: '🐦',
  facebook: '🔵',
  instagram: '📸',
  linkedin: '💼',
  reddit: '👽',
};

const platformColors = {
  twitter: 'bg-blue-400',
  facebook: 'bg-blue-600',
  instagram: 'bg-gradient-to-r from-pink-500 via-red-500 to-yellow-500',
  linkedin: 'bg-blue-800',
  reddit: 'bg-orange-500',
};

export default function SocialAccountList() {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const gridStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
    gap: '16px',
    width: '100%',
  };

  const cardStyle = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    background: '#fff',
    borderRadius: '16px',
    padding: '16px',
    border: '1px solid #e5e7eb',
    boxShadow: '0 8px 20px rgba(15, 23, 42, 0.08)',
    textAlign: 'center',
  };

  const iconStyle = {
    width: '56px',
    height: '56px',
    borderRadius: '9999px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '24px',
    color: '#fff',
    marginBottom: '10px',
  };

  const buttonStyle = {
    width: '100%',
    padding: '8px 12px',
    borderRadius: '8px',
    border: '1px solid #fecaca',
    color: '#dc2626',
    background: '#fff',
    fontWeight: 600,
    cursor: 'pointer',
  };

  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        setLoading(true);
        const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:6001';
        const response = await fetch(`${apiBase}/api/social/pages`);
        
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
      const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:6001';
      const response = await fetch(`${apiBase}/api/social/pages/${accountId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error(`Failed to delete account: ${response.statusText}`);
      }

      setAccounts(accounts.filter(acc => acc.id !== accountId));
    } catch (err) {
      alert(`Error disconnecting account: ${err.message}`);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="text-gray-600">Loading accounts...</div>
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
      <div className="bg-gray-100 border border-gray-300 rounded-lg p-8 text-center">
        <p className="text-gray-600 mb-4">No social accounts connected yet</p>
        <p className="text-sm text-gray-500">Connect your social media accounts to start publishing</p>
      </div>
    );
  }

  return (
    <div style={gridStyle} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 w-full">
      {accounts.map((account) => {
        const platform = account.platform || 'unknown';
        const icon = platformIcons[platform] || '📱';
        const colorClass = platformColors[platform] || 'bg-gray-500';
        const iconBg = {
          twitter: '#60a5fa',
          facebook: '#2563eb',
          instagram: '#ec4899',
          linkedin: '#1e40af',
          reddit: '#f97316',
        }[platform] || '#6b7280';
        
        return (
          <div
            key={account.id}
            style={cardStyle}
            className="flex flex-col items-center bg-white rounded-2xl p-6 shadow-md hover:shadow-xl border border-slate-100 transition-all duration-300 hover:-translate-y-1 group"
          >
            <div style={{ ...iconStyle, background: iconBg }} className={`${colorClass} text-white rounded-full w-20 h-20 flex items-center justify-center text-4xl font-bold mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
              {icon}
            </div>
            <h3 className="font-bold text-slate-900 capitalize text-lg text-center mb-1">
              {platform}
            </h3>
            <p className="text-sm text-slate-600 mb-5 break-words text-center max-w-full h-10 flex items-center justify-center">
              {account.label || 'Connected'}
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
