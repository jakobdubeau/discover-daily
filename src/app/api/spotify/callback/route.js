import { cookies } from "next/headers";

export const dynamic = 'force-dynamic'

// read code and state from url
// read code verifier and state from cookies, verify state
// exchange code for access token
// store token
// redirect

export async function GET(request) {

    const clientId = process.env.SPOTIFY_CLIENT_ID;
    const redirectUri = process.env.SPOTIFY_REDIRECT_URI;
    const appUrl = process.env.APP_URL ?? "http://localhost:3000"

    // missing env variables

    if (!clientId || !redirectUri) {
        return new Response(
        "Missing SPOTIFY_CLIENT_ID or SPOTIFY_REDIRECT_URI in env",
        { status: 500 }
        )
    }

    const url = new URL(request.url)
    const code = url.searchParams.get('code')
    const returnedState = url.searchParams.get('state')
    const error = url.searchParams.get('error')

    if (error) {
        return new Response(`Spotify OAuth error: ${error}`, { status: 400 })
    }

    if (!code || !returnedState) {
        return new Response("Missing code or state in callback url", { status: 400 })
    }

    const cookieStore = await cookies()

    const expectedState = cookieStore.get('spotify_oauth_state')?.value
    const codeVerifier = cookieStore.get('spotify_pkce_verifier')?.value

    if (!codeVerifier || !expectedState) {
        return new Response("Missing PKCE verifier/state cookie (expired?)", { status: 400 })
    }

    if (returnedState !== expectedState) {
        return new Response("State mismatch", { status: 400 })
    }

    const tokenUrl = "https://accounts.spotify.com/api/token"

    const params =  {
        client_id: clientId,
        grant_type: 'authorization_code',
        code,
        redirect_uri: redirectUri,
        code_verifier: codeVerifier,
    }

    const body = new URLSearchParams(params)

    const tokenRes = await fetch(tokenUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body,
    })

    if (!tokenRes.ok) {
        const text = await tokenRes.text().catch(() => "")
        return new Response(`Token exchange failed: ${text}`, { status: 400 })
    }

    const tokenData = await tokenRes.json()
    const { access_token, refresh_token, expires_in } = tokenData

    if (!access_token) {
        return new Response("No access token in response", { status: 400 })
    }

    const isProd = process.env.NODE_ENV === "production"

    cookieStore.set("spotify_access_token", access_token, {
        httpOnly: true,
        secure: isProd,
        sameSite: "lax",
        path: "/",
        maxAge: Number(expires_in ?? 3600),
    })

    if (refresh_token) {
        cookieStore.set("spotify_refresh_token", refresh_token, {
            httpOnly: true,
            secure: isProd,
            sameSite: "lax",
            path: "/",
            maxAge: 60 * 60 * 24 * 30, // 30 days
        })
    }


    cookieStore.set("spotify_pkce_verifier", "", { path: "/", maxAge: 0 })
    cookieStore.set("spotify_oauth_state", "", { path: "/", maxAge: 0 })


    return Response.redirect(appUrl, 302)
}
