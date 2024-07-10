
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
      yearStr = "nineteen";
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



  export {
    ConversationNode,
    ConversationNodes,
    carMakes,
    carModels,
    services,
    years,
    yearStringToNumber,
    daysOfWeek,
    electricVehicleMakes,
    oddHours,
    evenHours,
    timeStringToNumerical,
    getRecommendedServices,
    makesWith50kCheck,
    yesNoKeywords
  };