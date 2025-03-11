import { OAuth2Client } from "google-auth-library";
import { TokenInfo } from "../types/auth";

// Initialize OAuth client with credentials and redirect URI
const client = new OAuth2Client(
  process.env.CLIENT_ID,
  process.env.CLIENT_SECRET,
  process.env.REDIRECT_URI
);

// In-memory token storage (replace with a database in production)
const tokenStore = new Map<string, TokenInfo>();

/**
 * Generate authentication URL for Google OAuth using the Authorization Code flow.
 */
export const generateAuthUrl = (): string => {
  const scopes = [
    "https://www.googleapis.com/auth/userinfo.email",
    "https://www.googleapis.com/auth/userinfo.profile",
    "https://www.googleapis.com/auth/drive.readonly",
  ];

  return client.generateAuthUrl({
    access_type: "offline", // request refresh token
    prompt: "consent",
    scope: scopes,
  });
};

/**
 * Exchange the authorization code for access and refresh tokens.
 */
export const getTokensFromCode = async (code: string): Promise<TokenInfo> => {
  const { tokens } = await client.getToken(code);

  if (!tokens.access_token) {
    throw new Error("Failed to obtain access token");
  }

  const tokenInfo: TokenInfo = {
    access_token: tokens.access_token,
    refresh_token: tokens.refresh_token ?? undefined,
    expiry_date: tokens.expiry_date || Date.now() + 3600 * 1000, // fallback expiry in 1 hour
  };

  // Store tokens (in production, store tokens linked to the user)
  tokenStore.set(tokenInfo.access_token, tokenInfo);

  return tokenInfo;
};

/**
 * Verify the provided access token and refresh it if expired.
 */
export const verifyAndRefreshToken = async (
  accessToken: string
): Promise<TokenInfo> => {
  const storedTokens = tokenStore.get(accessToken);

  if (!storedTokens) {
    throw new Error("Token not found");
  }

  // Check if token is expired
  if (Date.now() >= storedTokens.expiry_date) {
    if (!storedTokens.refresh_token) {
      throw new Error("Refresh token not available");
    }

    // Set the refresh token and refresh the access token
    client.setCredentials({
      refresh_token: storedTokens.refresh_token,
    });

    const { credentials } = await client.refreshAccessToken();

    const newTokenInfo: TokenInfo = {
      access_token: credentials.access_token || storedTokens.access_token,
      refresh_token: credentials.refresh_token || storedTokens.refresh_token,
      expiry_date: credentials.expiry_date || Date.now() + 3600 * 1000,
    };

    // Remove old token and store the new one
    tokenStore.delete(accessToken);
    tokenStore.set(newTokenInfo.access_token, newTokenInfo);

    return newTokenInfo;
  }

  return storedTokens;
};

/**
 * Create and return an OAuth2Client instance with the provided tokens.
 */
export const createAuthenticatedClient = (tokens: TokenInfo): OAuth2Client => {
  const oAuth2Client = new OAuth2Client(
    process.env.CLIENT_ID,
    process.env.CLIENT_SECRET,
    process.env.REDIRECT_URI
  );

  oAuth2Client.setCredentials({
    access_token: tokens.access_token,
    refresh_token: tokens.refresh_token,
    expiry_date: tokens.expiry_date,
  });

  return oAuth2Client;
};
