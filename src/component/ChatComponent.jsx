
import { useState, useEffect, useRef } from 'react';

import {
  MainContainer,
  MessageList,
  Message,
  TypingIndicator,
} from '@chatscope/chat-ui-kit-react';


const API_KEY = "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";

// const API_KEY = "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";
const ChatComponent = () => {
  const [messages, setMessages] = useState([
    {
      message: "Hello, I'm ChatGPT! Ask me anything!",
      sentTime: "just now",
      sender: "ChatGPT",
    },
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [isSpeaking, setIsSpeaking] = useState(false); // New state
  const messageListRef = useRef(null);

  useEffect(() => {
    // Scroll to the bottom of the message list whenever a new message is added
    if (messageListRef.current) {
      setTimeout(() => {
        messageListRef.current.scrollTop = messageListRef.current.scrollHeight;
      }, 0);
    }
  }, [messages]);

  const handleSendRequest = async (e) => {
    e.preventDefault();
    if (inputValue.trim() === '') {
      return; // Don't send empty messages
    }

    const newMessage = {
      message: inputValue,
      direction: 'outgoing',
      sender: "user",
    };

    setMessages((prevMessages) => [...prevMessages, newMessage]);
    setIsTyping(true);

    try {
      const response = await processMessageToChatGPT([...messages, newMessage]);
      const content = response.choices[0]?.message?.content;
      if (content) {
        const chatGPTResponse = {
          message: content,
          sender: "ChatGPT",
        };
        setMessages((prevMessages) => [...prevMessages, chatGPTResponse]);
        /////
        // Set speaking indicator to true
        setIsSpeaking(true);
        speakText(content);
      }
    } catch (error) {
      console.error("Error processing message:", error);
    } finally {
      setIsTyping(false);
      setIsSpeaking(false); // Reset speaking 
      setInputValue(''); // Clear input after sending
    }
  };

  async function processMessageToChatGPT(chatMessages) {
    const apiMessages = chatMessages.map((messageObject) => {
        const role = messageObject.sender === "ChatGPT" ? "assistant" : "user";
        return { role, content: messageObject.message };
      });
  
      const apiRequestBody = {
        "model": "gpt-3.5-turbo",
        "messages": [
          { role: "system", content: "I'm a Student using ChatGPT for learning" },
          ...apiMessages,
        ],
      };
  
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": "Bearer " + API_KEY,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(apiRequestBody),
      });
  
      return response.json();
  }

  const speakText = (text) => {
    const synth = window.speechSynthesis;
  const utterance = new SpeechSynthesisUtterance(text);

  // Filter voices to find a girlish and robotic voice
  const girlishVoice = synth.getVoices().find(voice => voice.name.includes("Girl"));
  
  // Set the chosen voice
  utterance.voice = girlishVoice || synth.getVoices()[0]; // Default to the first available voice if not found
  
  utterance.onend = () => {
    // Set speaking indicator to false after speech ends
    setIsSpeaking(false);
  };

  synth.speak(utterance);
  };

  return (
    <div className="app-container" style={{ backgroundColor: "rgba(0, 0, 0, 0)", color: "#ccc", minHeight: "50vh", display: "flex", alignItems: "center", justifyContent: "center", zIndex: "3" }}>
  <div style={{ width: "50%", maxWidth: "700px", borderRadius: "10px", overflow: "hidden", padding: "20px" }}>
        <MessageList
          ref={messageListRef}
          style={{ maxHeight: "400px", overflowY: "auto" }}
          scrollBehavior="smooth"
          typingIndicator={isTyping ? <TypingIndicator content="ChatGPT is typing" /> : null}
        >
          {messages.map((message, i) => (
            <Message
              key={i}
              model={message}
              style={{
                marginBottom: "10px",
                background: message.sender === "user" ? "#007BFF" : "#6C757D", // Different background for user and AI messages
                color: "#fff", // Text color
                borderRadius: "8px",
                padding: "8px",
                alignSelf: message.sender === "user" ? "flex-end" : "flex-start", // Align user messages to the right, AI messages to the left
              }}
            />
          ))}
        </MessageList>
        <form onSubmit={handleSendRequest}>
          <div style={{ display: "flex", marginTop: "10px" }}>
            <input
              type="text"
              style={{ flex: "1", marginRight: "10px", padding: "8px", borderRadius: "8px", border: "1px solid #ccc" }}
              placeholder="Type a message"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
            />
            <button
              type="submit"
              style={{
                backgroundColor: "#28a745", // Button color
                color: "#fff", // Text color
                border: "none",
                padding: "10px",
                borderRadius: "8px",
                cursor: "pointer",
              }}
            >
              Send
            </button>
          </div>
          {isSpeaking && <div style={{ marginTop: '10px' }}>🔊 Preparing Voice...</div>}
        </form>
      </div>
    </div>
  )
}

export default ChatComponent;
