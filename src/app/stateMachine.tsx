
  
import { Dispatch, SetStateAction } from 'react';
import { 
    ConversationNode,
  ConversationNodes, 
  carMakes, 
  carModels, 
  years, 
  yearStringToNumber, 
  makesWith50kCheck, 
  yesNoKeywords, 
  daysOfWeek, 
  electricVehicleMakes, 
  oddHours, 
  evenHours, 
  timeStringToNumerical, 
  getRecommendedServices 
} from './keywords';


  const createNodes = (
    setName: Dispatch<SetStateAction<string>>,
    setMake: Dispatch<SetStateAction<string>>,
    setModel: Dispatch<SetStateAction<string>>,
    setYear: Dispatch<SetStateAction<number | undefined>>,
    setService: Dispatch<SetStateAction<string>>,
    setAppointmentDay: Dispatch<SetStateAction<string>>,
    setAppointmentTime: Dispatch<SetStateAction<string>>,
    name: string,
    make: string,
    model: string,
    year: number | undefined,
    service: string,
    appointmentDay: string,
    appointmentTime: string
  ):  ConversationNodes => ({
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
});

export { createNodes };
  