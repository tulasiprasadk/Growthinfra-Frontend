import Head from 'next/head';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import '../styles/globals.css';
import { getAuthToken } from '../utils/auth';

const PROTECTED_ROUTES = [
  '/dashboard',
  '/accounts',
  '/workflow',
  '/credentials',
  '/social-credentials',
  '/onboard',
];

export default function App({ Component, pageProps }) {
  const router = useRouter();
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    const token = getAuthToken();
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
      <Component {...pageProps} />
    </>
  );
}
