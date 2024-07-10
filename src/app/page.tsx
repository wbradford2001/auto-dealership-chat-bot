"use client";

import { useEffect, useState, useRef } from "react";
import { createClient, LiveTranscriptionEvents } from "@deepgram/sdk";
import { createNodes } from "./stateMachine";
import styles from "./page.module.css";
import Agent from "./agent";

import { WaveFile } from 'wavefile';


const Home: React.FC = () => {
  const [transcript, setTranscript] = useState<string>("");
  const [message, setMessage] = useState<string>("");
  const [isListening, setIsListening] = useState<boolean>(false);
  const [currentNodeKey, setCurrentNodeKey] = useState<keyof ConversationNodes | null>('start');

  const [name, setName] = useState<string>("");
  const [make, setMake] = useState<string>("");
  const [model, setModel] = useState<string>("");
  const [year, setYear] = useState<number>();
  const [service, setService] = useState<string>("");
  const [appointmentDay, setAppointmentDay] = useState<string>("");
  const [appointmentTime, setAppointmentTime] = useState<string>("");

  
  const [chatbotStarted, setChatbotStarted] = useState<boolean>(false);


  const [customer_words, setCustomer_words] = useState<string>("");



  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const connectionRef = useRef<any>(null);
  const sentenceRef = useRef<string>("");

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
    appointmentTime
  );

  useEffect(() => {
    if (currentNodeKey) {
      console.log(currentNodeKey);

      const currentNode = nodes[currentNodeKey];
      setMessage(typeof currentNode.message === 'function' ? currentNode.message() : currentNode.message);
    }
  }, [currentNodeKey, name, make, model, year, service, appointmentDay, appointmentTime]);

  const startTranscription = async () => {
    if (currentNodeKey === 'halt' || currentNodeKey === 'confirmation') {
      console.log("STOPPING")
      console.log(currentNodeKey)
      stopTranscription();

      
      return;
    }

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
      const sentence = data.channel.alternatives[0].transcript;
      sentenceRef.current = sentence;
      setTranscript(sentence);
      console.log(sentence);

      if (data.is_final && sentence.trim() !== "") {
        stopTranscription();
      }
    });

    connection.addListener(LiveTranscriptionEvents.Error, (err) => {
      console.error(err);
    });

    mediaRecorder.addEventListener("dataavailable", async (event) => {
      if (event.data.size > 0) {

        if (event.data.size == 0) {

          const audioBlob = new Blob([event.data], { type: 'audio/webm' });
          const arrayBuffer = await audioBlob.arrayBuffer();
          
          const audioContext = new (window.AudioContext || window.webkitAudioContext)();
          const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
          
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
          
          console.log(muLawBlob);
          
          connection.send(muLawBlob);
        } else {
          connection.send(event.data);

        }
      }
    });

    mediaRecorder.start(2000); // Collect data in chunks of 2 seconds
  };

  const stopTranscription = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }
    if (connectionRef.current) {
      connectionRef.current.finish();
    }
    setIsListening(false);
    handleResponse(sentenceRef.current);
  };

  const handleResponse = (response: string) => {
    if (currentNodeKey) {
      const nextNodeKey = nodes[currentNodeKey].next(response);
      setCustomer_words(response)
      setCurrentNodeKey(nextNodeKey);
    }
  };

  const handleStart = () => {
    setChatbotStarted(true);
    startTranscription();
  };

  useEffect(() => {
    // Clean up function
    return () => {
      stopTranscription();
    };
  }, []);

  useEffect(() => {
    if (chatbotStarted && !isListening && message && currentNodeKey !== 'halt'&& currentNodeKey !== 'confirmation') {
      const timer = setTimeout(() => {
        startTranscription();
      }, 2000); // Delay before restarting transcription

      return () => clearTimeout(timer);
    }
  }, [chatbotStarted, isListening, message, currentNodeKey]);

  return (
    <div className={styles.container}>
      <h1 className={styles.header}>Voice AI ChatBot</h1>
      {!chatbotStarted ? (
        <div className={styles.startContainer}>
          <p className={styles.instruction}>Press the button to start the chatbot</p>
          <button className={styles.startButton} onClick={handleStart}>
            Start Chatbot
          </button>
        </div>
      ) : (
        <div className={styles.chatContainer}>
          <div className={styles.dialogContainer}>
            <h2 className={styles.status}>
              ChatBot Dialog ({(currentNodeKey === "halt" || currentNodeKey === "confirmation") ? "Stopped" : "Running"})
            </h2>
            {/* <button className={styles.stopButton} onClick={stopTranscription} disabled={!isListening}>
              {isListening ? "Stop Listening" : "Stopped"}
            </button> */}
            
            <Agent prompt={message} customer_words={customer_words}/>
          </div>
          <div className={styles.infoContainer}>
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
      )}
    </div>
  );
  
};

export default Home;
