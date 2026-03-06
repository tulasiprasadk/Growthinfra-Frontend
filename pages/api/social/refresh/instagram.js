export default function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  return res.status(200).json({ ok: true, count: 0, message: 'Instagram refresh not enabled in frontend-only mode yet.' });
}