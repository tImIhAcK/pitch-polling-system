import { neon } from '@neondatabase/serverless';

let sql;

export function getDb() {
  if (!sql) {
    if (!process.env.POSTGRES_URL) {
      throw new Error('POSTGRES_URL environment variable is not set');
    }
    sql = neon(process.env.POSTGRES_URL);
  }
  return sql;
}

// Initialize database tables
export async function initDb() {
  const sql = getDb();
  
  // Create pitches table
  await sql`
    CREATE TABLE IF NOT EXISTS pitches (
      id SERIAL PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      description TEXT NOT NULL,
      votes INTEGER DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `;

  // Create voters table
  await sql`
    CREATE TABLE IF NOT EXISTS voters (
      id SERIAL PRIMARY KEY,
      voter_id VARCHAR(255) UNIQUE NOT NULL,
      pitch_id INTEGER REFERENCES pitches(id),
      voted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `;

  // Check if pitches exist
  const existing = await sql`SELECT COUNT(*) as count FROM pitches`;
  
  if (existing[0].count === '0') {
    // Insert initial pitches
    await sql`
      INSERT INTO pitches (title, description) VALUES
      ('AI-Powered Meal Planning App', 'Personalized meal plans based on dietary preferences and budget'),
      ('Sustainable Fashion Marketplace', 'Connect eco-conscious consumers with ethical fashion brands'),
      ('Remote Team Collaboration Tool', 'All-in-one platform for async communication and project management'),
      ('Local Service Finder', 'Discover and book trusted local service providers in your area')
    `;
  }
}