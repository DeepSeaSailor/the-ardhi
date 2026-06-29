import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-server'
import * as XLSX from 'xlsx'

export async function GET(req: NextRequest) {
  try {
    const landlord_id = req.headers.get('x-user-id')
    const { searchParams } = req.nextUrl
    const property_id = searchParams.get('property_id')
    const date_from = searchParams.get('date_from')
    const date_to = searchParams.get('date_to')

    if (!landlord_id || !property_id) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 })
    }

    const supabase = getSupabaseAdmin()

    // Fetch property
    const { data: property } = await supabase
      .from('properties')
      .select('*')
      .eq('id', property_id)
      .eq('landlord_id', landlord_id)
      .single()

    if (!property) return NextResponse.json({ error: 'Property not found' }, { status: 404 })

    // Fetch landlord profile
    const { data: landlord } = await supabase
      .from('profiles')
      .select('full_name, email, phone')
      .eq('id', landlord_id)
      .single()

    // Fetch units
    const { data: units } = await supabase
      .from('units')
      .select('*')
      .eq('property_id', property_id)
      .order('unit_number')

    // Fetch active tenancies with tenant profiles
    const { data: tenancies } = await supabase
      .from('tenancies')
      .select(`
        *,
        tenant:profiles!tenancies_tenant_id_fkey(full_name, email, phone, national_id),
        unit:units(unit_number, rent_amount)
      `)
      .eq('property_id', property_id)
      .eq('is_active', true)

    // Fetch payments within date range
    let paymentsQuery = supabase
      .from('payments')
      .select(`
        *,
        tenant:profiles!payments_tenant_id_fkey(full_name, phone),
        tenancy:tenancies(unit_id, unit:units(unit_number))
      `)
      .in('tenancy_id', (tenancies || []).map((t: any) => t.id))

    if (date_from) paymentsQuery = paymentsQuery.gte('created_at', date_from)
    if (date_to) paymentsQuery = paymentsQuery.lte('created_at', date_to + 'T23:59:59')

    const { data: payments } = await paymentsQuery.order('created_at', { ascending: false })

    // ── Build workbook ──
    const wb = XLSX.utils.book_new()
    const reportDate = new Date().toLocaleDateString('en-UG')
    const periodLabel = date_from && date_to
      ? `${new Date(date_from).toLocaleDateString('en-UG')} – ${new Date(date_to).toLocaleDateString('en-UG')}`
      : 'All Time'

    // ── SHEET 1: Summary ──
    const summaryData = [
      ['THE ARDHI PROPERTY MANAGEMENT REPORT'],
      [''],
      ['Property', property.name],
      ['Location', property.location],
      ['Type', property.type],
      ['Report Period', periodLabel],
      ['Generated', reportDate],
      ['Landlord', landlord?.full_name || ''],
      ['Landlord Email', landlord?.email || ''],
      ['Landlord Phone', landlord?.phone || ''],
      [''],
      ['SUMMARY'],
      ['Total Units', property.total_units],
      ['Occupied Units', property.occupied_units || 0],
      ['Vacant Units', (property.total_units || 0) - (property.occupied_units || 0)],
      ['Occupancy Rate', `=ROUND(C14/C13*100,1)&"%"`],
      ['Active Tenants', (tenancies || []).length],
      [''],
      ['FINANCIAL SUMMARY'],
      ['Total Rent Roll (Monthly)', (tenancies || []).reduce((s: number, t: any) => s + (t.rent_amount || 0), 0)],
      ['Total Payments Received', (payments || []).filter((p: any) => p.status === 'confirmed').reduce((s: number, p: any) => s + (p.amount || 0), 0)],
      ['Pending Payments', (payments || []).filter((p: any) => p.status === 'pending').reduce((s: number, p: any) => s + (p.amount || 0), 0)],
    ]
    const wsSummary = XLSX.utils.aoa_to_sheet(summaryData)
    wsSummary['!cols'] = [{ wch: 28 }, { wch: 35 }]
    wsSummary['A1'] = { v: 'THE ARDHI PROPERTY MANAGEMENT REPORT', t: 's' }
    XLSX.utils.book_append_sheet(wb, wsSummary, 'Summary')

    // ── SHEET 2: Units ──
    const unitsHeaders = ['Unit Number', 'Status', 'Rent Amount (UGX)', 'Tenant Name', 'Tenant Phone', 'Lease Start']
    const unitsRows = (units || []).map((u: any) => {
      const tenancy = (tenancies || []).find((t: any) => t.unit_id === u.id)
      return [
        u.unit_number,
        u.is_occupied ? 'Occupied' : 'Vacant',
        u.rent_amount || 0,
        tenancy?.tenant?.full_name || '-',
        tenancy?.tenant?.phone || '-',
        tenancy?.start_date ? new Date(tenancy.start_date).toLocaleDateString('en-UG') : '-',
      ]
    })
    const wsUnits = XLSX.utils.aoa_to_sheet([unitsHeaders, ...unitsRows])
    wsUnits['!cols'] = [{ wch: 14 }, { wch: 12 }, { wch: 20 }, { wch: 25 }, { wch: 18 }, { wch: 14 }]
    XLSX.utils.book_append_sheet(wb, wsUnits, 'Units')

    // ── SHEET 3: Tenants ──
    const tenantsHeaders = ['Unit', 'Full Name', 'Email', 'Phone', 'National ID', 'Monthly Rent (UGX)', 'Lease Start', 'Status']
    const tenantsRows = (tenancies || []).map((t: any) => [
      t.unit?.unit_number || '-',
      t.tenant?.full_name || '-',
      t.tenant?.email || '-',
      t.tenant?.phone || '-',
      t.tenant?.national_id || '-',
      t.rent_amount || 0,
      t.start_date ? new Date(t.start_date).toLocaleDateString('en-UG') : '-',
      t.is_active ? 'Active' : 'Inactive',
    ])
    const wsTenants = XLSX.utils.aoa_to_sheet([tenantsHeaders, ...tenantsRows])
    wsTenants['!cols'] = [{ wch: 10 }, { wch: 24 }, { wch: 28 }, { wch: 16 }, { wch: 18 }, { wch: 22 }, { wch: 14 }, { wch: 10 }]
    XLSX.utils.book_append_sheet(wb, wsTenants, 'Tenants')

    // ── SHEET 4: Payments ──
    const paymentsHeaders = ['Date', 'Unit', 'Tenant Name', 'Phone', 'Amount (UGX)', 'Method', 'Reference', 'Status']
    const paymentsRows = (payments || []).map((p: any) => [
      new Date(p.created_at).toLocaleDateString('en-UG'),
      p.tenancy?.unit?.unit_number || '-',
      p.tenant?.full_name || '-',
      p.tenant?.phone || '-',
      p.amount || 0,
      (p.payment_method || '').replace(/_/g, ' ').toUpperCase(),
      p.reference || '-',
      (p.status || '').toUpperCase(),
    ])
    // Add totals row
    const confirmedTotal = (payments || []).filter((p: any) => p.status === 'confirmed').reduce((s: number, p: any) => s + (p.amount || 0), 0)
    paymentsRows.push(['', '', '', 'TOTAL CONFIRMED:', confirmedTotal, '', '', ''])

    const wsPayments = XLSX.utils.aoa_to_sheet([paymentsHeaders, ...paymentsRows])
    wsPayments['!cols'] = [{ wch: 14 }, { wch: 10 }, { wch: 24 }, { wch: 16 }, { wch: 18 }, { wch: 18 }, { wch: 20 }, { wch: 12 }]
    XLSX.utils.book_append_sheet(wb, wsPayments, 'Payments')

    // ── SHEET 5: Contacts ──
    const contactsHeaders = ['Unit', 'Tenant Name', 'Email', 'Phone', 'National ID', 'Emergency Contact (if any)']
    const contactsRows = (tenancies || []).map((t: any) => [
      t.unit?.unit_number || '-',
      t.tenant?.full_name || '-',
      t.tenant?.email || '-',
      t.tenant?.phone || '-',
      t.tenant?.national_id || '-',
      '-',
    ])
    const wsContacts = XLSX.utils.aoa_to_sheet([contactsHeaders, ...contactsRows])
    wsContacts['!cols'] = [{ wch: 10 }, { wch: 24 }, { wch: 28 }, { wch: 16 }, { wch: 18 }, { wch: 24 }]
    XLSX.utils.book_append_sheet(wb, wsContacts, 'Contacts')

    // ── Generate file ──
    const buf = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' })
    const filename = `Ardhi-${property.name.replace(/\s+/g, '-')}-${periodLabel.replace(/\s|–/g, '_')}.xlsx`

    return new NextResponse(buf, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': buf.length.toString(),
      },
    })
  } catch (e: any) {
    console.error('Export error:', e)
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
