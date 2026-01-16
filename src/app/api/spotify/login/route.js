import { cookies } from "next/headers";
import { createPkcePair, generateState } from "@/lib/spotifyAuth"

// don't cache route
export const dynamic = 'force-dynamic'

export async function GET() {

    const clientId = process.env.SPOTIFY_CLIENT_ID;
    const redirectUri = process.env.SPOTIFY_REDIRECT_URI;

    // missing env variables

    if (!clientId || !redirectUri) {
        return new Response(
        "Missing SPOTIFY_CLIENT_ID or SPOTIFY_REDIRECT_URI in env",
        { status: 500 }
        )
    }

    const { codeVerifier, codeChallenge } = createPkcePair()
    const state = generateState()

    const cookieStore = await cookies()

    // node_env is environment variable that tells app where it's running, development = npm run dev, production = vercel
    // secure being true means cookie is only sent over https
    // so only require https cookies when in production
    const isProd = process.env.NODE_ENV === "production"

    // store code verifier and state in http-only cookies

    cookieStore.set("spotify_pkce_verifier", codeVerifier, {
        httpOnly: true,
        secure: isProd,
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 10, // 10 minutes
    })

    cookieStore.set("spotify_oauth_state", state, {
        httpOnly: true,
        secure: isProd,
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 10, // 10 minutes
    })

    // build spotify auth url

    const scope = 'user-read-private user-read-email user-top-read user-library-read user-read-recently-played playlist-modify-public playlist-modify-private playlist-read-private'

    const authUrl = new URL("https://accounts.spotify.com/authorize")

    const params =  {
        response_type: 'code',
        client_id: clientId,
        scope,
        state,
        code_challenge_method: 'S256',
        code_challenge: codeChallenge,
        redirect_uri: redirectUri,
    }

    authUrl.search = new URLSearchParams(params).toString()

    // redirect to spotify authorization page

    return Response.redirect(authUrl.toString(), 302)
}