-- Add assigned_to field to pre_talks table
-- This allows assigning a team member (pre-talk taker) in addition to the mentor

ALTER TABLE pre_talks 
ADD COLUMN IF NOT EXISTS assigned_to UUID REFERENCES users(id) ON DELETE SET NULL;

-- Create index for faster filtering
CREATE INDEX IF NOT EXISTS idx_pre_talks_assigned_to ON pre_talks(assigned_to);

-- Add comment
COMMENT ON COLUMN pre_talks.assigned_to IS 'Team member assigned to take/conduct the pre-talk session';

