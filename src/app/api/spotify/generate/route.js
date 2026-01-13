export const dynamic = 'force-dynamic'

export async function POST() {

    const cookieStore = await cookies()
        
    const accessTokenCookie = cookieStore.get('spotify_access_token')
    
    if (!accessTokenCookie) {
        return new Response("No access token", { status: 401 })
    }
    
    const accessToken = accessTokenCookie?.value

    // fetch tracks, recently played
    // get recs
    // filter
    // mix 70/30
    // create playlist and add
    // return playlist url and track list
}