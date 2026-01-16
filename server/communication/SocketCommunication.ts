import { Socket } from "socket.io";
import type { PlayerCommunication } from "./PlayerCommunication";

export class SocketCommunication implements PlayerCommunication {
  socket: Socket;

  constructor(socket: Socket) {
    this.socket = socket;
  }

  join(room: string) {
    this.socket.join(room);
  }
  leave(room: string) {
    this.socket.leave(room);
  }

  emit(event: string, ...args: any[]) {
    this.socket.emit(event, ...args);
  }

  on(event: string, handler: (...args: any[]) => void) {
    this.socket.on(event, handler);
  }
  off(event: string, handler: (...args: any[]) => void) {
    this.socket.off(event, handler);
  }

  removeAllListeners(event: string) {
    this.socket.removeAllListeners(event);
  }

  logListeners() {
    console.log(this.socket.eventNames());
  }
}
