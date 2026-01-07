import { PlayerBot } from "./models/PlayerBot.js";
import { ServerInfo } from "./ServerInfo.js";

/**
 * @param {import("socket.io").Server} io
 * @param {import("socket.io").Socket} socket
 * @param {import("./LobbyManager.js").LobbyManager} lobbyManager
 */

function sockets(io, socket, lobbyManager) {
  socket.on("lobby:checkCode", function (lobbyCode) {
    const lobby = lobbyManager.getLobby(lobbyCode);
    console.log(`Check lobby with code ${lobbyCode}`);
    console.log(lobby);
    if (lobby == undefined) {
      socket.emit("lobby:checkCodeResponse", { available: false, reason: "no_lobby" });
    } else if (lobby.phase != "lobby") {
      socket.emit("lobby:checkCodeResponse", { available: false, reason: "started" });
    } else {
      socket.emit("lobby:checkCodeResponse", { available: true });
    }
  });

  socket.on("lobby:create", function (gameSettings) {
    const lobbyCode = lobbyManager.createLobby(gameSettings);

    socket.emit("lobby:created", lobbyCode);
  });

  socket.on("lobby:joinAsPlayer", function (lobbyCode, playerId, name, avatarSettings) {
    lobbyManager.getLobby(lobbyCode)?.onNewPlayerConnection(socket, playerId, name, avatarSettings);
  });

  socket.on("lobby:joinAsHost", function (lobbyCode) {
    lobbyManager.getLobby(lobbyCode)?.onHostJoined(socket);
  });

  socket.on("disconnect", function () {
    lobbyManager.getLobby(socket.data.lobbyId)?.onPlayerDisconnected(socket.data.playerId);
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
    lobby.onPlayerJoined(new PlayerBot(name), true);
  });

  socket.on("admin:requestUpdate", function () {
    socket.emit(
      "admin:allLobbies",
      lobbyManager.lobbies.map((l) => {
        return {
          id: l.context.lobbyId,
          phase: l.phase,
          players: l.context.players.map(({ socket, ...rest }) => rest),
        };
      })
    );
    socket.emit("admin:serverInfo", ServerInfo);
  });

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

export { sockets };
