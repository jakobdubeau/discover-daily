import { randomBytes, createHash } from 'crypto';

// login to spotify using authorization code flow with PKCE

// code verifier

export function generateRandomString(length) {
  const possible =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
  const values = randomBytes(length)

  let result = ""
  for (let i = 0; i < values.length; i++) {
    result += possible[values[i] % possible.length]
  }
  return result
}

// code challenge

export function sha256Bytes(plain) {
  return createHash("sha256").update(plain).digest()
}

export function base64UrlEncode(bytes) {
  return Buffer.from(bytes)
    .toString("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
}

export function createPkcePair() {
  const codeVerifier = generateRandomString(64)
  const hashed = sha256Bytes(codeVerifier)
  const codeChallenge = base64UrlEncode(hashed)

  return { codeVerifier, codeChallenge }
}

export function generateState(length = 16) {
  return generateRandomString(length)
}
