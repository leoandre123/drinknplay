import { Minigame } from "../Minigame";
import  allTracks  from "../data/tracks.json" with { type: 'json' };
import type { ServerLobbyContext } from "server/models/ServerLobbyContext.js";
import type { GameResult } from "server/models/GameResult.js";
import type { Player } from "server/models/Player.js";
import type { Host } from "server/models/Host";
import {isOnTrack, isWall} from "@shared/minigames/racing/RacingGameHelper"

const MAX_SPEED = 1;
const MAX_SPEED_GRASS = 0.2;
const FRICTION_COEFFICIENT = 0.99;
const FRICTION_COEFFICIENT_GRASS = 0.9;
const BRAKING_COEFFICIENT = 0.5;
const ACCELERATION = 10;

const TILE_SIZE = 128;
const ROAD_WIDTH = 64;

export class RacingGame extends Minigame {

  track: any;
  cars: any[];
  startTime: number;
  cancelRequested = false;


  constructor(context: ServerLobbyContext, onFinished: (results: GameResult) => void) {
    super(context, onFinished);
    this.track = allTracks[0];
    this.cars = [];
    this.startTime = 0;

    this.generateTrackData(
      this.track.data,
      this.track.startX,
      this.track.startY,
      this.track.direction
    );
  }

  registerListeners(player: Player) {
    player.communication?.on("racingInput", (input) => this.onPlayerInput(player.id, input));
  }

  unregisterListeners(player: Player) {
    player.communication?.removeAllListeners("racingInput");
  }

  onPlayerJoined(player: Player) {
    console.log(`Player joined race: ${player.id}`);
    this.addPlayer(player.id);
  }
  onPlayerDisconnected(player: Player) {
    this.cars = this.cars.filter((x) => x.id != player.id);
  }

  onHostJoined(_: Host){}

  start() {
    this.startGameLoop();
  }
  stop() {
    this.cancelRequested = true;
  }
  onPlayerInput(playerId: string, input: any) {
    this.cars.find((x) => x.id == playerId).input = input;
  }

  startGameLoop() {
    const TICK_RATE = 60;
    const MS_PER_TICK = 1000 / TICK_RATE;
    const SECONDS_PER_TICK = 1 / TICK_RATE;
    let lastTime = Date.now();
    let accumulator = 0;

    const loop = () => {
      if (this.cancelRequested) return;
      const now = Date.now();
      const delta = now - lastTime;
      accumulator += delta;

      while (accumulator >= MS_PER_TICK) {
        this.update(SECONDS_PER_TICK);
        accumulator -= MS_PER_TICK;
        //TODO: Skicka inte allt varje tick/endast bilar
        this.broadcastHosts("updateCars", this.cars);
        this.broadcastHosts("setTrack", this.track);
        this.broadcastHosts("setStartTime", this.startTime);
      }

      lastTime = now;
      setImmediate(loop);
    };

    loop();
  }

  update(dt: number) {
    for (let car of this.cars) {
      this.checkCollisions(car);
      this.calculateDistance(car);

      if (car.isFinshed) continue;

      const onTrack = isOnTrack(car.x, car.y, this.track.data, TILE_SIZE, ROAD_WIDTH);
      const steer = car.input.steer * car.speed;

      car.angle += steer * dt;

      if (car.input.gas) {
        car.speed = Math.min(
          car.speed + ACCELERATION * dt,
          onTrack ? MAX_SPEED + (car.input.boost || 0) : MAX_SPEED_GRASS
        );
      } else {
        car.speed *= onTrack ? FRICTION_COEFFICIENT : FRICTION_COEFFICIENT_GRASS;
        if (car.speed < 0.01) {
          car.speed = 0;
        }
      }

      if (car.input.brake) {
        if (car.speed > 0) car.speed *= BRAKING_COEFFICIENT;
        else
          car.speed = Math.max(
            car.speed - ACCELERATION * dt,
            onTrack ? -MAX_SPEED : -MAX_SPEED_GRASS
          );
      }

      car.x += Math.cos(car.angle) * car.speed;
      car.y += Math.sin(car.angle) * car.speed;

      let carTileX = Math.floor(car.x / TILE_SIZE);
      let carTileY = Math.floor(car.y / TILE_SIZE);

      if (carTileX != car.lastTileX || carTileY != car.lastTileY) {
        this.onEnterNewTile(car);
      }
    }

    let order = this.cars
      .map((c, i) => {
        return { index: i, finishTime: c.finishTime, distance: c.distance };
      })
      .toSorted((a, b) => a.finishTime - b.finishTime || b.distance - a.distance);

    for (let i = 0; i < order.length; i++) {
      this.cars[order[i].index].place = i;
    }

      if (this.cars.every((x) => x.isFinshed)) {
        this.stop();

        const results: GameResult = {
          type: "ranking",
          data: this.cars
            .toSorted((a, b) => a.finishTime - b.finishTime)
            .map((c) => ({ playerId: c.id })),
        };

        setTimeout(() => {
          this.onFinished?.(results);
        }, 3000);
      }
  }
  calculateDistance(car: any) {
    let carTileX = Math.floor(car.x / TILE_SIZE);
    let carTileY = Math.floor(car.y / TILE_SIZE);
    const subTileX = (car.x % TILE_SIZE) / TILE_SIZE;
    const subTileY = (car.y % TILE_SIZE) / TILE_SIZE;

    const tileIndex = this.track.route.findIndex((t: any) => t.x == carTileX && t.y == carTileY);
    if (tileIndex == -1) {
      console.log("WTF!!!!");
      return;
    }
    let dist = car.lap * this.track.route.length + tileIndex;
    switch (this.track.route[tileIndex].direction) {
      case "north":
        dist += 1 - subTileY;
        break;
      case "south":
        dist += subTileY;
        break;
      case "west":
        dist += 1 - subTileX;
        break;
      case "east":
        dist += subTileX;
        break;
    }

    car.distance = dist;
  }
  checkCollisions(car: any) {
    let wallCollision = isWall(car.x, car.y, this.track.data, TILE_SIZE, 10);
    while (wallCollision.isWall) {
      car.x += Math.cos(wallCollision.wallNormal!) * 0.1;
      car.y += Math.sin(wallCollision.wallNormal!) * 0.1;

      wallCollision = isWall(car.x, car.y, this.track.data, TILE_SIZE, 10);
    }
  }
  onEnterNewTile(car: any) {
    let carTileX = Math.floor(car.x / TILE_SIZE);
    let carTileY = Math.floor(car.y / TILE_SIZE);

    const lastTileIndex = this.track.route.findIndex(
      (t: any) => t.x == car.lastTileX && t.y == car.lastTileY
    );
    const newTileIndex = this.track.route.findIndex((t: any) => t.x == carTileX && t.y == carTileY);

    console.log(`${lastTileIndex} -> ${newTileIndex}`);

    if (newTileIndex == lastTileIndex + 1) {
      car.tilesStack.push({ x: carTileX, y: carTileY });
    } else if (newTileIndex == lastTileIndex - 1) {
      car.tilesStack.pop();
    } else if (lastTileIndex == this.track.route.length - 1 && newTileIndex == 0) {
      car.tilesStack = [{ x: carTileX, y: carTileY }];
      this.onLapFinsihed(car);
    } else {
      console.log("ERROR INVALID PATH");
    }

    car.lastTileX = carTileX;
    car.lastTileY = carTileY;
  }
  onLapFinsihed(car: any) {
    console.log(`${car.id} finished lap ${car.lap} out of ${this.track.laps}`);
    if (++car.lap >= this.track.laps) {
      console.log(`${car.id} finished the race`);
      car.isFinshed = true;
      car.finishTime = Date.now();
    }
  }
  addPlayer(id: string) {
    this.cars.push({
      id: id,
      input: {
        steer: 0,
        gas: 0,
        brake: 0,
      },
      tilesStack: [{ x: this.track.startX, y: this.track.startY }],
      lastTileX: this.track.startX,
      lastTileY: this.track.startY,
      x: (this.track.startX + 0.5) * TILE_SIZE,
      y: (this.track.startY + 0.5) * TILE_SIZE,
      angle: 0,
      speed: 0,
      place: 0,
      lap: 0,
      isFinshed: false,
      finishTime: Number.MAX_SAFE_INTEGER,
      distance: 0,
    });
  }
  generateTrackData(trackData: any[], startX: number, startY: number, direction: string) {
    this.track.data = trackData;
    this.track.width = trackData[0].length;
    this.track.height = trackData.length;
    this.track.startX = startX;
    this.track.startY = startY;
    this.track.laps = 3;

    //let prevX = startX;
    //let prevY = startY;

    let route = [];

    let x = startX;
    let y = startY;

    let max = 50;
    do {
      if (max-- <= 0) {
        break;
      }
      let currentTile = trackData[y][x];
      route.push({ x: x, y: y, direction: direction });

      switch (currentTile) {
        case "─":
          if (direction == "east") x++;
          else x--;
          break;
        case "│":
          if (direction == "south") y++;
          else y--;
          break;
        case "┌":
          if (direction == "north") {
            x++;
            direction = "east";
          } else {
            y++;
            direction = "south";
          }
          break;
        case "┐":
          if (direction == "east") {
            y++;
            direction = "south";
          } else {
            x--;
            direction = "west";
          }
          break;
        case "┘":
          if (direction == "east") {
            y--;
            direction = "north";
          } else {
            x--;
            direction = "west";
          }
          break;
        case "└":
          if (direction == "south") {
            x++;
            direction = "east";
          } else {
            y--;
            direction = "north";
          }
          break;
        default:
          console.log("ERROR !!!!!!!!!!!!!!!!!");
          break;
      }

      route[route.length - 1].direction = direction;
    } while (x != startX || y != startY);

    this.track.route = route;
  }
}
