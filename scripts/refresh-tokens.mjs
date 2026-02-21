import { createClient } from "@supabase/supabase-js";
import crypto from "crypto";

const SP_DC = process.env.SPOTIFY_SP_DC;
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

// spotify TOTP implementation (from spotify-secrets)
const SECRETS_URL = "https://code.thetadev.de/ThetaDev/spotify-secrets/raw/branch/main/secrets/secretDict.json";

async function getSecrets() {
    const res = await fetch(SECRETS_URL);
    return res.json();
}

function transformSecret(secretBytes) {
    return secretBytes.map((e, t) => e ^ ((t % 33) + 9));
}

function toBase32(buffer) {
    const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
    let bits = "";
    for (const byte of buffer) bits += byte.toString(2).padStart(8, "0");
    let result = "";
    for (let i = 0; i < bits.length; i += 5) {
        const chunk = bits.slice(i, i + 5).padEnd(5, "0");
        result += alphabet[parseInt(chunk, 2)];
    }
    return result;
}

function generateTOTP(secret, period = 30) {
    const time = Math.floor(Date.now() / 1000 / period);
    const timeBuffer = Buffer.alloc(8);
    timeBuffer.writeUInt32BE(0, 0);
    timeBuffer.writeUInt32BE(time, 4);

    const hmac = crypto.createHmac("sha1", secret);
    hmac.update(timeBuffer);
    const hash = hmac.digest();

    const offset = hash[hash.length - 1] & 0x0f;
    const code = ((hash[offset] & 0x7f) << 24) |
        ((hash[offset + 1] & 0xff) << 16) |
        ((hash[offset + 2] & 0xff) << 8) |
        (hash[offset + 3] & 0xff);

    return (code % 1000000).toString().padStart(6, "0");
}

async function getSpotifyTOTP() {
    const secrets = await getSecrets();
    // use the latest version
    const versions = Object.keys(secrets).map(Number).sort((a, b) => b - a);
    const version = versions[0];
    const secretBytes = secrets[version.toString()];
    const transformed = transformSecret(secretBytes);
    const hexString = Buffer.from(transformed).toString("hex");
    const base32Secret = toBase32(Buffer.from(hexString, "utf-8"));
    const secretBuffer = Buffer.from(base32Secret, "base64");

    // actually need to decode base32 to bytes for HMAC
    function base32Decode(str) {
        const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
        let bits = "";
        for (const c of str) {
            const val = alphabet.indexOf(c.toUpperCase());
            if (val === -1) continue;
            bits += val.toString(2).padStart(5, "0");
        }
        const bytes = [];
        for (let i = 0; i + 8 <= bits.length; i += 8) {
            bytes.push(parseInt(bits.slice(i, i + 8), 2));
        }
        return Buffer.from(bytes);
    }

    const decoded = base32Decode(base32Secret);
    return generateTOTP(decoded);
}

async function fetchInternalToken() {
    const totp = await getSpotifyTOTP();
    const res = await fetch(
        `https://open.spotify.com/api/token?reason=transport&productType=web_player&totp=${totp}`,
        {
            headers: {
                cookie: `sp_dc=${SP_DC}`,
                "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0.0 Safari/537.36",
            },
        }
    );
    const text = await res.text();
    if (!res.ok) {
        console.error(`Token fetch failed (${res.status}): ${text.slice(0, 300)}`);
        throw new Error(`Failed to fetch internal token (${res.status})`);
    }
    const data = JSON.parse(text);
    if (!data.accessToken || data.isAnonymous) {
        throw new Error("Failed to get internal token — sp_dc may be expired");
    }
    return data.accessToken;
}

async function fetchClientToken() {
    const res = await fetch("https://clienttoken.spotify.com/v1/clienttoken", {
        method: "POST",
        headers: {
            "content-type": "application/json",
            "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0.0 Safari/537.36",
        },
        body: JSON.stringify({
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
        }),
    });
    const text = await res.text();
    if (!res.ok) {
        console.error(`Client token fetch failed (${res.status}): ${text.slice(0, 300)}`);
        throw new Error(`Failed to fetch client token (${res.status})`);
    }
    const data = JSON.parse(text);
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
    const internalToken = await fetchInternalToken();
    console.log(`Got internal token (${internalToken.length} chars)`);

    console.log("Fetching client token...");
    const clientToken = await fetchClientToken();
    console.log(`Got client token (${clientToken.length} chars)`);

    console.log("Updating Supabase...");
    await updateTokens(internalToken, clientToken);
    console.log("Done.");
}

main().catch((err) => {
    console.error("FATAL:", err.message);
    process.exit(1);
});
