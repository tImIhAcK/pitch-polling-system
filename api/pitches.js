import { getDb, initDb } from '../lib/db.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'GET') {
    try {
      const sql = getDb();
      
      // Initialize database if needed
      await initDb();

      // Get all pitches
      const pitches = await sql`
        SELECT id, title, description, votes 
        FROM pitches 
        ORDER BY id ASC
      `;

      return res.status(200).json({ pitches });
    } catch (error) {
      console.error('Error fetching pitches:', error);
      return res.status(500).json({ error: 'Failed to fetch pitches' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}