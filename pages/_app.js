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
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
      </Head>
      <Link href="/" className="global-home-logo" aria-label="Go to home">
        <img
          src="/growthinfra-logo.png"
          alt="GrowthInfra Home"
          onError={(e) => {
            e.currentTarget.src = '/signalflow-logo.svg';
          }}
        />
      </Link>
      {isAuthenticated && (
        <div style={{ position: 'fixed', top: '16px', right: '16px', zIndex: 1000, display: 'flex', gap: '10px' }}>
          <Link
            href="/dashboard"
            style={{
              padding: '10px 14px',
              borderRadius: '999px',
              border: '1px solid #cbd5e1',
              background: '#ffffff',
              color: '#0f172a',
              fontSize: '14px',
              fontWeight: '700',
              textDecoration: 'none',
              boxShadow: '0 8px 24px rgba(15, 23, 42, 0.08)',
            }}
          >
            Dashboard
          </Link>
          {isAdmin && (
            <Link
              href="/admin"
              style={{
                padding: '10px 14px',
                borderRadius: '999px',
                border: '1px solid #cbd5e1',
                background: '#ffffff',
                color: '#0f172a',
                fontSize: '14px',
                fontWeight: '700',
                textDecoration: 'none',
                boxShadow: '0 8px 24px rgba(15, 23, 42, 0.08)',
              }}
            >
              Admin
            </Link>
          )}
          <button
            type="button"
            onClick={handleLogout}
            style={{
              padding: '10px 14px',
              borderRadius: '999px',
              border: '1px solid #fecaca',
              background: '#ffffff',
              color: '#b91c1c',
              fontSize: '14px',
              fontWeight: '700',
              cursor: 'pointer',
              boxShadow: '0 8px 24px rgba(15, 23, 42, 0.08)',
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
