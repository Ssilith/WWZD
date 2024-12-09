import React, { useEffect, useState } from 'react';
import * as d3 from 'd3';

const InteractiveUMAP = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch data from API
  useEffect(() => {
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
  }, []); // empty dependency array means this useEffect runs once when component mounts

  // Create visualization with D3 when data is available
  useEffect(() => {
    if (data) {
      const width = 800;
      const height = 600;

    //   // Select the SVG container and clear it
    // const svg = d3.select('#umap-viz')
    //   .select('svg'); // select the first svg inside umap-viz div
    // svg.selectAll('*').remove(); // clear all previous elements

    // // Create new SVG container
    // svg.attr('width', width)
    //   .attr('height', height);

      // // Create SVG container
      const svg = d3
        .select('#umap-viz')
        .append('svg')
        .attr('width', width)
        .attr('height', height);

      // Create zoom behavior
      // const zoom = d3.zoom().on('zoom', (event) => {
      //   svg.attr('transform', event.transform);
      // });
      // svg.call(zoom);

      // Create a group to hold points
      const g = svg.append('g');

      // Scale points to fit within the viewport
      const xScale = d3.scaleLinear()
        .domain([d3.min(data, d => d.x), d3.max(data, d => d.x)])
        .range([0, width])
        .clamp(true); // Prevent points from leaving the plot area on x-axis

      const yScale = d3.scaleLinear()
        .domain([d3.min(data, d => d.y), d3.max(data, d => d.y)])
        .range([height, 0])
        .clamp(true); // Prevent points from leaving the plot area on y-axis

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
          // Show tooltip on hover
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
          // Hide tooltip when not hovering
          d3.select('#tooltip').style('display', 'none');
        });
    }
  }, [data]); // Now this effect runs every time `data` updates

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      <h1>Interactive UMAP Visualization</h1>
      <div id="umap-viz" />
      <div
        id="tooltip"
        style={{
          position: 'absolute',
          display: 'none',
          backgroundColor: 'white',
          border: '1px solid black',
          padding: '10px',
          borderRadius: '4px',
          pointerEvents: 'none',
        }}
      ></div>
    </div>
  );
};

export default InteractiveUMAP;
