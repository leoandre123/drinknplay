import { ClosestWin } from "./minigames/ClosestWin";
import { DrawingGame } from "./minigames/DrawingGame";
import { KahootGame } from "./minigames/KahootGame";
import { RacingGame } from "./minigames/RacingGame";
import { ReactionGame } from "./minigames/ReactionGame";
import { Mazegame } from "./minigames/MazeGame";
import { RouletteGame } from "./minigames/RouletteGame";
import type { MinigameCtor } from "./Minigame";

export const ALL_GAMES: MinigameCtor[] = [
  RacingGame,
  KahootGame,
  DrawingGame,
  ReactionGame,
  ClosestWin,
  Mazegame,
  RouletteGame,
];
