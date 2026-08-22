import { createHash, timingSafeEqual } from "node:crypto";
import type { H3Event } from "h3";

type AdminSession = {
  admin?: true;
  loginAt?: number;
};

export function useAdminSession(event: H3Event) {
  const { sessionPassword } = useRuntimeConfig(event);

  return useSession<AdminSession>(event, {
    password: sessionPassword,
    name: "hsa_admin",
    maxAge: 60 * 60 * 8, // 8 hours
    cookie: {
      httpOnly: true,
      secure: !import.meta.dev, // localhost is http in dev
      sameSite: "lax",
      path: "/",
    },
  });
}

// Constant-time comparison. Hash both sides first so unequal lengths do not
// leak through timingSafeEqual's length check.
export function timingSafeEqualStr(a: string, b: string): boolean {
  const ha = createHash("sha256").update(a).digest();
  const hb = createHash("sha256").update(b).digest();
  return timingSafeEqual(ha, hb);
}
