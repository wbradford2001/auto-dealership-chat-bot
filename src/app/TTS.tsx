import React, { useEffect, useState } from 'react';

export const readMessageAloud = async (text: string): Promise<string> => {
  const url = "https://api.deepgram.com/v1/speak?model=aura-asteria-en";
  const apiKey = "1a76586463d37e92d561966f88c045b910a14556";
  
  const body = JSON.stringify({ text });

  const headers = {
    Authorization: `Token ${apiKey}`,
    "Content-Type": "application/json",
  };

  const options = {
    method: "POST",
    headers: headers,
    body: body,
  };

  const response = await fetch(url, options);
  if (!response.ok) {
    throw new Error("Failed to make request: " + response.statusText);
  }

  const blob = await response.blob();
  const objectUrl = URL.createObjectURL(blob);

  return objectUrl;
};

interface AudioPlayerProps {
  responseMessage: string;
}

const AudioPlayer: React.FC<AudioPlayerProps> = ({ responseMessage }) => {
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  const fetchAndPlayAudio = async () => {
    try {
      const url = await readMessageAloud(responseMessage);
      setAudioUrl(url);
    } catch (error) {
      console.error("Error:", error);
    }
  };

  useEffect(() => {
    if (responseMessage) {
      fetchAndPlayAudio();
    }
  }, [responseMessage]);

  useEffect(() => {
    if (audioUrl) {
      const audio = new Audio(audioUrl);
      audio.play().catch((error) => {
        console.error("Audio playback failed:", error);
      });
    }
  }, [audioUrl]);

  return (
    <div>
      {audioUrl && <audio src={audioUrl} autoPlay />}
    </div>
  );
};

export default AudioPlayer;
