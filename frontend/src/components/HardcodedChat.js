
import React, { useState } from 'react';
import ChatDialog from './ChatDialog';

const HardcodedChat = ({ columns, onSubmit }) => {
  const [messages, setMessages] = useState([
    {
      sender: 'bot',
      text: `Witaj, mam pobrane kolumny:\n${columns.join(', ')}\nPodaj nazwę kolumny z danymi (np. "G")`,
    },
  ]);
  const [step, setStep] = useState(1);

  const [dataCol, setDataCol] = useState('');
  const [metadataCol, setMetadataCol] = useState('');
  const [neighbors, setNeighbors] = useState(null);
  const [minDistance, setMinDistance] = useState(null);

  const handleUserInput = (inputText) => {
    const userMessage = { sender: 'user', text: inputText };
    setMessages((prev) => [...prev, userMessage]);

    switch (step) {
      case 1: {
        const col = findColumn(inputText, columns);
        if (!col) {
          addBotMessage(`Nie znaleziono kolumny '${inputText}'. Spróbuj ponownie.`);
        } else {
          setDataCol(col);
          addBotMessage(`Wybrałeś kolumnę danych: ${col}. Czy to poprawne? (tak/nie)`);
          setStep(2);
        }
        break;
      }
      case 2: {
        if (inputText.toLowerCase() === 'tak') {
          addBotMessage('Podaj kolumnę metadanych:');
          setStep(3);
        } else if (inputText.toLowerCase() === 'nie') {
          addBotMessage('Ok, podaj kolumnę danych jeszcze raz:');
          setStep(1);
        } else {
          addBotMessage('Odpowiedz "tak" lub "nie"');
        }
        break;
      }
      case 3: {
        const col = findColumn(inputText, columns);
        if (!col) {
          addBotMessage(`Nie znaleziono kolumny '${inputText}'. Spróbuj ponownie.`);
        } else if (col === dataCol) {
          addBotMessage('Kolumna metadanych musi się różnić od kolumny danych. Spróbuj ponownie.');
        } else {
          setMetadataCol(col);
          addBotMessage(`Wybrałeś kolumnę metadanych: ${col}. Czy to poprawne? (tak/nie)`);
          setStep(4);
        }
        break;
      }
      case 4: {
        if (inputText.toLowerCase() === 'tak') {
          addBotMessage('Podaj liczbę sąsiadów (np. 15):');
          setStep(5);
        } else if (inputText.toLowerCase() === 'nie') {
          addBotMessage('Ok, podaj kolumnę metadanych jeszcze raz:');
          setStep(3);
        } else {
          addBotMessage('Odpowiedz "tak" lub "nie"');
        }
        break;
      }
      case 5: {
        const n = parseInt(inputText, 10);
        if (isNaN(n) || n <= 0) {
          addBotMessage('Nieprawidłowa liczba sąsiadów. Spróbuj ponownie.');
        } else {
          setNeighbors(n);
          addBotMessage(`Wybrałeś ${n} sąsiadów. Czy to poprawne? (tak/nie)`);
          setStep(6);
        }
        break;
      }
      case 6: {
        if (inputText.toLowerCase() === 'tak') {
          addBotMessage('Podaj minimalny dystans (np. 0.1):');
          setStep(7);
        } else if (inputText.toLowerCase() === 'nie') {
          addBotMessage('Ok, podaj liczbę sąsiadów jeszcze raz:');
          setStep(5);
        } else {
          addBotMessage('Odpowiedz "tak" lub "nie"');
        }
        break;
      }
      case 7: {
        const dist = parseFloat(inputText);
        if (isNaN(dist) || dist < 0 || dist > 1) {
          addBotMessage('Nieprawidłowy dystans! Podaj liczbę z zakresu [0,1]');
        } else {
          setMinDistance(dist);
          addBotMessage(`Ustawiono min_distance = ${dist}. Czy to poprawne? (tak/nie)`);
          setStep(8);
        }
        break;
      }
      case 8: {
        if (inputText.toLowerCase() === 'tak') {
          addBotMessage(
            `OK. Parametry:\nDane: ${dataCol}\nMetadata: ${metadataCol}\nNeighbors: ${neighbors}\nMinDist: ${minDistance}\nPobieram UMAP...`
          );
          onSubmit(dataCol, metadataCol, neighbors, minDistance);
          setStep(9);
        } else if (inputText.toLowerCase() === 'nie') {
          addBotMessage('Ok, podaj minimalny dystans jeszcze raz:');
          setStep(7);
        } else {
          addBotMessage('Odpowiedz "tak" lub "nie"');
        }
        break;
      }
      default:
        break;
    }
  };

  const addBotMessage = (text) => {
    setMessages((prev) => [...prev, { sender: 'bot', text }]);
  };

  const findColumn = (input, availableCols) => {
    const lower = input.toLowerCase().trim();
    return availableCols.find((c) => c.toLowerCase() === lower) || null;
  };

  return (
    <ChatDialog onSubmit={handleUserInput} messages={messages} />
  );
};

export default HardcodedChat;
