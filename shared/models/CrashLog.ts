export type CrashRecord = {
  ts: string;
  pid: number;
  nodeVersion: string;
  appVersion?: string;
  type: "uncaughtException" | "unhandledRejection" | "signal" | "manual";
  message?: string;
  stack?: string;
};
