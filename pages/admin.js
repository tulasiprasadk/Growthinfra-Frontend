import { useEffect, useState } from 'react';
import Link from 'next/link';
import { adminFetch, getAdminKey, setAdminKey } from '../utils/admin';
import { getStoredUser } from '../utils/auth';

const pageStyle = {
  minHeight: '100vh',
  background: '#f8fafc',
  padding: '48px 16px',
  color: '#0f172a',
};

const cardStyle = {
  background: '#ffffff',
  border: '1px solid #e2e8f0',
  borderRadius: '16px',
  padding: '20px',
  boxShadow: '0 10px 30px rgba(15, 23, 42, 0.06)',
};

const inputStyle = {
  width: '100%',
  border: '1px solid #cbd5e1',
  borderRadius: '10px',
  padding: '10px 12px',
  fontSize: '14px',
};

const buttonStyle = {
  border: 'none',
  borderRadius: '10px',
  padding: '10px 14px',
  fontSize: '14px',
  fontWeight: 700,
  cursor: 'pointer',
};

export default function AdminPage() {
  const [adminKey, setAdminKeyState] = useState('');
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [overview, setOverview] = useState(null);
  const [users, setUsers] = useState([]);
  const [organizations, setOrganizations] = useState([]);
  const [reports, setReports] = useState([]);
  const [canAccessAdmin, setCanAccessAdmin] = useState(false);
  const [editingUserId, setEditingUserId] = useState('');
  const [editUser, setEditUser] = useState({ email: '', password: '' });
  const [userSearch, setUserSearch] = useState('');
  const [resetPasswords, setResetPasswords] = useState({});
  const [editingOrganizationId, setEditingOrganizationId] = useState('');
  const [editOrganization, setEditOrganization] = useState({
    name: '',
    description: '',
    category: '',
    location: '',
    website: '',
  });
  const [newOrganization, setNewOrganization] = useState({
    name: '',
    description: '',
    category: '',
    location: '',
    website: '',
  });
  const currentUser = getStoredUser();
  const [newUser, setNewUser] = useState({
    email: '',
    password: '',
    organizationId: '',
    organizationName: '',
    role: 'member',
  });

  const loadAdminData = async () => {
    setLoading(true);
    setError('');
    try {
      const [overviewData, usersData, organizationsData, reportsData] =
        await Promise.all([
          adminFetch('/api/admin/overview'),
          adminFetch('/api/admin/users'),
          adminFetch('/api/admin/organizations'),
          adminFetch('/api/admin/reports'),
        ]);

      setOverview(overviewData);
      setUsers(usersData.users || []);
      setOrganizations(organizationsData.organizations || []);
      setReports(reportsData.reports || []);
      setStatus('Admin data loaded.');
    } catch (err) {
      setError(err.message || 'Failed to load admin data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const stored = getAdminKey();
    setAdminKeyState(stored);
    setCanAccessAdmin(Boolean(getStoredUser()?.isAdmin));
  }, []);

  if (!canAccessAdmin) {
    return (
      <div style={pageStyle}>
        <div style={{ maxWidth: 860, margin: '0 auto', ...cardStyle }}>
          <h1 style={{ marginTop: 0 }}>Admin Access Required</h1>
          <p style={{ color: '#475569' }}>
            This page is limited to users with an organization role of <strong>admin</strong> or <strong>owner</strong>.
          </p>
          <Link href="/dashboard" style={{ color: '#2563eb', textDecoration: 'none', fontWeight: 700 }}>
            Back to dashboard
          </Link>
        </div>
      </div>
    );
  }

  const handleSaveKey = async (event) => {
    event.preventDefault();
    setAdminKey(adminKey.trim());
    setStatus('Admin key saved locally.');
    setError('');
    if (adminKey.trim()) {
      await loadAdminData();
    }
  };

  const handleCreateUser = async (event) => {
    event.preventDefault();
    setError('');
    setStatus('');
    try {
      const payload = {
        email: newUser.email,
        password: newUser.password,
        role: newUser.role,
      };
      if (newUser.organizationId) {
        payload.organizationId = newUser.organizationId;
      } else if (newUser.organizationName) {
        payload.organizationName = newUser.organizationName;
      }

      const response = await adminFetch('/api/admin/users', {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      setStatus(`User created: ${response.user.email}`);
      setNewUser({
        email: '',
        password: '',
        organizationId: '',
        organizationName: '',
        role: 'member',
      });
      await loadAdminData();
    } catch (err) {
      setError(err.message || 'Failed to create user');
    }
  };

  const handleRoleChange = async (membershipId, role) => {
    setError('');
    setStatus('');
    try {
      await adminFetch(`/api/admin/memberships/${membershipId}`, {
        method: 'PATCH',
        body: JSON.stringify({ role }),
      });
      setStatus('Role updated.');
      await loadAdminData();
    } catch (err) {
      setError(err.message || 'Failed to update role');
    }
  };

  const startEditUser = (user) => {
    setEditingUserId(user.id);
    setEditUser({
      email: user.email || '',
      password: '',
    });
    setError('');
    setStatus('');
  };

  const cancelEditUser = () => {
    setEditingUserId('');
    setEditUser({ email: '', password: '' });
  };

  const handleUpdateUser = async (userId) => {
    setError('');
    setStatus('');
    try {
      const payload = {};
      if (editUser.email.trim()) payload.email = editUser.email.trim();
      if (editUser.password.trim()) payload.password = editUser.password.trim();

      await adminFetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        body: JSON.stringify(payload),
      });
      setStatus('User updated.');
      cancelEditUser();
      await loadAdminData();
    } catch (err) {
      setError(err.message || 'Failed to update user');
    }
  };

  const handleDeleteUser = async (user) => {
    const confirmed = window.confirm(`Delete user ${user.email}? This removes their memberships too.`);
    if (!confirmed) return;

    setError('');
    setStatus('');
    try {
      await adminFetch(`/api/admin/users/${user.id}`, {
        method: 'DELETE',
      });
      setStatus(`Deleted user: ${user.email}`);
      if (editingUserId === user.id) {
        cancelEditUser();
      }
      await loadAdminData();
    } catch (err) {
      setError(err.message || 'Failed to delete user');
    }
  };

  const handleResetPassword = async (user) => {
    const nextPassword = resetPasswords[user.id]?.trim();
    if (!nextPassword || nextPassword.length < 6) {
      setError('Password reset requires at least 6 characters.');
      return;
    }

    setError('');
    setStatus('');
    try {
      await adminFetch(`/api/admin/users/${user.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ password: nextPassword }),
      });
      setResetPasswords((current) => ({ ...current, [user.id]: '' }));
      setStatus(`Password reset for ${user.email}`);
    } catch (err) {
      setError(err.message || 'Failed to reset password');
    }
  };

  const handleDeleteMembership = async (membership) => {
    const confirmed = window.confirm(`Remove ${membership.user?.email || 'this user'} from ${membership.organization.name}?`);
    if (!confirmed) return;

    setError('');
    setStatus('');
    try {
      await adminFetch(`/api/admin/memberships/${membership.id}`, {
        method: 'DELETE',
      });
      setStatus('Membership removed.');
      await loadAdminData();
    } catch (err) {
      setError(err.message || 'Failed to remove membership');
    }
  };

  const handleCreateOrganization = async (event) => {
    event.preventDefault();
    setError('');
    setStatus('');
    try {
      const response = await adminFetch('/api/admin/organizations', {
        method: 'POST',
        body: JSON.stringify(newOrganization),
      });
      setStatus(`Organization created: ${response.organization.name}`);
      setNewOrganization({
        name: '',
        description: '',
        category: '',
        location: '',
        website: '',
      });
      await loadAdminData();
    } catch (err) {
      setError(err.message || 'Failed to create organization');
    }
  };

  const startEditOrganization = (organization) => {
    setEditingOrganizationId(organization.id);
    setEditOrganization({
      name: organization.name || '',
      description: organization.description || '',
      category: organization.category || '',
      location: organization.location || '',
      website: organization.website || '',
    });
    setError('');
    setStatus('');
  };

  const cancelEditOrganization = () => {
    setEditingOrganizationId('');
    setEditOrganization({
      name: '',
      description: '',
      category: '',
      location: '',
      website: '',
    });
  };

  const handleUpdateOrganization = async (organizationId) => {
    setError('');
    setStatus('');
    try {
      const response = await adminFetch(`/api/admin/organizations/${organizationId}`, {
        method: 'PATCH',
        body: JSON.stringify(editOrganization),
      });
      setStatus(`Organization updated: ${response.organization.name}`);
      cancelEditOrganization();
      await loadAdminData();
    } catch (err) {
      setError(err.message || 'Failed to update organization');
    }
  };

  const handleDeleteOrganization = async (organization) => {
    const confirmed = window.confirm(`Delete organization ${organization.name}? This only works if it has no members, accounts, campaigns, or subscriptions.`);
    if (!confirmed) return;

    setError('');
    setStatus('');
    try {
      await adminFetch(`/api/admin/organizations/${organization.id}`, {
        method: 'DELETE',
      });
      setStatus(`Organization deleted: ${organization.name}`);
      if (editingOrganizationId === organization.id) {
        cancelEditOrganization();
      }
      await loadAdminData();
    } catch (err) {
      setError(err.message || 'Failed to delete organization');
    }
  };

  const filteredUsers = users.filter((user) => {
    const query = userSearch.trim().toLowerCase();
    if (!query) return true;
    const membershipText = (user.memberships || [])
      .map((membership) => `${membership.organization.name} ${membership.role}`)
      .join(' ')
      .toLowerCase();
    return user.email.toLowerCase().includes(query) || membershipText.includes(query);
  });

  return (
    <div style={pageStyle}>
      <div style={{ maxWidth: 1280, margin: '0 auto', display: 'grid', gap: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
          <div>
            <div style={{ fontSize: 12, fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#64748b' }}>Admin Panel</div>
            <h1 style={{ margin: '6px 0 8px', fontSize: 36 }}>Users, access, reports</h1>
            <p style={{ margin: 0, color: '#475569' }}>Create accounts, update organization roles, and review report records from one page.</p>
          </div>
          <Link href="/dashboard" style={{ color: '#2563eb', textDecoration: 'none', fontWeight: 700 }}>Back to dashboard</Link>
        </div>

        <div style={{ ...cardStyle, display: 'grid', gap: 14 }}>
          <h2 style={{ margin: 0 }}>Admin Access</h2>
          <form onSubmit={handleSaveKey} style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <input
              type="password"
              value={adminKey}
              onChange={(event) => setAdminKeyState(event.target.value)}
              placeholder="Enter ADMIN_KEY"
              style={{ ...inputStyle, maxWidth: 360 }}
            />
            <button type="submit" style={{ ...buttonStyle, background: '#0f172a', color: '#ffffff' }}>Save Key</button>
            <button type="button" style={{ ...buttonStyle, background: '#dbeafe', color: '#1d4ed8' }} onClick={loadAdminData}>Load Admin Data</button>
          </form>
          {status && <div style={{ padding: '12px 14px', borderRadius: 10, background: '#dcfce7', color: '#166534' }}>{status}</div>}
          {error && <div style={{ padding: '12px 14px', borderRadius: 10, background: '#fee2e2', color: '#991b1b' }}>{error}</div>}
        </div>

        {overview && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16 }}>
            {[
              ['Users', overview.users],
              ['Organizations', overview.organizations],
              ['Memberships', overview.memberships],
              ['Reports', overview.reports],
              ['Social Accounts', overview.socialAccounts],
            ].map(([label, value]) => (
              <div key={label} style={cardStyle}>
                <div style={{ color: '#64748b', fontSize: 13 }}>{label}</div>
                <div style={{ marginTop: 6, fontSize: 28, fontWeight: 800 }}>{value}</div>
              </div>
            ))}
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.1fr) minmax(0, 1.4fr)', gap: 24 }}>
          <div style={{ ...cardStyle, display: 'grid', gap: 16, alignContent: 'start' }}>
            <h2 style={{ margin: 0 }}>Create User</h2>
            <form onSubmit={handleCreateUser} style={{ display: 'grid', gap: 12 }}>
              <input type="email" placeholder="user@example.com" value={newUser.email} onChange={(event) => setNewUser((current) => ({ ...current, email: event.target.value }))} style={inputStyle} required />
              <input type="text" placeholder="Temporary password" value={newUser.password} onChange={(event) => setNewUser((current) => ({ ...current, password: event.target.value }))} style={inputStyle} minLength={6} required />
              <select value={newUser.role} onChange={(event) => setNewUser((current) => ({ ...current, role: event.target.value }))} style={inputStyle}>
                <option value="member">member</option>
                <option value="admin">admin</option>
                <option value="owner">owner</option>
                <option value="viewer">viewer</option>
                <option value="editor">editor</option>
              </select>
              <select value={newUser.organizationId} onChange={(event) => setNewUser((current) => ({ ...current, organizationId: event.target.value }))} style={inputStyle}>
                <option value="">Create a new organization</option>
                {organizations.map((organization) => (
                  <option key={organization.id} value={organization.id}>
                    {organization.name}
                  </option>
                ))}
              </select>
              {!newUser.organizationId && (
                <input type="text" placeholder="New organization name (optional)" value={newUser.organizationName} onChange={(event) => setNewUser((current) => ({ ...current, organizationName: event.target.value }))} style={inputStyle} />
              )}
              <button type="submit" style={{ ...buttonStyle, background: '#2563eb', color: '#ffffff' }}>Add User</button>
            </form>
          </div>

          <div style={{ ...cardStyle, display: 'grid', gap: 16 }}>
            <h2 style={{ margin: 0 }}>Users and Rights</h2>
            <input
              type="text"
              placeholder="Search by email, organization, or role"
              value={userSearch}
              onChange={(event) => setUserSearch(event.target.value)}
              style={inputStyle}
            />
            <div style={{ display: 'grid', gap: 12 }}>
              {filteredUsers.map((user) => (
                <div key={user.id} style={{ border: '1px solid #e2e8f0', borderRadius: 12, padding: 14 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
                    <div>
                      <div style={{ fontWeight: 700 }}>{user.email}</div>
                      <div style={{ fontSize: 12, color: '#64748b' }}>Created {new Date(user.createdAt).toLocaleString()}</div>
                    </div>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                      <div style={{ fontSize: 12, color: '#64748b' }}>Memberships: {user.memberships.length}</div>
                      <button
                        type="button"
                        onClick={() => startEditUser(user)}
                        style={{ ...buttonStyle, background: '#e2e8f0', color: '#0f172a', padding: '8px 12px' }}
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteUser(user)}
                        disabled={currentUser?.id === user.id}
                        style={{ ...buttonStyle, background: currentUser?.id === user.id ? '#e2e8f0' : '#fee2e2', color: currentUser?.id === user.id ? '#94a3b8' : '#991b1b', padding: '8px 12px', cursor: currentUser?.id === user.id ? 'not-allowed' : 'pointer' }}
                        title={currentUser?.id === user.id ? 'You cannot delete your own account' : 'Delete user'}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                  {editingUserId === user.id && (
                    <div style={{ display: 'grid', gap: 10, marginTop: 12, background: '#f8fafc', borderRadius: 10, padding: 12 }}>
                      <input
                        type="email"
                        value={editUser.email}
                        onChange={(event) => setEditUser((current) => ({ ...current, email: event.target.value }))}
                        style={inputStyle}
                        placeholder="Update email"
                      />
                      <input
                        type="text"
                        value={editUser.password}
                        onChange={(event) => setEditUser((current) => ({ ...current, password: event.target.value }))}
                        style={inputStyle}
                        placeholder="New password (leave blank to keep current)"
                      />
                      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                        <button
                          type="button"
                          onClick={() => handleUpdateUser(user.id)}
                          style={{ ...buttonStyle, background: '#2563eb', color: '#ffffff' }}
                        >
                          Save Changes
                        </button>
                        <button
                          type="button"
                          onClick={cancelEditUser}
                          style={{ ...buttonStyle, background: '#e2e8f0', color: '#0f172a' }}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                  <div style={{ display: 'flex', gap: 8, marginTop: 12, flexWrap: 'wrap', alignItems: 'center' }}>
                    <input
                      type="text"
                      value={resetPasswords[user.id] || ''}
                      onChange={(event) => setResetPasswords((current) => ({ ...current, [user.id]: event.target.value }))}
                      style={{ ...inputStyle, maxWidth: 280 }}
                      placeholder="New password for reset"
                    />
                    <button
                      type="button"
                      onClick={() => handleResetPassword(user)}
                      style={{ ...buttonStyle, background: '#0f172a', color: '#ffffff' }}
                    >
                      Reset Password
                    </button>
                  </div>
                  <div style={{ display: 'grid', gap: 10, marginTop: 12 }}>
                    {user.memberships.map((membership) => (
                      <div key={membership.id} style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'center', flexWrap: 'wrap', background: '#f8fafc', borderRadius: 10, padding: 12 }}>
                        <div>
                          <div style={{ fontWeight: 600 }}>{membership.organization.name}</div>
                          <div style={{ fontSize: 12, color: '#64748b' }}>Role: {membership.role}</div>
                        </div>
                        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                          <select value={membership.role} onChange={(event) => handleRoleChange(membership.id, event.target.value)} style={{ ...inputStyle, width: 160 }}>
                            <option value="member">member</option>
                            <option value="admin">admin</option>
                            <option value="owner">owner</option>
                            <option value="viewer">viewer</option>
                            <option value="editor">editor</option>
                          </select>
                          <button
                            type="button"
                            onClick={() => handleDeleteMembership(membership)}
                            style={{ ...buttonStyle, background: '#fee2e2', color: '#991b1b' }}
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              {!filteredUsers.length && <div style={{ color: '#64748b' }}>No matching users found.</div>}
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', gap: 24 }}>
          <div style={{ ...cardStyle, display: 'grid', gap: 12 }}>
            <h2 style={{ margin: 0 }}>Organizations</h2>
            <form onSubmit={handleCreateOrganization} style={{ display: 'grid', gap: 10, marginBottom: 10, padding: 12, background: '#f8fafc', borderRadius: 12 }}>
              <input type="text" placeholder="Organization name" value={newOrganization.name} onChange={(event) => setNewOrganization((current) => ({ ...current, name: event.target.value }))} style={inputStyle} required />
              <input type="text" placeholder="Description" value={newOrganization.description} onChange={(event) => setNewOrganization((current) => ({ ...current, description: event.target.value }))} style={inputStyle} />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <input type="text" placeholder="Category" value={newOrganization.category} onChange={(event) => setNewOrganization((current) => ({ ...current, category: event.target.value }))} style={inputStyle} />
                <input type="text" placeholder="Location" value={newOrganization.location} onChange={(event) => setNewOrganization((current) => ({ ...current, location: event.target.value }))} style={inputStyle} />
              </div>
              <input type="text" placeholder="Website" value={newOrganization.website} onChange={(event) => setNewOrganization((current) => ({ ...current, website: event.target.value }))} style={inputStyle} />
              <button type="submit" style={{ ...buttonStyle, background: '#2563eb', color: '#ffffff' }}>Create Organization</button>
            </form>
            {organizations.map((organization) => (
              <div key={organization.id} style={{ border: '1px solid #e2e8f0', borderRadius: 12, padding: 14 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap' }}>
                  <div style={{ fontWeight: 700 }}>{organization.name}</div>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                    <div style={{ fontSize: 12, color: '#64748b' }}>
                      Members {organization._count.memberships} | Accounts {organization._count.socialAccounts} | Campaigns {organization._count.campaigns}
                    </div>
                    <button type="button" onClick={() => startEditOrganization(organization)} style={{ ...buttonStyle, background: '#e2e8f0', color: '#0f172a', padding: '8px 12px' }}>Edit</button>
                    <button type="button" onClick={() => handleDeleteOrganization(organization)} style={{ ...buttonStyle, background: '#fee2e2', color: '#991b1b', padding: '8px 12px' }}>Delete</button>
                  </div>
                </div>
                {editingOrganizationId === organization.id && (
                  <div style={{ display: 'grid', gap: 10, marginTop: 12, background: '#f8fafc', borderRadius: 10, padding: 12 }}>
                    <input type="text" value={editOrganization.name} onChange={(event) => setEditOrganization((current) => ({ ...current, name: event.target.value }))} style={inputStyle} placeholder="Organization name" />
                    <input type="text" value={editOrganization.description} onChange={(event) => setEditOrganization((current) => ({ ...current, description: event.target.value }))} style={inputStyle} placeholder="Description" />
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                      <input type="text" value={editOrganization.category} onChange={(event) => setEditOrganization((current) => ({ ...current, category: event.target.value }))} style={inputStyle} placeholder="Category" />
                      <input type="text" value={editOrganization.location} onChange={(event) => setEditOrganization((current) => ({ ...current, location: event.target.value }))} style={inputStyle} placeholder="Location" />
                    </div>
                    <input type="text" value={editOrganization.website} onChange={(event) => setEditOrganization((current) => ({ ...current, website: event.target.value }))} style={inputStyle} placeholder="Website" />
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                      <button type="button" onClick={() => handleUpdateOrganization(organization.id)} style={{ ...buttonStyle, background: '#2563eb', color: '#ffffff' }}>Save Organization</button>
                      <button type="button" onClick={cancelEditOrganization} style={{ ...buttonStyle, background: '#e2e8f0', color: '#0f172a' }}>Cancel</button>
                    </div>
                  </div>
                )}
                <div style={{ marginTop: 8, fontSize: 13, color: '#475569' }}>
                  {(organization.memberships || []).map((membership) => `${membership.user.email} (${membership.role})`).join(', ') || 'No members'}
                </div>
              </div>
            ))}
            {!organizations.length && <div style={{ color: '#64748b' }}>No organizations loaded.</div>}
          </div>

          <div style={{ ...cardStyle, display: 'grid', gap: 12 }}>
            <h2 style={{ margin: 0 }}>Reports</h2>
            {reports.map((report) => (
              <div key={report.id} style={{ border: '1px solid #e2e8f0', borderRadius: 12, padding: 14 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap' }}>
                  <div>
                    <div style={{ fontWeight: 700 }}>{report.type}</div>
                    <div style={{ fontSize: 12, color: '#64748b' }}>Generated {new Date(report.generatedAt).toLocaleString()}</div>
                  </div>
                  {report.fileUrl ? (
                    <a href={report.fileUrl} target="_blank" rel="noreferrer" style={{ color: '#2563eb', fontWeight: 700, textDecoration: 'none' }}>
                      Open file
                    </a>
                  ) : (
                    <span style={{ color: '#94a3b8', fontSize: 12 }}>No file URL</span>
                  )}
                </div>
                <div style={{ marginTop: 8, fontSize: 13, color: '#475569' }}>
                  Campaign: {report.campaign?.name || report.campaignId}
                </div>
                <div style={{ marginTop: 4, fontSize: 12, color: '#64748b' }}>
                  Organization: {report.campaign?.organization?.name || 'Unknown'}
                </div>
              </div>
            ))}
            {!reports.length && <div style={{ color: '#64748b' }}>No reports found in the database yet.</div>}
          </div>
        </div>
      </div>
    </div>
  );
}
