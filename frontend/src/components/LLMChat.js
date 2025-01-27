import React, { useState } from 'react';
import ChatDialog from './ChatDialog';

const LLMChat = ({ columns, onSubmit }) => {
  const [messages, setMessages] = useState([
    { sender: 'bot', text: 'Cześć, jestem asystentem LLM! Jak mogę pomóc?' },
  ]);

  const [pendingDataCol, setPendingDataCol] = useState(null);
  const [pendingMetaCol, setPendingMetaCol] = useState(null);

  const [lastSuggestedColumns, setLastSuggestedColumns] = useState({ dataColumn: null, metaColumn: null });

  const [askingNeighbors, setAskingNeighbors] = useState(false);
  const [askingMinDistance, setAskingMinDistance] = useState(false);
  const [neighbors, setNeighbors] = useState(null);
  const [minDistance, setMinDistance] = useState(null);

  const handleUserInput = async (inputText) => {
    const userMsg = { sender: 'user', text: inputText };
    setMessages((prev) => [...prev, userMsg]);

    if (askingNeighbors) {
      const parsedNeighbors = parseInt(inputText, 10);
      if (isNaN(parsedNeighbors) || parsedNeighbors <= 0) {
        setMessages((prev) => [
          ...prev,
          { sender: 'bot', text: 'Nieprawidłowa liczba sąsiadów! Podaj liczbę większą od 0.' },
        ]);
        return;
      }
      setNeighbors(parsedNeighbors);
      setMessages((prev) => [
        ...prev,
        { sender: 'bot', text: `Liczba sąsiadów ustawiona na ${parsedNeighbors}. Podaj minimalny dystans (np. 0.1):` },
      ]);
      setAskingNeighbors(false);
      setAskingMinDistance(true);
      return;
    }

    if (askingMinDistance) {
      const parsedMinDistance = parseFloat(inputText);
      if (isNaN(parsedMinDistance) || parsedMinDistance < 0 || parsedMinDistance > 1) {
        setMessages((prev) => [
          ...prev,
          { sender: 'bot', text: 'Nieprawidłowy dystans! Podaj liczbę z zakresu 0 do 1.' },
        ]);
        return;
      }
      setMinDistance(parsedMinDistance);
      setMessages((prev) => [
        ...prev,
        { sender: 'bot', text: `Minimalny dystans ustawiony na ${parsedMinDistance}. Wykonuję UMAP...` },
      ]);
      setAskingMinDistance(false);
      onSubmit(pendingDataCol, pendingMetaCol, neighbors, parsedMinDistance);
      return;
    }

    if (pendingDataCol && pendingMetaCol) {
      if (inputText.toLowerCase() === 'tak') {
        setMessages((prev) => [
          ...prev,
          { sender: 'bot', text: 'Świetnie! Teraz podaj liczbę sąsiadów (np. 15):' },
        ]);
        setAskingNeighbors(true);
        return;
      } else if (inputText.toLowerCase() === 'nie') {
        setPendingDataCol(null);
        setPendingMetaCol(null);
        setMessages((prev) => [
          ...prev,
          { sender: 'bot', text: 'OK, podaj inne kolumny.' },
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

    // if (responseData.data_column && responseData.metadata_column) {
    //   setPendingDataCol(responseData.data_column);
    //   setPendingMetaCol(responseData.metadata_column);
    //   setMessages((prev) => [
    //     ...prev,
    //     {
    //       sender: 'bot',
    //       text: `Sugeruję kolumny: ${responseData.data_column} i ${responseData.metadata_column}. Potwierdzasz? (tak/nie)`,
    //     },
    //   ]);
    // }
    if (responseData.data_column && responseData.metadata_column) {
      const { data_column: newDataColumn, metadata_column: newMetaColumn } = responseData;

      // Sprawdź, czy proponowane kolumny różnią się od ostatnich
      if (
        lastSuggestedColumns.dataColumn !== newDataColumn ||
        lastSuggestedColumns.metaColumn !== newMetaColumn
      ) {
        setPendingDataCol(newDataColumn);
        setPendingMetaCol(newMetaColumn);
        setLastSuggestedColumns({ dataColumn: newDataColumn, metaColumn: newMetaColumn });
        setMessages((prev) => [
          ...prev,
          {
            sender: 'bot',
            text: `Sugeruję kolumny: ${newDataColumn} i ${newMetaColumn}. Potwierdzasz? (tak/nie)`,
          },
        ]);
      }
      // } else {
      //   // Jeśli kolumny są takie same, pomiń wyświetlanie wiadomości
      //   setMessages((prev) => [
      //     ...prev,
      //     {
      //       sender: 'bot',
      //       text: 'Nie mam innych propozycji kolumn. Jeśli to się nie zgadza, podaj nowe dane.',
      //     },
      //   ]);
      // }
    }
  };

  return <ChatDialog onSubmit={handleUserInput} messages={messages} />;
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
