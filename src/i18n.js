import { createI18n } from "vue-i18n";
import enCommon from "@/locales/en/common.json";
import enLobby from "@/locales/en/lobby.json";
import enGame from "@/locales/en/game.json";
import enResults from "@/locales/en/results.json";
import enRoulette from "@/locales/en/roulette.json";
import enReaction from "@/locales/en/reaction.json";
import enKahoot from "@/locales/en/kahoot.json";
import enLobbyInfo from "@/locales/en/lobbyInfo.json";

import svCommon from "@/locales/sv/common.json";
import svLobby from "@/locales/sv/lobby.json";
import svGame from "@/locales/sv/game.json";
import svResults from "@/locales/sv/results.json";
import svReaction from "@/locales/sv/reaction.json";
import svKahoot from "@/locales/sv/kahoot.json";

import svRoulette from "@/locales/sv/roulette.json";
import svLobbyInfo from "@/locales/sv/lobbyInfo.json";


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
      roulette: enRoulette,
      reaction: enReaction,
      kahoot: enKahoot,

      lobbyInfo: enLobbyInfo,
    },
    sv: {
      common: svCommon,
      lobby: svLobby,
      game: svGame,
      results: svResults,
      roulette: svRoulette,
      reaction: svReaction,
      kahoot: svKahoot,

      lobbyInfo: svLobbyInfo
    },
  },
});
