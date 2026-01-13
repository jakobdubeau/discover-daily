import { cookies } from "next/headers";

export async function GET() {

    const cookieStore = await cookies()
    
    const accessTokenCookie = cookieStore.get('spotify_access_token')

    if (!accessTokenCookie) {
        return new Response("No access token", { status: 401 })
    }

    const accessToken = accessTokenCookie?.value

    const response = await fetch("https://api.spotify.com/v1/me", {
        headers: {
            Authorization: `Bearer ${accessToken}`,
        },
    })

    if (!response.ok) {
        return new Response("Failed to fetch user data", { status: response.status })
    }

    const data = await response.json()

    return new Response(JSON.stringify(data), {
        status: 200,
        headers: {
            "Content-Type": "application/json",
        },
    })
}
