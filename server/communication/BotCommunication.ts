import type { PlayerCommunication } from "./PlayerCommunication.js";

export class BotCommunication implements PlayerCommunication {
  constructor() {}

  join(room: string) {}
  leave(room: string) {}

  emit(event: string, ...args: any[]) {}

  on(event: string, handler: (...args: any[]) => void) {}
  off(event: string, handler: (...args: any[]) => void) {}

  removeAllListeners(event: string) {}
  logListeners() {}
}
