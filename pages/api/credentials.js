// API route for securely saving credentials (demo only, do not use in production without encryption!)
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  const { openaiKey, socialToken } = req.body;
  // In a real app, encrypt and store securely (e.g., in a DB or secret manager)
  // For demo, just log and return success
  console.log('Received credentials:', {
    openaiKey: openaiKey ? '***' + openaiKey.slice(-4) : '',
    socialToken: socialToken ? '***' + socialToken.slice(-4) : '',
  });
  // Simulate save
  return res.status(200).json({ success: true });
}
