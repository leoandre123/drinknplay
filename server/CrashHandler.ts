import path from "node:path";
import fs from "fs";
import { NODE_VERSION, VERSION } from "./ServerInfo.js";
import type { CrashRecord } from "@shared/models/CrashLog.js";

function resolveCrashDirectory() {
  // 1. Explicit override always wins
  if (process.env.CRASH_DIR) {
    return process.env.CRASH_DIR;
  }

  // 2. systemd integration (Linux production)
  if (process.env.STATE_DIRECTORY) {
    return process.env.STATE_DIRECTORY;
  }

  // 3. Cross-platform fallback (dev)
  if (process.env.NODE_ENV === "production") {
    // Non-systemd Linux or Docker
    return "/var/lib/drinknplay";
  }

  // 4. Dev machine (Windows/Mac/Linux)
  return path.join(process.cwd(), "data");
}

export const crashDir = resolveCrashDirectory();
export const crashFile = path.join(crashDir, "crashes.jsonl");

export function logCrash(err: Error, origin: NodeJS.UncaughtExceptionOrigin) {
  const record: CrashRecord = {
    stack: err.stack,
    ts: new Date().toISOString(),
    type: origin,
    message: err.message,
    nodeVersion: NODE_VERSION,
    pid: process.pid,
    appVersion: VERSION,
  };

  //fs.appendFileSync(crashFile, JSON.stringify(record) + "\n");

  try {
    fs.mkdirSync(crashDir, { recursive: true });
    fs.appendFileSync(crashFile, JSON.stringify(record) + "\n", "utf8");
  } catch (err) {
    console.error("Failed to write crash log:", err);
  }
}

export function getCrashes(lastN = -1): CrashRecord[] {
  if (!fs.existsSync(crashFile)) return [];
  const lines = fs.readFileSync(crashFile, "utf8").trim().split("\n");

  return lines
    .filter(Boolean)
    .slice(lastN == -1 ? undefined : -lastN)
    .map((l) => {
      try {
        return JSON.parse(l);
      } catch {
        return null;
      }
    })
    .filter(Boolean);
}
