import { createCanvasMiddleware } from "@/lib/middleware";
import { initSession } from "@/lib/auth";

initSession("ye-search");

export const middleware = createCanvasMiddleware({
  appId: "ye-search",
  publicRoutes: ["/embed/"],
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|icons).*)"],
};
