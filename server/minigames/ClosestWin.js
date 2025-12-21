import { geoDistance } from "../../shared/MathHelper.js";
import { Minigame } from "../Minigame.js";
import { readFileSync } from "fs";

export class ClosestWin extends Minigame {
  constructor() {
    super();
    this.locations = JSON.parse(readFileSync("./server/data/closest-locations.json"));

    this.roundCount = 5;
    this.currentRound = 0;
    this.endTime = 0;
    this.currentLocation = this.locations[0];
    this.reactionPlayers = [];
  }

  onPlayerJoined(player) {
    this.reactionPlayers.push({
      id: player.id,
      points: 0,
      pos: [0, 0],
    });
    this.broadcastHosts("closest:updatePlayers", this.reactionPlayers);
  }
  onPlayerDisconnected(player) {
    this.reactionPlayers = this.reactionPlayers.filter((p) => p.id != player.id);
    this.broadcastHosts("closest:updatePlayers", this.reactionPlayers);
  }

  onHostJoined(socket) {
    console.log("HOST JOINED CLOSEST GAME");
    socket.emit("closest:setLocation", this.currentLocation);
    socket.emit("closest:updateRound", this.currentRound, this.roundCount);
    socket.emit("closest:startRound", this.endTime);
    socket.emit("closest:updatePlayers", this.reactionPlayers);
  }

  registerListeners(socket) {
    socket.on("closest:updatePosition", (pos) => {
      this.reactionPlayers.find((p) => p.id == socket.data.playerId).pos = pos;
    });
  }
  unregisterListeners(socket) {
    socket.removeAllListeners("closest:updatePosition");
  }

  start() {
    this.startRound();
  }
  stop() {}

  startRound() {
    this.currentLocation = this.locations[Math.floor(Math.random() * this.locations.length)];

    const guessTime = 25_000;

    this.endTime = Date.now() + guessTime;
    this.broadcastHosts("closest:setLocation", this.currentLocation);
    this.broadcast("closest:updateRound", this.currentRound, this.roundCount);
    this.broadcast("closest:startRound", this.endTime);

    setTimeout(() => {
      const results = this.reactionPlayers.map((p) => {
        return {
          id: p.id,
          distance: geoDistance(p.pos, this.currentLocation.pos),
        };
      });

      results.sort((a, b) => a.distance - b.distance);

      results.forEach((r) => {
        console.log("Dist: ", r.distance);
      });

      for (let i = 0; i < Math.min(3, results.length); i++)
        this.reactionPlayers.find((x) => x.id == results[i].id).points += 3 - i;

      this.broadcastHosts("closest:updatePlayers", this.reactionPlayers);
      this.onRoundFinished();
    }, guessTime);
  }

  onRoundFinished() {
    this.currentRound++;
    console.log(this.currentRound);
    if (this.currentRound < this.roundCount) {
      setTimeout(() => this.startRound(), 15_000);
    } else {
      this.onFinished([]);
    }
  }
}
