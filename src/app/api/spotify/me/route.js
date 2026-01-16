import { cookies } from "next/headers";

export const dynamic = 'force-dynamic'

export async function GET() {

    const cookieStore = await cookies()

    // ?.value returns undefined if cookie doesn't exist, instead of crashing
    const accessTokenCookie = cookieStore.get('spotify_access_token')?.value

    if (!accessTokenCookie) {
        return new Response("No access token", { status: 401 })
    }

    const res = await fetch("https://api.spotify.com/v1/me", {
        headers: {
            Authorization: `Bearer ${accessTokenCookie}`,
        },
    })

    if (!res.ok) {
        const text = await res.text().catch(() => "")
        return new Response(`Failed to fetch user data: ${text}`, { status: res.status })
    }

    const data = await res.json()

    // 200 means connected
    return Response.json(data, { status: 200 })
}
