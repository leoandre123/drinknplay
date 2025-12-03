import { readFileSync } from "fs";
import { Minigame } from "../Minigame.js";
import { isWall, isOnTrack } from "../../shared/RacingGameHelper.js";

const MAX_SPEED = 1;
const MAX_SPEED_GRASS = 0.2;
const FRICTION_COEFFICIENT = 0.99;
const FRICTION_COEFFICIENT_GRASS = 0.9;
const BRAKING_COEFFICIENT = 0.5;
const ACCELERATION = 10;

const TILE_SIZE = 128;
const ROAD_WIDTH = 64;

export class RacingGame extends Minigame {
  constructor(noWinCheck = false) {
    super();
    this.tracks = JSON.parse(readFileSync("./server/data/tracks.json"));
    this.track = this.tracks[0];
    this.cars = [];
    this.startTime = 0;
    this.noWinCheck = noWinCheck;

    this.generateTrackData(
      this.track.data,
      this.track.startX,
      this.track.startY,
      this.track.direction
    );
  }

  registerListeners(socket) {
    console.log(`Registering racing listeners for socket ${socket.id}`);
    socket.on("racingInput", (input) => this.onPlayerInput(socket.id, input));
  }

  unregisterListeners(socket) {
    console.log(`Unregistering racing listeners for socket ${socket.id}`);
    socket?.removeAllListeners("racingInput");
  }

  onPlayerJoined(player) {
    console.log(`Player joined race: ${player.id}`);
    this.addPlayer(player.id);
  }
  onPlayerDisconnected(player) {
    this.cars = this.cars.filter((x) => x.id != player.id);
  }

  start() {
    this.startGameLoop();
  }
  stop() {
    this.cancelRequested = true;
  }
  onPlayerInput(playerId, input) {
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

  update(dt) {
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
        return { index: i, distance: c.distance };
      })
      .toSorted((a, b) => a.finishTime - b.finishTime || b.distance - a.distance);

    for (let i = 0; i < order.length; i++) {
      this.cars[order[i].index].place = i;
    }

    if (!this.noWinCheck)
      if (this.cars.every((x) => x.isFinshed)) {
        this.stop();
        setTimeout(this.onFinished, 3000);
      }
  }
  calculateDistance(car) {
    let carTileX = Math.floor(car.x / TILE_SIZE);
    let carTileY = Math.floor(car.y / TILE_SIZE);
    const subTileX = (car.x % TILE_SIZE) / TILE_SIZE;
    const subTileY = (car.y % TILE_SIZE) / TILE_SIZE;

    const tileIndex = this.track.route.findIndex((t) => t.x == carTileX && t.y == carTileY);
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
  checkCollisions(car) {
    let wallCollision = isWall(car.x, car.y, this.track.data, TILE_SIZE, 10);
    while (wallCollision.isWall) {
      car.x += Math.cos(wallCollision.wallNormal) * 0.1;
      car.y += Math.sin(wallCollision.wallNormal) * 0.1;

      wallCollision = isWall(car.x, car.y, this.track.data, TILE_SIZE, 10);
    }
  }
  onEnterNewTile(car) {
    let carTileX = Math.floor(car.x / TILE_SIZE);
    let carTileY = Math.floor(car.y / TILE_SIZE);

    const lastTileIndex = this.track.route.findIndex(
      (t) => t.x == car.lastTileX && t.y == car.lastTileY
    );
    const newTileIndex = this.track.route.findIndex((t) => t.x == carTileX && t.y == carTileY);

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
  onLapFinsihed(car) {
    console.log(`${car.id} finished lap ${car.lap} out of ${this.laps}`);
    if (++car.lap >= this.track.laps) {
      console.log(`${car.id} finished the race`);
      car.isFinshed = true;
      car.finishTime = Date.now();
    }
  }
  addPlayer(id) {
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
  generateTrackData(trackData, startX, startY, direction) {
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
