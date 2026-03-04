import { useEffect, useState } from 'react';
import SocialConnectPanel from '../components/Social/SocialConnectPanel';
import SocialAccountList from '../components/Social/SocialAccountList';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:6001';

export default function DashboardPage() {
  const [apiBase, setApiBase] = useState(API_BASE);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    setApiBase(API_BASE);
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    const connected = params.get('connected');
    const success = params.get('success');
    if (connected && success === '1') {
      // Refresh accounts after OAuth callback
      setTimeout(() => {
        setRefreshKey(prev => prev + 1);
      }, 1000);
    }
  }, [apiBase]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      <div className="max-w-7xl mx-auto px-8 py-10" style={{ maxWidth: '1400px', width: '100%' }}>
        {/* Hero Header */}
        <div className="rounded-3xl bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white p-8 shadow-2xl mb-10">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 flex items-center justify-center">
                  <img src="/signalflow-logo.svg" alt="SignalFlow" className="w-12 h-12 object-contain" />
                </div>
                <span className="text-xl font-bold">SignalFlow</span>
              </div>
              <p className="text-sm uppercase tracking-widest text-slate-300">Social Media Command Center</p>
              <h1 className="text-4xl md:text-5xl font-bold mt-2">Dashboard</h1>
              <p className="text-slate-300 mt-3 max-w-2xl">
                Manage connected accounts, launch campaigns, and schedule posts with a premium, streamlined workflow.
              </p>
              <div className="flex flex-wrap gap-3 mt-6">
                <a
                  href="/workflow"
                  className="px-5 py-2.5 bg-white text-slate-900 rounded-xl font-semibold hover:bg-slate-100 transition"
                >
                  Create a Post
                </a>
                <a
                  href="/accounts"
                  className="px-5 py-2.5 border border-slate-400 text-white rounded-xl font-semibold hover:bg-slate-800 transition"
                >
                  Manage Accounts
                </a>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-white/10 border border-white/20 rounded-2xl p-4 text-center">
                <p className="text-xs text-slate-300">Platforms</p>
                <p className="text-2xl font-bold">4</p>
              </div>
              <div className="bg-white/10 border border-white/20 rounded-2xl p-4 text-center">
                <p className="text-xs text-slate-300">Status</p>
                <p className="text-2xl font-bold">Live</p>
              </div>
              <div className="bg-white/10 border border-white/20 rounded-2xl p-4 text-center">
                <p className="text-xs text-slate-300">Scheduler</p>
                <p className="text-2xl font-bold">On</p>
              </div>
            </div>
          </div>
        </div>

        <div
          className="grid grid-cols-1 xl:grid-cols-12 gap-8"
          style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(0, 2fr) minmax(0, 1fr)',
            gap: '24px',
          }}
        >
          {/* Left Column */}
          <div className="xl:col-span-8 space-y-8" style={{ minWidth: 0 }}>
            <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-lg">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-slate-900">Connected Accounts</h2>
                <a
                  href="/accounts"
                  className="text-slate-700 hover:text-slate-900 text-sm font-semibold"
                >
                  View all →
                </a>
              </div>
              <SocialAccountList key={refreshKey} />
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-lg">
              <h2 className="text-2xl font-bold text-slate-900 mb-6">Add More Accounts</h2>
              <SocialConnectPanel onAccountAdded={() => setRefreshKey(prev => prev + 1)} />
            </div>
          </div>

          {/* Right Column */}
          <div className="xl:col-span-4 space-y-8" style={{ minWidth: 0 }}>
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-lg">
              <h3 className="text-lg font-bold text-slate-900 mb-4">Quick Actions</h3>
              <div className="grid grid-cols-1 gap-4">
                <a
                  href="/workflow"
                  className="group p-4 bg-slate-50 rounded-xl border border-slate-200 hover:shadow-md transition"
                >
                  <div className="flex items-center gap-3">
                    <div className="text-2xl">✍️</div>
                    <div>
                      <p className="font-semibold text-slate-900">Content Workflow</p>
                      <p className="text-xs text-slate-600">Create, edit, schedule</p>
                    </div>
                  </div>
                </a>
                <a
                  href="/accounts"
                  className="group p-4 bg-slate-50 rounded-xl border border-slate-200 hover:shadow-md transition"
                >
                  <div className="flex items-center gap-3">
                    <div className="text-2xl">🔗</div>
                    <div>
                      <p className="font-semibold text-slate-900">Connected Accounts</p>
                      <p className="text-xs text-slate-600">Manage profiles</p>
                    </div>
                  </div>
                </a>
                <a
                  href="/reports"
                  className="group p-4 bg-slate-50 rounded-xl border border-slate-200 hover:shadow-md transition"
                >
                  <div className="flex items-center gap-3">
                    <div className="text-2xl">📊</div>
                    <div>
                      <p className="font-semibold text-slate-900">Reports</p>
                      <p className="text-xs text-slate-600">Insights & performance</p>
                    </div>
                  </div>
                </a>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-lg">
              <h3 className="text-lg font-bold text-slate-900 mb-4">System Status</h3>
              <div className="grid grid-cols-1 gap-4">
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl">
                  <p className="font-semibold text-slate-900 mb-1">Backend Server</p>
                  <p className="text-xs text-slate-600">✓ Running on port 6001</p>
                </div>
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-2xl">
                  <p className="font-semibold text-slate-900 mb-1">Frontend Server</p>
                  <p className="text-xs text-slate-600">✓ Running on port 6002</p>
                </div>
                <div className="p-4 bg-purple-50 border border-purple-200 rounded-2xl">
                  <p className="font-semibold text-slate-900 mb-1">OAuth Endpoints</p>
                  <p className="text-xs text-slate-600">✓ All platforms ready</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
