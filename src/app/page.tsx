// pages/index.tsx
"use client";

import { useEffect, useState, useRef } from "react";
import { createClient, LiveTranscriptionEvents } from "@deepgram/sdk";

import { createNodes } from "./stateMachine";

import Agent from "./agent";





const Home: React.FC = () => {
  const [transcript, setTranscript] = useState<string>("");
  const [message, setMessage] = useState<string>();
  const [isListening, setIsListening] = useState<boolean>(false);
  const [currentNodeKey, setCurrentNodeKey] = useState<keyof ConversationNodes | null>('start');

  const [name, setName] = useState<string>("");
  const [make, setMake] = useState<string>("");
  const [model, setModel] = useState<string>("");
  const [year, setYear] = useState<number>();
  const [service, setService] = useState<string>("");
  const [appointmentDay, setAppointmentDay] = useState<string>("");
  const [appointmentTime, setAppointmentTime] = useState<string>("");

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const connectionRef = useRef<any>(null);
  let sentence: string;

  const nodes = createNodes(
    setName,
    setMake,
    setModel,
    setYear,
    setService,
    setAppointmentDay,
    setAppointmentTime,
    name,
    make,
    model,
    year,
    service,
    appointmentDay,
    appointmentTime);

  useEffect(() => {
    if (currentNodeKey) {
      console.log(currentNodeKey);
      
      const currentNode = nodes[currentNodeKey];
      setMessage(typeof currentNode.message === 'function' ? currentNode.message() : currentNode.message);
    }
  }, [currentNodeKey, name, make, model, year, service, appointmentDay, appointmentTime]);

  const startTranscription = async () => {
    setIsListening(true);
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const mediaRecorder = new MediaRecorder(stream, {
      mimeType: "audio/webm;codecs=opus",
    });
    mediaRecorderRef.current = mediaRecorder;

    const deepgram = createClient('1a76586463d37e92d561966f88c045b910a14556');
    const currentNode = nodes[currentNodeKey];
    const connection = deepgram.listen.live({ model: "nova", keywords: currentNode.keywords });
    connectionRef.current = connection;

    connection.addListener(LiveTranscriptionEvents.Transcript, (data) => {
      sentence = data.channel.alternatives[0].transcript;
      setTranscript(sentence);
      console.log(sentence);

      if (data.is_final && sentence.trim() !== "") {
        stopTranscription();
      }
    });

    connection.addListener(LiveTranscriptionEvents.Error, (err) => {
      console.error(err);
    });

    mediaRecorder.addEventListener("dataavailable", (event) => {
      if (event.data.size > 0) {
        connection.send(event.data);
      }
    });

    mediaRecorder.start(2000); // Collect data in chunks of 1 second
  };

  const stopTranscription = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }
    if (connectionRef.current) {
      connectionRef.current.finish();
    }
    setIsListening(false);
    handleResponse(sentence);
  };

  const handleResponse = (response: string) => {
    if (currentNodeKey) {
      const nextNodeKey = nodes[currentNodeKey].next(response);
      setCurrentNodeKey(nextNodeKey);
    }
  };

  useEffect(() => {
    // Clean up function
    return () => {
      stopTranscription();
    };
  }, []);

  const handleStart = () => {
    startTranscription();
  };

  return (
    <div>
      <h1>Microphone to Deepgram</h1>
      <button onClick={handleStart} disabled={isListening}>
        {isListening ? "Listening..." : "Start Transcription"}
      </button>
      
      <Agent prompt={message} />
      <div>
        <h2>Collected Information</h2>
        <p>Name: {name}</p>
        <p>Make: {make}</p>
        <p>Model: {model}</p>
        <p>Year: {year}</p>
        <p>Service: {service}</p>
        <p>Appointment Day: {appointmentDay}</p>
        <p>Appointment Time: {appointmentTime}</p>
      </div>
    </div>
  );
};

export default Home;
