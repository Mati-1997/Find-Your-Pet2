-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- Create users table (extends Supabase auth.users)
CREATE TABLE public.users (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  phone TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create pets table
CREATE TABLE public.pets (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  breed TEXT,
  age INTEGER,
  weight DECIMAL(5,2),
  color TEXT,
  description TEXT,
  image_url TEXT,
  microchip_id TEXT UNIQUE,
  is_lost BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create tracking_devices table
CREATE TABLE public.tracking_devices (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  pet_id UUID REFERENCES public.pets(id) ON DELETE CASCADE NOT NULL,
  device_id TEXT UNIQUE NOT NULL,
  device_type TEXT NOT NULL DEFAULT 'collar',
  battery_level INTEGER DEFAULT 100,
  is_active BOOLEAN DEFAULT TRUE,
  last_ping TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create locations table with PostGIS support
CREATE TABLE public.locations (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  pet_id UUID REFERENCES public.pets(id) ON DELETE CASCADE NOT NULL,
  device_id UUID REFERENCES public.tracking_devices(id) ON DELETE CASCADE,
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  altitude DECIMAL(8, 2),
  speed DECIMAL(5, 2),
  accuracy DECIMAL(5, 2),
  battery_level INTEGER,
  is_moving BOOLEAN DEFAULT FALSE,
  location_point GEOGRAPHY(POINT, 4326),
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create safe_zones table
CREATE TABLE public.safe_zones (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  pet_id UUID REFERENCES public.pets(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  center_latitude DECIMAL(10, 8) NOT NULL,
  center_longitude DECIMAL(11, 8) NOT NULL,
  radius INTEGER NOT NULL, -- radius in meters
  is_active BOOLEAN DEFAULT TRUE,
  zone_polygon GEOGRAPHY(POLYGON, 4326),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create alert_settings table
CREATE TABLE public.alert_settings (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  pet_id UUID REFERENCES public.pets(id) ON DELETE CASCADE NOT NULL,
  alert_type TEXT NOT NULL CHECK (alert_type IN (
    'inactivity', 'excessive_movement', 'unusual_location', 
    'battery_low', 'geofence', 'unusual_time', 'speed_alert', 
    'no_movement', 'health_pattern'
  )),
  is_enabled BOOLEAN DEFAULT TRUE,
  threshold_value DECIMAL(10, 2),
  severity TEXT DEFAULT 'medium' CHECK (severity IN ('low', 'medium', 'high')),
  notify_push BOOLEAN DEFAULT TRUE,
  notify_email BOOLEAN DEFAULT FALSE,
  notify_sms BOOLEAN DEFAULT FALSE,
  time_window INTEGER, -- in minutes
  geofence_radius INTEGER, -- in meters
  time_restrictions JSONB, -- array of time ranges
  days_active TEXT[], -- array of days
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(pet_id, alert_type)
);

-- Create alert_history table
CREATE TABLE public.alert_history (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  pet_id UUID REFERENCES public.pets(id) ON DELETE CASCADE NOT NULL,
  alert_type TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high')),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'resolved', 'ignored')),
  trigger_value DECIMAL(10, 2),
  threshold_value DECIMAL(10, 2),
  location_latitude DECIMAL(10, 8),
  location_longitude DECIMAL(11, 8),
  related_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  resolved_at TIMESTAMP WITH TIME ZONE,
  resolved_by UUID REFERENCES public.users(id)
);

-- Create ai_recognitions table
CREATE TABLE public.ai_recognitions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  image_url TEXT NOT NULL,
  recognition_results JSONB,
  confidence_score DECIMAL(3, 2),
  matched_pet_id UUID REFERENCES public.pets(id),
  processing_status TEXT DEFAULT 'pending' CHECK (processing_status IN ('pending', 'processing', 'completed', 'failed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  processed_at TIMESTAMP WITH TIME ZONE
);

-- Create lost_pet_reports table
CREATE TABLE public.lost_pet_reports (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  pet_id UUID REFERENCES public.pets(id) ON DELETE CASCADE NOT NULL,
  reporter_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  report_type TEXT NOT NULL CHECK (report_type IN ('lost', 'found', 'sighting')),
  description TEXT,
  last_seen_latitude DECIMAL(10, 8),
  last_seen_longitude DECIMAL(11, 8),
  last_seen_at TIMESTAMP WITH TIME ZONE,
  contact_info JSONB,
  reward_amount DECIMAL(10, 2),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_pets_user_id ON public.pets(user_id);
CREATE INDEX idx_pets_is_lost ON public.pets(is_lost);
CREATE INDEX idx_locations_pet_id ON public.locations(pet_id);
CREATE INDEX idx_locations_timestamp ON public.locations(timestamp DESC);
CREATE INDEX idx_locations_point ON public.locations USING GIST(location_point);
CREATE INDEX idx_alert_history_pet_id ON public.alert_history(pet_id);
CREATE INDEX idx_alert_history_status ON public.alert_history(status);
CREATE INDEX idx_alert_history_created_at ON public.alert_history(created_at DESC);
CREATE INDEX idx_tracking_devices_pet_id ON public.tracking_devices(pet_id);
CREATE INDEX idx_safe_zones_pet_id ON public.safe_zones(pet_id);

-- Create function to update location_point from lat/lng
CREATE OR REPLACE FUNCTION update_location_point()
RETURNS TRIGGER AS $$
BEGIN
  NEW.location_point = ST_SetSRID(ST_MakePoint(NEW.longitude, NEW.latitude), 4326);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update location_point
CREATE TRIGGER trigger_update_location_point
  BEFORE INSERT OR UPDATE ON public.locations
  FOR EACH ROW
  EXECUTE FUNCTION update_location_point();

-- Create function to update safe zone polygon
CREATE OR REPLACE FUNCTION update_safe_zone_polygon()
RETURNS TRIGGER AS $$
BEGIN
  NEW.zone_polygon = ST_Buffer(
    ST_SetSRID(ST_MakePoint(NEW.center_longitude, NEW.center_latitude), 4326)::geography,
    NEW.radius
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for safe zone polygon
CREATE TRIGGER trigger_update_safe_zone_polygon
  BEFORE INSERT OR UPDATE ON public.safe_zones
  FOR EACH ROW
  EXECUTE FUNCTION update_safe_zone_polygon();

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER trigger_users_updated_at BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trigger_pets_updated_at BEFORE UPDATE ON public.pets FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trigger_tracking_devices_updated_at BEFORE UPDATE ON public.tracking_devices FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trigger_safe_zones_updated_at BEFORE UPDATE ON public.safe_zones FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trigger_alert_settings_updated_at BEFORE UPDATE ON public.alert_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trigger_lost_pet_reports_updated_at BEFORE UPDATE ON public.lost_pet_reports FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
