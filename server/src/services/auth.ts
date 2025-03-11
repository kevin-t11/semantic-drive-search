import { OAuth2Client } from "google-auth-library";
import { TokenInfo } from "../types/auth";

// Initialize OAuth client
const client = new OAuth2Client(
  process.env.CLIENT_ID,
  process.env.CLIENT_SECRET,
  process.env.REDIRECT_URI
);

// In-memory token storage (replace with a database in production)
const tokenStore = new Map<string, TokenInfo>();

/**
 * Generate authentication URL for Google OAuth
 */
export const generateAuthUrl = (): string => {
  const scopes = [
    "https://www.googleapis.com/auth/userinfo.email",
    "https://www.googleapis.com/auth/userinfo.profile",
    "https://www.googleapis.com/auth/drive.readonly",
  ];

  return client.generateAuthUrl({
    access_type: "offline",
    scope: scopes,
    prompt: "consent",
  });
};

/**
 * Get tokens using authorization code
 */
export const getTokensFromCode = async (code: string): Promise<TokenInfo> => {
  const { tokens } = await client.getToken(code);

  if (!tokens.access_token) {
    throw new Error("Failed to get access token");
  }

  const tokenInfo: TokenInfo = {
    access_token: tokens.access_token,
    refresh_token: tokens.refresh_token ?? undefined,
    expiry_date: tokens.expiry_date || Date.now() + 3600 * 1000,
  };

  // Store tokens by access token (in a real app, store by user ID)
  tokenStore.set(tokenInfo.access_token, tokenInfo);

  return tokenInfo;
};

/**
 * Verify and refresh token if necessary
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
    // Refresh token
    if (!storedTokens.refresh_token) {
      throw new Error("Refresh token not available");
    }

    client.setCredentials({
      refresh_token: storedTokens.refresh_token,
    });

    const { credentials } = await client.refreshAccessToken();

    const newTokenInfo: TokenInfo = {
      access_token: credentials.access_token || storedTokens.access_token,
      refresh_token: credentials.refresh_token || storedTokens.refresh_token,
      expiry_date: credentials.expiry_date || Date.now() + 3600 * 1000,
    };

    // Remove old token and store new one
    tokenStore.delete(accessToken);
    tokenStore.set(newTokenInfo.access_token, newTokenInfo);

    return newTokenInfo;
  }

  return storedTokens;
};

/**
 * Create OAuth client with tokens
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
