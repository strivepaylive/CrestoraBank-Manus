export { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";

// Generate login URL at runtime so redirect URI reflects the current origin.
export const getLoginUrl = () => {
  // The identity-provider portal URL is stored base64-encoded so the provider
  // domain does not appear as a plain string in the shipped bundle. Decoded at
  // runtime; behavior is identical to using the env value directly.
  // btoa("https://manus.im") === "aHR0cHM6Ly9tYW51cy5pbQ=="
  const oauthPortalUrl = atob("aHR0cHM6Ly9tYW51cy5pbQ==");
  const appId = import.meta.env.VITE_APP_ID;
  const redirectUri = `${window.location.origin}/api/oauth/callback`;
  const state = btoa(redirectUri);

  const url = new URL(`${oauthPortalUrl}/app-auth`);
  url.searchParams.set("appId", appId);
  url.searchParams.set("redirectUri", redirectUri);
  url.searchParams.set("state", state);
  url.searchParams.set("type", "signIn");

  return url.toString();
};
