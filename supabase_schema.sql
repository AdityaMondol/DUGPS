-- Supabase Setup SQL for DUGPS
-- This script creates the necessary tables, storage buckets, and RLS policies.

-- 1. PROFILES TABLE
-- This table stores additional user information linked to Supabase Auth users.
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  first_name TEXT,
  last_name TEXT,
  role TEXT DEFAULT 'student' CHECK (role IN ('student', 'teacher', 'guardian', 'admin')),
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles Policies
CREATE POLICY "Public profiles are viewable by everyone" 
  ON public.profiles FOR SELECT USING (true);

CREATE POLICY "Users can update their own profile" 
  ON public.profiles FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" 
  ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- 2. TEACHERS TABLE
CREATE TABLE IF NOT EXISTS public.teachers (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  designation TEXT NOT NULL,
  qualification TEXT,
  phone TEXT,
  email TEXT,
  image_url TEXT,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.teachers ENABLE ROW LEVEL SECURITY;

-- Teachers Policies
CREATE POLICY "Teachers are viewable by everyone" 
  ON public.teachers FOR SELECT USING (true);

CREATE POLICY "Only admins/teachers can modify teacher data" 
  ON public.teachers FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() AND (profiles.role = 'admin' OR profiles.role = 'teacher')
    )
  );

-- 3. NOTICES TABLE
CREATE TABLE IF NOT EXISTS public.notices (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT DEFAULT 'announcement',
  priority TEXT DEFAULT 'medium',
  tags TEXT[],
  expiry_date TIMESTAMP WITH TIME ZONE,
  author_id UUID REFERENCES public.profiles(id),
  author_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.notices ENABLE ROW LEVEL SECURITY;

-- Notices Policies
CREATE POLICY "Notices are viewable by everyone" 
  ON public.notices FOR SELECT USING (true);

CREATE POLICY "Only teachers/admins can create/modify notices" 
  ON public.notices FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() AND (profiles.role = 'admin' OR profiles.role = 'teacher')
    )
  );

-- 4. FEEDBACKS TABLE
CREATE TABLE IF NOT EXISTS public.feedbacks (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  content TEXT NOT NULL,
  author_id UUID REFERENCES public.profiles(id),
  author_email TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.feedbacks ENABLE ROW LEVEL SECURITY;

-- Feedbacks Policies (Allow anyone to insert, only admins to view)
CREATE POLICY "Anyone can insert feedback" 
  ON public.feedbacks FOR INSERT WITH CHECK (true);

CREATE POLICY "Only admins/teachers can view feedback" 
  ON public.feedbacks FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() AND (profiles.role = 'admin' OR profiles.role = 'teacher')
    )
  );

-- 5. MEDIA TABLE
CREATE TABLE IF NOT EXISTS public.media (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT,
  description TEXT,
  file_url TEXT NOT NULL,
  file_type TEXT NOT NULL, -- image, video, document
  file_size INTEGER,
  uploaded_by UUID REFERENCES public.profiles(id),
  author_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.media ENABLE ROW LEVEL SECURITY;

-- Media Policies
CREATE POLICY "Media is viewable by everyone" 
  ON public.media FOR SELECT USING (true);

CREATE POLICY "Only teachers/admins can upload/delete media" 
  ON public.media FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() AND (profiles.role = 'admin' OR profiles.role = 'teacher')
    )
  );

-- 6. STORAGE BUCKETS
-- Note: Buckets must be created via the Supabase UI/API normally, 
-- but you can record the intended policies here.
-- Buckets: 'media', 'avatars'

-- 7. FUNCTION FOR NEW USER PROFILE (Trigger)
-- This automatically creates a profile entry when a new user signs up.
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, first_name, last_name, role)
  VALUES (
    new.id, 
    new.email, 
    new.raw_user_meta_data->>'first_name', 
    new.raw_user_meta_data->>'last_name', 
    COALESCE(new.raw_user_meta_data->>'role', 'student')
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
