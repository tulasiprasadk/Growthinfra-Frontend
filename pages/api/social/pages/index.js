import { getPool } from '../../../../lib/db';

function derivePlatform(provider) {
  if (!provider) return 'unknown';
  const value = String(provider).toLowerCase();
  if (value.startsWith('facebook')) return 'facebook';
  if (value.startsWith('instagram')) return 'instagram';
  if (value.startsWith('linkedin')) return 'linkedin';
  if (value.startsWith('twitter')) return 'twitter';
  if (value.startsWith('reddit')) return 'reddit';
  return 'unknown';
}

function derivePageId(provider) {
  const value = String(provider || '');
  if (!value) return '';
  const idx = value.indexOf(':');
  return idx >= 0 ? value.slice(idx + 1) : value;
}

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const pool = getPool();
    const query = `
      SELECT
        sa.id,
        sa.provider,
        sa."accessToken",
        sa."refreshToken",
        sa."expiresAt",
        sa."lastError",
        sa."organizationId",
        o.name AS "organizationName"
      FROM "SocialAccount" sa
      LEFT JOIN "Organization" o ON o.id = sa."organizationId"
      ORDER BY sa.id DESC
    `;

    const { rows } = await pool.query(query);

    const data = rows.map((row) => {
      const platform = derivePlatform(row.provider);
      const pageId = derivePageId(row.provider);
      const invalidFacebook = platform === 'facebook' && String(row.provider || '').startsWith('facebook:');

      return {
        id: row.id,
        provider: row.provider,
        pageId,
        platform,
        accessToken: row.accessToken,
        refreshToken: row.refreshToken,
        expiresAt: row.expiresAt,
        lastError: row.lastError,
        organizationId: row.organizationId,
        organizationName: row.organizationName || 'Unassigned',
        isPostable: !invalidFacebook,
        postabilityReason: invalidFacebook ? 'Invalid Facebook Page ID. Reconnect Facebook to fetch real pages.' : null,
        label: pageId || row.provider,
      };
    });

    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({ error: `Failed to load social pages: ${String(error.message || error)}` });
  }
}
