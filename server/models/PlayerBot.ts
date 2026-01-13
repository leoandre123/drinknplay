import { BotCommunication } from "../communication/BotCommunication";
import { Player } from "./Player";
import { AvatarSettings } from "../../shared/models/AvatarSettings";

export class PlayerBot extends Player {
  constructor(name: string) {
    super(
      name,
      "bot_" + Math.floor(Math.random() * 100000),
      new BotCommunication(),
      AvatarSettings.GetRandomAvatar()
    );
    this.score = Math.floor(Math.random() * 2000);
  }
}
