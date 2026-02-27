import type { AvatarSettings } from "./AvatarSettings.js";

export type PlayerDto = {
  name: string;
  id: string;
  connected: boolean;
  disconnectedAt?: number;
  avatarSettings: AvatarSettings;
  glassLevel: number;
  drunkness: number;
  score: number;
  isReady: boolean;
  gameScore: number;
  credits: number;
  glassesToDrink: number;
};
