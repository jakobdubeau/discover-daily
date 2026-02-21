import { createClient } from "@supabase/supabase-js"

const cache = {
    internal_token: null,
    client_token: null,
}

const CACHE_TTL_MS = 5 * 60 * 1000

function getSupabase() {
    return createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY
    )
}

async function fetchTokenFromSupabase(key) {
    const supabase = getSupabase()
    const { data, error } = await supabase
        .from("spotify_tokens")
        .select("value")
        .eq("key", key)
        .single()

    if (error || !data?.value) return null
    return data.value
}

async function getToken(key) {
    const cached = cache[key]
    if (cached && Date.now() - cached.fetchedAt < CACHE_TTL_MS) {
        return cached.value
    }

    const token = await fetchTokenFromSupabase(key)
    if (token) {
        cache[key] = { value: token, fetchedAt: Date.now() }
        return token
    }

    const envMap = {
        internal_token: "SPOTIFY_INTERNAL_TOKEN",
        client_token: "SPOTIFY_CLIENT_TOKEN",
    }
    const envValue = process.env[envMap[key]]
    if (envValue) return envValue

    throw new Error(`No ${key} available`)
}

export async function getInternalToken() {
    return getToken("internal_token")
}

export async function getClientToken() {
    return getToken("client_token")
}
