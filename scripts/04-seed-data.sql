-- Insert sample data for testing (optional)
-- Note: This assumes you have a test user with a specific UUID
-- Replace with actual user UUIDs after user registration

-- Sample user (this will be created through Supabase Auth)
-- INSERT INTO public.users (id, email, full_name) VALUES 
--   ('550e8400-e29b-41d4-a716-446655440000', 'test@example.com', 'Usuario de Prueba');

-- Sample pets
-- INSERT INTO public.pets (id, user_id, name, breed, age, weight, color, description, is_lost) VALUES 
--   ('550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440000', 'Max', 'Golden Retriever', 3, 25.5, 'Dorado', 'Perro muy amigable y juguetón', true),
--   ('550e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440000', 'Luna', 'Border Collie', 2, 18.0, 'Negro y blanco', 'Muy inteligente y activa', false),
--   ('550e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440000', 'Rocky', 'Bulldog Francés', 4, 12.0, 'Atigrado', 'Tranquilo y cariñoso', false);

-- Sample tracking devices
-- INSERT INTO public.tracking_devices (pet_id, device_id, device_type, battery_level) VALUES 
--   ('550e8400-e29b-41d4-a716-446655440001', 'DEVICE001', 'collar', 85),
--   ('550e8400-e29b-41d4-a716-446655440002', 'DEVICE002', 'collar', 92),
--   ('550e8400-e29b-41d4-a716-446655440003', 'DEVICE003', 'collar', 78);

-- Sample locations for Max (the lost pet)
-- INSERT INTO public.locations (pet_id, latitude, longitude, altitude, speed, battery_level, is_moving, timestamp) VALUES 
--   ('550e8400-e29b-41d4-a716-446655440001', 19.4326, -99.1332, 2240, 0, 85, false, NOW() - INTERVAL '30 minutes'),
--   ('550e8400-e29b-41d4-a716-446655440001', 19.4346, -99.1352, 2245, 3.2, 90, true, NOW() - INTERVAL '2 hours'),
--   ('550e8400-e29b-41d4-a716-446655440001', 19.4366, -99.1372, 2250, 2.8, 95, true, NOW() - INTERVAL '5 hours');

-- Sample safe zones
-- INSERT INTO public.safe_zones (pet_id, name, center_latitude, center_longitude, radius) VALUES 
--   ('550e8400-e29b-41d4-a716-446655440001', 'Casa', 19.4326, -99.1332, 100),
--   ('550e8400-e29b-41d4-a716-446655440001', 'Parque', 19.4366, -99.1372, 200);

-- Sample alert settings
-- INSERT INTO public.alert_settings (pet_id, alert_type, threshold_value, severity) VALUES 
--   ('550e8400-e29b-41d4-a716-446655440001', 'battery_low', 20, 'high'),
--   ('550e8400-e29b-41d4-a716-446655440001', 'inactivity', 6, 'medium'),
--   ('550e8400-e29b-41d4-a716-446655440001', 'geofence', 0, 'high');

-- Sample alert history
-- INSERT INTO public.alert_history (pet_id, alert_type, title, description, severity, trigger_value, threshold_value) VALUES 
--   ('550e8400-e29b-41d4-a716-446655440001', 'battery_low', 'Batería baja', 'La batería del collar está por debajo del 20%', 'high', 15, 20),
--   ('550e8400-e29b-41d4-a716-446655440001', 'inactivity', 'Inactividad prolongada', 'Max ha estado inactivo por más de 6 horas', 'medium', 8, 6);

-- Sample lost pet report
-- INSERT INTO public.lost_pet_reports (pet_id, reporter_id, report_type, description, last_seen_latitude, last_seen_longitude, last_seen_at) VALUES 
--   ('550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440000', 'lost', 'Max se perdió en el parque cerca de casa', 19.4366, -99.1372, NOW() - INTERVAL '6 hours');
