export class Logger {
  name: string;

  constructor(name: string) {
    this.name = name;
  }

  logFormatted(level: string, msg: any) {
    const time = new Date().toLocaleTimeString();

    if (typeof msg === "object" && msg !== null) {
      console.log(`[${time}][\x1b[32m${this.name}\x1b[0m]:`);
      console.log(msg);
    } else {
      console.log(`[${time}][\x1b[32m${this.name}\x1b[0m]: ${colorMessage(msg, level)}`);
    }

    //return `[${time}][\x1b[32m${this.name}\x1b[0m]: ${colorMessage(msg, level)}`;
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
}
const LEVEL = { DEBUG: 10, INFO: 20, WARN: 30, ERROR: 40 };

const ENV = process.env.NODE_ENV ?? "development";
const MIN_LEVEL = ENV === "production" ? LEVEL.INFO : LEVEL.DEBUG;

const color = {
  red: (s: any) => `\x1b[31m${s}\x1b[0m`,
  green: (s: any) => `\x1b[32m${s}\x1b[0m`,
  yellow: (s: any) => `\x1b[33m${s}\x1b[0m`,
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
