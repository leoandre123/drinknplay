import { GetRandomAvatar } from "@shared/models/AvatarSettings";
import { BotCommunication } from "../communication/BotCommunication";
import { Player } from "./Player";

export class PlayerBot extends Player {
  constructor(name: string) {
    super(
      name,
      "bot_" + Math.floor(Math.random() * 100000),
      new BotCommunication(),
      GetRandomAvatar()
    );
    this.score = Math.floor(Math.random() * 2000);
  }
}
