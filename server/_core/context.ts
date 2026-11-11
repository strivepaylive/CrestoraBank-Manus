import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import type { User } from "../../drizzle/schema";
import { sdk } from "./sdk";
import { isSessionRevoked } from "../sessionRevocation";

export type TrpcContext = {
  req: CreateExpressContextOptions["req"];
  res: CreateExpressContextOptions["res"];
  user: User | null;
};

export async function createContext(
  opts: CreateExpressContextOptions
): Promise<TrpcContext> {
  let user: User | null = null;
  let sessionKey: string | undefined;

  try {
    // Extract sessionKey from the verified JWT token if present
    const authResult = await sdk.authenticateRequest(opts.req);
    user = authResult;
    // We need to peek at the token payload again since authenticateRequest doesn't return sessionKey
    const cookies = (sdk as any).parseCookies(opts.req.headers.cookie);
    let sessionToken = cookies.get("app_session_id");
    if (!sessionToken && typeof opts.req.headers.authorization === "string" && opts.req.headers.authorization.startsWith("Bearer ")) {
      sessionToken = opts.req.headers.authorization.slice(7);
    }
    if (sessionToken) {
      const session = await sdk.verifySession(sessionToken);
      sessionKey = session?.sessionKey;
    }
  } catch (error) {
    // Authentication is optional for public procedures.
    user = null;
  }

  // Enforce device-session revocation for bank customers (openId reg_<id>)
  if (user && user.openId?.startsWith("reg_")) {
    try {
      if (await isSessionRevoked(user.openId, sessionKey)) {
        user = null;
      }
    } catch {
      // fail-open on transient errors so legitimate users are not locked out
    }
  }

  return {
    req: opts.req,
    res: opts.res,
    user,
  };
}
