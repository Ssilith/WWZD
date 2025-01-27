import React, { useState, useEffect } from 'react';
import * as d3 from 'd3';
import Header from './components/Header';
import DragUploadSection from './components/DragUploadSection';
import HardcodedChat from './components/HardcodedChat';
import LLMChat from './components/LLMChat';
import './InteractiveUMAP.css';
import ChatDialog from './components/ChatDialog';
import Spinner from './components/Spinner';

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
            Rozpocznij
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
        // <div style={{ marginTop: '20px', fontSize: '18px', textAlign: 'center' }}>
        //   Wczytywanie danych...
        // </div>
        <Spinner/>
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
