import { supabase } from './supabase';

const TABLE = 'hall_of_fame_entries';

const normalizePayload = (payload = {}) => ({
    builder_id: payload.builder_id,
    certificate_id: payload.certificate_id,
    featured_project_url: payload.featured_project_url?.trim() || null,
    featured_quote: payload.featured_quote?.trim() || null,
    featured_order: Number.isFinite(Number(payload.featured_order)) ? Number(payload.featured_order) : 1000,
    is_active: payload.is_active !== false,
    featured_at: payload.featured_at || new Date().toISOString(),
    created_by: payload.created_by || null
});

const hydrateRows = async (rows = []) => {
    if (!rows.length) return [];
    const builderIds = [...new Set(rows.map((row) => row.builder_id).filter(Boolean))];
    const certIds = [...new Set(rows.map((row) => row.certificate_id).filter(Boolean))];

    const [{ data: profiles = [] }, { data: certificatesById = [] }, { data: certificatesByBuilder = [] }] = await Promise.all([
        builderIds.length
            ? supabase.from('profiles').select('id, full_name, district, threads_handle').in('id', builderIds)
            : Promise.resolve({ data: [] }),
        certIds.length
            ? supabase
                .from('builder_certificates')
                .select('id, builder_id, builder_name, district, program_title, app_name, project_url, certificate_url, issued_at')
                .in('id', certIds)
            : Promise.resolve({ data: [] }),
        builderIds.length
            ? supabase
                .from('builder_certificates')
                .select('id, builder_id, builder_name, district, program_title, app_name, project_url, certificate_url, issued_at')
                .in('builder_id', builderIds)
                .order('issued_at', { ascending: false })
            : Promise.resolve({ data: [] })
    ]);

    const profileMap = new Map((profiles || []).map((item) => [item.id, item]));
    const certificateByIdMap = new Map((certificatesById || []).map((item) => [item.id, item]));
    const latestCertificateByBuilderMap = new Map();
    (certificatesByBuilder || []).forEach((item) => {
        if (!item?.builder_id || latestCertificateByBuilderMap.has(item.builder_id)) return;
        latestCertificateByBuilderMap.set(item.builder_id, item);
    });

    return rows.map((row) => ({
        ...row,
        profile: profileMap.get(row.builder_id) || null,
        // Fallback to latest cert for builder if stored certificate_id is stale.
        certificate: certificateByIdMap.get(row.certificate_id) || latestCertificateByBuilderMap.get(row.builder_id) || null
    }));
};

export async function fetchPublicHallOfFame() {
    const { data, error } = await supabase
        .from(TABLE)
        .select('*')
        .eq('is_active', true)
        .order('featured_order', { ascending: true })
        .order('featured_at', { ascending: false });
    if (error) throw error;
    return hydrateRows(data || []);
}

export async function fetchAdminHallOfFame() {
    const { data, error } = await supabase
        .from(TABLE)
        .select('*')
        .order('featured_order', { ascending: true })
        .order('featured_at', { ascending: false });
    if (error) throw error;
    return hydrateRows(data || []);
}

export async function createHallOfFameEntry(payload) {
    const normalized = normalizePayload(payload);
    const { data, error } = await supabase
        .from(TABLE)
        .upsert([normalized], { onConflict: 'builder_id' })
        .select('*')
        .single();
    if (error) throw error;
    const [hydrated] = await hydrateRows([data]);
    return hydrated;
}

export async function updateHallOfFameEntry(id, payload) {
    const safePayload = {
        featured_project_url: payload.featured_project_url?.trim() || null,
        featured_quote: payload.featured_quote?.trim() || null,
        featured_order: Number.isFinite(Number(payload.featured_order)) ? Number(payload.featured_order) : 1000,
        is_active: payload.is_active !== false,
        updated_at: new Date().toISOString()
    };
    if (payload.featured_at) safePayload.featured_at = payload.featured_at;

    const { data, error } = await supabase
        .from(TABLE)
        .update(safePayload)
        .eq('id', id)
        .select('*')
        .single();
    if (error) throw error;
    const [hydrated] = await hydrateRows([data]);
    return hydrated;
}

export async function deleteHallOfFameEntry(id) {
    const { error } = await supabase.from(TABLE).delete().eq('id', id);
    if (error) throw error;
    return true;
}

export async function reorderHallOfFameEntries(orderRows = []) {
    const updates = (orderRows || [])
        .map((item) => ({
            id: item.id,
            featured_order: Number(item.featured_order)
        }))
        .filter((item) => item.id && Number.isFinite(item.featured_order));

    if (!updates.length) return [];
    await Promise.all(
        updates.map((item) =>
            supabase
                .from(TABLE)
                .update({ featured_order: item.featured_order, updated_at: new Date().toISOString() })
                .eq('id', item.id)
        )
    );
    return fetchAdminHallOfFame();
}

