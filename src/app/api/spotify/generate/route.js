import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic'

export async function POST() {

    const cookieStore = await cookies()
        
    const token = cookieStore.get("spotify_access_token")?.value
    
    if (!token) {
        return new Response("No access token", { status: 401 })
    }

    // try

    // get me from fetchMe w token

    // get top tracks

    // get recent

    // close seeds and explore seeds

    // close a and b
    // explore a and b

    // remove dupes from close and explore

    // filter not played too much

    // final tracks > mix tracks, check length after

    // create playlist and add tracks

    // catch errors and return 500
}