import { getDb } from '../lib/db.js';

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';

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

  const sql = getDb();

  if (req.method === 'GET') {
    try {
      // Get all pitches with votes
      const pitches = await sql`
        SELECT id, title, description, votes 
        FROM pitches 
        ORDER BY votes DESC
      `;

      // Get vote log
      const voteLog = await sql`
        SELECT v.voter_id, v.pitch_id, v.voted_at, p.title
        FROM voters v
        JOIN pitches p ON v.pitch_id = p.id
        ORDER BY v.voted_at DESC
      `;

      // Calculate stats
      const totalVotes = pitches.reduce((sum, p) => sum + p.votes, 0);
      const uniqueVoters = voteLog.length;

      return res.status(200).json({
        pitches,
        voteLog: voteLog.map(v => ({
          pitchId: v.pitch_id,
          pitchTitle: v.title,
          voterId: v.voter_id,
          timestamp: v.voted_at
        })),
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
        // Delete all votes
        await sql`DELETE FROM voters`;
        
        // Reset vote counts
        await sql`UPDATE pitches SET votes = 0`;

        return res.status(200).json({ success: true, message: 'All votes reset' });
      } catch (error) {
        console.error('Error resetting votes:', error);
        return res.status(500).json({ error: 'Failed to reset votes' });
      }
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}