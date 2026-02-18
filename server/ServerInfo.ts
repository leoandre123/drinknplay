import type { ServerInfo } from "@shared/models/ServerInfo.js";
import pkg from "../package.json" with { type: "json" };

export const VERSION = pkg.version ?? "0.0.0";
export const ENVIRONTMENT = process.env.NODE_ENV ?? "development";

const startTime = Date.now();

export function getServerInfo(): ServerInfo {
  return {
    startTime: startTime,
    memoryUsage: process.memoryUsage().heapUsed,
    version: VERSION,
    environment: ENVIRONTMENT,
  };
}
