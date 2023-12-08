import { useState } from 'react'
import './App.css'
import '@chatscope/chat-ui-kit-styles/dist/default/styles.min.css';
import { MainContainer, ChatContainer, MessageList, Message, MessageInput, TypingIndicator } from '@chatscope/chat-ui-kit-react';
import { FaComments } from 'react-icons/fa'; // Assurez-vous d'installer react-icons via npm ou yarn
import { useSpeechSynthesis } from 'react-speech-kit';

const API_KEY = "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";
// "Explain things like you would to a 10 year old learning how to code."
const systemMessage = { //  Explain things like you're talking to a software professional with 5 years of experience.
  "role": "system", "content": "talk like an climate change expert ."
}

const Chatbot = () => {
  // Logique du chatbot ici
  const [messages, setMessages] = useState([
    {
      message: "Hello, I'm a climate change expert how can i help",
      sentTime: "just now",
      sender: "ChatGPT"
    }
  ]);
  const {speak} = useSpeechSynthesis();
  const [isTyping, setIsTyping] = useState(false);

  const handleSend = async (message) => {
    const newMessage = {
      message,
      direction: 'outgoing',
      sender: "user"
    };

    const newMessages = [...messages, newMessage];
    
    setMessages(newMessages);

    // Initial system message to determine ChatGPT functionality
    // How it responds, how it talks, etc.
    setIsTyping(true);
    await processMessageToChatGPT(newMessages);
    
  };

  async function processMessageToChatGPT(chatMessages) { // messages is an array of messages
    // Format messages for chatGPT API
    // API is expecting objects in format of { role: "user" or "assistant", "content": "message here"}
    // So we need to reformat

    let apiMessages = chatMessages.map((messageObject) => {
      let role = "";
      if (messageObject.sender === "ChatGPT") {
        role = "assistant";
      } else {
        role = "user";
      }
      
      return { role: role, content: messageObject.message}
    });


    // Get the request body set up with the model we plan to use
    // and the messages which we formatted above. We add a system message in the front to'
    // determine how we want chatGPT to act. 
    const apiRequestBody = {
      "model": "gpt-3.5-turbo",
      "messages": [
        systemMessage,  // The system message DEFINES the logic of our chatGPT
        ...apiMessages // The messages from our chat with ChatGPT
      ]
    }

    await fetch("https://api.openai.com/v1/chat/completions", 
    {
      method: "POST",
      headers: {
        "Authorization": "Bearer " + API_KEY,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(apiRequestBody)
    }).then((data) => {
      return data.json();
    }).then((data) => {
      console.log(data);
      setMessages([...chatMessages, {
        message: data.choices[0].message.content,
        sender: "ChatGPT"
      }]);
      speak({ text: data.choices[0].message.content });
      setIsTyping(false);
    });
  }

  return (
    <div className="App">
      <div  style={{ position: 'fixed', bottom: '5%', right: '5%', maxWidth: '300px' ,width: '60%', height: '60%', background: '#fff', padding: '10px', boxShadow: '0 0 10px rgba(0, 0, 0, 0.1) ',borderRadius: '2rem' }}>
        <MainContainer>
          <ChatContainer>       
            <MessageList 
              scrollBehavior="smooth" 
              typingIndicator={isTyping ? <TypingIndicator content="Assistant is typing" /> : null}
            >
              {messages.map((message, i) => {
                console.log(message)
                
                
                return <Message key={i} model={message} />
              })}
            </MessageList>
            <MessageInput placeholder="Type message here" onSend={handleSend} />        
          </ChatContainer>
        </MainContainer>
      </div>
    </div>
  )
};

function App() {
  const [showChatbot, setShowChatbot] = useState(false);

  const toggleChatbot = () => {
    setShowChatbot(!showChatbot);
  };

  return (
    <div style={{ position: 'relative', minHeight: '100vh' }}>
    <h1>Mon Application React</h1>
    <div style={{ position: 'fixed', bottom: 20, right: 20 }}>
      {/* Icône du chatbot */}
      <FaComments size={30} onClick={toggleChatbot} style={{ cursor: 'pointer' }} />
    </div>
    {showChatbot && <Chatbot />}
  </div>
  );
  
}

export default App
