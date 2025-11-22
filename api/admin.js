import { kv } from '@vercel/kv';

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123'; // Set this in Vercel env vars

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Check admin password
  const authHeader = req.headers.authorization;
  if (!authHeader || authHeader !== `Bearer ${ADMIN_PASSWORD}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (req.method === 'GET') {
    try {
      const pitches = await kv.get('pitches') || [];
      const voteLog = await kv.get('vote_log') || [];
      
      const totalVotes = pitches.reduce((sum, p) => sum + p.votes, 0);
      const uniqueVoters = voteLog.length;

      return res.status(200).json({
        pitches,
        voteLog,
        stats: {
          totalVotes,
          uniqueVoters
        }
      });
    } catch (error) {
      console.error('Error fetching admin data:', error);
      return res.status(500).json({ error: 'Failed to fetch data' });
    }
  }

  if (req.method === 'POST') {
    const { action } = req.body;

    if (action === 'reset') {
      try {
        // Reset all votes
        const pitches = await kv.get('pitches');
        const resetPitches = pitches.map(p => ({ ...p, votes: 0 }));
        
        await kv.set('pitches', resetPitches);
        await kv.set('vote_log', []);
        
        // Delete all voter records
        const keys = await kv.keys('voter:*');
        for (const key of keys) {
          await kv.del(key);
        }

        return res.status(200).json({ success: true, message: 'All votes reset' });
      } catch (error) {
        console.error('Error resetting votes:', error);
        return res.status(500).json({ error: 'Failed to reset votes' });
      }
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}