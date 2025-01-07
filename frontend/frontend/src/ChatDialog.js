// import React, { useState } from 'react';
// import './ChatDialog.css';

// const ChatDialog = ({ onSubmit }) => {
//   const [inputValue, setInputValue] = useState('');
//   const [messages, setMessages] = useState([]);

//   const handleSend = () => {
//     if (inputValue.trim() !== '') {
//       const newMessage = { sender: 'user', text: inputValue };
//       setMessages([...messages, newMessage]);
//       setInputValue('');
//       if (onSubmit) {
//         onSubmit(newMessage.text);
//       }
//     }
//   };

//   return (
//     <div className="chat-dialog">
//       <div className="chat-header">Welcome to the Assistant</div>
//       <div className="chat-messages">
//         {messages.map((message, index) => (
//           <div
//             key={index}
//             className={`chat-message ${message.sender === 'user' ? 'user' : 'bot'}`}
//           >
//             {message.text}
//           </div>
//         ))}
//       </div>
//       <div className="chat-input">
//         <input
//           type="text"
//           placeholder="Type your message..."
//           value={inputValue}
//           onChange={(e) => setInputValue(e.target.value)}
//         />
//         <button onClick={handleSend}>Send</button>
//       </div>
//     </div>
//   );
// };

// export default ChatDialog;

import React, { useState } from 'react';
import './ChatDialog.css';

const ChatDialog = ({ onSubmit, messages }) => {
  const [inputValue, setInputValue] = useState('');

  const handleSend = () => {
    if (inputValue.trim() !== '') {
      onSubmit(inputValue); // Wysłanie wiadomości
      setInputValue(''); // Czyszczenie pola tekstowego
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault(); // Zablokowanie wysyłania po naciśnięciu Entera
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
      </div>
      <div className="chat-input">
        <input
          type="text"
          placeholder="Type your message..."
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown} // Zapobieganie wysyłaniu przez Enter
        />
        <button onClick={handleSend}>Send</button> {/* Wysłanie po kliknięciu */}
      </div>
    </div>
  );
};

export default ChatDialog;
