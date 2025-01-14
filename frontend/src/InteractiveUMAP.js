import React, { useState, useEffect, useRef } from 'react';
import * as d3 from 'd3';
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
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [showChat, setShowChat] = useState(true);
  const [showFetchDataButton, setShowFetchDataButton] = useState(true);

  const hardcodedColumns = [
    "ID", "source", "affil", "lang", "type", "comment", "upvotes", "irony_sarcasm", "anger", "sadness",
    "stupidity", "personas", "places", "disaster", "rhetorical_q", "personal", "collective", "agency",
    "freedom", "migration", "numbers", "sources", "threat", "morality", "failure", "illegal", "fear", "trash",
    "lies", "youth", "god", "Unnamed: 31"
  ];

  const handleColumnSelection = (inputText) => {
    const normalizedInput = inputText.trim().toLowerCase();
    return columnsNames.find(col => col.toLowerCase() === normalizedInput) || null;
  };

  const handleFetchColumns = async () => {
    try {
      const response = await fetch('http://localhost:5001/get_columns');
      if (!response.ok) {
        throw new Error('Failed to fetch columns');
      }
      const data = await response.json();
      const fetchedColumns = data.column_names;

      setColumnsNames(fetchedColumns);

      setMessages((prevMessages) => [
        ...prevMessages,
        { sender: 'bot', text: `Columns have been fetched! \nHere's the list of available columns:\n${fetchedColumns.join(', ')}\nPlease specify the data column (e.g., 'G').` }
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

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (file) {
      console.log(`Selected file: ${file.name}`);

      const formData = new FormData();
      formData.append("file", file);

      try {
        const response = await fetch('http://localhost:5001/upload_file', {
          method: 'POST',
          body: formData,
        });

        if (response.ok) {
          const contentType = response.headers.get('Content-Type');
          if (contentType && contentType.includes('application/json')) {
            const result = await response.json();
            console.log("File uploaded successfully!", result);
          } else {
            const text = await response.text();
            console.error("Server returned non-JSON response:", text);
          }
        } else {
          console.error(`Error uploading file: ${response.status} ${response.statusText}`);
        }
      } catch (error) {
        console.error("Error connecting to the server:", error);
      }
    }
  };




  const handleUserInput = (inputText) => {
    let newMessage = { sender: 'user', text: inputText };
    setMessages((prevMessages) => [...prevMessages, newMessage]);

    switch (step) {
      case 1:
        const selectedDataCol = handleColumnSelection(inputText);
        if (!selectedDataCol) {
          setMessages((prevMessages) => [
            ...prevMessages,
            { sender: 'bot', text: "Invalid data column! Please enter a valid letter or column name." }
          ]);
        } else {
          setDataCol(selectedDataCol);
          setMessages((prevMessages) => [
            ...prevMessages,
            { sender: 'bot', text: `You selected data column '${selectedDataCol}'. Is this correct? (yes/no)` }
          ]);
          setStep(2);
        }
        break;
      case 2:
        if (inputText.toLowerCase() === 'yes') {
          setMessages((prevMessages) => [
            ...prevMessages,
            { sender: 'bot', text: "Great! Now, please specify the metadata column:" }
          ]);
          setStep(3);
        } else if (inputText.toLowerCase() === 'no') {
          setMessages((prevMessages) => [
            ...prevMessages,
            { sender: 'bot', text: "Please specify the data column again:" }
          ]);
          setStep(1);
        } else {
          setMessages((prevMessages) => [
            ...prevMessages,
            { sender: 'bot', text: "Invalid response. Please type 'yes' or 'no'." }
          ]);
        }
        break;
      case 3:
        const selectedMetadataCol = handleColumnSelection(inputText);
        if (!selectedMetadataCol) {
          setMessages((prevMessages) => [
            ...prevMessages,
            { sender: 'bot', text: "Invalid metadata column! Please enter a valid letter or column name." }
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
            { sender: 'bot', text: `You selected metadata column '${selectedMetadataCol}'. Is this correct? (yes/no)` }
          ]);
          setStep(4);
        }
        break;
      case 4:
        if (inputText.toLowerCase() === 'yes') {
          setMessages((prevMessages) => [
            ...prevMessages,
            { sender: 'bot', text: "Great! Now, please specify the number of neighbours (e.g., 15):" }
          ]);
          setStep(5);
        } else if (inputText.toLowerCase() === 'no') {
          setMessages((prevMessages) => [
            ...prevMessages,
            { sender: 'bot', text: "Please specify the metadata column again:" }
          ]);
          setStep(3);
        } else {
          setMessages((prevMessages) => [
            ...prevMessages,
            { sender: 'bot', text: "Invalid response. Please type 'yes' or 'no'." }
          ]);
        }
        break;
      case 5:
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
            { sender: 'bot', text: `You selected ${parsedNeighbours} neighbours. Is this correct? (yes/no)` }
          ]);
          setStep(6);
        }
        break;
      case 6:
        if (inputText.toLowerCase() === 'yes') {
          setMessages((prevMessages) => [
            ...prevMessages,
            { sender: 'bot', text: "Great! Now, please specify the minimum distance (e.g., 0.1):" }
          ]);
          setStep(7);
        } else if (inputText.toLowerCase() === 'no') {
          setMessages((prevMessages) => [
            ...prevMessages,
            { sender: 'bot', text: "Please specify the number of neighbours again:" }
          ]);
          setStep(5);
        } else {
          setMessages((prevMessages) => [
            ...prevMessages,
            { sender: 'bot', text: "Invalid response. Please type 'yes' or 'no'." }
          ]);
        }
        break;
      case 7:
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
            { sender: 'bot', text: `You selected a minimum distance of ${parsedMinDistance}. Is this correct? (yes/no)` }
          ]);
          setStep(8);
        }
        break;
      case 8:
        if (inputText.toLowerCase() === 'yes') {
          setMessages((prevMessages) => [
            ...prevMessages,
            { sender: 'bot', text: `Selection complete: Data column = '${dataCol}', Metadata column = '${metadataCol}', Neighbours = ${neighbours}, Min distance = ${minDistance}.` }
          ]);
          fetchData();
        } else if (inputText.toLowerCase() === 'no') {
          setMessages((prevMessages) => [
            ...prevMessages,
            { sender: 'bot', text: "Please specify the minimum distance again:" }
          ]);
          setStep(7);
        } else {
          setMessages((prevMessages) => [
            ...prevMessages,
            { sender: 'bot', text: "Invalid response. Please type 'yes' or 'no'." }
          ]);
        }
        break;
      default:
        break;
    }
  };

  // const fetchData = async () => {
  //   setLoading(true);
  //   setError(null);

  //   try {
  //     // Zmiana na metodę GET
  //     const response = await fetch(`http://localhost:5001/umap_data?data_column=${dataCol}&metadata_column=${metadataCol}&neighbours=${neighbours}&min_distance=${minDistance}`);
  //     if (!response.ok) {
  //       throw new Error('Network response was not ok');
  //     }

  //     const data = await response.json();
  //     setData(data.points);
  //     setShowChat(false);
  //     setShowFetchDataButton(false);
  //     setLoading(false);
  //   } catch (error) {
  //     setError(error);
  //     setLoading(false);
  //   }
  // };

  const fetchData = async () => {
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
          neighbours: neighbours,
          min_distance: minDistance,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit data');
      }
      const resultData = await response.json();
      setData(resultData.points);
      setLoading(false);
      setShowFetchDataButton(false);
      setShowChat(false);
    } catch (error) {
      setError(error);
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
    <div>
      <h1>Interactive UMAP Visualization</h1>
      {loading ? (
        <div>Loading...</div>
      ) : isDataFetched && showChat ? (
        <ChatDialog
          onSubmit={handleUserInput}
          messages={messages}
        />
      ) : (
        <div>
          {showFetchDataButton && (
            <>
              <button className="button-fetch" onClick={handleFetchColumns}>
                Fetch Columns
              </button>
              <button className="button-upload" onClick={() => document.getElementById('file-upload').click()}>
                <i className="fa fa-paperclip" aria-hidden="true"></i> Upload File
              </button>
              <input
                id="file-upload"
                type="file"
                className="input-file"
                onChange={handleFileUpload}
                style={{ display: 'none' }} // Ukrycie inputa
              />
            </>
          )}
        </div>
      )}
      {error && <div style={{ color: 'red' }}>Error: {error.message}</div>}
      <div id="umap-viz">
        <svg />
      </div>
      <div id="tooltip"></div>

    </div>
  );
};

export default InteractiveUMAP;

