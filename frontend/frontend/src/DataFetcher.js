// //src/DataFetcher.js
// import React, { useEffect, useState } from 'react';

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
import React, { useEffect, useState } from 'react';

const DataFetcher = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch('http://localhost:5001/umap_data')
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(rawData => {
        // Przetwarzanie danych przed zapisaniem do stanu
        const formattedData = rawData.map(item => ({
          id: item[0],
          value1: item[1],
          value2: item[2],
          text: item[3],
        }));
        setData(formattedData);
        setLoading(false);
      })
      .catch(error => {
        setError(error);
        setLoading(false);
      });
  }, []); // empty dependency array means this useEffect runs once when component mounts

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      <h1>Data from Backend:</h1>
      {data.map((item, index) => (
        <div key={index} style={{ marginBottom: '20px' }}>
          <p><strong>ID:</strong> {item.id}</p>
          <p><strong>Value 1:</strong> {item.value1}</p>
          <p><strong>Value 2:</strong> {item.value2}</p>
          <p><strong>Text:</strong> {item.text}</p>
        </div>
      ))}
    </div>
  );
};

export default DataFetcher;
