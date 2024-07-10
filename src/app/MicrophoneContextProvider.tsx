// context/MicrophoneContextProvider.tsx
import React, { createContext, useContext, useState } from "react";

const MicrophoneContext = createContext<any>(null);

export const useMicrophone = () => {
  return useContext(MicrophoneContext);
};

export const MicrophoneProvider: React.FC = ({ children }) => {
  const [microphone, setMicrophone] = useState<MediaRecorder | null>(null);
  const [microphoneState, setMicrophoneState] = useState<string>("CLOSED");

  const setupMicrophone = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const mediaRecorder = new MediaRecorder(stream, {
      mimeType: "audio/webm;codecs=opus",
    });
    setMicrophone(mediaRecorder);
    setMicrophoneState("READY");
  };

  const startMicrophone = () => {
    if (microphone && microphone.state === "inactive") {
      microphone.start(3000); // Collect data in chunks of 1 second
      setMicrophoneState("OPEN");
    }
  };

  return (
    <MicrophoneContext.Provider
      value={{ microphone, setupMicrophone, startMicrophone, microphoneState }}
    >
      {children}
    </MicrophoneContext.Provider>
  );
};


export default MicrophoneProvider