// import React, { useEffect, useState } from 'react';
// import * as d3 from 'd3';
// import './InteractiveUMAP.css';
// import ChatDialog from './ChatDialog';



// const InteractiveUMAP = () => {
//   const [data, setData] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState(null);

//   const fetchData = () => {
//     setLoading(true);
//     setError(null);

//     fetch('http://localhost:5001/umap_data')
//       .then(response => {
//         if (!response.ok) {
//           throw new Error('Network response was not ok');
//         }
//         return response.json();
//       })
//       .then(data => {
//         setData(data.points);
//         setLoading(false);
//       })
//       .catch(error => {
//         setError(error);
//         setLoading(false);
//       });
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
//         // .attr('fill', 'blue')
//         .attr('fill', d => colorScale(d.metadata_number)) // Użyj koloru z palety
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
//       <h1>Interactive UMAP Visualization</h1>
//       <button
//         className="button-fetch"
//         onClick={fetchData}
//         disabled={loading}
//       >
//         {loading ? 'Loading...' : 'Fetch UMAP Data'}
//       </button>
//       {error && <div style={{ color: 'red' }}>Error: {error.message}</div>}
//       <div id="umap-viz">
//         <svg />
//       </div>
//       <div
//         id="tooltip"
//       ></div>
//     </div>
//   );
// };

// export default InteractiveUMAP;


// import React, { useState } from 'react';
// import ChatDialog from './ChatDialog'; // Import komponentu
// import './InteractiveUMAP.css';

// const InteractiveUMAP = () => {
//   const [isDataFetched, setIsDataFetched] = useState(false); // Stan: czy dane zostały pobrane
//   const [queryData, setQueryData] = useState(null); // Dane z okna czatu

//   const handleFetchData = (query) => {
//     console.log('User query:', query); // Debug: wyświetlenie zapytania
//     setQueryData(query); // Zapisanie zapytania
//     setIsDataFetched(true); // Przejście do wizualizacji
//   };

//   return (
//     <div>
//       <h1>Interactive UMAP Visualization</h1>
//       {!isDataFetched ? (
//         <ChatDialog onSubmit={handleFetchData} /> // Wyświetlenie okna czatu
//       ) : (
//         <div id="umap-viz">
//           <p>Query Data: {queryData}</p> {/* Debug: Wyświetlenie zapytania */}
//           <svg />
//         </div>
//       )}
//     </div>
//   );
// };

// export default InteractiveUMAP;

import React, { useState } from 'react';
import ChatDialog from './ChatDialog';
import './InteractiveUMAP.css';

const InteractiveUMAP = () => {
  const [isDataFetched, setIsDataFetched] = useState(false);
  const [messages, setMessages] = useState([]);
  const [step, setStep] = useState(0);
  const [dataCol, setDataCol] = useState(null);
  const [metadataCol, setMetadataCol] = useState(null);
  const [neighbours, setNeighbours] = useState(null);
  const [minDistance, setMinDistance] = useState(null);
  const [columnsNames, setColumnsNames] = useState([]);

  const hardcodedColumns = [
    "ID", "source", "affil", "lang", "type", "comment", "upvotes", "irony_sarcasm", "anger", "sadness",
    "stupidity", "personas", "places", "disaster", "rhetorical_q", "personal", "collective", "agency",
    "freedom", "migration", "numbers", "sources", "threat", "morality", "failure", "illegal", "fear", "trash",
    "lies", "youth", "god", "Unnamed: 31"
  ];

  // const handleFetchColumns = () => {
  //   setColumnsNames(hardcodedColumns);
  //   setMessages((prevMessages) => [
  //     ...prevMessages,
  //     { sender: 'bot', text: "Columns have been fetched! Here's the list of available columns:" },
  //     { sender: 'bot', text: hardcodedColumns.join(', ') },
  //     { sender: 'bot', text: "Please specify the data column (e.g., 'G'): " }
  //   ]);
  //   setStep(1);
  //   setIsDataFetched(true);
  // };

  const handleFetchColumns = async () => {
    try {
      const response = await fetch('http://localhost:5000/get_columns');
      if (!response.ok) {
        throw new Error('Failed to fetch columns');
      }
      const data = await response.json();
      const fetchedColumns = data.column_names;

      setColumnsNames(fetchedColumns);

      setMessages((prevMessages) => [
        ...prevMessages,
        { sender: 'bot', text: "Columns have been fetched! Here's the list of available columns:" },
        { sender: 'bot', text: fetchedColumns.join(', ') },
        { sender: 'bot', text: "Please specify the data column (e.g., 'G'): " }
      ]);

      setStep(1);
      setIsDataFetched(true);
    } catch (error) {
      setMessages((prevMessages) => [
        ...prevMessages,
        { sender: 'bot', text: "Failed to fetch columns. Please try again." }
      ]);
    }
  };
  const handleUserInput = (inputText) => {
    let newMessage = { sender: 'user', text: inputText };
    setMessages((prevMessages) => [...prevMessages, newMessage]);

    switch (step) {
      case 1: {
        const selectedDataCol = handleColumnSelection(inputText);
        if (!selectedDataCol) {
          setMessages((prevMessages) => [
            ...prevMessages,
            { sender: 'bot', text: "Invalid data column! Please enter a valid letter or name." }
          ]);
        } else {
          setDataCol(selectedDataCol);
          setMessages((prevMessages) => [
            ...prevMessages,
            { sender: 'bot', text: `You selected data column '${selectedDataCol}'. Please specify the metadata column.` }
          ]);
          setStep(2);
        }
        break;
      }
      case 2: {
        const selectedMetadataCol = handleColumnSelection(inputText);
        if (!selectedMetadataCol) {
          setMessages((prevMessages) => [
            ...prevMessages,
            { sender: 'bot', text: "Invalid metadata column! Please enter a valid letter or name." }
          ]);
        } else if (dataCol === selectedMetadataCol) {
          setMessages((prevMessages) => [
            ...prevMessages,
            { sender: 'bot', text: "Error: Data and metadata columns must be different! Please specify again." }
          ]);
        } else {
          setMetadataCol(selectedMetadataCol);
          setMessages((prevMessages) => [
            ...prevMessages,
            { sender: 'bot', text: `You selected metadata column '${selectedMetadataCol}'. Please specify the number of neighbours (e.g., 15).` }
          ]);
          setStep(3);
        }
        break;
      }
      case 3: {
        const parsedNeighbours = parseInt(inputText, 10);
        if (isNaN(parsedNeighbours) || parsedNeighbours <= 0) {
          setMessages((prevMessages) => [
            ...prevMessages,
            { sender: 'bot', text: "Invalid number of neighbours! Please enter a positive integer." }
          ]);
        } else {
          setNeighbours(parsedNeighbours);
          setMessages((prevMessages) => [
            ...prevMessages,
            { sender: 'bot', text: `You selected ${parsedNeighbours} neighbours. Please specify the minimum distance (e.g., 0.1).` }
          ]);
          setStep(4);
        }
        break;
      }
      case 4: {
        const parsedMinDistance = parseFloat(inputText);
        if (isNaN(parsedMinDistance) || parsedMinDistance < 0 || parsedMinDistance > 1) {
          setMessages((prevMessages) => [
            ...prevMessages,
            { sender: 'bot', text: "Invalid minimum distance! Please enter a number between 0 and 1." }
          ]);
        } else {
          setMinDistance(parsedMinDistance);
          setMessages((prevMessages) => [
            ...prevMessages,
            { sender: 'bot', text: `You selected a minimum distance of ${parsedMinDistance}. Do you confirm? (yes/no)` }
          ]);
          setStep(5);
        }
        break;
      }
      case 5: {
        if (inputText.toLowerCase() === 'yes') {
          setMessages((prevMessages) => [
            ...prevMessages,
            { sender: 'bot', text: `Selection confirmed: Data column is '${dataCol}', metadata column is '${metadataCol}', neighbours = ${neighbours}, min_distance = ${minDistance}` }
          ]);
          
        } else {
          setMessages((prevMessages) => [
            ...prevMessages,
            { sender: 'bot', text: "Selection not confirmed. Please start over." }
          ]);
          setStep(0);
        }
        break;
      }
      default:
        break;
    }
  };

  const handleColumnSelection = (inputText) => {
    const normalizedInput = inputText.trim().toLowerCase();
    return columnsNames.find(col => col.toLowerCase() === normalizedInput) || null;
  };

  return (
    <div>
      <h1>Interactive UMAP Visualization</h1>
      {!isDataFetched ? (
        <div>
          <button className="button-fetch" onClick={handleFetchColumns}>
            Fetch Columns
          </button>
        </div>
      ) : (
        <ChatDialog
          onSubmit={handleUserInput}
          messages={messages}
        />
      )}
    </div>
  );
};

export default InteractiveUMAP;
