import type { ServerInfo } from "@shared/models/ServerInfo.js";

const startTime = Date.now();

export function getServerInfo(): ServerInfo {
  return {
    startTime: startTime,
    memoryUsage: process.memoryUsage().heapUsed,
    version: process.env.npm_package_version ?? "0.0.0",
    environment: process.env.NODE_ENV ?? "dev",
  };
}
