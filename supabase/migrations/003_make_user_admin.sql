-- Quick script to make yourself an admin
-- Replace 'sulfidrupal@gmail.com' with your actual email

-- Make yourself admin
UPDATE users 
SET role = 'admin', updated_at = NOW()
WHERE email = 'sulfidrupal@gmail.com';

-- Verify the update
SELECT id, name, email, role, created_at 
FROM users 
WHERE email = 'sulfidrupal@gmail.com';

-- See all users and their roles
SELECT id, name, email, role, created_at 
FROM users 
ORDER BY role, name;

