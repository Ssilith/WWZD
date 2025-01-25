// import React, { useState, useEffect, useRef } from 'react';
// import * as d3 from 'd3';
// import Header from './components/Header.js';
// import DragUploadSection from './components/DragUploadSection.js';
// import ChatDialog from './components/ChatDialog.js';
// import './InteractiveUMAP.css';
// import './components/DragUploadSection.css'


// const InteractiveUMAP = () => {
//   const [isDataFetched, setIsDataFetched] = useState(false);
//   const [messages, setMessages] = useState([]);
//   const [step, setStep] = useState(0);
//   const [dataCol, setDataCol] = useState(null);
//   const [metadataCol, setMetadataCol] = useState(null);
//   const [neighbours, setNeighbours] = useState(null);
//   const [minDistance, setMinDistance] = useState(null);
//   const [columnsNames, setColumnsNames] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [data, setData] = useState(null);
//   const [error, setError] = useState(null);
//   const [showChat, setShowChat] = useState(true);
//   const [showFetchDataButton, setShowFetchDataButton] = useState(true);
//   const [isFileUploaded, setIsFileUploaded] = useState(false);

//   const handleFileUploadSuccess = () => {
//     setIsFileUploaded(true);
//   };

//   const handleColumnSelection = (inputText) => {
//     const normalizedInput = inputText.trim().toLowerCase();
//     return columnsNames.find(col => col.toLowerCase() === normalizedInput) || null;
//   };

//   const handleFetchColumns = async () => {
//     try {
//       const response = await fetch('http://localhost:5001/get_columns');
//       if (!response.ok) {
//         throw new Error('Failed to fetch columns');
//       }
//       const data = await response.json();
//       const fetchedColumns = data.column_names;

//       setColumnsNames(fetchedColumns);

//       setMessages((prevMessages) => [
//         ...prevMessages,
//         { sender: 'bot', text: `Columns have been fetched! \nHere's the list of available columns:\n${fetchedColumns.join(', ')}\nPlease specify the data column (e.g., 'G').` }
//       ]);

//       setStep(1);
//       setIsDataFetched(true);
//     } catch (error) {
//       setMessages((prevMessages) => [
//         ...prevMessages,
//         { sender: 'bot', text: "Failed to fetch columns. Please try again." }
//       ]);
//     }
//   };

//   const handleUserInput = (inputText) => {
//     let newMessage = { sender: 'user', text: inputText };
//     setMessages((prevMessages) => [...prevMessages, newMessage]);

//     switch (step) {
//       case 1:
//         const selectedDataCol = handleColumnSelection(inputText);
//         if (!selectedDataCol) {
//           setMessages((prevMessages) => [
//             ...prevMessages,
//             { sender: 'bot', text: "Invalid data column! Please enter a valid letter or column name." }
//           ]);
//         } else {
//           setDataCol(selectedDataCol);
//           setMessages((prevMessages) => [
//             ...prevMessages,
//             { sender: 'bot', text: `You selected data column '${selectedDataCol}'. Is this correct? (yes/no)` }
//           ]);
//           setStep(2);
//         }
//         break;
//       case 2:
//         if (inputText.toLowerCase() === 'yes') {
//           setMessages((prevMessages) => [
//             ...prevMessages,
//             { sender: 'bot', text: "Great! Now, please specify the metadata column:" }
//           ]);
//           setStep(3);
//         } else if (inputText.toLowerCase() === 'no') {
//           setMessages((prevMessages) => [
//             ...prevMessages,
//             { sender: 'bot', text: "Please specify the data column again:" }
//           ]);
//           setStep(1);
//         } else {
//           setMessages((prevMessages) => [
//             ...prevMessages,
//             { sender: 'bot', text: "Invalid response. Please type 'yes' or 'no'." }
//           ]);
//         }
//         break;
//       case 3:
//         const selectedMetadataCol = handleColumnSelection(inputText);
//         if (!selectedMetadataCol) {
//           setMessages((prevMessages) => [
//             ...prevMessages,
//             { sender: 'bot', text: "Invalid metadata column! Please enter a valid letter or column name." }
//           ]);
//         } else if (dataCol === selectedMetadataCol) {
//           setMessages((prevMessages) => [
//             ...prevMessages,
//             { sender: 'bot', text: "Error: Data and metadata columns must be different! Please specify again." }
//           ]);
//         } else {
//           setMetadataCol(selectedMetadataCol);
//           setMessages((prevMessages) => [
//             ...prevMessages,
//             { sender: 'bot', text: `You selected metadata column '${selectedMetadataCol}'. Is this correct? (yes/no)` }
//           ]);
//           setStep(4);
//         }
//         break;
//       case 4:
//         if (inputText.toLowerCase() === 'yes') {
//           setMessages((prevMessages) => [
//             ...prevMessages,
//             { sender: 'bot', text: "Great! Now, please specify the number of neighbours (e.g., 15):" }
//           ]);
//           setStep(5);
//         } else if (inputText.toLowerCase() === 'no') {
//           setMessages((prevMessages) => [
//             ...prevMessages,
//             { sender: 'bot', text: "Please specify the metadata column again:" }
//           ]);
//           setStep(3);
//         } else {
//           setMessages((prevMessages) => [
//             ...prevMessages,
//             { sender: 'bot', text: "Invalid response. Please type 'yes' or 'no'." }
//           ]);
//         }
//         break;
//       case 5:
//         const parsedNeighbours = parseInt(inputText, 10);
//         if (isNaN(parsedNeighbours) || parsedNeighbours <= 0) {
//           setMessages((prevMessages) => [
//             ...prevMessages,
//             { sender: 'bot', text: "Invalid number of neighbours! Please enter a positive integer." }
//           ]);
//         } else {
//           setNeighbours(parsedNeighbours);
//           setMessages((prevMessages) => [
//             ...prevMessages,
//             { sender: 'bot', text: `You selected ${parsedNeighbours} neighbours. Is this correct? (yes/no)` }
//           ]);
//           setStep(6);
//         }
//         break;
//       case 6:
//         if (inputText.toLowerCase() === 'yes') {
//           setMessages((prevMessages) => [
//             ...prevMessages,
//             { sender: 'bot', text: "Great! Now, please specify the minimum distance (e.g., 0.1):" }
//           ]);
//           setStep(7);
//         } else if (inputText.toLowerCase() === 'no') {
//           setMessages((prevMessages) => [
//             ...prevMessages,
//             { sender: 'bot', text: "Please specify the number of neighbours again:" }
//           ]);
//           setStep(5);
//         } else {
//           setMessages((prevMessages) => [
//             ...prevMessages,
//             { sender: 'bot', text: "Invalid response. Please type 'yes' or 'no'." }
//           ]);
//         }
//         break;
//       case 7:
//         const parsedMinDistance = parseFloat(inputText);
//         if (isNaN(parsedMinDistance) || parsedMinDistance < 0 || parsedMinDistance > 1) {
//           setMessages((prevMessages) => [
//             ...prevMessages,
//             { sender: 'bot', text: "Invalid minimum distance! Please enter a number between 0 and 1." }
//           ]);
//         } else {
//           setMinDistance(parsedMinDistance);
//           setMessages((prevMessages) => [
//             ...prevMessages,
//             { sender: 'bot', text: `You selected a minimum distance of ${parsedMinDistance}. Is this correct? (yes/no)` }
//           ]);
//           setStep(8);
//         }
//         break;
//       case 8:
//         if (inputText.toLowerCase() === 'yes') {
//           setMessages((prevMessages) => [
//             ...prevMessages,
//             { sender: 'bot', text: `Selection complete: Data column = '${dataCol}', Metadata column = '${metadataCol}', Neighbours = ${neighbours}, Min distance = ${minDistance}.` }
//           ]);
//           fetchData();
//         } else if (inputText.toLowerCase() === 'no') {
//           setMessages((prevMessages) => [
//             ...prevMessages,
//             { sender: 'bot', text: "Please specify the minimum distance again:" }
//           ]);
//           setStep(7);
//         } else {
//           setMessages((prevMessages) => [
//             ...prevMessages,
//             { sender: 'bot', text: "Invalid response. Please type 'yes' or 'no'." }
//           ]);
//         }
//         break;
//       default:
//         break;
//     }
//   };

//   const fetchData = async () => {
//     setLoading(true);
//     setError(null);

//     try {
//       const response = await fetch('http://localhost:5001/umap_data', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({
//           data_column: dataCol,
//           metadata_column: metadataCol,
//           neighbours: neighbours,
//           min_distance: minDistance,
//         }),
//       });

//       if (!response.ok) {
//         throw new Error('Failed to submit data');
//       }
//       const resultData = await response.json();
//       setData(resultData.points);
//       setLoading(false);
//       setShowFetchDataButton(false);
//       setShowChat(false);
//     } catch (error) {
//       setError(error);
//       setLoading(false);
//     }
//   };


//   useEffect(() => {
//     if (data) {
//       const width = 900;
//       const height = 900;

//       const svg = d3
//         .select('#umap-viz')
//         .select('svg');
//       svg.selectAll('*').remove();

//       svg.attr('width', width)
//         .attr('height', height);

//       const g = svg.append('g');
//       const colorScale = d3.scaleSequential(d3.interpolateViridis)
//         .domain([d3.min(data, d => d.metadata_number), d3.max(data, d => d.metadata_number)]);

//       const xScale = d3.scaleLinear()
//         .domain([d3.min(data, d => d.x), d3.max(data, d => d.x)])
//         .range([0, width])
//         .clamp(true);

//       const yScale = d3.scaleLinear()
//         .domain([d3.min(data, d => d.y), d3.max(data, d => d.y)])
//         .range([height, 0])
//         .clamp(true);

//       g.selectAll('circle')
//         .data(data)
//         .enter()
//         .append('circle')
//         .attr('cx', d => xScale(d.x))
//         .attr('cy', d => yScale(d.y))
//         .attr('r', 5)
//         .attr('fill', d => colorScale(d.metadata_number))
//         .on('mouseover', function (event, d) {
//           const tooltip = d3.select('#tooltip');
//           tooltip
//             .style('left', `${event.pageX + 5}px`)
//             .style('top', `${event.pageY + 5}px`)
//             .style('display', 'block')
//             .html(`
//               <strong>Index:</strong> ${d.index}<br/>
//               <strong>Metadata:</strong> ${d.metadata}<br/>
//               <strong>Metadata_number:</strong> ${d.metadata_number}<br/>
//               <strong>Text:</strong> ${d.data}
//             `);
//         })
//         .on('mouseout', () => {
//           d3.select('#tooltip').style('display', 'none');
//         });

//       svg.append('rect')
//         .attr('x', 0)
//         .attr('y', 0)
//         .attr('width', width)
//         .attr('height', height)
//         .attr('stroke', 'black')
//         .attr('stroke-width', 8)
//         .attr('fill', 'none')
//         .style('pointer-events', 'none');
//     }
//   }, [data]);


//   return (
//     <div>
//       <Header></Header>
//       {loading ? (
//         <div>Loading...</div>
//       ) : isDataFetched && showChat ? (
//         <div className="page-container">
//           <ChatDialog onSubmit={handleUserInput} messages={messages} />
//         </div>
//       ) : (
//         <div className='app-container'>
//           {showFetchDataButton && (
//             <>
//               {!isFileUploaded && <DragUploadSection onFileUploaded={handleFileUploadSuccess} />}
//               {isFileUploaded && !isDataFetched && (
//                 <button className="button-fetch" onClick={handleFetchColumns}>
//                   Fetch Columns
//                 </button>
//               )}
//             </>
//           )}
//         </div>
//       )}
//       {error && <div style={{ color: 'red' }}>Error: {error.message}</div>}
//       <div id="umap-viz">
//         <svg />
//       </div>
//       <div id="tooltip"></div>

//     </div>
//   );
// };

// export default InteractiveUMAP;


import React, { useState, useEffect } from 'react';
import * as d3 from 'd3';
import Header from './components/Header';
import DragUploadSection from './components/DragUploadSection';
import HardcodedChat from './HardcodedChat';
import LLMChat from './LLMChat';
import './InteractiveUMAP.css';
import ChatDialog from './components/ChatDialog';

const InteractiveUMAP = () => {
  const [isFileUploaded, setIsFileUploaded] = useState(false);
  const [columns, setColumns] = useState([]); // nazwy kolumn z backendu
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  // Ten stan określa, czy po pobraniu kolumn włączamy chat.
  const [showDialog, setShowDialog] = useState(false);


  // Rodzaj czatu (hardcoded vs llm)
  const [chatMode, setChatMode] = useState(null);

  const handleFileUploadSuccess = () => {
    setIsFileUploaded(true);
  };

  const handleFetchColumns = async () => {
    if (!chatMode) {
      alert('Najpierw wybierz tryb rozmowy!');
      return;
    }

    try {
      setLoading(true);
      const response = await fetch('http://localhost:5001/get_columns');
      if (!response.ok) {
        throw new Error('Failed to fetch columns');
      }
      const data = await response.json();
      setColumns(data.column_names || []);
      setShowDialog(true); // Wyświetl okno dialogowe po pobraniu danych
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  // Odbiera dane parametry (col, metaCol, neigh, dist) i pobiera UMAP
  const fetchUMAPData = async (dataCol, metadataCol, neighbours, minDistance) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('http://localhost:5001/umap_data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          data_column: dataCol,
          metadata_column: metadataCol,
          neighbours,
          min_distance: minDistance,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit data');
      }

      const resultData = await response.json();
      setData(resultData.points);
      setShowDialog(false);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (data) {
      const width = 900;
      const height = 900;

      const svg = d3
        .select('#umap-viz')
        .select('svg');
      svg.selectAll('*').remove();

      svg.attr('width', width)
        .attr('height', height);

      const g = svg.append('g');
      const colorScale = d3.scaleSequential(d3.interpolateViridis)
        .domain([d3.min(data, d => d.metadata_number), d3.max(data, d => d.metadata_number)]);

      const xScale = d3.scaleLinear()
        .domain([d3.min(data, d => d.x), d3.max(data, d => d.x)])
        .range([0, width])
        .clamp(true);

      const yScale = d3.scaleLinear()
        .domain([d3.min(data, d => d.y), d3.max(data, d => d.y)])
        .range([height, 0])
        .clamp(true);

      g.selectAll('circle')
        .data(data)
        .enter()
        .append('circle')
        .attr('cx', d => xScale(d.x))
        .attr('cy', d => yScale(d.y))
        .attr('r', 5)
        .attr('fill', d => colorScale(d.metadata_number))
        .on('mouseover', function (event, d) {
          const tooltip = d3.select('#tooltip');
          tooltip
            .style('left', `${event.pageX + 5}px`)
            .style('top', `${event.pageY + 5}px`)
            .style('display', 'block')
            .html(`
                  <strong>Index:</strong> ${d.index}<br/>
                  <strong>Metadata:</strong> ${d.metadata}<br/>
                  <strong>Metadata_number:</strong> ${d.metadata_number}<br/>
                  <strong>Text:</strong> ${d.data}
                `);
        })
        .on('mouseout', () => {
          d3.select('#tooltip').style('display', 'none');
        });

      svg.append('rect')
        .attr('x', 0)
        .attr('y', 0)
        .attr('width', width)
        .attr('height', height)
        .attr('stroke', 'black')
        .attr('stroke-width', 8)
        .attr('fill', 'none')
        .style('pointer-events', 'none');
    }
  }, [data]);

  return (
    <div className="page-container">
      <Header />

      {/* 1. Sekcja uploadu pliku */}
      {!isFileUploaded && (
        <DragUploadSection onFileUploaded={handleFileUploadSuccess} />
      )}

      {/* 2. Wybór trybu rozmowy */}
      {isFileUploaded && !loading && !showDialog && !data && (
        <div className="radio-group">
          <p>Wybierz formę rozmowy:</p>
          <label>
            <input
              type="radio"
              name="chatMode"
              value="hardcoded"
              checked={chatMode === 'hardcoded'}
              onChange={(e) => setChatMode(e.target.value)}
            />
            Czat hardcoded (z góry ustalone kroki)
          </label>
          <br />
          <label>
            <input
              type="radio"
              name="chatMode"
              value="llm"
              checked={chatMode === 'llm'}
              onChange={(e) => setChatMode(e.target.value)}
            />
            Czat LLM (np. ChatGPT)
          </label>
          <br />
          <button onClick={handleFetchColumns} className="button-fetch">
            Fetch Columns
          </button>
        </div>
      )}

      {/* 3. Okno dialogowe */}
      {!loading && showDialog && chatMode === 'hardcoded' && (
        <HardcodedChat columns={columns} onSubmit={fetchUMAPData} />
      )}
      {!loading && showDialog && chatMode === 'llm' && (
       <LLMChat columns={columns} onSubmit={fetchUMAPData} />
      )}

      {/* 4. "Loading..." */}
      {loading && (
        <div style={{ marginTop: '20px', fontSize: '18px', textAlign: 'center' }}>
          Wczytywanie danych...
        </div>
      )}

      {/* 5. Wizualizacja */}
      {data && (
        <div id="umap-viz">
          <svg />
        </div>
      )}

      <div id="tooltip"></div>


      {/* 6. Obsługa błędów */}
      {error && <div style={{ color: 'red' }}>Błąd: {error.message}</div>}
    </div>
  );
};

export default InteractiveUMAP;
