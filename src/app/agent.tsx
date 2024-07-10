import React, { useEffect, useState } from 'react';
import Together from "together-ai";
import {readMessageAloud} from "./TTS";

interface AgentProps {
  prompt: string;
}

const Agent: React.FC<AgentProps> = ({ prompt }) => {
  const [responseMessage, setResponseMessage] = useState<string>("");
  const [conversationHistory, setConversationHistory] = useState<{ role: string, content: string }[]>([]);

  useEffect(() => {
    const callTogetherAPI = async () => {
      const together = new Together({
        apiKey: '234a842afd91cfa637469c80e816477e26ec7ce3f04bb7bba3343a4da41dc415',
      });

      try {
        console.log(prompt);
        if (prompt) {
          const updatedHistory = [
            ...conversationHistory,
            { role: "user", content: prompt }
          ];

          const response = await together.chat.completions.create({
            model: "meta-llama/Llama-3-8b-chat-hf",
            messages: updatedHistory,
          });

          const assistantMessage = response.choices[0].message.content;
          updatedHistory.push({ role: "assistant", content: assistantMessage });
          setConversationHistory(updatedHistory);

          setResponseMessage(assistantMessage);
          readMessageAloud(assistantMessage)

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
      {conversationHistory.map((msg, index) => (
        <p key={index}><strong>{msg.role}:</strong> {msg.content}</p>
      ))}
    </div>
  );
};

export default Agent;
