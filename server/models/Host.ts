import { Socket } from "socket.io";

export class Host {
  socket: Socket;
  constructor(socket: Socket) {
    this.socket = socket;
  }
}
