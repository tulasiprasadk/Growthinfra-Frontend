import { useState } from 'react';
import SocialConnectPanel from '../components/Social/SocialConnectPanel';

export default function Onboard() {
  const [form, setForm] = useState({
    name: '',
    description: '',
    category: '',
    location: '',
    website: '',
  });
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    try {
      const res = await fetch('http://localhost:15000/api/org', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setSuccess(true);
        setForm({ name: '', description: '', category: '', location: '', website: '' });
      } else {
        const data = await res.json();
        setError(data.message || 'Failed to onboard business.');
      }
    } catch (err) {
      setError('Could not connect to backend.');
    }
  };

  return (
    <div style={{ maxWidth: 500, margin: '40px auto', padding: 24, background: '#fff', borderRadius: 8, boxShadow: '0 2px 8px #eee' }}>
      <h2>Onboard Your Business</h2>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <input name="name" value={form.name} onChange={handleChange} placeholder="Business Name" required />
        <input name="description" value={form.description} onChange={handleChange} placeholder="Description" required />
        <input name="category" value={form.category} onChange={handleChange} placeholder="Category" required />
        <input name="location" value={form.location} onChange={handleChange} placeholder="Location" required />
        <input name="website" value={form.website} onChange={handleChange} placeholder="Website" required />
        <button type="submit" style={{ background: '#0070f3', color: '#fff', padding: '10px 0', border: 'none', borderRadius: 6, fontWeight: 'bold' }}>Submit</button>
      </form>
      <SocialConnectPanel />
      {success && <div style={{ color: 'green', marginTop: 12 }}>Business onboarded successfully!</div>}
      {error && <div style={{ color: 'red', marginTop: 12 }}>{error}</div>}
    </div>
  );
}
