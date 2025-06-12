-- Create storage bucket for pet images if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('pet-images', 'pet-images', true)
ON CONFLICT (id) DO NOTHING;

-- Create storage bucket for user avatars if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('user-avatars', 'user-avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Set up RLS policies for pet images
CREATE POLICY "Pet images are publicly accessible" ON storage.objects
FOR SELECT USING (bucket_id = 'pet-images');

CREATE POLICY "Users can upload pet images" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'pet-images' AND auth.role() = 'authenticated');

CREATE POLICY "Users can update their pet images" ON storage.objects
FOR UPDATE USING (bucket_id = 'pet-images' AND auth.role() = 'authenticated');

CREATE POLICY "Users can delete their pet images" ON storage.objects
FOR DELETE USING (bucket_id = 'pet-images' AND auth.role() = 'authenticated');

-- Set up RLS policies for user avatars
CREATE POLICY "User avatars are publicly accessible" ON storage.objects
FOR SELECT USING (bucket_id = 'user-avatars');

CREATE POLICY "Users can upload their avatars" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'user-avatars' AND auth.role() = 'authenticated');

CREATE POLICY "Users can update their avatars" ON storage.objects
FOR UPDATE USING (bucket_id = 'user-avatars' AND auth.role() = 'authenticated');

CREATE POLICY "Users can delete their avatars" ON storage.objects
FOR DELETE USING (bucket_id = 'user-avatars' AND auth.role() = 'authenticated');
