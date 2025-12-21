import { DefaultAvatar, GetRandomAvatar } from "../../shared/AvatarHelper.js";
import { Player } from "./Player.js";

export class PlayerBot extends Player {
  constructor(name) {
    const socket = {
      emit(msg, ...ev) {
        console.log("BOT EMIT: " + msg + " - " + ev);
      },
      on(msg, handler) {},
      join(room) {},
      data: {},
    };

    super(name, "bot_" + Math.floor(Math.random() * 100000), socket, GetRandomAvatar());
    this.score = Math.floor(Math.random() * 2000);
  }
}
