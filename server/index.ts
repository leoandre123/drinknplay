import { createServer } from "http";
import { Server, Socket } from "socket.io";
import { instrument } from "@socket.io/admin-ui";
import { Logger } from "./Logger.js";
import {
  LOBBY_JOIN_AS_HOST,
  LOBBY_JOIN_AS_HOST_RESPONSE,
  LOBBY_JOIN_AS_PLAYER,
  LOBBY_JOIN_AS_PLAYER_RESPONSE,
} from "@shared/contracts/socket-events.js";
import type { JoinLobbyHostResponse, JoinLobbyResponse } from "@shared/contracts/types.js";

const logger = new Logger("SERVER");

logger.info({
  x: 2,
  y: 2,
  obj: { name: "Leo", age: 23, isGood: true },
});

console.log(`
###################################################################################################################
#                                                                                                                 #
#       ____       _       __           _    ____                         _____                                   #
#      / __ \\_____(_)___  / /__   ____ ( )  / __ \\_________ __      __   / ___/___  ______   _____  _____         #
#     / / / / ___/ / __ \\/ //_/  / __ \\|/  / / / / ___/ __ \`/ | /| / /   \\__ \\/ _ \\/ ___/ | / / _ \\/ ___/         #
#    / /_/ / /  / / / / / ,<    / / / /   / /_/ / /  / /_/ /| |/ |/ /   ___/ /  __/ /   | |/ /  __/ /             #
#   /_____/_/  /_/_/ /_/_/|_|  /_/ /_/   /_____/_/   \\__,_/ |__/|__/   /____/\\___/_/    |___/\\___/_/              #
#                                                                                                                 #
###################################################################################################################`);
const httpServer = createServer();
const io = new Server(httpServer, {
  maxHttpBufferSize: 1e7,
  cors: { origin: ["*", "https://admin.socket.io"], credentials: true },
});

instrument(io, { auth: false });

import { LobbyManager } from "./LobbyManager.js";
import { ServerInfo } from "./ServerInfo.js";
import { PlayerBot } from "./models/PlayerBot.js";

let lobbyManager = new LobbyManager(io);

io.on("connection", function (socket) {
  var address = socket.handshake.address;
  logger.debug(`New connection ${socket.id} from ${address}`);
  registerDefaultListeners(io, socket, lobbyManager);
});

const PORT = parseInt(process.env.PORT || "3000");
const HOST = process.env.HOST || (process.env.NODE_ENV === "production" ? "127.0.0.1" : "0.0.0.0");
httpServer.listen(PORT, HOST, () => {
  logger.info(`Socket.io server running on http://${HOST}:${PORT}`);
});

function registerDefaultListeners(io: Server, socket: Socket, lobbyManager: LobbyManager) {
  socket.on("lobby:checkCode", function (lobbyCode) {
    const lobby = lobbyManager.getLobby(lobbyCode);
    if (lobby == undefined) {
      socket.emit("lobby:checkCodeResponse", { available: false, reason: "no_lobby" });
    } else if (lobby.phase != "lobby") {
      socket.emit("lobby:checkCodeResponse", { available: false, reason: "started" });
    } else if (lobby.context.players.length >= lobby.settings.maxPlayers) {
      socket.emit("lobby:checkCodeResponse", { available: false, reason: "lobby_full" });
    } else {
      socket.emit("lobby:checkCodeResponse", { available: true });
    }
  });

  socket.on("lobby:create", function (gameSettings) {
    const lobbyCode = lobbyManager.createLobby(gameSettings);

    socket.emit("lobby:created", lobbyCode);
  });

  socket.on(LOBBY_JOIN_AS_PLAYER, function (lobbyCode, playerId, name, avatarSettings) {
    const lobby = lobbyManager.getLobby(lobbyCode);
    if (!lobby) {
      const resp: JoinLobbyResponse = {
        success: false,
        reason: "no_lobby",
      } as JoinLobbyResponse;
      socket.emit(LOBBY_JOIN_AS_PLAYER_RESPONSE, resp);
      return;
    }
    lobby.onNewPlayerConnection(socket, playerId, name, avatarSettings);
  });

  socket.on(LOBBY_JOIN_AS_HOST, function (lobbyCode) {
    const lobby = lobbyManager.getLobby(lobbyCode);
    if (!lobby) {
      const resp: JoinLobbyHostResponse = {
        success: false,
        reason: "no_lobby",
      } as JoinLobbyResponse;
      socket.emit(LOBBY_JOIN_AS_HOST_RESPONSE, resp);
      return;
    }
    lobby.onHostJoined(socket);
  });

  socket.on("disconnect", function () {
    if (socket.data.lobbyId) {
      if (socket.data.playerId)
        lobbyManager.getLobby(socket.data.lobbyId)?.onPlayerDisconnected(socket.data.playerId);
      else lobbyManager.getLobby(socket.data.lobbyId)?.onHostDisconnected(socket);
    }
  });

  socket.on("debug:getAllLobbies", function () {
    socket.emit(
      "debug:allLobbies",
      lobbyManager.lobbies.map((x) => {
        return {
          id: x.context.lobbyId,
          playerCount: x.context.players.length,
        };
      })
    );
  });
  socket.on("debug:startMinigame", function (gameIndex) {
    const lobby = lobbyManager.getLobby(socket.data.lobbyId);
    lobby?.selectGame(gameIndex);
    lobby?.startLoadingScreen();
  });

  socket.on("debug:addBot", function (name) {
    const lobby = lobbyManager.getLobby(socket.data.lobbyId);
    if (!lobby) return;
    lobby.onPlayerJoined(new PlayerBot(name), true);
  });

  socket.on("admin:requestUpdate", function () {
    socket.emit(
      "admin:allLobbies",
      lobbyManager.lobbies.map((l) => {
        return {
          id: l.context.lobbyId,
          phase: l.phase,
          players: l.context.players.map((p) => p.toDto()),
        };
      })
    );
    socket.emit("admin:serverInfo", ServerInfo);
  });

  //TODO: Move to game
  socket.on("reaction:submit", function (lobbyCode, amount, name) {
    const lobby = lobbyManager.getLobby(lobbyCode);
    if (!lobby) return;
    // Skicka bara till host-rummet
    io.to(lobbyCode + "_HOST").emit("reaction:hostUpdate", {
      amount,
      name,
      playerId: socket.id,
    });
  });
}
