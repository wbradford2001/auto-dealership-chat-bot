"use client";

import { useState, useRef } from 'react';
import { WaveFile } from 'wavefile';

const AudioRecorder: React.FC = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<BlobPart[]>([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = async () => {
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

        const muLawBlob = new Blob([wav.toBuffer()], { type: 'audio/wav' });
        const muLawUrl = URL.createObjectURL(muLawBlob);
        setAudioUrl(muLawUrl);

        // Play the audio automatically
        const audio = new Audio(muLawUrl);
        audio.play();

        audioChunksRef.current = [];
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Error accessing audio devices:', error);
    }
  };

  const stopRecording = () => {
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
      <button onClick={stopRecording} disabled={!isRecording}>
        Stop Recording
      </button>
    </div>
  );
};

export default AudioRecorder;
