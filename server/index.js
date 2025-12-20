import { createServer } from "http";
import { Server } from "socket.io";
import { instrument } from "@socket.io/admin-ui";

const httpServer = createServer();
const io = new Server(httpServer, {
  cors: { origin: ["*", "https://admin.socket.io"], credentials: true },
});

instrument(io, { auth: false });

import { LobbyManager } from "./LobbyManager.js";
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
