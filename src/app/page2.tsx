import { createClient } from "@deepgram/sdk";
import { LiveTranscriptionEvents } from "@deepgram/sdk";


const deepgram = createClient("1a76586463d37e92d561966f88c045b910a14556");





const App: () => JSX.Element = () => {
  const live = deepgram.listen.live({ model: "nova" });
  live.on(LiveTranscriptionEvents.Open, () => {
    live.on(LiveTranscriptionEvents.Transcript, (data) => {
      console.log("hello");
    });
  });
 
  return(
    <div>
      Hello
    </div>
  )
}

export default App