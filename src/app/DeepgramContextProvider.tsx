// context/DeepgramContextProvider.tsx
import React, { createContext, useContext, useState } from "react";
import { createClient, LiveTranscriptionEvents } from "@deepgram/sdk";

const DeepgramContext = createContext<any>(null);

export const useDeepgram = () => {
  return useContext(DeepgramContext);
};

export const DeepgramProvider: React.FC = ({ children }) => {
  const [connection, setConnection] = useState<any>(null);
  const [connectionState, setConnectionState] = useState<string>("CLOSED");

  const connectToDeepgram = (options: any) => {
    const deepgram = createClient('1a76586463d37e92d561966f88c045b910a14556');
    const conn = deepgram.listen.live(options);
    setConnection(conn);

    conn.addListener(LiveTranscriptionEvents.Open, () => {
      setConnectionState("OPEN");
    });

    conn.addListener(LiveTranscriptionEvents.Close, () => {
      setConnectionState("CLOSED");
    });

    return conn;
  };

  return (
    <DeepgramContext.Provider value={{ connection, connectToDeepgram, connectionState }}>
      {children}
    </DeepgramContext.Provider>
  );
};

export default DeepgramProvider
