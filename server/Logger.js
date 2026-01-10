export class Logger {
  constructor(name) {
    this.name = name;
  }

  fmt(level, msg) {
    const time = new Date().toLocaleTimeString();
    return `[${time}][\x1b[32m${this.name}\x1b[0m]: ${colorMessage(msg, level)}`;
  }

  debug(msg) {
    if (shouldLog("debug")) console.debug(this.fmt("debug", msg));
  }
  info(msg, meta) {
    if (shouldLog("info")) console.info(this.fmt("info", msg, meta));
  }
  warn(msg, meta) {
    if (shouldLog("warn")) console.warn(this.fmt("warn", msg, meta));
  }
  error(msg, meta) {
    if (shouldLog("error")) console.error(this.fmt("error", msg, meta));
  }
}
const LEVELS = { debug: 10, info: 20, warn: 30, error: 40 };

const env = process.env.NODE_ENV ?? "development";
const minLevel = env === "production" ? "info" : "debug";

const color = {
  red: (s) => `\x1b[31m${s}\x1b[0m`,
  green: (s) => `\x1b[32m${s}\x1b[0m`,
  yellow: (s) => `\x1b[33m${s}\x1b[0m`,
  gray: (s) => `\x1b[0;38;5;245;49m${s}\x1b[0m`,
};

function colorMessage(msg, level) {
  switch (level) {
    case "debug":
      return color.gray(msg);
    case "info":
      return msg;
    case "warn":
      return color.yellow(msg);
    case "error":
      return color.red(msg);
  }
}

function shouldLog(level) {
  return LEVELS[level] >= LEVELS[minLevel];
}
