import { Server } from "socket.io";
import { Player } from "./Player";
import { Host } from "./Host";

export class ServerLobbyContext {
  io: Server;
  lobbyId: string;

  players: Player[];
  hosts: Host[];

  constructor(io: Server, lobbyId: string) {
    this.io = io;
    this.lobbyId = lobbyId;
    this.players = [];
    this.hosts = [];
  }
}
