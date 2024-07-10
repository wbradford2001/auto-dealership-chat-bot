import React, { useEffect, useState } from 'react';
import Together from "together-ai";
import AudioPlayer from "./TTS";



const intro: string = "Be precise and to the point, keep un necessary words to a minimum, You don't have to keep saying Hi. Remember to always sound polite and professional. "



interface AgentProps {
  prompt: string;
}
let started = false;
const Agent: React.FC<AgentProps> = ({ prompt, customer_words}) => {
  const [responseMessage, setResponseMessage] = useState<string>("");
  const [conversationHistory, setConversationHistory] = useState<{ role: string, content: string }[]>([]);
  const [dialog, setDialog] = useState<{ speaker: string, message: string }[]>([]);


  useEffect(() => {
    const callTogetherAPI = async () => {
      if (started && conversationHistory.length <= 1){
        return
      }
      started = true;

      const together = new Together({
        apiKey: '234a842afd91cfa637469c80e816477e26ec7ce3f04bb7bba3343a4da41dc415',
      });

      try {
        console.log(prompt);
        if (prompt) {
          const updatedHistory = [
            ...conversationHistory,
            { role: "user", content:intro +  prompt }
          ];


       

          const response = await together.chat.completions.create({
            model: "meta-llama/Llama-3-8b-chat-hf",
            messages: updatedHistory,
          });

          const assistantMessage = response.choices[0].message.content;
          updatedHistory.push({ role: "assistant", content:  assistantMessage });
          setConversationHistory(updatedHistory);

          const updatedDialog = [
            ...dialog]
            if (customer_words){

              updatedDialog.push({ speaker: "customer", message: customer_words })
            }
          updatedDialog.push({ speaker: "agent", message: assistantMessage })

           
          setDialog(updatedDialog)

          setResponseMessage(assistantMessage);
        }
      } catch (error) {
        console.error("Error calling Together API:", error);
        setResponseMessage("Sorry, something went wrong.");
      }
    };

    if (prompt) {
      callTogetherAPI();
    }
  }, [prompt]);

  return (
    <div>
      {dialog.map((msg, index) => (
        <p key={index}><strong>{msg.speaker}:</strong> {msg.message}</p>
      ))}
      <AudioPlayer responseMessage={responseMessage} />
    </div>
  );
};

export default Agent;