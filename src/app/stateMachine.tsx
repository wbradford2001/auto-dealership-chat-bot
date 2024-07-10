
  
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
      message: "",
      next: (response: string) => 'greeting',
    },
    greeting: {
      message: "You are a female working at an auto dealership named Toma's Autodealership. Introduce yourself now, but never again throughout the conversation. You are polite and sound like a customer service rep. Remember to always sound professional. Say hello, and ask for their name",
      next: (response: string) => {
        setName(response);
        return 'make';
      },
    },
    make: {
      message: () => `Ask them what the make of their vehicle is`,
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
      message: "You don't recognize that vehicle make. Ask them to try again",
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
      message: () => `Ask them the model of their ${make}.`,
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
      message: () => `You don't recognize that. Ask them to try again.`,
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
      message: () => `Ask the customer what year their ${make} ${model} is.`,
      next: (response: string) => {
        if (years.includes(response.toLowerCase())) {
          setYear(yearStringToNumber[response]);
          console.log(year)
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
      message: "You don't recognize that year.",
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
      message: () => `Ask them if their ${make} ${model} has driven more than 50,000 miles.`,
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
      message: "You  don't understand that response. Ask them if their vehicle has driven more than 50,000 miles",
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
      message: "Ask if they would you like to schedule a factory-recommended maintenance.",
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
      message: "You don't understand that response. Ask them if they would you like to schedule a factory-recommended maintenance",
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
      message: "Say there is noo recommended services for them. Tell them to have a wonderful day.",
      next: (response: string) => {

      },
    },    
    service: {
      message: () => {
        const recommendedServices = getRecommendedServices(make);
        return `Say that based on their ${make} ${model}, we recommend the following services: ${recommendedServices.join(', ')}. Ask them what services they need.`;
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
        return `You don't recognize that service. We recommend the following services: ${recommendedServices.join(', ')}. Ask What service do they need.`;
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
      message: () => `Ask them to Please select a day of the week (Monday to Friday) for their ${service} service.`,
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
      message: "You don't recognize that day. Please ask them to try again.",
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
        return `For their ${make} ${model}, available times for ${service} on ${appointmentDay} are: ${availableTimes.join(', ')}. Please ask them to choose one.`;
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
        return `You don't recognize that time. Available times for their ${make} ${model} on ${appointmentDay} are: ${availableTimes.join(', ')}. Please ask them to choose one.`;
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
      message: () => `Say Thanks, ${name}. Confirm their appointment for ${make} ${model} ${year}, service: ${service}, on ${appointmentDay} at ${appointmentTime}. Wish them a good rest of their day`,
      next: () => null,
    },
});

export { createNodes };
  