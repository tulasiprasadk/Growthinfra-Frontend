import { getPool } from '../../../../lib/db';

export default async function handler(req, res) {
  if (req.method !== 'DELETE') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { id } = req.query;
  if (!id) {
    return res.status(400).json({ error: 'Missing account id' });
  }

  try {
    const pool = getPool();
    const result = await pool.query('DELETE FROM "SocialAccount" WHERE id = $1', [String(id)]);
    return res.status(200).json({ ok: true, deleted: result.rowCount || 0 });
  } catch (error) {
    return res.status(500).json({ error: `Failed to delete account: ${String(error.message || error)}` });
  }
}
