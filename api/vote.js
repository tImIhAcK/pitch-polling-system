import { getDb } from '../lib/db.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'POST') {
    try {
      const { pitchId, voterId } = req.body;

      if (!pitchId || !voterId) {
        return res.status(400).json({ error: 'Missing pitchId or voterId' });
      }

      const sql = getDb();

      // Check if user has already voted
      const existingVote = await sql`
        SELECT pitch_id FROM voters WHERE voter_id = ${voterId}
      `;

      if (existingVote.length > 0) {
        return res.status(403).json({ 
          error: 'Already voted', 
          votedPitchId: existingVote[0].pitch_id 
        });
      }

      // Start transaction: record vote and increment counter
      await sql`
        INSERT INTO voters (voter_id, pitch_id) 
        VALUES (${voterId}, ${pitchId})
      `;

      await sql`
        UPDATE pitches 
        SET votes = votes + 1 
        WHERE id = ${pitchId}
      `;

      // Get updated pitches
      const pitches = await sql`
        SELECT id, title, description, votes 
        FROM pitches 
        ORDER BY id ASC
      `;

      return res.status(200).json({ success: true, pitches });
    } catch (error) {
      console.error('Error processing vote:', error);
      return res.status(500).json({ error: 'Failed to process vote' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}