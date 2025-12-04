import { createI18n } from "vue-i18n";
import enCommon from "@/locales/en/common.json";
import enLobby from "@/locales/en/lobby.json";
import enGame from "@/locales/en/game.json";

import svCommon from "@/locales/sv/common.json";
import svLobby from "@/locales/sv/lobby.json";
import svGame from "@/locales/sv/game.json";

export default createI18n({
  legacy: false,
  locale: "en",
  fallbackLocale: "en",
  messages: {
    en: {
      common: enCommon,
      lobby: enLobby,
      game: enGame,
    },
    sv: {
      common: svCommon,
      lobby: svLobby,
      game: svGame,
    },
  },
});
