-- Add user approval status
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS is_approved BOOLEAN DEFAULT false;

-- Add admin key verification status (stored in JWT/session, but we'll track it)
-- Note: This will be handled in the JWT token, but we add a column for tracking
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS admin_key_verified BOOLEAN DEFAULT false;

-- Update existing users to be approved (so current users don't get blocked)
UPDATE users SET is_approved = true WHERE is_approved IS NULL OR is_approved = false;

-- Create index for approval status
CREATE INDEX IF NOT EXISTS idx_users_is_approved ON users(is_approved);

