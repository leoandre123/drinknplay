import type { PlayerCommunication } from "server/communication/PlayerCommunication";
import type { AvatarSettings } from "../../shared/models/AvatarSettings.ts";

export class Player {
  name: string;
  id: string;
  communication?: PlayerCommunication;

  connected = false;
  disconnectedAt? = 0;
  disconnectTimer?: NodeJS.Timeout = undefined;

  avatarSettings: any;

  glassLevel = 0;
  drunkness = 0;
  score = 0;
  isReady = false;
  gameScore = 0;

  credits = 0;
  glassesToDrink = 0;

  constructor(
    name: string,
    id: string,
    communication: PlayerCommunication,
    avatarSettings: AvatarSettings
  ) {
    this.name = name;
    this.id = id;
    this.communication = communication;
    this.avatarSettings = avatarSettings;
  }

  toDto() {
    return {
      name: this.name,
      id: this.id,

      connected: this.connected,
      disconnectedAt: this.disconnectedAt,

      avatarSettings: this.avatarSettings,

      glassLevel: this.glassLevel,
      drunkness: this.drunkness,
      score: this.score,

      isReady: this.isReady,
      gameScore: this.gameScore,

      credits: this.credits,
      glassesToDrink: this.glassesToDrink,
    };
  }
}
