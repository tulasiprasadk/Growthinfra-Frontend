import { useState, useCallback } from 'react';
import { useRouter } from 'next/router';
import SocialAccountList from '../components/Social/SocialAccountList';
import SocialConnectPanel from '../components/Social/SocialConnectPanel';
import { authFetch } from '../utils/auth';

export default function AccountsPage() {
  const router = useRouter();
  const [refreshKey, setRefreshKey] = useState(0);
  const [syncing, setSyncing] = useState(false);
  const [message, setMessage] = useState(null);

  const handleAccountAdded = useCallback(() => {
    setRefreshKey(prev => prev + 1);
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
        text: `✓ Synced ${data.count} Instagram account(s) from Facebook pages`,
      });
      setRefreshKey(prev => prev + 1);
    } catch (error) {
      setMessage({
        type: 'error',
        text: `Failed to sync Instagram: ${error.message}`,
      });
    } finally {
      setSyncing(false);
    }
  };

  const handleConnectFacebook = () => {
    const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || '';
    window.location.href = `${apiBase}/api/social/connect/facebook`;
  };

  const handleConnectLinkedIn = () => {
    const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || '';
    window.location.href = `${apiBase}/api/social/connect/linkedin`;
  };

  const handleConnectTwitter = () => {
    const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || '';
    window.location.href = `${apiBase}/api/social/connect/twitter`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push('/')}
                className="p-2 hover:bg-slate-100 rounded-lg transition duration-200"
                title="Back to home"
              >
                <span className="text-2xl">🏠</span>
              </button>
              <div>
                <h1 className="text-3xl font-bold text-slate-900">Social Accounts</h1>
                <p className="text-sm text-slate-600 mt-1">Manage and connect your social media profiles</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs text-slate-500 uppercase tracking-wider">Account Management</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-12">
        {/* Status Message */}
        {message && (
          <div
            className={`mb-8 p-4 rounded-xl border backdrop-blur-sm transition-all ${
              message.type === 'success'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                : 'bg-red-50 border-red-200 text-red-800'
            }`}
          >
            <p className="font-medium">{message.text}</p>
          </div>
        )}

        {/* Quick Actions */}
        <div className="mb-12">
          <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
            <span>⚡</span> Quick Actions
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <button
              onClick={handleConnectFacebook}
              className="group relative overflow-hidden bg-white border-2 border-blue-500 rounded-xl p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
            >
              <div className="absolute inset-0 bg-blue-50 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300"></div>
              <div className="relative flex flex-col items-center gap-3">
                <span className="text-4xl">🔵</span>
                <span className="font-semibold text-slate-900">Connect Facebook</span>
              </div>
            </button>
            
            <button
              onClick={handleSyncInstagram}
              disabled={syncing}
              className="group relative overflow-hidden bg-white border-2 border-pink-500 rounded-xl p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 disabled:opacity-50"
            >
              <div className="absolute inset-0 bg-pink-50 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300"></div>
              <div className="relative flex flex-col items-center gap-3">
                <span className="text-4xl">📸</span>
                <span className="font-semibold text-slate-900">{syncing ? 'Syncing...' : 'Sync Instagram'}</span>
              </div>
            </button>

            <button
              onClick={handleConnectTwitter}
              className="group relative overflow-hidden bg-white border-2 border-black rounded-xl p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
            >
              <div className="absolute inset-0 bg-slate-100 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300"></div>
              <div className="relative flex flex-col items-center gap-3">
                <span className="text-4xl">🐦</span>
                <span className="font-semibold text-slate-900">Connect Twitter</span>
              </div>
            </button>
            
            <button
              onClick={handleConnectLinkedIn}
              className="group relative overflow-hidden bg-white border-2 border-blue-800 rounded-xl p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
            >
              <div className="absolute inset-0 bg-blue-50 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300"></div>
              <div className="relative flex flex-col items-center gap-3">
                <span className="text-4xl">💼</span>
                <span className="font-semibold text-slate-900">Connect LinkedIn</span>
              </div>
            </button>
          </div>
        </div>

        {/* Connected Accounts */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-slate-900 mb-8 flex items-center gap-2">
            <span>🔗</span> Your Connected Accounts
            {refreshKey > 0 && <span className="text-sm font-normal text-emerald-600 ml-auto">✓ Updated</span>}
          </h2>
          <SocialAccountList key={refreshKey} />
        </div>

        {/* Expandable Panel */}
        <div className="border-t border-slate-200 pt-12">
          <h2 className="text-2xl font-bold text-slate-900 mb-8 flex items-center gap-2">
            <span>➕</span> Add More Accounts
          </h2>
          <SocialConnectPanel onAccountAdded={handleAccountAdded} />
        </div>
      </div>
    </div>
  );
}
