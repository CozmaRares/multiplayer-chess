import { useEffect, useRef } from "react";
import { io, ManagerOptions, SocketOptions } from "socket.io-client";

export default function useSocket(
  url: string,
  options?: Partial<ManagerOptions & SocketOptions>
) {
  const socket = useRef(io(url, options)).current;

  useEffect(() => {
    return () => {
      if (socket.connected) socket.disconnect();
    };
  }, [url]);

  return socket;
}
