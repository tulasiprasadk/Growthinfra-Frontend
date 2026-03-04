import React from 'react';

const providers = [
  { name: 'Facebook', color: 'bg-blue-600', icon: '🔵' },
  { name: 'LinkedIn', color: 'bg-blue-800', icon: '💼' },
  { name: 'Instagram', color: 'bg-gradient-to-r from-pink-500 via-red-500 to-yellow-500', icon: '📸' },
  { name: 'Twitter', color: 'bg-blue-400', icon: '🐦' },
  { name: 'Reddit', color: 'bg-orange-500', icon: '👽' },
];

export default function SocialLoginButtons({ onProviderClick, isLoading }) {
  return (
    <div className="flex flex-col gap-3 my-4">
      {providers.map(p => (
        <button
          key={p.name}
          className={`flex items-center justify-center ${p.color} text-white py-2 rounded font-semibold shadow ${
            isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-lg cursor-pointer'
          }`}
          onClick={() => onProviderClick && onProviderClick(p.name)}
          type="button"
          disabled={isLoading}
        >
          <span className="mr-2 text-xl">{p.icon}</span> Continue with {p.name}
        </button>
      ))}
    </div>
  );
}
