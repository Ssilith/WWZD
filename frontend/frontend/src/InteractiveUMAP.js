import React, { useEffect, useState } from 'react';
import * as d3 from 'd3';
import './InteractiveUMAP.css';


const InteractiveUMAP = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchData = () => {
    setLoading(true);
    setError(null);

    fetch('http://localhost:5001/umap_data')
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(data => {
        setData(data.data); // Store only the points data
        setLoading(false);
      })
      .catch(error => {
        setError(error);
        setLoading(false);
      });
  };

  // Create visualization with D3 when data is available
  useEffect(() => {
    if (data) {
      const width = 900;
      const height = 900;

      // Select the SVG container and clear it
      const svg = d3
        .select('#umap-viz')
        .select('svg'); // Select the first SVG inside `#umap-viz` div
      svg.selectAll('*').remove(); // Clear all previous elements

      // Create new SVG container
      svg.attr('width', width)
        .attr('height', height);

      // Create a group to hold points
      const g = svg.append('g');

      // Scale points to fit within the viewport
      const xScale = d3.scaleLinear()
        .domain([d3.min(data, d => d.x), d3.max(data, d => d.x)])
        .range([0, width])
        .clamp(true);

      const yScale = d3.scaleLinear()
        .domain([d3.min(data, d => d.y), d3.max(data, d => d.y)])
        .range([height, 0])
        .clamp(true);

      // Draw points
      g.selectAll('circle')
        .data(data)
        .enter()
        .append('circle')
        .attr('cx', d => xScale(d.x))
        .attr('cy', d => yScale(d.y))
        .attr('r', 5)
        .attr('fill', 'blue')
        .on('mouseover', function (event, d) {
          const tooltip = d3.select('#tooltip');
          tooltip
            .style('left', `${event.pageX + 5}px`)
            .style('top', `${event.pageY + 5}px`)
            .style('display', 'block')
            .html(`
              <strong>ID:</strong> ${d.id}<br/>
              <strong>X:</strong> ${d.x.toFixed(2)}<br/>
              <strong>Y:</strong> ${d.y.toFixed(2)}<br/>
              <strong>Text:</strong> ${d.text}
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
        .attr('stroke', 'black') // Border color
        .attr('stroke-width', 8) // Border thickness
        .attr('fill', 'none') // No fill inside the border
        .style('pointer-events', 'none'); // Make sure it doesn't block interactions
    }
  }, [data]); // Effect runs only when `data` changes

  return (
    <div>
      <h1>Interactive UMAP Visualization</h1>
      <button
        className="button-fetch"
        onClick={fetchData}
        disabled={loading}
      >
        {loading ? 'Loading...' : 'Fetch UMAP Data'}
      </button>

      {error && <div style={{ color: 'red' }}>Error: {error.message}</div>}
      <div id="umap-viz">
        <svg />
      </div>
      <div
        id="tooltip"
      ></div>
    </div>
  );
};

export default InteractiveUMAP;
