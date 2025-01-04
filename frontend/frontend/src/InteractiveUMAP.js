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
        setData(data.points);
        setLoading(false);
      })
      .catch(error => {
        setError(error);
        setLoading(false);
      });
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
        // .attr('fill', 'blue')
        .attr('fill', d => colorScale(d.metadata_number)) // Użyj koloru z palety
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
