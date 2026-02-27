import { ClosestWin } from "./minigames/ClosestWin.js";
import { DrawingGame } from "./minigames/DrawingGame.js";
import { KahootGame } from "./minigames/KahootGame.js";
import { RacingGame } from "./minigames/RacingGame.js";
import { ReactionGame } from "./minigames/ReactionGame.js";
import { Mazegame } from "./minigames/MazeGame.js";
import { RouletteGame } from "./minigames/RouletteGame.js";
import type { MinigameCtor } from "./Minigame.js";

export const ALL_GAMES: MinigameCtor[] = [
  RacingGame,
  KahootGame,
  DrawingGame,
  ReactionGame,
  ClosestWin,
  Mazegame,
  RouletteGame,
];
