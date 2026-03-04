import Head from 'next/head';
import Link from 'next/link';
import '../styles/globals.css';

export default function App({ Component, pageProps }) {
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
