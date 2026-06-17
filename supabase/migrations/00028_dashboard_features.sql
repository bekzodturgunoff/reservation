-- Dashboard features: columns, tables, RLS

-- Venues table additions
ALTER TABLE venues ADD COLUMN IF NOT EXISTS district text;
ALTER TABLE venues ADD COLUMN IF NOT EXISTS approved_at timestamptz;
ALTER TABLE venues ADD COLUMN IF NOT EXISTS approved_by uuid REFERENCES profiles(id);
ALTER TABLE venues ADD COLUMN IF NOT EXISTS rejection_reason text;
ALTER TABLE venues ADD COLUMN IF NOT EXISTS rejected_at timestamptz;
ALTER TABLE venues ADD COLUMN IF NOT EXISTS rejected_by uuid REFERENCES profiles(id);

-- Bookings table additions
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS cancellation_reason text;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS cancelled_at timestamptz;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS confirmed_at timestamptz;

-- Reviews table additions
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS owner_response text;
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS owner_response_at timestamptz;

-- Profiles table additions
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS notification_preferences jsonb DEFAULT '{"new_booking_email":true,"new_review_email":true,"weekly_report_email":false}'::jsonb;

-- Platform settings table
CREATE TABLE IF NOT EXISTS platform_settings (
  key text PRIMARY KEY,
  value text NOT NULL,
  updated_at timestamptz DEFAULT now(),
  updated_by uuid REFERENCES profiles(id)
);
ALTER TABLE platform_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "admin_manage_settings" ON platform_settings FOR ALL
  USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'admin')
  WITH CHECK ((SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');
CREATE POLICY "anyone_read_settings" ON platform_settings FOR SELECT USING (true);

INSERT INTO platform_settings (key, value) VALUES
  ('commission_rate', '8'),
  ('min_photos', '1'),
  ('min_description_chars', '50')
ON CONFLICT (key) DO NOTHING;

-- Blocked dates table
CREATE TABLE IF NOT EXISTS blocked_dates (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  venue_id uuid REFERENCES venues(id) ON DELETE CASCADE,
  date date NOT NULL,
  reason text,
  created_by uuid REFERENCES profiles(id),
  created_at timestamptz DEFAULT now(),
  UNIQUE(venue_id, date)
);
ALTER TABLE blocked_dates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "owners_manage_blocked_dates" ON blocked_dates FOR ALL
  USING (venue_id IN (SELECT id FROM venues WHERE owner_id = auth.uid()))
  WITH CHECK (venue_id IN (SELECT id FROM venues WHERE owner_id = auth.uid()));
CREATE POLICY "public_read_blocked_dates" ON blocked_dates FOR SELECT USING (true);

-- Storage bucket for venue images
INSERT INTO storage.buckets (id, name, public, avif_autodetection, file_size_limit, allowed_mime_types)
VALUES ('venue-images', 'venue-images', true, false, 5242880, '{image/jpeg,image/png,image/webp}')
ON CONFLICT (id) DO NOTHING;

-- Public read access on venue-images bucket
CREATE POLICY "public_read_venue_images" ON storage.objects FOR SELECT
  USING (bucket_id = 'venue-images');
CREATE POLICY "authenticated_upload_venue_images" ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'venue-images' AND auth.role() = 'authenticated');
