import { createCallbackHandler } from "@/lib/routes/auth";
export const GET = createCallbackHandler({ appId: "ye-search", externalUrlEnv: "SEARCH_EXTERNAL_URL" });
