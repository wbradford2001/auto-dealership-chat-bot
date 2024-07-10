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

type ConversationNode = {
  message: string | (() => string);
  next: (response: string) => keyof ConversationNodes | null;
  keywords?: string[];
};

type ConversationNodes = {
  [key: string]: ConversationNode;
};

// Comprehensive list of car makes and models
const carMakes = ["Chevy", "Ford", "Toyota", "Honda", "Tesla", "Polestar", "Rivian", "Chrysler", "Dodge", "Jeep", "RAM"];

const carModels: { [key: string]: string[] } = {
  Chevy: ["Malibu", "Camaro", "Silverado"],
  Ford: ["F-150", "Mustang", "Escape"],
  Toyota: ["Camry", "Corolla", "RAV4"],
  Honda: ["Civic", "Accord", "CR-V"],
  Tesla: ["Model S", "Model 3", "Model X", "Model Y"],
  Polestar: ["1", "2", "3"],
  Rivian: ["R1T", "R1S"],
  Chrysler: ["300", "Pacifica"],
  Dodge: ["Charger", "Challenger", "Durango"],
  Jeep: ["Wrangler", "Cherokee", "Grand Cherokee"],
  RAM: ["1500", "2500", "3500"],
};

const services = ["oil change", "tire rotation", "windshield wiper replacement", "battery replacement", "charging port diagnosis", "factory-recommended maintenance"];

let years: string[] = [];
const yearStringToNumber: { [key: string]: number } = {};

const belowTwenty = ["", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten", "eleven", "twelve", "thirteen", "fourteen", "fifteen", "sixteen", "seventeen", "eighteen", "nineteen"];
const tens = ["", "", "twenty", "thirty", "forty", "fifty", "sixty", "seventy", "eighty", "ninety"];

const makesWith50kCheck = ["Chrysler", "Dodge", "Jeep", "RAM"];
const yesNoKeywords = ["yes", "no"];


for (let i = 1960; i <= 2024; i++) {
  let yearStr = "";
  if (i < 2000) {
    yearStr = "nineteen ";
  } else if (i >= 2000 && i <= 2009) {
    yearStr = "two thousand";
  } else if (i >= 2010) {
    yearStr = "twenty";
  }

  const lastTwoDigits = i % 100;
  if (lastTwoDigits !== 0 || i >= 2010) {
    if (lastTwoDigits < 20) {
      yearStr += " " + belowTwenty[lastTwoDigits];
    } else {
      yearStr += " " + tens[Math.floor(lastTwoDigits / 10)];
      if (lastTwoDigits % 10 !== 0) {
        yearStr += " " + belowTwenty[lastTwoDigits % 10];
      }
    }
  }

  const yearString = yearStr.trim();
  years.push(yearString);
  yearStringToNumber[yearString] = i;  // Mapping string to numeric value
}
console.log(years);

const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

const electricVehicleMakes = ["Tesla", "Polestar", "Rivian"];
const oddHours = ["one pm", "three pm", "five pm"];
const evenHours = ["ten am", "twelve pm", "two pm", "four pm", "six pm"];
const timeStringToNumerical: { [key: string]: string } = {
  "one pm": "1PM",
  "three pm": "3PM",
  "five pm": "5PM",
  "ten am": "10AM",
  "twelve pm": "12PM",
  "two pm": "2PM",
  "four pm": "4PM",
  "six pm": "6PM"
};

const getRecommendedServices = (make: string): string[] => {
  if (electricVehicleMakes.includes(make)) {
    return ["battery replacement", "charging port diagnosis"];
  } else {
    return ["oil change", "tire rotation", "windshield wiper replacement"];
  }
};


const Home: React.FC = () => {
  const [transcript, setTranscript] = useState<string>("");
  const [message, setMessage] = useState<string>("Hello! What is your name?");
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

  const nodes: ConversationNodes = {
    start: {
      message: "Hello! What is your name?",
      next: (response: string) => 'greeting',
    },
    greeting: {
      message: "Hello! What is your name?",
      next: (response: string) => {
        setName(response);
        return 'make';
      },
    },
    make: {
      message: () => `Hello ${name}, what is the make of your vehicle?`,
      next: (response: string) => {
        const carMake = carMakes.find(make => response.toLowerCase().includes(make.toLowerCase()));
        if (carMake) {
          setMake(carMake);
          return 'model';
        }
        return 'unrecognizedMake';
      },
      keywords: carMakes,
    },
    unrecognizedMake: {
      message: "I don't recognize that car make. Please try again.",
      next: (response: string) => {
        const carMake = carMakes.find(make => response.toLowerCase().includes(make.toLowerCase()));
        if (carMake) {
          setMake(carMake);
          return 'model';
        }
        return 'unrecognizedMake';
      },
      keywords: carMakes,
    },
    model: {
      message: () => `Got it, ${name}. What is the model of your ${make}?`,
      next: (response: string) => {
        console.log(carModels[make]);
        if (carModels[make] && carModels[make].includes(response)) {
          setModel(response);
          return 'year';
        }
        return 'unrecognizedModel';
      },
      keywords: carModels[make],
    },
    unrecognizedModel: {
      message: () => `I don't recognize that model for your ${make}. Please try again.`,
      next: (response: string) => {
        if (carModels[make] && carModels[make].includes(response)) {
          setModel(response);
          return 'year';
        }
        return 'unrecognizedModel';
      },
      keywords: carModels[make],
    },
    year: {
      message: () => `Thanks, ${name}. What is the year of your ${make} ${model}?`,
      next: (response: string) => {
        if (years.includes(response.toLowerCase())) {
          setYear(yearStringToNumber[response]);
          if (makesWith50kCheck.includes(make)) {
            return 'mileageCheck';
          }
          return 'service';
        }
        return 'unrecognizedYear';
      },
      keywords: years,
    },
    unrecognizedYear: {
      message: "I don't recognize that year. Please try again.",
      next: (response: string) => {
        if (years.includes(response.toLowerCase())) {
          setYear(yearStringToNumber[response]);
          if (makesWith50kCheck.includes(make)) {
            return 'mileageCheck';
          }          
          return 'service';
        }
        return 'unrecognizedYear';
      },
      keywords: years,
    },
    mileageCheck: {
      message: () => `Has your ${make} ${model} driven more than 50,000 miles? (yes or no)`,
      next: (response: string) => {
        if (response.toLowerCase().includes('yes')) {
          return 'offerFactoryMaintenance';
        } else if (response.toLowerCase().includes('no')) {
          return 'halt';
        }
        return 'unrecognizedMileageResponse';
      },
      keywords: yesNoKeywords,
    },
    unrecognizedMileageResponse: {
      message: "I don't understand that response. Has your vehicle driven more than 50,000 miles? (yes or no)",
      next: (response: string) => {
        if (response.toLowerCase().includes('yes')) {
          return 'offerFactoryMaintenance';
        } else if (response.toLowerCase().includes('no')) {
          return 'halt';
        }
        return 'unrecognizedMileageResponse';
      },
      keywords: yesNoKeywords,
    },
    offerFactoryMaintenance: {
      message: "Would you like to schedule a factory-recommended maintenance? (yes or no)",
      next: (response: string) => {
        if (response.toLowerCase().includes('yes')) {
          setService("factory-recommended maintenance");
          return 'appointmentDay';
        } else if (response.toLowerCase().includes('no')) {
          return 'halt';
        }
        return 'unrecognizedFactoryMaintenanceResponse';
      },
      keywords: yesNoKeywords,
    },
    unrecognizedFactoryMaintenanceResponse: {
      message: "I don't understand that response. Would you like to schedule a factory-recommended maintenance? (yes or no)",
      next: (response: string) => {
        if (response.toLowerCase().includes('yes')) {
          setService("factory-recommended maintenance");
          return 'appointmentDay';
        } else if (response.toLowerCase().includes('no')) {
          return 'halt';
        }
        return 'unrecognizedFactoryMaintenanceResponse';
      },
      keywords: yesNoKeywords,
    },
    halt: {
      message: "Have a great Day",
      next: (response: string) => {

      },
    },    
    service: {
      message: () => {
        const recommendedServices = getRecommendedServices(make);
        return `Based on your ${make} ${model}, we recommend the following services: ${recommendedServices.join(', ')}. What service do you need?`;
      },
      next: (response: string) => {
        const recommendedServices = getRecommendedServices(make);
        const selectedService = recommendedServices.find(service => response.toLowerCase().includes(service.toLowerCase()));
        if (selectedService) {
          setService(selectedService);
          return 'appointmentDay';
        }
        return 'unrecognizedService';
      },
      keywords: getRecommendedServices(make),
    },
    unrecognizedService: {
      message: () => {
        const recommendedServices = getRecommendedServices(make);
        return `I don't recognize that service. We recommend the following services: ${recommendedServices.join(', ')}. What service do you need?`;
      },
      next: (response: string) => {
        const recommendedServices = getRecommendedServices(make);
        const selectedService = recommendedServices.find(service => response.toLowerCase().includes(service.toLowerCase()));
        if (selectedService) {
          setService(selectedService);
          return 'appointmentDay';
        }
        return 'unrecognizedService';
      },
      keywords: getRecommendedServices(make),
    },
    appointmentDay: {
      message: () => `Got it, ${name}. Please select a day of the week (Monday to Friday) for your ${service} service.`,
      next: (response: string) => {
        const selectedDay = daysOfWeek.find(day => response.toLowerCase().includes(day.toLowerCase()));
        if (selectedDay) {
          setAppointmentDay(selectedDay);
          return 'appointmentTime';
        }
        return 'unrecognizedDay';
      },
      keywords: daysOfWeek,
    },
    unrecognizedDay: {
      message: "I don't recognize that day. Please try again.",
      next: (response: string) => {
        const selectedDay = daysOfWeek.find(day => response.toLowerCase().includes(day.toLowerCase()));
        if (selectedDay) {
          setAppointmentDay(selectedDay);
          return 'appointmentTime';
        }
        return 'unrecognizedDay';
      },
      keywords: daysOfWeek,
    },
    appointmentTime: {
      message: () => {
        const availableTimes = electricVehicleMakes.includes(make) ? oddHours : evenHours;
        return `For your ${make} ${model}, available times for ${service} on ${appointmentDay} are: ${availableTimes.join(', ')}. Please choose one.`;
      },
      next: (response: string) => {
        const availableTimes = electricVehicleMakes.includes(make) ? oddHours : evenHours;
        const selectedTime = availableTimes.find(time => response.toLowerCase().includes(time.toLowerCase()));
        if (selectedTime) {
          const actualtime = timeStringToNumerical[selectedTime];
          setAppointmentTime(actualtime);
          return 'confirmation';
        }
        return 'unrecognizedTime';
      },
      keywords: electricVehicleMakes.includes(make) ? oddHours : evenHours,
    },
    unrecognizedTime: {
      message: () => {
        const availableTimes = electricVehicleMakes.includes(make) ? oddHours : evenHours;
        return `I don't recognize that time. Available times for your ${make} ${model} on ${appointmentDay} are: ${availableTimes.join(', ')}. Please choose one.`;
      },
      next: (response: string) => {
        const availableTimes = electricVehicleMakes.includes(make) ? oddHours : evenHours;
        const selectedTime = availableTimes.find(time => response.toLowerCase().includes(time.toLowerCase()));
        if (selectedTime) {
          const actualtime = timeStringToNumerical[selectedTime];
          setAppointmentTime(actualtime);
          return 'confirmation';
        }
        return 'unrecognizedTime';
      },
      keywords: electricVehicleMakes.includes(make) ? oddHours : evenHours,
    },
    confirmation: {
      message: () => `Thanks, ${name}. Confirm your appointment for ${make} ${model} ${year}, service: ${service}, on ${appointmentDay} at ${appointmentTime}.`,
      next: () => null,
    },
  };

  useEffect(() => {
    if (currentNodeKey) {
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
      
      <ChildComponent message={message} />
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
