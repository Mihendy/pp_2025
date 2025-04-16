import React, { useState, useEffect } from "react";
import './App.css';

function App() {
  const [message, setMessage] = useState("");
  const [chatMessages, setChatMessages] = useState([]);

  useEffect(() => {
    const socket = new WebSocket("ws://localhost:8000/ws/chat/1");

    socket.onopen = () => {
      console.log("Connected to the WebSocket server");
    };

    socket.onmessage = (event) => {
      setChatMessages((prevMessages) => [...prevMessages, event.data]);
    };

    socket.onclose = () => {
      console.log("Disconnected from WebSocket server");
    };

    return () => {
      socket.close();
    };
  }, []);

  const handleMessageSubmit = (event) => {
    event.preventDefault();
    const socket = new WebSocket("ws://localhost:8000/ws/chat/1");
    socket.onopen = () => {
      socket.send(message);
      setMessage(""); // Clear the input after sending
    };
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>React + FastAPI WebSocket Chat</h1>
        <div>
          <h2>Chat Messages:</h2>
          <ul>
            {chatMessages.map((msg, index) => (
              <li key={index}>{msg}</li>
            ))}
          </ul>
        </div>
        <form onSubmit={handleMessageSubmit}>
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type a message"
          />
          <button type="submit">Send</button>
        </form>
      </header>
    </div>
  );
}

export default App;
