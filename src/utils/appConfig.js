export function getBackendConfigStatus() {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
    const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY
    const backendUrl = import.meta.env.VITE_API_URL
    const supabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey)
    const backendConfigured = Boolean(backendUrl)
    const configured = supabaseConfigured || backendConfigured

    return {
        configured,
        backendConfigured,
        supabaseConfigured,
        urlConfigured: Boolean(supabaseUrl),
        anonKeyConfigured: Boolean(supabaseAnonKey),
        message: configured
            ? ''
            : 'La configuration de l\'API backend ou de Supabase est incomplète. Certaines fonctionnalités peuvent être limitées.',
    }
}

export const getSupabaseConfigStatus = getBackendConfigStatus

export function isSupabaseConfigured() {
    return getBackendConfigStatus().configured
}
