import { useRouter } from 'next/router';
import { useEffect } from 'react';

export default function MockConnect() {
  const router = useRouter();
  const { provider } = router.query;

  useEffect(() => {
    // simulate redirect to provider and back to callback after delay
    const t = setTimeout(() => {
      const callbackUrl = `/mock/social/callback?provider=${encodeURIComponent(provider || '')}&status=success`;
      window.location.href = callbackUrl;
    }, 900);
    return () => clearTimeout(t);
  }, [provider]);

  return (
    <div style={{padding:40,fontFamily:'sans-serif'}}>
      <h2>Mock OAuth: {provider}</h2>
      <p>Simulating redirect to {provider} and returning to app...</p>
      <p>If nothing happens, <a href={`/mock/social/callback?provider=${provider}&status=success`}>click to continue</a>.</p>
    </div>
  );
}
