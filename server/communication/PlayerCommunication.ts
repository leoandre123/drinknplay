export interface PlayerCommunication {
  join(room: string): void;
  leave(room: string): void;

  emit(event: string, ...args: any[]): void;

  on(event: string, handler: (...args: any[]) => void): void;
  off(event: string, handler: (...args: any[]) => void): void;

  removeAllListeners(event: string): void;
}
