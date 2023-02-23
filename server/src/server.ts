import express from "express";
import http from "http";
import { Server } from "socket.io";
import { Chess } from "./chess";
import { SOCKET_EVENTS } from "./socketEvents";
import * as ListenerTypes from "./socketListenerArgTypes";

const PORT = 3000;
const CLIENT_URL = "http://localhost:5173";

const app: express.Application = express();

const chess = new Chess();

app.get("/", (req: express.Request, res: express.Response) => {
  res.send("Hello world!");
});

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: CLIENT_URL
  }
});

io.on(SOCKET_EVENTS.CONNECT_TO_SERVER, socket => {
  console.log("Connected", socket.id);
  console.log(io.sockets.sockets.size);

  socket.on(SOCKET_EVENTS.MAKE_MOVE, (move: ListenerTypes.MakeMove) => {
    chess.move(move);

    io.emit(SOCKET_EVENTS.SEND_MOVE, { fen: chess.fen() });
  });

  socket.on(SOCKET_EVENTS.DISCONNECT, () => {
    console.log(socket.id, "disconnected");
    console.log(io.sockets.sockets.size);
  });
});

server.listen(PORT, () => {
  console.log("Server listening on http://localhost:" + PORT);
});
