import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY
const supabasePublishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY
const supabaseClientKey = supabaseAnonKey || supabasePublishableKey

const hasSupabaseConfig =
    typeof supabaseUrl === 'string' &&
    typeof supabaseClientKey === 'string' &&
    !!supabaseUrl.trim() &&
    !!supabaseClientKey.trim() &&
    !supabaseUrl.includes('your-project-url.supabase.co') &&
    !supabaseClientKey.includes('your-anon-key')

const fallbackUrl = 'http://127.0.0.1:54321'
const fallbackAnonKey = 'missing-supabase-anon-key'

export const supabase = createClient(
    hasSupabaseConfig ? supabaseUrl : fallbackUrl,
    hasSupabaseConfig ? supabaseClientKey : fallbackAnonKey,
    {
        global: {
            fetch: (input, init) => {
                if (!hasSupabaseConfig) {
                    return Promise.reject(
                        new Error(
                            'Supabase is not configured. Set VITE_SUPABASE_URL plus VITE_SUPABASE_ANON_KEY (or VITE_SUPABASE_PUBLISHABLE_KEY).'
                        )
                    )
                }
                return fetch(input, init)
            }
        }
    }
)

if (!hasSupabaseConfig) {
    const noopChannel = {
        on() {
            return this
        },
        subscribe() {
            return this
        }
    }

    supabase.channel = () => noopChannel
    supabase.removeChannel = () => { }

    if (typeof console !== 'undefined') {
        console.warn(
            '[Supabase] Missing VITE_SUPABASE_URL and client key (VITE_SUPABASE_ANON_KEY or VITE_SUPABASE_PUBLISHABLE_KEY). Falling back to offline mode without realtime subscriptions.'
        )
    }
}

export const isSupabaseConfigured = hasSupabaseConfig
