export const SOCKET_EVENTS = {
  CONNECT_TO_SERVER: "connection",
  CONNECTED_TO_SERVER: "connect",
  DISCONNECT: "disconnect",
  MAKE_MOVE: "make-move",
  SEND_MOVE: "send-move",
  NEW_GAME: "new-game",
  JOIN_GAME: "join-game"
} as const;
