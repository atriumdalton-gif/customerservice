import { cookies } from "next/headers";

const COOKIE_NAME = "inbox_copilot_auth";

export async function isAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME);
  return token?.value === process.env.AUTH_TOKEN;
}

export function getAuthCookieName(): string {
  return COOKIE_NAME;
}
