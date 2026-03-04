import { useState } from 'react';

export default function UserProfileForm({ profile, setProfile, onSave }) {
  const [saved, setSaved] = useState(false);
  const handleChange = (field, value) => {
    setProfile(prev => ({ ...prev, [field]: value }));
  };
  const handleSave = () => {
    if (onSave) onSave();
    setSaved(true);
    window.setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div style={{ width: '100%' }}>
      <h3 style={{ marginBottom: 20 }}>User Customization</h3>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
        {/* Logo */}
        <div>
          <label style={labelStyle}>Logo</label>
          <input
            type="file"
            accept="image/*"
            style={inputStyle}
            onChange={e => {
              const f = e.target.files[0];
              if (!f) return;
              const reader = new FileReader();
              reader.onload = () => {
                if (typeof reader.result === 'string') {
                  handleChange('logo', reader.result);
                }
              };
              reader.readAsDataURL(f);
            }}
          />
          {profile.logo ? (
            <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
              <img
                src={profile.logo}
                alt="logo-preview"
                style={{ width: 36, height: 36, borderRadius: 8, objectFit: 'cover', border: '1px solid #E5E7EB' }}
              />
              <span style={{ fontSize: 12, color: '#4B5563' }}>Logo loaded</span>
            </div>
          ) : (
            <div style={{ marginTop: 8, fontSize: 12, color: '#6B7280' }}>
              Upload a logo to display it on images.
            </div>
          )}
        </div>

        {/* Tagline */}
        <div>
          <label style={labelStyle}>Tagline</label>
          <input
            type="text"
            value={profile.tagline}
            onChange={e => handleChange('tagline', e.target.value)}
            placeholder="Short brand tagline"
            style={inputStyle}
          />
        </div>

        {/* Email */}
        <div>
          <label style={labelStyle}>Email</label>
          <input
            type="email"
            value={profile.email}
            onChange={e => handleChange('email', e.target.value)}
            placeholder="contact@company.com"
            style={inputStyle}
          />
        </div>

        {/* Contact */}
        <div>
          <label style={labelStyle}>Contact Number</label>
          <input
            type="text"
            value={profile.contact}
            onChange={e => handleChange('contact', e.target.value)}
            placeholder="+91 9XXXXXXXXX"
            style={inputStyle}
          />
        </div>

        {/* Website */}
        <div>
          <label style={labelStyle}>Website</label>
          <input
            type="text"
            value={profile.website}
            onChange={e => handleChange('website', e.target.value)}
            placeholder="https://example.com"
            style={inputStyle}
          />
        </div>

        <button
          type="button"
          onClick={handleSave}
          style={{
            marginTop: 4,
            background: '#1E5EFF',
            color: '#fff',
            border: 'none',
            padding: '10px 14px',
            borderRadius: 8,
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          Save
        </button>
        {saved && <div style={{ fontSize: 12, color: '#15803d' }}>Saved.</div>}
      </div>
    </div>
  );
}

/* ================= STYLES ================= */

const labelStyle = {
  display: 'block',
  fontSize: 14,
  fontWeight: 500,
  marginBottom: 6,
  color: '#374151',
};

const inputStyle = {
  width: '100%',
  padding: '12px 14px',
  borderRadius: 8,
  border: '1px solid #D1D5DB',
  fontSize: 14,
  outline: 'none',
  boxSizing: 'border-box',
};
