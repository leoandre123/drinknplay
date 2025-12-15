function sockets(io, socket, lobbyManager) {
  socket.on("checkLobbyCode", function (lobbyCode) {
    const lobby = lobbyManager.getLobby(lobbyCode);
    console.log(`Check lobby with code ${lobbyCode}`);
    console.log(lobby);
    if (lobby == undefined) {
      socket.emit("checkLobbyCodeResponse", { available: false, reason: "no_lobby" });
    } else if (lobby.phase != "lobby") {
      socket.emit("checkLobbyCodeResponse", { available: false, reason: "started" });
    } else {
      socket.emit("checkLobbyCodeResponse", { available: true });
    }
  });

  socket.on("createLobby", function () {
    const lobbyCode = lobbyManager.createLobby();

    socket.emit("lobbyCreated", lobbyCode);
  });

  socket.on("joinLobby", function (lobbyCode, name) {
    lobbyManager.getLobby(lobbyCode)?.onPlayerJoined(socket, name);
  });

  socket.on("joinLobbyHost", function (lobbyCode) {
    lobbyManager.getLobby(lobbyCode)?.onHostJoined(socket);
  });

  socket.on("disconnect", function () {
    lobbyManager.getLobby(socket.data.lobbyId)?.onPlayerDisconnected(socket.id);
  });

socket.on("reaction:submit", function (lobbyCode, amount, name) {
  const lobby = lobbyManager.getLobby(lobbyCode);
  if (!lobby) return;

  // Skicka bara till host-rummet
  io.to(lobbyCode + "_HOST").emit("reaction:hostUpdate", {
    amount,
    name, 
    playerId: socket.id
  });
});

}

export { sockets };
