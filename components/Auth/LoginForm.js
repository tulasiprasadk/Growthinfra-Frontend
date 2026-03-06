import Link from 'next/link';
import { useRouter } from 'next/router';
import { useState } from 'react';
import { setAuthSession } from '../../utils/auth';

export default function LoginForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      setIsLoading(true);
      setError('');

      const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || '';
      const response = await fetch(`${apiBase}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || data.error || 'Login failed');
      }

      setAuthSession(data.token, data.user);
      router.push('/dashboard');
    } catch (err) {
      setError(err.message || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form className="max-w-md mx-auto p-6 bg-white rounded shadow" onSubmit={handleSubmit}>
      <h2 className="text-xl font-bold mb-4">Login</h2>

      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      <div className="mb-4">
        <label className="block text-sm font-semibold mb-2">Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border border-slate-300 rounded px-3 py-2"
          placeholder="you@example.com"
          required
        />
      </div>

      <div className="mb-4">
        <label className="block text-sm font-semibold mb-2">Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full border border-slate-300 rounded px-3 py-2"
          placeholder="Enter your password"
          minLength={6}
          required
        />
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-blue-600 text-white rounded px-4 py-2 font-semibold disabled:opacity-50"
      >
        {isLoading ? 'Logging in...' : 'Login'}
      </button>

      <p className="mt-4 text-sm text-slate-600">
        No account yet?{' '}
        <Link href="/signup" className="text-blue-600 font-semibold">
          Sign up
        </Link>
      </p>
    </form>
  );
}
