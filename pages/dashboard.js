import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import SocialConnectPanel from '../components/Social/SocialConnectPanel';
import SocialAccountList from '../components/Social/SocialAccountList';
import { clearAuthSession, getStoredUser } from '../utils/auth';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || '';

export default function DashboardPage() {
  const router = useRouter();
  const [apiBase, setApiBase] = useState(API_BASE);
  const [refreshKey, setRefreshKey] = useState(0);
  const [userEmail, setUserEmail] = useState('');

  useEffect(() => {
    setApiBase(API_BASE);
    const storedUser = getStoredUser();
    setUserEmail(storedUser?.email || 'Authorized User');
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    const connected = params.get('connected');
    const success = params.get('success');
    if (connected && success === '1') {
      setTimeout(() => {
        setRefreshKey((prev) => prev + 1);
      }, 1000);
    }
  }, [apiBase]);

  const handleLogout = () => {
    clearAuthSession();
    router.replace('/login');
  };

  return (
    <div className="brand-shell">
      <div style={{ maxWidth: '1380px', margin: '0 auto', display: 'grid', gap: '24px' }}>
        <div className="brand-surface" style={{ padding: '34px', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, rgba(7,89,133,0.92), rgba(15,23,42,0.96) 45%, rgba(30,41,59,0.96) 100%)' }} />
          <div style={{ position: 'absolute', right: '-120px', top: '-80px', width: '340px', height: '340px', borderRadius: '999px', background: 'radial-gradient(circle, rgba(34,211,238,0.34), transparent 70%)' }} />
          <div style={{ position: 'relative', color: '#fff', display: 'grid', gridTemplateColumns: 'minmax(0, 1.4fr) minmax(280px, 0.8fr)', gap: '26px', alignItems: 'center' }}>
            <div>
              <div className="brand-pill" style={{ background: 'rgba(255,255,255,0.12)', color: '#e0f2fe', borderColor: 'rgba(186,230,253,0.2)' }}>GrowthInfra Mission Control</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginTop: '18px', flexWrap: 'wrap' }}>
                <img src="/growthinfra-logo.png" alt="GrowthInfra" style={{ width: '250px', maxWidth: '100%', height: 'auto' }} />
              </div>
              <h1 style={{ fontSize: '46px', lineHeight: 1.02, margin: '18px 0 10px' }}>GrowthInfra Dashboard</h1>
              <p style={{ margin: 0, color: 'rgba(226,232,240,0.92)', maxWidth: '740px', fontSize: '18px', lineHeight: 1.7 }}>
                Orchestrate brand accounts, launch channel workflows, and keep publishing assets aligned from one GrowthInfra workspace.
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', marginTop: '24px' }}>
                <a href="/workflow" style={{ padding: '14px 22px', background: '#fff', color: '#0f172a', borderRadius: '999px', fontWeight: 700, textDecoration: 'none' }}>Create a Post</a>
                <a href="/accounts" style={{ padding: '14px 22px', border: '1px solid rgba(255,255,255,0.28)', color: '#fff', borderRadius: '999px', fontWeight: 700, textDecoration: 'none' }}>Manage Accounts</a>
                <button onClick={handleLogout} style={{ padding: '14px 22px', borderRadius: '999px', border: '1px solid rgba(254,202,202,0.5)', background: 'rgba(127,29,29,0.16)', color: '#fff', fontWeight: 700, cursor: 'pointer' }}>Logout</button>
              </div>
            </div>

            <div style={{ display: 'grid', gap: '14px' }}>
              <div style={{ padding: '18px', borderRadius: '22px', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.16)', backdropFilter: 'blur(10px)' }}>
                <div style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#bfdbfe', fontWeight: 700 }}>Signed in as</div>
                <div style={{ marginTop: '6px', fontSize: '20px', fontWeight: 800, wordBreak: 'break-word' }}>{userEmail}</div>
              </div>
              <div className="brand-grid">
                <div style={{ padding: '18px', borderRadius: '22px', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.16)' }}>
                  <div style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#bfdbfe', fontWeight: 700 }}>Workspace</div>
                  <div style={{ marginTop: '6px', fontSize: '28px', fontWeight: 800 }}>Live</div>
                </div>
                <div style={{ padding: '18px', borderRadius: '22px', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.16)' }}>
                  <div style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#bfdbfe', fontWeight: 700 }}>Channels</div>
                  <div style={{ marginTop: '6px', fontSize: '28px', fontWeight: 800 }}>4+</div>
                </div>
                <div style={{ padding: '18px', borderRadius: '22px', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.16)' }}>
                  <div style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#bfdbfe', fontWeight: 700 }}>Scheduling</div>
                  <div style={{ marginTop: '6px', fontSize: '28px', fontWeight: 800 }}>On</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.9fr) minmax(320px, 0.9fr)', gap: '24px' }}>
          <div style={{ display: 'grid', gap: '24px' }}>
            <div className="brand-surface" style={{ padding: '28px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px', marginBottom: '16px', flexWrap: 'wrap' }}>
                <div>
                  <div className="brand-pill">Connected Network</div>
                  <h2 style={{ margin: '14px 0 8px', fontSize: '30px' }}>Connected GrowthInfra Accounts</h2>
                  <p style={{ margin: 0, color: '#475569', lineHeight: 1.6 }}>Track every connected page, profile, and business account from one operational board.</p>
                </div>
                <a href="/accounts" style={{ textDecoration: 'none', color: '#0369a1', fontWeight: 700 }}>View all accounts</a>
              </div>
              <SocialAccountList key={refreshKey} />
            </div>

            <div className="brand-surface" style={{ padding: '28px' }}>
              <div className="brand-pill">Expansion</div>
              <h2 style={{ margin: '14px 0 8px', fontSize: '30px' }}>Add More Accounts</h2>
              <p style={{ margin: '0 0 20px', color: '#475569', lineHeight: 1.6 }}>Bring more business pages and social profiles into the GrowthInfra control layer.</p>
              <SocialConnectPanel onAccountAdded={() => setRefreshKey((prev) => prev + 1)} />
            </div>
          </div>

          <div style={{ display: 'grid', gap: '24px' }}>
            <div className="brand-surface" style={{ padding: '24px' }}>
              <div className="brand-pill">Quick Actions</div>
              <div style={{ display: 'grid', gap: '14px', marginTop: '18px' }}>
                <a href="/workflow" style={{ padding: '18px', borderRadius: '20px', background: 'linear-gradient(180deg, #ffffff, #f8fbff)', border: '1px solid rgba(148,163,184,0.18)', textDecoration: 'none' }}>
                  <div style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#64748b', fontWeight: 700 }}>Create</div>
                  <div style={{ marginTop: '8px', fontSize: '20px', fontWeight: 800 }}>Campaign Workflow</div>
                  <div style={{ marginTop: '6px', color: '#475569' }}>Draft, edit, and schedule posts.</div>
                </a>
                <a href="/accounts" style={{ padding: '18px', borderRadius: '20px', background: 'linear-gradient(180deg, #ffffff, #f8fbff)', border: '1px solid rgba(148,163,184,0.18)', textDecoration: 'none' }}>
                  <div style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#64748b', fontWeight: 700 }}>Manage</div>
                  <div style={{ marginTop: '8px', fontSize: '20px', fontWeight: 800 }}>Account Control</div>
                  <div style={{ marginTop: '6px', color: '#475569' }}>Audit, connect, and clean profile access.</div>
                </a>
                <a href="/reports" style={{ padding: '18px', borderRadius: '20px', background: 'linear-gradient(180deg, #ffffff, #f8fbff)', border: '1px solid rgba(148,163,184,0.18)', textDecoration: 'none' }}>
                  <div style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#64748b', fontWeight: 700 }}>Measure</div>
                  <div style={{ marginTop: '8px', fontSize: '20px', fontWeight: 800 }}>Reports</div>
                  <div style={{ marginTop: '6px', color: '#475569' }}>Review insights and performance trends.</div>
                </a>
              </div>
            </div>

            <div className="brand-surface" style={{ padding: '24px' }}>
              <div className="brand-pill">System Status</div>
              <div style={{ display: 'grid', gap: '14px', marginTop: '18px' }}>
                <div className="brand-stat">
                  <p className="brand-stat-label">Backend</p>
                  <p className="brand-stat-value" style={{ fontSize: '20px' }}>Deployed and active</p>
                </div>
                <div className="brand-stat">
                  <p className="brand-stat-label">Frontend</p>
                  <p className="brand-stat-value" style={{ fontSize: '20px' }}>GrowthInfra live</p>
                </div>
                <div className="brand-stat">
                  <p className="brand-stat-label">OAuth Layer</p>
                  <p className="brand-stat-value" style={{ fontSize: '20px' }}>Ready for use</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
