-- Enable Row Level Security on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tracking_devices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.safe_zones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alert_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alert_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_recognitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lost_pet_reports ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can view own profile" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.users
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Pets policies
CREATE POLICY "Users can view own pets" ON public.pets
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own pets" ON public.pets
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own pets" ON public.pets
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own pets" ON public.pets
  FOR DELETE USING (auth.uid() = user_id);

-- Allow public read access for lost pets
CREATE POLICY "Public can view lost pets" ON public.pets
  FOR SELECT USING (is_lost = true);

-- Tracking devices policies
CREATE POLICY "Users can manage own pet devices" ON public.tracking_devices
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.pets 
      WHERE pets.id = tracking_devices.pet_id 
      AND pets.user_id = auth.uid()
    )
  );

-- Locations policies
CREATE POLICY "Users can view own pet locations" ON public.locations
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.pets 
      WHERE pets.id = locations.pet_id 
      AND pets.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own pet locations" ON public.locations
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.pets 
      WHERE pets.id = locations.pet_id 
      AND pets.user_id = auth.uid()
    )
  );

-- Safe zones policies
CREATE POLICY "Users can manage own pet safe zones" ON public.safe_zones
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.pets 
      WHERE pets.id = safe_zones.pet_id 
      AND pets.user_id = auth.uid()
    )
  );

-- Alert settings policies
CREATE POLICY "Users can manage own pet alert settings" ON public.alert_settings
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.pets 
      WHERE pets.id = alert_settings.pet_id 
      AND pets.user_id = auth.uid()
    )
  );

-- Alert history policies
CREATE POLICY "Users can view own pet alerts" ON public.alert_history
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.pets 
      WHERE pets.id = alert_history.pet_id 
      AND pets.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own pet alerts" ON public.alert_history
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.pets 
      WHERE pets.id = alert_history.pet_id 
      AND pets.user_id = auth.uid()
    )
  );

-- AI recognitions policies
CREATE POLICY "Users can manage own AI recognitions" ON public.ai_recognitions
  FOR ALL USING (auth.uid() = user_id);

-- Lost pet reports policies
CREATE POLICY "Users can view all active reports" ON public.lost_pet_reports
  FOR SELECT USING (is_active = true);

CREATE POLICY "Users can create reports" ON public.lost_pet_reports
  FOR INSERT WITH CHECK (auth.uid() = reporter_id);

CREATE POLICY "Pet owners can manage their pet reports" ON public.lost_pet_reports
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.pets 
      WHERE pets.id = lost_pet_reports.pet_id 
      AND pets.user_id = auth.uid()
    )
  );

CREATE POLICY "Reporters can update their own reports" ON public.lost_pet_reports
  FOR UPDATE USING (auth.uid() = reporter_id);
