"use client";

import { useEffect, useRef, useState } from "react";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";

const REDIS_LAB_WS_URL =
  process.env.NEXT_PUBLIC_REDIS_LAB_URL ?? "http://localhost:8081";

export function useSocketTopic<T>(topic: string, onEvent: (event: T) => void) {
  const [connected, setConnected] = useState(false);
  const onEventRef = useRef(onEvent);
  onEventRef.current = onEvent;

  useEffect(() => {
    const client = new Client({
      webSocketFactory: () => new SockJS(`${REDIS_LAB_WS_URL}/ws`) as WebSocket,
      reconnectDelay: 3000,
      onConnect: () => {
        setConnected(true);
        client.subscribe(topic, (message) => {
          onEventRef.current(JSON.parse(message.body) as T);
        });
      },
      onDisconnect: () => setConnected(false),
      onWebSocketClose: () => setConnected(false),
    });

    client.activate();

    return () => {
      client.deactivate();
    };
  }, [topic]);

  return { connected };
}
