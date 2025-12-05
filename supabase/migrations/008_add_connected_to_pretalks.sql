-- Add connected field to pre_talks table
-- This field is for listing mentors to connect in the pre-talk call

ALTER TABLE pre_talks 
ADD COLUMN IF NOT EXISTS connected TEXT;

-- Add comment
COMMENT ON COLUMN pre_talks.connected IS 'Mentors or contacts to connect in this pre-talk call';

