-- ============================================================================
-- Batch 7e: Promo Codes, Waitlist, Notifications, Site Settings
-- Execute this in Supabase SQL Editor
-- ============================================================================

-- 1. PROMO CODES
-- Venue owners can create discount codes for their venues
CREATE TABLE IF NOT EXISTS promo_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  venue_id UUID NOT NULL REFERENCES venues(id) ON DELETE CASCADE,
  code TEXT NOT NULL,
  discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
  discount_value INTEGER NOT NULL CHECK (discount_value > 0),
  max_uses INTEGER DEFAULT NULL,
  used_count INTEGER DEFAULT 0,
  min_booking_amount INTEGER DEFAULT NULL,
  max_discount_amount INTEGER DEFAULT NULL,
  starts_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ DEFAULT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(venue_id, code)
);

ALTER TABLE promo_codes ENABLE ROW LEVEL SECURITY;

-- Owners can manage their venue's promo codes
CREATE POLICY "promo_codes_owner_manage"
  ON promo_codes FOR ALL
  USING (
    venue_id IN (
      SELECT id FROM venues WHERE owner_id = auth.uid()
    )
  );

-- Anyone can read active promo codes (for validation at checkout)
CREATE POLICY "promo_codes_public_read_active"
  ON promo_codes FOR SELECT
  USING (is_active = true AND (expires_at IS NULL OR expires_at > NOW()));

-- Add promo_code_id to bookings
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS promo_code_id UUID REFERENCES promo_codes(id) ON DELETE SET NULL;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS discount_amount INTEGER DEFAULT 0;

-- Index for code lookups
CREATE INDEX IF NOT EXISTS idx_promo_codes_code ON promo_codes(code);
CREATE INDEX IF NOT EXISTS idx_promo_codes_venue ON promo_codes(venue_id);
CREATE INDEX IF NOT EXISTS idx_bookings_promo ON bookings(promo_code_id);


-- 2. WAITLIST
-- Users can join a waitlist when a venue/time is fully booked
CREATE TABLE IF NOT EXISTS waitlist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  venue_id UUID NOT NULL REFERENCES venues(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  booking_date DATE NOT NULL,
  time_slot TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'waiting' CHECK (status IN ('waiting', 'notified', 'cancelled', 'fulfilled')),
  notified_at TIMESTAMPTZ DEFAULT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(venue_id, user_id, booking_date, time_slot)
);

ALTER TABLE waitlist ENABLE ROW LEVEL SECURITY;

-- Users can manage their own waitlist entries
CREATE POLICY "waitlist_user_manage"
  ON waitlist FOR ALL
  USING (user_id = auth.uid());

-- Venue owners can view waitlist for their venues
CREATE POLICY "waitlist_owner_view"
  ON waitlist FOR SELECT
  USING (
    venue_id IN (
      SELECT id FROM venues WHERE owner_id = auth.uid()
    )
  );

CREATE INDEX IF NOT EXISTS idx_waitlist_venue_date ON waitlist(venue_id, booking_date);
CREATE INDEX IF NOT EXISTS idx_waitlist_user ON waitlist(user_id);
CREATE INDEX IF NOT EXISTS idx_waitlist_status ON waitlist(status);


-- 3. NOTIFICATIONS
-- System-wide notifications for users
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL DEFAULT 'info' CHECK (type IN ('booking', 'review', 'promo', 'system', 'info')),
  title TEXT NOT NULL,
  message TEXT,
  data JSONB DEFAULT NULL,
  link TEXT DEFAULT NULL,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Users can read/update their own notifications
CREATE POLICY "notifications_user_manage"
  ON notifications FOR ALL
  USING (user_id = auth.uid());

CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_unread ON notifications(user_id, is_read) WHERE is_read = false;


-- 4. SITE SETTINGS
-- Key-value store for admin-configurable platform settings
CREATE TABLE IF NOT EXISTS site_settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  description TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  updated_by UUID REFERENCES profiles(id) ON DELETE SET NULL
);

ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

-- Only admins can manage settings
CREATE POLICY "site_settings_admin_manage"
  ON site_settings FOR ALL
  USING (
    auth.uid() IN (
      SELECT id FROM profiles WHERE role = 'admin'
    )
  );

-- Anyone can read settings (public-safe values)
CREATE POLICY "site_settings_public_read"
  ON site_settings FOR SELECT
  USING (true);

-- Insert default settings
INSERT INTO site_settings (key, value, description) VALUES
  ('commission_rate', '0.08', 'Platform commission rate (0.00-1.00)'),
  ('min_booking_hours', '1', 'Minimum booking duration in hours'),
  ('max_booking_hours', '12', 'Maximum booking duration in hours'),
  ('min_notice_hours', '1', 'Minimum hours before booking'),
  ('allow_registration', 'true', 'Allow new user registration'),
  ('require_venue_approval', 'true', 'Require admin approval for new venues'),
  ('enable_promotions', 'false', 'Enable promo code system'),
  ('enable_reviews', 'true', 'Enable review system')
ON CONFLICT (key) DO NOTHING;


-- 5. FUNCTION: Auto-create notification on booking status change
CREATE OR REPLACE FUNCTION notify_booking_status_change()
RETURNS TRIGGER AS $$
DECLARE
  venue_name TEXT;
BEGIN
  SELECT name INTO venue_name FROM venues WHERE id = NEW.venue_id;

  IF NEW.status = 'confirmed' THEN
    INSERT INTO notifications (user_id, type, title, message, link)
    VALUES (
      NEW.user_id,
      'booking',
      'Bron tasdiqlandi',
      format('"%s" dagi broningiz tasdiqlandi', venue_name),
      '/bookings'
    );
  ELSIF NEW.status = 'cancelled' THEN
    INSERT INTO notifications (user_id, type, title, message, link)
    VALUES (
      NEW.user_id,
      'booking',
      'Bron bekor qilindi',
      format('"%s" dagi broningiz bekor qilindi', venue_name),
      '/bookings'
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS booking_notification_trigger ON bookings;
CREATE TRIGGER booking_notification_trigger
  AFTER UPDATE OF status ON bookings
  FOR EACH ROW
  WHEN (OLD.status IS DISTINCT FROM NEW.status)
  EXECUTE FUNCTION notify_booking_status_change();
