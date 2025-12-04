-- Optional: Seed an admin user
-- Note: This requires a valid Google ID. Update the values before running.
-- You can also create admin users through the OAuth flow and manually update their role.

-- Example (commented out - uncomment and update with real values):
-- INSERT INTO users (google_id, name, email, role) VALUES
--     ('your-google-id-here', 'Admin User', 'admin@example.com', 'admin')
-- ON CONFLICT (email) DO UPDATE SET role = 'admin';

