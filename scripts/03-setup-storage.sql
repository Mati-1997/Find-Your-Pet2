-- Create storage buckets
INSERT INTO storage.buckets (id, name, public) VALUES 
  ('pet-images', 'pet-images', true),
  ('ai-recognition-images', 'ai-recognition-images', true),
  ('user-avatars', 'user-avatars', true);

-- Storage policies for pet images
CREATE POLICY "Users can upload pet images" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'pet-images' AND 
    auth.role() = 'authenticated'
  );

CREATE POLICY "Users can view pet images" ON storage.objects
  FOR SELECT USING (bucket_id = 'pet-images');

CREATE POLICY "Users can update own pet images" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'pet-images' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete own pet images" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'pet-images' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Storage policies for AI recognition images
CREATE POLICY "Users can upload AI recognition images" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'ai-recognition-images' AND 
    auth.role() = 'authenticated'
  );

CREATE POLICY "Users can view AI recognition images" ON storage.objects
  FOR SELECT USING (bucket_id = 'ai-recognition-images');

CREATE POLICY "Users can manage own AI recognition images" ON storage.objects
  FOR ALL USING (
    bucket_id = 'ai-recognition-images' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Storage policies for user avatars
CREATE POLICY "Users can upload own avatar" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'user-avatars' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Anyone can view avatars" ON storage.objects
  FOR SELECT USING (bucket_id = 'user-avatars');

CREATE POLICY "Users can update own avatar" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'user-avatars' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete own avatar" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'user-avatars' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );
