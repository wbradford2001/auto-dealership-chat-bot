// TTS.tsx
import { createClient } from "@deepgram/sdk";

const deepgram = createClient('your-deepgram-api-key');

export const readMessageAloud = async (text: string) => {
  try {
    const response = await deepgram.speak.request(
      { text },
      {
        model: "aura-asteria-en",
        encoding: "linear16",
        container: "wav",
      }
    );

    const stream = await response.getStream();
    if (stream) {
      const audioBuffer = await getAudioBuffer(stream);
      playAudio(audioBuffer);
    } else {
      console.error("Error generating audio:", stream);
    }

    const headers = await response.getHeaders();
    if (headers) {
      console.log("Headers:", headers);
    }
  } catch (error) {
    console.error("Error with Deepgram TTS:", error);
  }
};

const getAudioBuffer = async (response: Response) => {
  const reader = response.body?.getReader();
  if (!reader) throw new Error("Failed to get reader from response");

  const chunks: Uint8Array[] = [];
  let done: boolean | undefined = false;

  while (!done) {
    const { value, done: chunkDone } = await reader.read();
    if (value) {
      chunks.push(value);
    }
    done = chunkDone;
  }

  const dataArray = chunks.reduce(
    (acc, chunk) => Uint8Array.from([...acc, ...chunk]),
    new Uint8Array(0)
  );

  return dataArray.buffer;
};

const playAudio = (audioBuffer: ArrayBuffer) => {
  const audioContext = new (window.AudioContext || window.webkitAudioContext)();
  audioContext.decodeAudioData(audioBuffer, (buffer) => {
    const source = audioContext.createBufferSource();
    source.buffer = buffer;
    source.connect(audioContext.destination);
    source.start(0);
  });
};
