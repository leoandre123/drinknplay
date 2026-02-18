import type { ServerInfo } from "@shared/models/ServerInfo.js";
import pkg from "../package.json" with { type: "json" };

export const VERSION = pkg.version;

const startTime = Date.now();

export function getServerInfo(): ServerInfo {
  return {
    startTime: startTime,
    memoryUsage: process.memoryUsage().heapUsed,
    version: VERSION ?? "0.0.0",
    environment: process.env.NODE_ENV ?? "dev",
  };
}
