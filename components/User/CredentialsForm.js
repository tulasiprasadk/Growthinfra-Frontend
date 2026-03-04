import React, { useState } from 'react';

export default function CredentialsForm({ onSave }) {
  const [openaiKey, setOpenaiKey] = useState('');
  const [socialToken, setSocialToken] = useState('');
  const [status, setStatus] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('Saving...');
    try {
      // Send credentials to backend (implement endpoint to store securely)
      const res = await fetch('/api/credentials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ openaiKey, socialToken }),
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
    <form onSubmit={handleSubmit} className="max-w-md mx-auto p-4 bg-white rounded shadow">
      <h2 className="text-lg font-bold mb-4">Enter API Credentials</h2>
      <label className="block mb-2">
        OpenAI API Key
        <input
          type="password"
          className="w-full border p-2 rounded mt-1"
          value={openaiKey}
          onChange={e => setOpenaiKey(e.target.value)}
          placeholder="sk-..."
        />
      </label>
      <label className="block mb-2">
        Social Media Token
        <input
          type="password"
          className="w-full border p-2 rounded mt-1"
          value={socialToken}
          onChange={e => setSocialToken(e.target.value)}
          placeholder="OAuth or API token"
        />
      </label>
      <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded mt-2">Save</button>
      {status && <div className="mt-2 text-sm">{status}</div>}
    </form>
  );
}
