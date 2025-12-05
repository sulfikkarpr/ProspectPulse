-- Add referral tracking to prospects
-- This tracks who referred/brought in the prospect

ALTER TABLE prospects 
ADD COLUMN IF NOT EXISTS referred_by UUID REFERENCES users(id) ON DELETE SET NULL;

-- Create index for faster filtering
CREATE INDEX IF NOT EXISTS idx_prospects_referred_by ON prospects(referred_by);

-- Add comment
COMMENT ON COLUMN prospects.referred_by IS 'User who referred/brought in this prospect';

