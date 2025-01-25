import React, { useState } from 'react';
import ChatDialog from './components/ChatDialog';

const LLMChat = ({ columns, onSubmit }) => {
  const [messages, setMessages] = useState([
    { sender: 'bot', text: 'Cześć, jestem asystentem LLM! Jak mogę pomóc?' },
  ]);


  const [pendingDataCol, setPendingDataCol] = useState(null);
  const [pendingMetaCol, setPendingMetaCol] = useState(null);

  const handleUserInput = async (inputText) => {
  
    const userMsg = { sender: 'user', text: inputText };
    setMessages((prev) => [...prev, userMsg]);


    if (pendingDataCol && pendingMetaCol) {
      if (inputText.toLowerCase() === 'tak') {
        setMessages((prev) => [
          ...prev,
          { sender: 'bot', text: `Wykonuję UMAP na kolumnach: ${pendingDataCol}, ${pendingMetaCol}` },
        ]);
        onSubmit(pendingDataCol, pendingMetaCol, 15, 0.1);
        setPendingDataCol(null);
        setPendingMetaCol(null);
        return;
      } else if (inputText.toLowerCase() === 'nie') {
        setPendingDataCol(null);
        setPendingMetaCol(null);
        setMessages((prev) => [
          ...prev,
          { sender: 'bot', text: 'OK, w takim razie podaj inne kolumny.' },
        ]);
        return;
      }
    }

    const conversationArray = [...messages.map((m) => m.text), inputText];
    const responseData = await callLLMDialogAPI(conversationArray, columns);

    if (responseData.error) {
      setMessages((prev) => [...prev, { sender: 'bot', text: `Błąd LLM: ${responseData.error}` }]);
      return;
    }

    if (responseData.text) {
      setMessages((prev) => [...prev, { sender: 'bot', text: responseData.text }]);
    }

    if (responseData.data_column && responseData.metadata_column) {
      setPendingDataCol(responseData.data_column);
      setPendingMetaCol(responseData.metadata_column);
      setMessages((prev) => [
        ...prev,
        {
          sender: 'bot',
          text: `Sugeruję kolumny: ${responseData.data_column} i ${responseData.metadata_column}. Potwierdzasz? (tak/nie)`,
        },
      ]);
    }
  };

  return (
    <ChatDialog onSubmit={handleUserInput} messages={messages} />
  );
};

async function callLLMDialogAPI(conversationArray, columns) {
  try {
    const response = await fetch('http://localhost:5001/llm_dialog', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        column_names: columns,
        messages: conversationArray,
      }),
    });
    return await response.json();
  } catch (err) {
    return { error: err.message };
  }
}

export default LLMChat;

// import React, { useState } from 'react';
// import ChatDialog from './components/ChatDialog';

// const LLMChat = ({ columns, onSubmit }) => {
//   const [messages, setMessages] = useState([
//     { sender: 'bot', text: 'Cześć, jestem asystentem LLM! Jak mogę pomóc?' },
//   ]);

//   // Stan z "propozycją" parametrów
//   const [pendingDataCol, setPendingDataCol] = useState(null);
//   const [pendingMetaCol, setPendingMetaCol] = useState(null);
//   const [pendingNeighbors, setPendingNeighbors] = useState(null);
//   const [pendingMinDist, setPendingMinDist] = useState(null);

//   const handleUserInput = async (inputText) => {
//     // 1. Dodaj wiadomość użytkownika
//     const userMsg = { sender: 'user', text: inputText };
//     setMessages((prev) => [...prev, userMsg]);

//     // 2. Sprawdź, czy mamy już oczekujące parametry (czekamy na "tak"/"nie")
//     if (
//       pendingDataCol &&
//       pendingMetaCol &&
//       pendingNeighbors !== null &&
//       pendingMinDist !== null
//     ) {
//       // Jesteśmy w trybie potwierdzania wszystkich 4 parametrów
//       if (inputText.toLowerCase() === 'tak') {
//         // Użytkownik potwierdza
//         setMessages((prev) => [
//           ...prev,
//           {
//             sender: 'bot',
//             text: `Wykonuję UMAP z kolumnami: ${pendingDataCol}, ${pendingMetaCol}, sąsiadami=${pendingNeighbors}, minDist=${pendingMinDist}`,
//           },
//         ]);

//         // Wywołanie onSubmit → fetchUMAPData w InteractiveUMAP
//         onSubmit(pendingDataCol, pendingMetaCol, pendingNeighbors, pendingMinDist);

//         // Resetujemy pending
//         setPendingDataCol(null);
//         setPendingMetaCol(null);
//         setPendingNeighbors(null);
//         setPendingMinDist(null);
//         return; // koniec
//       } else if (inputText.toLowerCase() === 'nie') {
//         // Odrzucenie – reset
//         setPendingDataCol(null);
//         setPendingMetaCol(null);
//         setPendingNeighbors(null);
//         setPendingMinDist(null);
//         setMessages((prev) => [
//           ...prev,
//           { sender: 'bot', text: 'OK, w takim razie spróbujmy raz jeszcze ustalić parametry.' },
//         ]);
//         return; // koniec
//       }
//     }

//     // 3. Jeżeli nie jesteśmy w trakcie potwierdzania,
//     //    wysyłamy całą konwersację do /llm_dialog
//     const conversationArray = [...messages.map((m) => m.text), inputText];
//     const responseData = await callLLMDialogAPI(conversationArray, columns);

//     // Błąd?
//     if (responseData.error) {
//       setMessages((prev) => [...prev, { sender: 'bot', text: `Błąd LLM: ${responseData.error}` }]);
//       return;
//     }

//     // Dodaj odpowiedź bota z pola "text"
//     if (responseData.text) {
//       setMessages((prev) => [...prev, { sender: 'bot', text: responseData.text }]);
//     }

//     // 4. Jeśli LLM zasugerował parametry:
//     //    (zwróć uwagę, że neighbors i min_distance mogą być liczbami, 
//     //     więc sprawdzamy typeof / isNaN, itp.)
//     if (
//       responseData.data_column &&
//       responseData.metadata_column &&
//       responseData.neighbors != null &&
//       responseData.min_distance != null
//     ) {
//       // Zapisujemy "pending" i prosimy użytkownika o potwierdzenie
//       setPendingDataCol(responseData.data_column);
//       setPendingMetaCol(responseData.metadata_column);
//       setPendingNeighbors(responseData.neighbors);
//       setPendingMinDist(responseData.min_distance);

//       setMessages((prev) => [
//         ...prev,
//         {
//           sender: 'bot',
//           text: `Sugeruję kolumny: ${responseData.data_column} i ${responseData.metadata_column}, 
//                  neighbors=${responseData.neighbors}, min_distance=${responseData.min_distance}. 
//                  Potwierdzasz? (tak/nie)`,
//         },
//       ]);
//     }
//     // Ewentualnie LLM mógłby zwrócić tylko 2 parametry, a potem w kolejnej odpowiedzi 2 kolejne, 
//     // to wymagałoby bardziej złożonej logiki (kilka stanów "pending").
//   };

//   return (
//     <ChatDialog onSubmit={handleUserInput} messages={messages} />
//   );
// };

// async function callLLMDialogAPI(conversationArray, columns) {
//   try {
//     const response = await fetch('http://localhost:5001/llm_dialog', {
//       method: 'POST',
//       headers: { 'Content-Type': 'application/json' },
//       body: JSON.stringify({
//         column_names: columns,
//         messages: conversationArray,
//       }),
//     });
//     return await response.json();
//   } catch (err) {
//     return { error: err.message };
//   }
// }

// export default LLMChat;
