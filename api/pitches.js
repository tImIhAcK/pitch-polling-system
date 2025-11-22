import { kv } from '@vercel/kv';

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'GET') {
    try {
      // Initialize pitches if they don't exist
      let pitches = await kv.get('pitches');
      
      if (!pitches) {
        pitches = [
          { id: 1, title: "AI-Powered Meal Planning App", description: "Personalized meal plans based on dietary preferences and budget", votes: 0 },
          { id: 2, title: "Sustainable Fashion Marketplace", description: "Connect eco-conscious consumers with ethical fashion brands", votes: 0 },
          { id: 3, title: "Remote Team Collaboration Tool", description: "All-in-one platform for async communication and project management", votes: 0 },
          { id: 4, title: "Local Service Finder", description: "Discover and book trusted local service providers in your area", votes: 0 }
        ];
        await kv.set('pitches', pitches);
      }

      return res.status(200).json({ pitches });
    } catch (error) {
      console.error('Error fetching pitches:', error);
      return res.status(500).json({ error: 'Failed to fetch pitches' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}