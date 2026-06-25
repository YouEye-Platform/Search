import { createSSOHandler } from "@/lib/routes/auth";
export const GET = createSSOHandler({ appId: "ye-search", externalUrlEnv: "SEARCH_EXTERNAL_URL" });
