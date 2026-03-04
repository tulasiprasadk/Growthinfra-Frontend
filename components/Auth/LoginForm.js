import { useRouter } from 'next/router';
import { useState } from 'react';
import SocialLoginButtons from './SocialLoginButtons';

export default function LoginForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleProviderClick = async (provider) => {
    try {
      setIsLoading(true);
      setError(null);

      const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:6001';
      const endpoint = `${apiBase}/api/social/connect/${provider.toLowerCase()}`;

      // Redirect to backend OAuth endpoint which will handle the OAuth flow
      window.location.href = endpoint;
    } catch (err) {
      setError(`Failed to connect ${provider}: ${err.message}`);
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded shadow">
      <h2 className="text-xl font-bold mb-4">Login</h2>
      
      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      {/* Email/password login can go here */}
      <div className="mb-4">Or login with:</div>
      <SocialLoginButtons onProviderClick={handleProviderClick} isLoading={isLoading} />
    </div>
  );
}
