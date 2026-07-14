"use client";

import { useEffect, useRef, useState } from "react";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";

export function useSocketTopic<T>(wsBaseUrl: string, topic: string, onEvent: (event: T) => void) {
  const [connected, setConnected] = useState(false);
  const onEventRef = useRef(onEvent);
  onEventRef.current = onEvent;

  useEffect(() => {
    const client = new Client({
      webSocketFactory: () => new SockJS(`${wsBaseUrl}/ws`) as WebSocket,
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
  }, [wsBaseUrl, topic]);

  return { connected };
}
