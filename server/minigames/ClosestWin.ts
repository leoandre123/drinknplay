import type { Player } from "server/models/Player.js";
import { geoDistance } from "@shared/utils/MathHelper.js";
import { CLOSEST_ROUND_TIMER, CLOSEST_ROUNDS_PER_GAME } from "@shared/Constants";
import { Minigame } from "../Minigame.js";
import allLocations from "../data/closest-locations.json";
import type { Host } from "server/models/Host.js";
import type { ServerLobbyContext } from "server/models/ServerLobbyContext.ts";
import type { GameResult } from "server/models/GameResult.ts";
import type { ClosestLocation, ClosestPlayer } from "@shared/minigames/closest/types";

export class ClosestWin extends Minigame {
  locations: ClosestLocation[];
  roundCount: number;
  currentRound: number;
  endTime: number;
  currentLocation: ClosestLocation;
  closestPlayers: ClosestPlayer[];

  constructor(context: ServerLobbyContext, onFinished: (results: GameResult) => void) {
    super(context, onFinished);
    this.locations = allLocations;

    this.roundCount = CLOSEST_ROUNDS_PER_GAME;
    this.currentRound = 0;
    this.endTime = 0;
    this.currentLocation = this.locations[0];
    this.closestPlayers = [];
  }

  onPlayerJoined(player: Player) {
    this.closestPlayers.push({
      id: player.id,
      points: 0,
      pos: [0, 0],
    });
    this.broadcastHosts("closest:updatePlayers", this.closestPlayers);
  }
  onPlayerRejoined(player: Player) {}
  onPlayerDisconnected(player: Player) {
    this.closestPlayers = this.closestPlayers.filter((p) => p.id != player.id);
    this.broadcastHosts("closest:updatePlayers", this.closestPlayers);
  }

  onHostJoined(host: Host) {
    console.log("HOST JOINED CLOSEST GAME");
    host.socket.emit("closest:setLocation", this.currentLocation);
    host.socket.emit("closest:updateRound", this.currentRound, this.roundCount);
    host.socket.emit("closest:startRound", this.endTime);
    host.socket.emit("closest:updatePlayers", this.closestPlayers);
  }

  registerListeners(player: Player) {
    player.communication?.on("closest:updatePosition", (pos) => {
      const cp = this.closestPlayers.find((p) => p.id == player.id);
      if (cp) cp.pos = pos;
    });
  }
  unregisterListeners(player: Player) {
    player.communication?.removeAllListeners("closest:updatePosition");
  }

  start() {
    this.startRound();
  }
  stop() {}

  startRound() {
    this.currentLocation = this.locations[Math.floor(Math.random() * this.locations.length)];

    this.endTime = Date.now() + CLOSEST_ROUND_TIMER;
    this.broadcastHosts("closest:setLocation", this.currentLocation);
    this.broadcast("closest:updateRound", this.currentRound, this.roundCount);
    this.broadcast("closest:startRound", this.endTime);

    setTimeout(() => {
      const results = this.closestPlayers.map((p) => {
        return {
          id: p.id,
          distance: geoDistance(p.pos, this.currentLocation.pos),
        };
      });

      results.sort((a, b) => a.distance - b.distance);

      results.forEach((r) => {
        console.log("Dist: ", r.distance);
      });

      for (let i = 0; i < Math.min(3, results.length); i++) {
        const cp = this.closestPlayers.find((x) => x.id == results[i].id);
        if (cp) cp.points += 3 - i;
      }

      this.broadcastHosts("closest:updatePlayers", this.closestPlayers);
      this.onRoundFinished();
    }, CLOSEST_ROUND_TIMER);
  }

  onRoundFinished() {
    this.currentRound++;
    console.log(this.currentRound);
    if (this.currentRound < this.roundCount) {
      setTimeout(() => this.startRound(), 15_000);
    } else {
      this.onFinished({
        type: "scores",
        data: this.closestPlayers.map((cp) => ({ playerId: cp.id, score: cp.points })),
      });
    }
  }
}
