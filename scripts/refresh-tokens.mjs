import { execSync } from "child_process";
import { createClient } from "@supabase/supabase-js";

const SP_DC = process.env.SPOTIFY_SP_DC;
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

function fetchInternalToken() {
    const result = execSync(
        `curl_chrome116 -s -b "sp_dc=${SP_DC}" "https://open.spotify.com/get_access_token?reason=transport&productType=web_player"`,
        { encoding: "utf-8" }
    );
    const data = JSON.parse(result);
    if (!data.accessToken || data.isAnonymous) {
        throw new Error("Failed to get internal token — sp_dc may be expired");
    }
    return data.accessToken;
}

function fetchClientToken() {
    const body = JSON.stringify({
        client_data: {
            client_version: "1.2.52.442.g0f7e002f",
            client_id: "d8a5ed958d274c2e8ee717e6a4b0971d",
            js_sdk_data: {
                device_brand: "unknown",
                device_model: "unknown",
                os: "linux",
                os_version: "unknown",
                device_type: "computer",
            },
        },
    });
    const result = execSync(
        `curl_chrome116 -s -X POST -H "content-type: application/json" -d '${body}' "https://clienttoken.spotify.com/v1/clienttoken"`,
        { encoding: "utf-8" }
    );
    const data = JSON.parse(result);
    const token = data?.granted_token?.token;
    if (!token) throw new Error("Failed to get client token");
    return token;
}

async function updateTokens(internalToken, clientToken) {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

    const { error: e1 } = await supabase
        .from("spotify_tokens")
        .update({ value: internalToken, updated_at: new Date().toISOString() })
        .eq("key", "internal_token");
    if (e1) throw new Error(`Supabase update internal_token failed: ${e1.message}`);

    const { error: e2 } = await supabase
        .from("spotify_tokens")
        .update({ value: clientToken, updated_at: new Date().toISOString() })
        .eq("key", "client_token");
    if (e2) throw new Error(`Supabase update client_token failed: ${e2.message}`);
}

async function main() {
    console.log("Fetching internal token...");
    const internalToken = fetchInternalToken();
    console.log(`Got internal token (${internalToken.length} chars)`);

    console.log("Fetching client token...");
    const clientToken = fetchClientToken();
    console.log(`Got client token (${clientToken.length} chars)`);

    console.log("Updating Supabase...");
    await updateTokens(internalToken, clientToken);
    console.log("Done.");
}

main().catch((err) => {
    console.error("FATAL:", err.message);
    process.exit(1);
});
