import "dotenv/config";
import { createServer } from "http";
import { Namespace, Server, Socket } from "socket.io";
import { Logger } from "./Logger.js";
import {
  LOBBY_JOIN_AS_HOST,
  LOBBY_JOIN_AS_HOST_RESPONSE,
  LOBBY_JOIN_AS_PLAYER,
  LOBBY_JOIN_AS_PLAYER_RESPONSE,
} from "@shared/contracts/socket-events.js";
import type { JoinLobbyHostResponse, JoinLobbyResponse } from "@shared/contracts/types.js";
import { LobbyManager } from "./LobbyManager.js";
import { ENVIRONTMENT, getServerInfo, VERSION } from "./ServerInfo.js";
import { PlayerBot } from "./models/PlayerBot.js";

const logger = new Logger("SERVER");

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
logger.info("Starting Drink n' Draw Server");
logger.info(`Version: ${VERSION}`);
logger.info(`Environment: ${ENVIRONTMENT}`);
console.log();
console.log();
console.log();

const httpServer = createServer();
const io = new Server(httpServer, {
  maxHttpBufferSize: 1e7,
  cors: { origin: ["*", "https://admin.socket.io"], credentials: true },
});

let lobbyManager = new LobbyManager(io);

io.on("connection", function (socket) {
  var address = socket.handshake.address;
  logger.debug(`New connection ${socket.id} from ${address}`);
  registerDefaultListeners(io, socket, lobbyManager);
});

const admin = io.of("/admin");

admin.use((socket, next) => {
  const token = socket.handshake.auth?.adminToken;
  const ok = token && token === process.env.ADMIN_TOKEN;
  if (!ok) {
    next(new Error("Not authorized"));
  } else {
    next();
  }
});

admin.on("connection", function (socket) {
  registerAdminListeners(socket);
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
      }),
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

function registerAdminListeners(socket: Socket) {
  socket.on("admin:requestUpdate", function () {
    socket.emit(
      "admin:allLobbies",
      lobbyManager.lobbies.map((l) => l.toDto()),
    );

    const info = getServerInfo();
    socket.emit("admin:serverInfo", info);

    socket.emit("admin:recent_logs", Logger.getRecentLogs());
  });

  socket.on("admin:killLobby", function (id: string) {
    lobbyManager.killLobby(id);
  });
  socket.on("admin:killServer", () => {
    process.exit();
  });
}
