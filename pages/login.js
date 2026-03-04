import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import LoginForm from '../components/Auth/LoginForm';

export default function LoginPage() {
  const router = useRouter();
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    // Check for OAuth callback results from query params
    if (router.query.connected && router.query.success) {
      const provider = router.query.connected;
      const isSuccess = router.query.success === '1';
      
      setSuccess({
        provider,
        isSuccess,
      });

      // Clear query params and redirect to dashboard after 2 seconds if successful
      if (isSuccess) {
        setTimeout(() => {
          router.push('/dashboard');
        }, 2000);
      }
    }
  }, [router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {success && (
          <div
            className={`mb-4 p-4 rounded-lg text-white ${
              success.isSuccess ? 'bg-green-500' : 'bg-red-500'
            }`}
          >
            <p className="font-semibold">
              {success.isSuccess
                ? `✓ Successfully connected to ${success.provider}!`
                : `✗ Failed to connect to ${success.provider}. Please try again.`}
            </p>
            {success.isSuccess && <p className="text-sm mt-1">Redirecting to dashboard...</p>}
          </div>
        )}

        <LoginForm />
      </div>
    </div>
  );
}
