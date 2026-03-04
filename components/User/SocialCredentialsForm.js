import React, { useState } from 'react';

const platforms = [
  'Facebook',
  'LinkedIn',
  'Instagram',
  'Twitter',
  'Reddit',
];

const tutorials = {
  Facebook: {
    url: 'https://developers.facebook.com/apps/',
    steps: [
      'Go to Facebook Developers and log in.',
      'Click "Create App" and follow the instructions.',
      'After creation, go to Settings > Basic to find your App ID and App Secret.',
      'Set the OAuth redirect URI to: http://localhost:3000/api/auth/callback/facebook',
    ],
  },
  LinkedIn: {
    url: 'https://www.linkedin.com/developers/apps',
    steps: [
      'Go to LinkedIn Developers and log in.',
      'Click "Create app" and fill in the details.',
      'After creation, go to Auth tab to find your Client ID and Client Secret.',
      'Set the OAuth redirect URI to: http://localhost:3000/api/auth/callback/linkedin',
    ],
  },
  Instagram: {
    url: 'https://developers.facebook.com/apps/',
    steps: [
      'Go to Facebook Developers and log in.',
      'Create an app and add Instagram Basic Display as a product.',
      'Configure Instagram settings and get your App ID and App Secret.',
      'Set the OAuth redirect URI to: http://localhost:3000/api/auth/callback/instagram',
    ],
  },
  Twitter: {
    url: 'https://developer.twitter.com/en/portal/projects-and-apps',
    steps: [
      'Go to Twitter Developer Portal and log in.',
      'Create a new Project and App.',
      'Find your API Key and API Secret Key in the Keys and Tokens tab.',
      'Set the OAuth redirect URI to: http://localhost:3000/api/auth/callback/twitter',
    ],
  },
  Reddit: {
    url: 'https://www.reddit.com/prefs/apps',
    steps: [
      'Go to Reddit Apps and log in.',
      'Click "Create App" or "Create Another App".',
      'Fill in the details and set type to "web app".',
      'Find your client ID under the app name and client secret below it.',
      'Set the redirect URI to: http://localhost:3000/api/auth/callback/reddit',
    ],
  },
};

const termsText = `By providing your social media credentials or API keys, you agree to our Terms and Conditions. We recommend using official OAuth integrations for best security and compliance. Your credentials will be handled securely and used only for the purpose of connecting your social accounts to this platform. Do not share credentials you are not authorized to share. For more information, see our Privacy Policy.`;

export default function SocialCredentialsForm({ onSave }) {
  const [credentials, setCredentials] = useState({});
  const [status, setStatus] = useState('');
  const [showTutorial, setShowTutorial] = useState(null);
  const [accepted, setAccepted] = useState(false);

  const handleChange = (platform, field, value) => {
    setCredentials(prev => ({
      ...prev,
      [platform]: {
        ...prev[platform],
        [field]: value,
      },
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!accepted) {
      setStatus('You must accept the Terms and Conditions.');
      return;
    }
    setStatus('Saving...');
    try {
      const res = await fetch('/api/social-credentials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credentials, accepted }),
      });
      if (res.ok) {
        setStatus('Credentials saved!');
        if (onSave) onSave();
      } else {
        setStatus('Failed to save.');
      }
    } catch (err) {
      setStatus('Error saving credentials.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-lg mx-auto p-4 bg-white rounded shadow">
      <h2 className="text-lg font-bold mb-4">Enter Social Media Credentials</h2>
      <div className="mb-6 text-sm text-gray-700">
        <b>Compliance Notice:</b> For best security, use OAuth (client ID/secret). If you prefer, you can enter your login credentials below. For instructions on getting your client ID/secret, click "Show Tutorial" for each platform.
      </div>
      {platforms.map(platform => (
        <div key={platform} className="mb-4 border-b pb-2">
          <h3 className="font-semibold mb-2 flex items-center justify-between">
            {platform}
            <button
              type="button"
              className="text-blue-600 underline text-xs ml-2"
              onClick={() => setShowTutorial(showTutorial === platform ? null : platform)}
            >
              {showTutorial === platform ? 'Hide Tutorial' : 'Show Tutorial'}
            </button>
          </h3>
          {showTutorial === platform && (
            <div className="mb-2 p-2 bg-gray-100 rounded text-xs">
              <div className="mb-1 font-semibold">How to get {platform} Client ID/Secret:</div>
              <ol className="list-decimal ml-5 mb-1">
                {tutorials[platform].steps.map((step, i) => (
                  <li key={i}>{step}</li>
                ))}
              </ol>
              <a href={tutorials[platform].url} target="_blank" rel="noopener noreferrer" className="text-blue-700 underline">Go to {platform} Developer Portal</a>
            </div>
          )}
          <input
            type="text"
            className="w-full border p-2 rounded mb-2"
            placeholder={`${platform} Username or Email`}
            value={credentials[platform]?.username || ''}
            onChange={e => handleChange(platform, 'username', e.target.value)}
          />
          <input
            type="password"
            className="w-full border p-2 rounded"
            placeholder={`${platform} Password`}
            value={credentials[platform]?.password || ''}
            onChange={e => handleChange(platform, 'password', e.target.value)}
          />
        </div>
      ))}
      <div className="my-4 p-3 bg-gray-50 border rounded text-xs text-gray-700">
        {termsText}
      </div>
      <label className="flex items-center mb-2">
        <input
          type="checkbox"
          checked={accepted}
          onChange={e => setAccepted(e.target.checked)}
          className="mr-2"
        />
        I accept the Terms and Conditions
      </label>
      <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded mt-2" disabled={!accepted}>Save All</button>
      {status && <div className="mt-2 text-sm">{status}</div>}
    </form>
  );
}
