import { kv } from '@vercel/kv';

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

      // Check if user has already voted
      const hasVoted = await kv.get(`voter:${voterId}`);
      if (hasVoted) {
        return res.status(403).json({ error: 'Already voted', votedPitchId: hasVoted });
      }

      // Get current pitches
      const pitches = await kv.get('pitches');
      
      // Update vote count
      const updatedPitches = pitches.map(pitch => 
        pitch.id === pitchId ? { ...pitch, votes: pitch.votes + 1 } : pitch
      );

      // Save updated pitches and voter record
      await kv.set('pitches', updatedPitches);
      await kv.set(`voter:${voterId}`, pitchId);

      // Log vote for admin
      const voteLog = await kv.get('vote_log') || [];
      voteLog.push({
        pitchId,
        voterId,
        timestamp: new Date().toISOString()
      });
      await kv.set('vote_log', voteLog);

      return res.status(200).json({ success: true, pitches: updatedPitches });
    } catch (error) {
      console.error('Error processing vote:', error);
      return res.status(500).json({ error: 'Failed to process vote' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}