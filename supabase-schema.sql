-- Run this in your Supabase SQL editor

-- Memory Items
CREATE TABLE memory_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('prompt', 'skill', 'preference', 'workflow')),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  tags TEXT[],
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Conversations
CREATE TABLE conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  model TEXT NOT NULL DEFAULT 'claude',
  title TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Messages
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- User Settings
CREATE TABLE user_settings (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  default_model TEXT DEFAULT 'claude',
  memory_injection_mode TEXT DEFAULT 'auto' CHECK (memory_injection_mode IN ('auto', 'manual', 'off')),
  api_keys JSONB
);

-- Indexes
CREATE INDEX idx_memory_items_user_id ON memory_items(user_id);
CREATE INDEX idx_conversations_user_id ON conversations(user_id);
CREATE INDEX idx_messages_conversation_id ON messages(conversation_id);

-- Enable Row Level Security
ALTER TABLE memory_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "own_memory_items" ON memory_items
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "own_conversations" ON conversations
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "own_messages" ON messages
  FOR ALL USING (
    conversation_id IN (
      SELECT id FROM conversations WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "own_settings" ON user_settings
  FOR ALL USING (auth.uid() = user_id);

-- Auto-update updated_at on memory_items
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER memory_items_updated_at
  BEFORE UPDATE ON memory_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
