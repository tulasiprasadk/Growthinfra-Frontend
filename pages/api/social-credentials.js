// API route for securely saving social credentials and agreement (demo only, do not use in production without encryption!)
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  // In a real app, encrypt and store securely (e.g., in a DB or secret manager)
  // For demo, just log and return success
  const { credentials, accepted } = req.body;
  console.log('Received social credentials:', Object.keys(credentials));
  console.log('User accepted terms:', !!accepted);
  return res.status(200).json({ success: true });
}
