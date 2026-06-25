import { createLogoutHandler } from "@/lib/routes/auth";
export const POST = createLogoutHandler({ appId: "ye-search", externalUrlEnv: "SEARCH_EXTERNAL_URL" });
