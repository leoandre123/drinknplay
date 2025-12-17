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

  socket.on("lobby:joinAsPlayer", function (lobbyCode, name) {
    lobbyManager.getLobby(lobbyCode)?.onPlayerJoined(socket, name);
  });

  socket.on("lobby:joinAsHost", function (lobbyCode) {
    lobbyManager.getLobby(lobbyCode)?.onHostJoined(socket);
  });

  socket.on("disconnect", function () {
    lobbyManager.getLobby(socket.data.lobbyId)?.onPlayerDisconnected(socket.id);
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
}

export { sockets };
