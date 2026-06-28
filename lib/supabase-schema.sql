-- ============================================================
-- THE ARDHI — Full Database Schema
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─── PROFILES ────────────────────────────────────────────────
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  phone TEXT,
  national_id TEXT,
  role TEXT NOT NULL CHECK (role IN ('admin', 'landlord', 'tenant')),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── PROPERTIES ──────────────────────────────────────────────
CREATE TABLE properties (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  landlord_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('apartment','residential','commercial','hostel','mall','shop')),
  location TEXT NOT NULL,
  total_units INTEGER NOT NULL DEFAULT 1,
  occupied_units INTEGER NOT NULL DEFAULT 0,
  invite_code TEXT UNIQUE NOT NULL,
  has_surveillance BOOLEAN DEFAULT false,
  surveillance_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── UNITS ───────────────────────────────────────────────────
CREATE TABLE units (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  property_id UUID REFERENCES properties(id) ON DELETE CASCADE NOT NULL,
  unit_number TEXT NOT NULL,
  floor TEXT,
  rent_amount NUMERIC(12,2) NOT NULL,
  is_occupied BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── TENANCIES ───────────────────────────────────────────────
CREATE TABLE tenancies (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  tenant_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  unit_id UUID REFERENCES units(id) ON DELETE CASCADE NOT NULL,
  property_id UUID REFERENCES properties(id) ON DELETE CASCADE NOT NULL,
  start_date DATE NOT NULL DEFAULT CURRENT_DATE,
  end_date DATE,
  rent_amount NUMERIC(12,2) NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── PAYMENTS ────────────────────────────────────────────────
CREATE TABLE payments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  tenancy_id UUID REFERENCES tenancies(id) ON DELETE CASCADE NOT NULL,
  tenant_id UUID REFERENCES profiles(id) NOT NULL,
  property_id UUID REFERENCES properties(id) NOT NULL,
  amount NUMERIC(12,2) NOT NULL,
  payment_method TEXT NOT NULL CHECK (payment_method IN ('mtn_momo','airtel_money','bank_transfer')),
  phone_or_account TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','confirmed','failed')),
  month_year TEXT NOT NULL,
  reference TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── COMPLAINTS ──────────────────────────────────────────────
CREATE TABLE complaints (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  tenant_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  property_id UUID REFERENCES properties(id) ON DELETE CASCADE NOT NULL,
  unit_id UUID REFERENCES units(id) NOT NULL,
  description TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','in_progress','resolved')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── ALERTS ──────────────────────────────────────────────────
CREATE TABLE alerts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  sender_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  property_id UUID REFERENCES properties(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('security','notice','payment')),
  message TEXT NOT NULL,
  read_by UUID[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── INDEXES ─────────────────────────────────────────────────
CREATE INDEX idx_properties_landlord ON properties(landlord_id);
CREATE INDEX idx_properties_invite_code ON properties(invite_code);
CREATE INDEX idx_units_property ON units(property_id);
CREATE INDEX idx_tenancies_tenant ON tenancies(tenant_id);
CREATE INDEX idx_tenancies_property ON tenancies(property_id);
CREATE INDEX idx_payments_tenant ON payments(tenant_id);
CREATE INDEX idx_payments_property ON payments(property_id);
CREATE INDEX idx_alerts_property ON alerts(property_id);

-- ─── ROW LEVEL SECURITY ──────────────────────────────────────
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE units ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenancies ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE complaints ENABLE ROW LEVEL SECURITY;
ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;

-- Profiles: users see their own profile; admins see all
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Admins see all profiles" ON profiles FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Properties: landlords manage their own; tenants see their property; admins see all
CREATE POLICY "Landlords manage own properties" ON properties FOR ALL USING (landlord_id = auth.uid());
CREATE POLICY "Tenants see their property" ON properties FOR SELECT USING (
  EXISTS (SELECT 1 FROM tenancies WHERE tenant_id = auth.uid() AND property_id = properties.id AND is_active = true)
);
CREATE POLICY "Admins see all properties" ON properties FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Payments: tenants see their own; landlords see payments on their properties; admins see all
CREATE POLICY "Tenants see own payments" ON payments FOR SELECT USING (tenant_id = auth.uid());
CREATE POLICY "Tenants create payments" ON payments FOR INSERT WITH CHECK (tenant_id = auth.uid());
CREATE POLICY "Landlords see property payments" ON payments FOR SELECT USING (
  EXISTS (SELECT 1 FROM properties WHERE id = payments.property_id AND landlord_id = auth.uid())
);
CREATE POLICY "Admins see all payments" ON payments FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Complaints: tenants manage own; landlords see their property complaints
CREATE POLICY "Tenants manage own complaints" ON complaints FOR ALL USING (tenant_id = auth.uid());
CREATE POLICY "Landlords see property complaints" ON complaints FOR SELECT USING (
  EXISTS (SELECT 1 FROM properties WHERE id = complaints.property_id AND landlord_id = auth.uid())
);
CREATE POLICY "Landlords update complaint status" ON complaints FOR UPDATE USING (
  EXISTS (SELECT 1 FROM properties WHERE id = complaints.property_id AND landlord_id = auth.uid())
);

-- Alerts: any tenant in property can see; tenants + landlords can create
CREATE POLICY "Property members see alerts" ON alerts FOR SELECT USING (
  EXISTS (SELECT 1 FROM tenancies WHERE tenant_id = auth.uid() AND property_id = alerts.property_id AND is_active = true)
  OR EXISTS (SELECT 1 FROM properties WHERE id = alerts.property_id AND landlord_id = auth.uid())
);
CREATE POLICY "Anyone can create alerts" ON alerts FOR INSERT WITH CHECK (sender_id = auth.uid());

-- Trigger: auto-create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    COALESCE(NEW.raw_user_meta_data->>'role', 'tenant')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Trigger: auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER properties_updated_at BEFORE UPDATE ON properties FOR EACH ROW EXECUTE FUNCTION update_updated_at();
