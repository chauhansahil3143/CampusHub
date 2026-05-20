-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- USERS TABLE (Linked to auth.users)
CREATE TABLE public.users (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  full_name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  avatar_url TEXT,
  college_name TEXT,
  branch TEXT,
  semester INTEGER,
  bio TEXT,
  role TEXT DEFAULT 'junior' CHECK (role IN ('junior', 'senior', 'admin')),
  verified BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Handle automatic user profile creation on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name)
  VALUES (new.id, new.email, new.raw_user_meta_data->>'full_name');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- NOTES TABLE
CREATE TABLE public.notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  subject TEXT,
  semester INTEGER,
  branch TEXT,
  tags TEXT[],
  pdf_url TEXT NOT NULL,
  thumbnail_url TEXT,
  uploaded_by UUID REFERENCES public.users(id) ON DELETE CASCADE,
  downloads INTEGER DEFAULT 0,
  likes INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- BOOKS TABLE
CREATE TABLE public.books (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  author TEXT,
  category TEXT,
  description TEXT,
  pdf_url TEXT NOT NULL,
  uploaded_by UUID REFERENCES public.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- PYQs TABLE
CREATE TABLE public.pyqs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  subject TEXT NOT NULL,
  year INTEGER NOT NULL,
  semester INTEGER,
  branch TEXT,
  pdf_url TEXT NOT NULL,
  uploaded_by UUID REFERENCES public.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- STORAGE BUCKETS (Phase 4)
INSERT INTO storage.buckets (id, name, public) VALUES 
('notes', 'notes', true),
('books', 'books', true),
('avatars', 'avatars', true),
('thumbnails', 'thumbnails', true);

-- Basic Row Level Security (RLS)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.books ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pyqs ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Public profiles are viewable by everyone." ON public.users FOR SELECT USING (true);
CREATE POLICY "Users can insert their own profile." ON public.users FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile." ON public.users FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Notes are viewable by everyone." ON public.notes FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert notes." ON public.notes FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Users can update their own notes." ON public.notes FOR UPDATE USING (auth.uid() = uploaded_by);
CREATE POLICY "Users can delete their own notes." ON public.notes FOR DELETE USING (auth.uid() = uploaded_by);

-- Books Policies
CREATE POLICY "Books are viewable by everyone." ON public.books FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert books." ON public.books FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Users can update their own books." ON public.books FOR UPDATE USING (auth.uid() = uploaded_by);
CREATE POLICY "Users can delete their own books." ON public.books FOR DELETE USING (auth.uid() = uploaded_by);

-- PYQs Policies
CREATE POLICY "PYQs are viewable by everyone." ON public.pyqs FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert pyqs." ON public.pyqs FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Users can update their own pyqs." ON public.pyqs FOR UPDATE USING (auth.uid() = uploaded_by);
CREATE POLICY "Users can delete their own pyqs." ON public.pyqs FOR DELETE USING (auth.uid() = uploaded_by);

CREATE POLICY "Storage Notes Upload" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'notes');
CREATE POLICY "Storage Notes Select" ON storage.objects FOR SELECT TO public USING (bucket_id = 'notes');

CREATE POLICY "Storage Books Upload" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'books');
CREATE POLICY "Storage Books Select" ON storage.objects FOR SELECT TO public USING (bucket_id = 'books');

CREATE POLICY "Storage Avatars Upload" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'avatars');
CREATE POLICY "Storage Avatars Select" ON storage.objects FOR SELECT TO public USING (bucket_id = 'avatars');

-- CHAT SYSTEM
CREATE TABLE public.chat_rooms (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  room_name TEXT NOT NULL,
  created_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  room_id UUID REFERENCES public.chat_rooms(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Chat RLS
ALTER TABLE public.chat_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Rooms are viewable by everyone." ON public.chat_rooms FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create rooms." ON public.chat_rooms FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Creators can delete their own rooms." ON public.chat_rooms FOR DELETE USING (auth.uid() = created_by);
CREATE POLICY "Messages are viewable by everyone." ON public.messages FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert messages." ON public.messages FOR INSERT WITH CHECK (auth.uid() = sender_id);

-- BOOKMARKS SYSTEM
CREATE TABLE public.bookmarks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  note_id UUID REFERENCES public.notes(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, note_id)
);

ALTER TABLE public.bookmarks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own bookmarks." ON public.bookmarks FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own bookmarks." ON public.bookmarks FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own bookmarks." ON public.bookmarks FOR DELETE USING (auth.uid() = user_id);
