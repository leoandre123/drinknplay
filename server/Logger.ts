import { Server, Socket } from "socket.io";

interface LogEntry {
  timestamp: number;
  level: string;
  message: any;
  context: string;
}

export class Logger {
  name: string;

  private static MAX_LOGS = 300;
  private static buffer: LogEntry[] = [];

  constructor(name: string) {
    this.name = name;
  }

  logFormatted(level: string, msg: any) {
    const time = new Date().toLocaleTimeString();

    if (typeof msg === "object" && msg !== null) {
      const json = safeStringify(msg);
      const syntaxHighlighted = syntaxHighlight(json);

      const entry: LogEntry = {
        level: level,
        message: json,
        timestamp: Date.now(),
        context: this.name,
      };
      Logger.push(entry);

      syntaxHighlighted
        .split("\n")
        .forEach((line) => console.log(`[${time}][\x1b[32m${this.name}\x1b[0m]: ${line}`));
    } else {
      const entry: LogEntry = {
        level: level,
        message: msg,
        timestamp: Date.now(),
        context: this.name,
      };
      Logger.push(entry);
      const formatted = `[${time}][\x1b[32m${this.name}\x1b[0m]: ${colorMessage(msg, level)}`;
      console.log(formatted);
    }
  }

  debug(msg: any) {
    if (shouldLog(LEVEL.DEBUG)) this.logFormatted("debug", msg);
  }
  info(msg: any) {
    if (shouldLog(LEVEL.INFO)) this.logFormatted("info", msg);
  }
  warn(msg: any) {
    if (shouldLog(LEVEL.WARN)) this.logFormatted("warn", msg);
  }
  error(msg: any) {
    if (shouldLog(LEVEL.ERROR)) this.logFormatted("error", msg);
  }

  private static push(entry: LogEntry) {
    Logger.buffer.push(entry);

    // keep only latest N logs
    if (Logger.buffer.length > Logger.MAX_LOGS) {
      Logger.buffer.shift();
    }
  }
  static getRecentLogs() {
    return [...Logger.buffer]; // return copy
  }
}
const LEVEL = { DEBUG: 10, INFO: 20, WARN: 30, ERROR: 40 };

const ENV = process.env.NODE_ENV ?? "development";
const MIN_LEVEL = ENV === "production" ? LEVEL.INFO : LEVEL.DEBUG;

const color = {
  red: (s: any) => `\x1b[31m${s}\x1b[0m`,
  green: (s: any) => `\x1b[32m${s}\x1b[0m`,
  yellow: (s: any) => `\x1b[33m${s}\x1b[0m`,
  white: (s: any) => `\x1b[37m${s}\x1b[0m`,
  gray: (s: any) => `\x1b[0;38;5;245;49m${s}\x1b[0m`,
};

function colorMessage(msg: any, level: string) {
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

function shouldLog(level: number) {
  return level >= MIN_LEVEL;
}

function syntaxHighlight(json: string) {
  json = json.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  return json.replace(
    /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g,
    function (match) {
      if (/^"/.test(match)) {
        if (/:$/.test(match)) {
          //KEY
          return color.white(match);
        } else {
          //STRING
          return color.green(match);
        }
      } else if (/true|false/.test(match)) {
        //BOOL
        return color.yellow(match);
      } else if (/null/.test(match)) {
        //NULL
        return color.yellow(match);
      }
      //NUMBER
      return color.red(match);
    },
  );
}
function safeStringify(value: any, space = 2) {
  const seen = new WeakSet<object>();
  return JSON.stringify(
    value,
    (_key, val) => {
      // Handle Errors (JSON.stringify(new Error()) => {})
      if (val instanceof Error) {
        return {
          __type: "Error",
          name: val.name,
          message: val.message,
          stack: val.stack,
        };
      }

      // Handle BigInt
      if (typeof val === "bigint") return val.toString();

      // Map / Set
      if (val instanceof Map) {
        return { __type: "Map", entries: Array.from(val.entries()) };
      }
      if (val instanceof Set) {
        return { __type: "Set", values: Array.from(val.values()) };
      }

      // Socket.IO objects (replace with summaries)
      //const summarized = summarizeSocketIO(val);
      //if (summarized) return summarized;

      const blacklist = [Socket, Server];
      if (blacklist.some((t) => val instanceof t)) {
        return `[${val?.constructor?.name}]`;
      }

      // Circular detection
      if (val && typeof val === "object") {
        if (seen.has(val)) return "[Circular]";
        seen.add(val);
      }

      return val;
    },
    space,
  );
}
