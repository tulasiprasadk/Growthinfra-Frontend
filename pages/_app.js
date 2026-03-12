import Head from 'next/head';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import '../styles/globals.css';
import { clearAuthSession, getAuthToken, getStoredUser, isStoredUserAdmin, setAuthSession } from '../utils/auth';
import { getApiBaseUrl } from '../utils/api';

const PROTECTED_ROUTES = [
  '/dashboard',
  '/accounts',
  '/workflow',
  '/credentials',
  '/social-credentials',
  '/onboard',
  '/admin',
];

export default function App({ Component, pageProps }) {
  const router = useRouter();
  const [authChecked, setAuthChecked] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const token = getAuthToken();
    setIsAuthenticated(Boolean(token));
    setIsAdmin(isStoredUserAdmin());
    const isProtectedRoute = PROTECTED_ROUTES.includes(router.pathname);
    const isAuthPage = router.pathname === '/login' || router.pathname === '/signup';

    if (isProtectedRoute && !token) {
      router.replace('/login');
      return;
    }

    if (isAuthPage && token) {
      router.replace('/dashboard');
      return;
    }

    setAuthChecked(true);
  }, [router.pathname, router]);

  useEffect(() => {
    const token = getAuthToken();
    if (!token) return;

    let cancelled = false;
    const syncUser = async () => {
      try {
        const response = await fetch(`${getApiBaseUrl()}/api/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!response.ok) return;
        const data = await response.json();
        if (!cancelled && data?.user) {
          setAuthSession(token, data.user);
          setIsAdmin(Boolean(data.user.isAdmin));
        }
      } catch {}
    };

    syncUser();
    return () => {
      cancelled = true;
    };
  }, [router.pathname]);

  const handleLogout = () => {
    clearAuthSession();
    setIsAuthenticated(false);
    setIsAdmin(false);
    router.replace('/login');
  };

  if (!authChecked) {
    return null;
  }

  return (
    <>
      <Head>
        <title>GrowthInfra</title>
        <link rel="icon" href="/growthinfra-logo.png" />
      </Head>
      <Link href="/" className="global-home-logo" aria-label="Go to home">
        <img
          src="/growthinfra-logo.png"
          alt="GrowthInfra Home"
        />
      </Link>
      {isAuthenticated && (
        <div style={{ position: 'fixed', top: '16px', right: '16px', zIndex: 1000, display: 'flex', gap: '10px', padding: '10px', borderRadius: '18px', background: 'rgba(255,255,255,0.78)', backdropFilter: 'blur(12px)', border: '1px solid rgba(148,163,184,0.2)', boxShadow: '0 16px 40px rgba(15,23,42,0.12)' }}>
          <Link
            href="/dashboard"
            style={{
              padding: '10px 16px',
              borderRadius: '999px',
              border: '1px solid rgba(14,165,233,0.2)',
              background: 'linear-gradient(180deg, #ffffff, #f8fbff)',
              color: '#0f172a',
              fontSize: '14px',
              fontWeight: '700',
              textDecoration: 'none',
              boxShadow: '0 8px 24px rgba(15, 23, 42, 0.06)',
            }}
          >
            Dashboard
          </Link>
          {isAdmin && (
            <Link
              href="/admin"
              style={{
                padding: '10px 16px',
                borderRadius: '999px',
                border: '1px solid rgba(14,165,233,0.2)',
                background: 'linear-gradient(180deg, #ffffff, #f8fbff)',
                color: '#0f172a',
                fontSize: '14px',
                fontWeight: '700',
                textDecoration: 'none',
                boxShadow: '0 8px 24px rgba(15, 23, 42, 0.06)',
              }}
            >
              Admin
            </Link>
          )}
          <button
            type="button"
            onClick={handleLogout}
            style={{
              padding: '10px 16px',
              borderRadius: '999px',
              border: '1px solid #fecaca',
              background: 'linear-gradient(180deg, #ffffff, #fff7f7)',
              color: '#b91c1c',
              fontSize: '14px',
              fontWeight: '700',
              cursor: 'pointer',
              boxShadow: '0 8px 24px rgba(15, 23, 42, 0.06)',
            }}
          >
            Logout
          </button>
        </div>
      )}
      <Component {...pageProps} />
    </>
  );
}
