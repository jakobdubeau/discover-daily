import { cookies } from "next/headers";

export const dynamic = 'force-dynamic'

export async function GET() {

    const cookieStore = await cookies()

    const accessTokenCookie = cookieStore.get('spotify_access_token')?.value

    if (!accessTokenCookie) {
        return new Response("No access token", { status: 401 })
    }

    const response = await fetch("https://api.spotify.com/v1/me", {
        headers: {
            Authorization: `Bearer ${accessTokenCookie}`,
        },
    })

    if (!response.ok) {
        const text = await response.text().catch(() => "")
        return new Response(text || "Failed to fetch user data", { status: response.status })
    }

    const data = await response.json()

    return Response.json(data, { status: 200 })
}
