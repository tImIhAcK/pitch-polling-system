-- Pitches table
CREATE TABLE IF NOT EXISTS pitches (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  votes INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Voters table (to track who voted)
CREATE TABLE IF NOT EXISTS voters (
  id SERIAL PRIMARY KEY,
  voter_id VARCHAR(255) UNIQUE NOT NULL,
  pitch_id INTEGER REFERENCES pitches(id),
  voted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert initial pitches
INSERT INTO pitches (title, description) VALUES
('AI-Powered Meal Planning App', 'Personalized meal plans based on dietary preferences and budget'),
('Sustainable Fashion Marketplace', 'Connect eco-conscious consumers with ethical fashion brands'),
('Remote Team Collaboration Tool', 'All-in-one platform for async communication and project management'),
('Local Service Finder', 'Discover and book trusted local service providers in your area')
ON CONFLICT DO NOTHING;