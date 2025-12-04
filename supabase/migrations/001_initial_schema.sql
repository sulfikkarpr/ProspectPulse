-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create enum types
CREATE TYPE user_role AS ENUM ('admin', 'mentor', 'member');
CREATE TYPE prospect_status AS ENUM ('new', 'call_done', 'pre_talk_scheduled', 'follow_up', 'closed', 'not_interested');
CREATE TYPE pre_talk_status AS ENUM ('scheduled', 'completed', 'canceled');

-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    google_id VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    avatar_url TEXT,
    role user_role NOT NULL DEFAULT 'member',
    refresh_token TEXT, -- Encrypted Google OAuth refresh token
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Prospects table
CREATE TABLE prospects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    email VARCHAR(255),
    age INTEGER,
    city VARCHAR(255),
    profession VARCHAR(255),
    source VARCHAR(100) NOT NULL, -- referral, cold, warm, etc.
    status prospect_status NOT NULL DEFAULT 'new',
    assigned_mentor_id UUID REFERENCES users(id) ON DELETE SET NULL,
    created_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Pre-talks table
CREATE TABLE pre_talks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    prospect_id UUID NOT NULL REFERENCES prospects(id) ON DELETE CASCADE,
    mentor_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    scheduled_at TIMESTAMPTZ NOT NULL,
    calendar_event_id VARCHAR(255),
    meet_link TEXT,
    status pre_talk_status NOT NULL DEFAULT 'scheduled',
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Activity logs table
CREATE TABLE activity_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    prospect_id UUID REFERENCES prospects(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL, -- prospect_created, pre_talk_scheduled, etc.
    meta JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Sheets sync status table
CREATE TABLE sheets_sync_status (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sheet_name VARCHAR(100) NOT NULL UNIQUE, -- 'prospects', 'pretalks', 'activity_logs'
    last_synced_at TIMESTAMPTZ,
    last_sync_row_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX idx_prospects_created_by ON prospects(created_by);
CREATE INDEX idx_prospects_assigned_mentor ON prospects(assigned_mentor_id);
CREATE INDEX idx_prospects_status ON prospects(status);
CREATE INDEX idx_prospects_created_at ON prospects(created_at);
CREATE INDEX idx_pre_talks_prospect_id ON pre_talks(prospect_id);
CREATE INDEX idx_pre_talks_mentor_id ON pre_talks(mentor_id);
CREATE INDEX idx_pre_talks_scheduled_at ON pre_talks(scheduled_at);
CREATE INDEX idx_pre_talks_status ON pre_talks(status);
CREATE INDEX idx_activity_logs_user_id ON activity_logs(user_id);
CREATE INDEX idx_activity_logs_prospect_id ON activity_logs(prospect_id);
CREATE INDEX idx_activity_logs_created_at ON activity_logs(created_at);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_prospects_updated_at BEFORE UPDATE ON prospects
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_pre_talks_updated_at BEFORE UPDATE ON pre_talks
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sheets_sync_status_updated_at BEFORE UPDATE ON sheets_sync_status
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert initial sync status records
INSERT INTO sheets_sync_status (sheet_name) VALUES
    ('prospects'),
    ('pretalks'),
    ('activity_logs');

