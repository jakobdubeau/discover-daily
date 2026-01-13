import { cookies } from "next/headers";

// read code and state from url
// read code verifier and state from cookies, verify state
// exchange code for access token
// store token
// redirect

export async function GET() {

    const urlParams = new URLSearchParams(window.location.search)
    let code = urlParams.get('code')
    let state = urlParams.get('state')

    const cookieStore = await cookies()

    const cookieState = cookieStore.get('spotify_oauth_state')

    const stateVal = cookieState?.value

    if (state != stateVal) {
        return new Response("State mismatch", { status: 400 })
    }

}

export async function POST() {
    
    const cookieStore = await cookies()
    const isProd = process.env.NODE_ENV === "production"

    const cookieCodeVerifier = cookieStore.get('spotify_pkce_verifier')

    const url = "https://accounts.spotify.com/api/token"
    const payload = {
        method: 'POST',
        headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
        client_id: clientId,
        grant_type: 'authorization_code',
        code,
        redirect_uri: redirectUri,
        code_verifier: cookieCodeVerifier,
        }),
    }

    const body = await fetch(url, payload)
    const response = await body.json()

    cookieStore.set("spotify_access_token", response.access_token, {
        httpOnly: true,
        secure: isProd,
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 10, // 10 minutes
    })

    cookieStore.delete("spotify_pkce_verifier")
    cookieStore.delete("spotify_oauth_state")

    return Response.redirect(process.env.APP_URL || "/", 302)
}