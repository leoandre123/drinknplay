import { createServer } from "http";
import { Server } from "socket.io";
import { instrument } from "@socket.io/admin-ui";
import { Logger } from "./logger.js";

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
const httpServer = createServer();
const io = new Server(httpServer, {
  maxHttpBufferSize: 1e7,
  cors: { origin: ["*", "https://admin.socket.io"], credentials: true },
});

instrument(io, { auth: false });

import { LobbyManager } from "./LobbyManager.js";
import { sockets } from "./sockets.js";

let lobbyManager = new LobbyManager(io);

io.on("connection", function (socket) {
  var address = socket.handshake.address;
  logger.debug(`New connection ${socket.id} from ${address}`);
  sockets(this, socket, lobbyManager);
});

const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, "0.0.0.0", () => {
  logger.info("Socket.io server running on http://0.0.0.0:" + PORT);
});
