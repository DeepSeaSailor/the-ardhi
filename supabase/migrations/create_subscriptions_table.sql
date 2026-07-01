-- ─── SUBSCRIPTIONS TABLE ──────────────────────────────────────────────────
-- Run this in Supabase SQL Editor

CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  landlord_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL UNIQUE,
  plan TEXT NOT NULL DEFAULT 'monthly' CHECK (plan IN ('monthly', 'annual')),
  status TEXT NOT NULL DEFAULT 'trial' CHECK (status IN ('trial', 'pending', 'active', 'expired', 'cancelled')),
  amount INTEGER NOT NULL DEFAULT 55000,
  trial_ends_at TIMESTAMPTZ,
  start_date DATE,
  end_date DATE,
  payment_method TEXT,
  payment_reference TEXT,
  phone_or_account TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Auto-create a trial subscription when a new landlord profile is created
CREATE OR REPLACE FUNCTION handle_new_landlord_subscription()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.role = 'landlord' THEN
    INSERT INTO subscriptions (landlord_id, status, plan, amount, trial_ends_at)
    VALUES (NEW.id, 'trial', 'monthly', 55000, NOW() + INTERVAL '14 days')
    ON CONFLICT (landlord_id) DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_landlord_created ON profiles;
CREATE TRIGGER on_landlord_created
  AFTER INSERT ON profiles
  FOR EACH ROW EXECUTE FUNCTION handle_new_landlord_subscription();

-- Backfill trial subscriptions for existing landlords with no subscription yet
INSERT INTO subscriptions (landlord_id, status, plan, amount, trial_ends_at)
SELECT id, 'trial', 'monthly', 55000, NOW() + INTERVAL '14 days'
FROM profiles
WHERE role = 'landlord'
ON CONFLICT (landlord_id) DO NOTHING;

-- RLS: landlords can only see their own subscription
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Landlord sees own subscription" ON subscriptions
  FOR ALL USING (auth.uid() = landlord_id);
CREATE POLICY "Admin sees all subscriptions" ON subscriptions
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );
