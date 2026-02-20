// currently unused

import "server-only"
import jwt from "jsonwebtoken"

let cachedToken = null
let tokenExpiry = 0

export function generateDeveloperToken() {
  const now = Math.floor(Date.now() / 1000)

  if (cachedToken && now < tokenExpiry - 3600) {
    return cachedToken
  }

  const teamId = process.env.APPLE_MUSIC_TEAM_ID
  const keyId = process.env.APPLE_MUSIC_KEY_ID
  const privateKeyRaw = process.env.APPLE_MUSIC_PRIVATE_KEY

  if (!teamId || !keyId || !privateKeyRaw) {
    throw new Error("Missing Apple Music env vars")
  }

  const privateKey = privateKeyRaw.replace(/\\n/g, "\n")

  const exp = now + 180 * 24 * 60 * 60 // 180 days

  const token = jwt.sign(
    {
      iss: teamId,
      iat: now,
      exp,
    },
    privateKey,
    {
      algorithm: "ES256",
      header: {
        alg: "ES256",
        kid: keyId,
      },
    }
  )

  cachedToken = token
  tokenExpiry = exp

  return token
}
