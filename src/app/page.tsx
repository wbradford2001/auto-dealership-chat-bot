// pages/index.tsx
"use client";

import { useEffect, useState, useRef } from "react";
import { createClient, LiveTranscriptionEvents } from "@deepgram/sdk";

interface ChildComponentProps {
  message: string;
}

const ChildComponent: React.FC<ChildComponentProps> = ({ message }) => {
  return (
    <div>
      <p>{message}</p>
    </div>
  );
};

const Home: React.FC = () => {
  const [transcript, setTranscript] = useState<string>("");
  const [message, setMessage] = useState<string>("Hello! What is your name?");
  const [isListening, setIsListening] = useState<boolean>(false);
  const [conversationStep, setConversationStep] = useState<number>(-1);
  
  const [name, setName] = useState<string>("");
  const [make, setMake] = useState<string>("");
  const [model, setModel] = useState<string>("");
  const [year, setYear] = useState<string>("");
  const [service, setService] = useState<string>("");
  const [appointmentTime, setAppointmentTime] = useState<string>("");

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const connectionRef = useRef<any>(null);
  let sentence: string;

  const conversationSteps = [
    () => `Hello! What is your name?`,
    () => `Hello ${name}, what is the make of your vehicle?`,
    () => `Got it, ${name}. What is the model of your ${make}?`,
    () => `Thanks, ${name}. What is the year of your ${make} ${model}?`,
    () => `Based on your ${make} ${model}, here are the recommended services. What service do you need?`,
    () => `Got it, ${name}. Here are the available slots for your ${service} service. Please choose one.`,
    () => `Thanks, ${name}. Confirm your appointment for ${make} ${model} ${year}, service: ${service}, at ${appointmentTime}.`
  ];

  useEffect(() => {
    if (conversationStep === -1) {
      setMessage(conversationSteps[0]());
      setConversationStep(0);
    } else if (conversationStep >= 0 && conversationStep < conversationSteps.length) {
      setMessage(conversationSteps[conversationStep]());
    }
  }, [conversationStep, name, make, model, year, service, appointmentTime]);

  const startTranscription = async () => {
    setIsListening(true);
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const mediaRecorder = new MediaRecorder(stream, {
      mimeType: "audio/webm;codecs=opus",
    });
    mediaRecorderRef.current = mediaRecorder;

    const deepgram = createClient('1a76586463d37e92d561966f88c045b910a14556');
    const connection = deepgram.listen.live({ model: "nova" });
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

    mediaRecorder.start(1000); // Collect data in chunks of 1 second
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
    switch(conversationStep) {
      case 0:
        setName(response);
        break;
      case 1:
        setMake(response);
        break;
      case 2:
        setModel(response);
        break;
      case 3:
        setYear(response);
        break;
      case 4:
        setService(response);
        break;
      case 5:
        setAppointmentTime(response);
        break;
      default:
        break;
    }
    setConversationStep(prev => prev + 1);
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
      
      <ChildComponent message={message} />
      <div>
        <h2>Collected Information</h2>
        <p>Name: {name}</p>
        <p>Make: {make}</p>
        <p>Model: {model}</p>
        <p>Year: {year}</p>
        <p>Service: {service}</p>
        <p>Appointment Time: {appointmentTime}</p>
      </div>
    </div>
  );
};

export default Home;
