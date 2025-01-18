// //src/DataFetcher.js
// import React, { useEffect, useState } from 'react';
// import { UMAP } from 'umap-js';

// const DataFetcher = () => {
//   const [data, setData] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   useEffect(() => {
//     fetch('http://localhost:5001/umap_data')
//       .then(response => {
//         if (!response.ok) {
//           throw new Error('Network response was not ok');
//         }
//         return response.json();
//       })
//       .then(data => {
//         setData(data);
//         setLoading(false);
//       })
//       .catch(error => {
//         setError(error);
//         setLoading(false);
//       });
//   }, []); // empty dependency array means this useEffect runs once when component mounts

//   if (loading) return <div>Loading...</div>;
//   if (error) return <div>Error: {error.message}</div>;

//   return (
//     <div>
//       <h1>Data from Backend:</h1>
//       <pre>{JSON.stringify(data, null, 2)}</pre>
//     </div>
//   );
// };


// export default DataFetcher;

// src/DataFetcher.js
import React, { useEffect, useState, useRef } from 'react';
import { UMAP } from 'umap-js';

const DataFetcher = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const umapRef = useRef();
  const canvasRef = useRef(null);

  useEffect(() => {
    fetch('http://localhost:5001/umap_data')
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(data => {
        setData(data);
        setLoading(false);
      })
      .catch(error => {
        setError(error);
        setLoading(false);
      });
  }, []); // empty dependency array means this useEffect runs once when component mounts

  useEffect(() => {
    if (data && data.data) {
      // 1. Wyciągnij wartości x i y
      const umapData = data.data.map(item => [item.x, item.y]);
  
      // 2. Stwórz instancję UMAP z dostosowanymi parametrami
      const umap = new UMAP({
        nNeighbors: 10, // Mniejsza liczba = bardziej lokalne skupienia
        minDist: 0.5,   // Większa wartość = punkty mogą być bardziej rozrzucone
        spread: 1.0     // Opcjonalne - kontroluje szerokość danych
      });
  
      // 3. Przekształć dane
      const transformedData = umap.fit(umapData);
  
      // 4. Rysuj dane na Canvas
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
  
      ctx.clearRect(0, 0, canvas.width, canvas.height);
  
      transformedData.forEach(([x, y], index) => {
        ctx.beginPath();
        ctx.arc(x * 50, y * 50, 3, 0, 2 * Math.PI);
        
        // Kolory punktów w zależności od grup (np. odległości w klastrach)
        const groupColor = `hsl(${Math.floor((x + y) * 100)}, 70%, 50%)`;
        ctx.fillStyle = groupColor;
        
        ctx.fill();
        ctx.closePath();
      });
    }
  }, [data]);


  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;


  return (
    <div>
      <h1>UMAP Visualization:</h1>
      <canvas ref={canvasRef} width={800} height={600} style={{ border: '1px solid black' }} />
    </div>
  );
};

export default DataFetcher;
