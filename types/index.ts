export type UserRole = 'admin' | 'landlord' | 'tenant'

export type PropertyType = 'apartment' | 'residential' | 'commercial' | 'hostel' | 'mall' | 'shop'

export interface Profile {
  id: string
  email: string
  full_name: string
  phone: string
  role: UserRole
  national_id?: string
  created_at: string
}

export interface Property {
  id: string
  landlord_id: string
  name: string
  type: PropertyType
  location: string
  total_units: number
  occupied_units: number
  invite_code: string
  has_surveillance: boolean
  surveillance_url?: string
  created_at: string
  landlord?: Profile
}

export interface Unit {
  id: string
  property_id: string
  unit_number: string
  floor?: string
  rent_amount: number
  is_occupied: boolean
  created_at: string
}

export interface Tenancy {
  id: string
  tenant_id: string
  unit_id: string
  property_id: string
  start_date: string
  end_date?: string
  rent_amount: number
  is_active: boolean
  created_at: string
  tenant?: Profile
  unit?: Unit
  property?: Property
}

export interface Payment {
  id: string
  tenancy_id: string
  tenant_id: string
  property_id: string
  amount: number
  payment_method: 'mtn_momo' | 'airtel_money' | 'bank_transfer'
  phone_or_account: string
  status: 'pending' | 'confirmed' | 'failed'
  month_year: string
  reference?: string
  created_at: string
  tenancy?: Tenancy
  tenant?: Profile
  property?: Property
}

export interface Complaint {
  id: string
  tenant_id: string
  property_id: string
  unit_id: string
  description: string
  status: 'pending' | 'in_progress' | 'resolved'
  created_at: string
  tenant?: Profile
}

export interface Alert {
  id: string
  sender_id: string
  property_id: string
  type: 'security' | 'notice' | 'payment'
  message: string
  is_read_by?: string[]
  created_at: string
  sender?: Profile
  property?: Property
}
