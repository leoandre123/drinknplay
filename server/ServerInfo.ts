import type { ServerInfo } from "@shared/models/ServerInfo.js";
import pkg from "../package.json" with { type: "json" };

export const VERSION = pkg.version ?? "0.0.0";
export const ENVIRONMENT = process.env.NODE_ENV ?? "development";
export const NODE_VERSION = process.version;

const startTime = Date.now();

export function getServerInfo(): ServerInfo {
  return {
    startTime: startTime,
    memoryUsage: process.memoryUsage().heapUsed,
    version: VERSION,
    environment: ENVIRONMENT,
    nodeVersion: NODE_VERSION,
  };
}
