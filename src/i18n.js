import { createI18n } from "vue-i18n";
import enCommon from "@/locales/en/common.json";
import enLobby from "@/locales/en/lobby.json";
import enGame from "@/locales/en/game.json";
import enResults from "@/locales/en/results.json";
import enReaction from "@/locales/en/reaction.json";
import enKahoot from "@/locales/en/kahoot.json";


import svCommon from "@/locales/sv/common.json";
import svLobby from "@/locales/sv/lobby.json";
import svGame from "@/locales/sv/game.json";
import svResults from "@/locales/sv/results.json";
import svReaction from "@/locales/sv/reaction.json";
import svKahoot from "@/locales/sv/kahoot.json";


export default createI18n({
  legacy: false,
  locale: "en",
  fallbackLocale: "en",
  messages: {
    en: {
      common: enCommon,
      lobby: enLobby,
      game: enGame,
      results: enResults,
      reaction: enReaction,
      kahoot: enKahoot,
    },
    sv: {
      common: svCommon,
      lobby: svLobby,
      game: svGame,
      results: svResults,
      reaction: svReaction,
      kahoot: svKahoot,
    },
  },
});
