import React, { useState, useRef, useEffect} from 'react';
import './ChatDialog.css';

const ChatDialog = ({ onSubmit, messages }) => {
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleSend = () => {
    if (inputValue.trim() !== '') {
      onSubmit(inputValue);
      setInputValue('');
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
    }
  };

  return (
    <div className="chat-dialog">
      <div className="chat-header">Welcome to the Assistant</div>
      <div className="chat-messages">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`chat-message ${message.sender === 'user' ? 'user' : 'bot'}`}
          >
            {message.text}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <div className="chat-input">
        <input
          type="text"
          placeholder="Type your message..."
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <button onClick={handleSend}>Send</button>
      </div>
    </div>
  );
};


export default ChatDialog;
