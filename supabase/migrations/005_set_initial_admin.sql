-- Set initial admin user
-- This makes slfkkrsulfi@gmail.com an admin and approved

UPDATE users 
SET role = 'admin', is_approved = true, updated_at = NOW()
WHERE email = 'slfkkrsulfi@gmail.com';

-- If user doesn't exist yet, this will do nothing
-- User will be created as admin when they first sign up (first user logic)

-- Verify the update
SELECT id, name, email, role, is_approved, created_at 
FROM users 
WHERE email = 'slfkkrsulfi@gmail.com';

