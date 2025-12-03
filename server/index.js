import { createServer } from "http";
import { Server } from "socket.io";

const httpServer = createServer();
const io = new Server(httpServer, {
  cors: { origin: "*" },
});

// Read in the "class" to store all our data on the server side
// If you need to change how data is handled, check the Data.js file!

import { Data } from "./Data.js";
import { LobbyManager } from "./LobbyManager.js";

//
import { sockets } from "./sockets.js";

let lobbyManager = new LobbyManager(io);

io.on("connection", function (socket) {
  var address = socket.handshake.address;
  console.log(`New connection ${socket.id} from ${address}`);
  sockets(this, socket, lobbyManager);
});

const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, "0.0.0.0", () => {
  console.log("Socket.io server running on http://0.0.0.0:" + PORT);
});
