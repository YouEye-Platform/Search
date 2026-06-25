/**
 * @/lib/routes/health — Health check endpoint factory
 *
 * Usage:
 *   import { createHealthHandler } from "@/lib/routes/health";
 *   export const GET = createHealthHandler({
 *     appId: "ye-cinema",
 *     onHealthCheck: async () => { await runMigrations(); },
 *   });
 */

import { NextResponse } from "next/server";
import packageJson from "../../../../package.json";

const startTime = Date.now();

interface HealthConfig {
  /** App ID, e.g. "ye-cinema" */
  appId: string;
  /** Optional async callback run on each health check (e.g. DB migrations, cache cleanup) */
  onHealthCheck?: () => Promise<void>;
}

export function createHealthHandler(config: HealthConfig) {
  let initialized = !config.onHealthCheck;

  return async function GET() {
    if (!initialized && config.onHealthCheck) {
      try {
        await config.onHealthCheck();
        initialized = true;
      } catch (error) {
        console.error(`Health check initialization failed for ${config.appId}:`, error);
      }
    }

    return NextResponse.json({
      status: "ok",
      app: config.appId,
      version: packageJson.version,
      uptime: Math.floor((Date.now() - startTime) / 1000),
      initialized,
    });
  };
}
