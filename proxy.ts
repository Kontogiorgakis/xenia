import createMiddleware from "next-intl/middleware";

import { routing } from "./lib/i18n/routing";

export default createMiddleware(routing);

export const config = {
  // Anchor `book` / `widget` so only `/book`, `/book/*`, `/widget`, `/widget/*`
  // are excluded — not `/booking-info`, `/bookstore`, etc.
  matcher: "/((?!api|trpc|_next|_vercel|book(?:/|$)|widget(?:/|$)|.*\\..*).*)",
};
