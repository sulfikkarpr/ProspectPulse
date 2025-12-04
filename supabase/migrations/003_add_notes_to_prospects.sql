-- Add notes column to prospects table
ALTER TABLE prospects 
ADD COLUMN IF NOT EXISTS notes TEXT;

-- Add index for better query performance if needed
-- CREATE INDEX IF NOT EXISTS idx_prospects_notes ON prospects USING gin(to_tsvector('english', notes));

