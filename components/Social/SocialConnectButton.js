import { getApiBaseUrl } from '../../utils/api';
import { getStoredUser } from '../../utils/auth';

export default function SocialConnectButton({ provider, name, icon, onConnect }) {
  const handleConnect = () => {
    const base = getApiBaseUrl();
    const user = getStoredUser();
    const organizationId = user?.memberships?.[0]?.organization?.id || '';
    const query = organizationId ? `?organizationId=${encodeURIComponent(organizationId)}` : '';
    const url = `${base}/api/social/connect/${provider}${query}`;
    // Redirect to backend OAuth endpoint
    if (typeof window !== 'undefined') {
      window.location.href = url;
    } else {
      alert(`Open ${url} to start OAuth for ${name}`);
    }
  };

  return (
    <button
      onClick={handleConnect}
      className="flex flex-col items-center gap-2 p-4 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 hover:border-gray-400 transition cursor-pointer text-sm font-medium"
    >
      <span className="text-2xl">{icon || '📱'}</span>
      <span className="text-center text-xs md:text-sm">{name}</span>
    </button>
  );
}
