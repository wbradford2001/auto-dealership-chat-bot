"use client";

import { useState, useRef, useEffect } from 'react';
import { WaveFile } from 'wavefile';
import { createClient, LiveTranscriptionEvents } from "@deepgram/sdk";

interface AudioRecorderProps {
  keywords: string[];
  parentHandleResponse: (response: string) => void;
}

const AudioRecorder: React.FC<AudioRecorderProps> = ({ keywords, parentHandleResponse }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<BlobPart[]>([]);
  const connectionRef = useRef<any>(null);
  const silenceTimerRef = useRef<NodeJS.Timeout | null>(null);

  const deepgram = createClient('1a76586463d37e92d561966f88c045b910a14556');

  const startRecording = async () => {
    console.log("Starting recording");

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = async () => {
        console.log("Media stopped");
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const arrayBuffer = await audioBlob.arrayBuffer();
        const audioBuffer = await new AudioContext().decodeAudioData(arrayBuffer);

        // Convert to WAV
        const wav = new WaveFile();
        const float32Array = audioBuffer.getChannelData(0);
        const buffer = new Int16Array(float32Array.length);
        for (let i = 0; i < float32Array.length; i++) {
          buffer[i] = Math.max(-1, Math.min(1, float32Array[i])) * 0x7FFF;
        }
        wav.fromScratch(1, audioBuffer.sampleRate, '16', buffer);

        // Change sample rate to 8 kHz
        wav.toSampleRate(8000);

        // Convert to 8-bit mu-law
        wav.toMuLaw();

        const muLawBlob = new Blob([wav.toBuffer()], { type: 'audio/mulaw' });
        const muLawUrl = URL.createObjectURL(muLawBlob);
        setAudioUrl(muLawUrl);

        // Send the processed audio data
        if (connectionRef.current) {
          connectionRef.current.send(muLawBlob);
          console.log("Sent connection");
        } else {
          console.error("Connection is not available");
        }

        audioChunksRef.current = [];
      };

      connectionRef.current = deepgram.listen.live({ model: "nova", keywords });

      connectionRef.current.addListener(LiveTranscriptionEvents.Transcript, (data) => {
        console.log("Listener received");
        const sentence = data.channel.alternatives[0].transcript;
        console.log(sentence);

        if (data.is_final && sentence.trim() !== "") {
          // Clear any existing timer
          if (silenceTimerRef.current) {
            clearTimeout(silenceTimerRef.current);
          }
          // Start a new timer
          silenceTimerRef.current = setTimeout(() => {
            stopRecording();
            parentHandleResponse(sentence);
          }, 2000); // Wait for 2 seconds before stopping the recording
        }
      });

      connectionRef.current.addListener(LiveTranscriptionEvents.Error, (err) => {
        console.error("Deepgram error:", err);
      });

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Error accessing audio devices:', error);
    }
  };

  const stopRecording = () => {
    console.log("Stopping recording");
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  return (
    <div>
      <button onClick={startRecording} disabled={isRecording}>
        Start Recording
      </button>
    </div>
  );
};

export default AudioRecorder;
