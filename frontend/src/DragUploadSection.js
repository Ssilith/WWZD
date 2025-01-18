import React, { useRef, useState } from 'react';
import './DragUploadSection.css';
import vectorPath from './assets/Vector.svg';
import uploadFile from './assets/undraw_upload_cucu.svg';

const DragUploadSection = ({ onDrop }) => {
  const fileInputRef = useRef(null);
  const [file, setFile] = useState(null); // Stan do przechowywania jednego pliku
  const [error, setError] = useState(null); // Stan błędu walidacji

  const handleBrowseClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const validateFile = (file) => {
    const allowedExtensions = ['.csv', '.xls', '.xlsx'];
    const fileName = file.name.toLowerCase();
    const isValid = allowedExtensions.some((ext) => fileName.endsWith(ext));
    return isValid;
  };

  const handleFileChange = (e) => {
    const newFile = e.target.files[0]; // Pobieramy tylko pierwszy plik
    if (newFile && validateFile(newFile)) {
      setFile(newFile); // Nadpisujemy poprzedni plik
      setError(null); // Usuwamy błędy walidacji
      if (onDrop) {
        onDrop([newFile]); // Wywołujemy funkcję z jednym plikiem
      }
    } else {
      setFile(null);
      setError('Invalid file type. Only CSV and Excel files are allowed.');
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const newFile = e.dataTransfer.files[0]; // Pobieramy tylko pierwszy plik
    if (newFile && validateFile(newFile)) {
      setFile(newFile); // Nadpisujemy poprzedni plik
      setError(null); // Usuwamy błędy walidacji
      if (onDrop) {
        onDrop([newFile]); // Wywołujemy funkcję z jednym plikiem
      }
    } else {
      setFile(null);
      setError('Invalid file type. Only CSV and Excel files are allowed.');
    }
  };

  const handleRemoveFile = () => {
    setFile(null); // Resetujemy stan pliku
    setError(null); // Usuwamy błędy
  };

  const handleUploadClick = async () => {
    if (!file) {
      alert("Please select a file before uploading!");
      return;
    }
  
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
          alert("File uploaded successfully!");
        } else {
          const text = await response.text();
          console.error("Server returned non-JSON response:", text);
          alert("File uploaded, but server returned unexpected response.");
        }
      } else {
        console.error(`Error uploading file: ${response.status} ${response.statusText}`);
        alert("Failed to upload file. Please try again.");
      }
    } catch (error) {
      console.error("Error connecting to the server:", error);
      alert("Error connecting to the server. Please try again later.");
    }
  };

  return (
    <div>
      <h2>Aplikacja do wizualizacji danych</h2>
      <div className="icon-bottom-left">
        <img src={uploadFile} alt="Vector Icon" />
      </div>
      <div className="wrapper">
        <h2 className="title">Upload your file here!</h2>
        <div
          className="container"
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        >
          <img src={vectorPath} alt="Vector Icon" />
          <div className="textContainer">
            <div className="uploadText">
              <span>Drag your file or </span>
              <button
                className="browseButton"
                onClick={handleBrowseClick}
              >
                browse
              </button>
              <input
                type="file"
                ref={fileInputRef}
                style={{ display: 'none' }}
                onChange={handleFileChange}
                accept=".csv,.xls,.xlsx" // Akceptowane typy plików
              />
            </div>
          </div>
        </div>

        {/* Sekcja informacji o plikach */}
        <div className="file-info">
          <h3>Added File:</h3>
          {file ? (
            <div className="file-details">
              <p>
                {file.name} ({(file.size / 1024).toFixed(2)} KB)
              </p>
              <span className="remove-icon" onClick={handleRemoveFile}>
                &times;
              </span>
            </div>
          ) : (
            <p>No file added yet.</p>
          )}
          {/* Komunikat błędu walidacji */}
          {error && <p className="error-text">{error}</p>}
        </div>

        <button className="uploadButton" onClick={handleUploadClick}>Upload</button>
      </div>
    </div>
  );
};

DragUploadSection.defaultProps = {
  onDrop: () => { },
};

export default DragUploadSection;
