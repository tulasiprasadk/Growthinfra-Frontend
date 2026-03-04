import { useRouter } from 'next/router';
export default function MockCallback() {
  const router = useRouter();
  const { provider, status } = router.query;

  return (
    <div style={{padding:40,fontFamily:'sans-serif'}}>
      <h2>Mock OAuth Callback</h2>
      <p>Provider: {provider}</p>
      <p>Status: {status}</p>
      <p>This is a simulated callback page. Close this page and return to the app UI.</p>
    </div>
  );
}
