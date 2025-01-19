import React, { useState, useRef } from 'react';
import './DragUploadSection.css';
import vectorPath from '../assets/Vector.svg';
import uploadFile from '../assets/undraw_upload_cucu.svg';

const DragUploadSection = ({ onDrop, onFileUploaded }) => {
  const fileInputRef = useRef(null);
  const [file, setFile] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showUploadSection, setShowUploadSection] = useState(true);
  const [fileUploaded, setFileUploaded] = useState(false);

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
    const newFile = e.target.files[0];
    if (newFile && validateFile(newFile)) {
      setFile(newFile);
      setError(null);
      setFileUploaded(false);
      if (onDrop) {
        onDrop([newFile]);
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
    const newFile = e.dataTransfer.files[0];
    if (newFile && validateFile(newFile)) {
      setFile(newFile);
      setError(null);
      setFileUploaded(false);
      if (onDrop) {
        onDrop([newFile]);
      }
    } else {
      setFile(null);
      setError('Invalid file type. Only CSV and Excel files are allowed.');
    }
  };

  const handleRemoveFile = () => {
    setFile(null);
    setError(null);
  };

  const handleUploadClick = async () => {
    if (!file) {
      alert("Please select a file before uploading!");
      return;
    }

    if (fileUploaded) {
      alert("File has already been uploaded.");
      return;
    }

    setIsLoading(true);
    setShowUploadSection(false); 

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch('http://localhost:5001/upload_file', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        setFileUploaded(true);
        alert("File uploaded successfully!");

        if (onFileUploaded) {
          onFileUploaded();
        }
      } else {
        alert("Failed to upload file. Please try again.");
      }
    } catch (error) {
      alert("Error connecting to the server. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      {isLoading ? (
        <div className="loading-container">
          <h2>Loading...</h2>
        </div>
      ) : showUploadSection ? (
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
                    accept=".csv,.xls,.xlsx"
                  />
                </div>
              </div>
            </div>
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
              {error && <p className="error-text">{error}</p>}
            </div>

            <button className="uploadButton" onClick={handleUploadClick}>
              Upload
            </button>
          </div>
        </div>
      ) : (
        <div className="chat-section">
          <h2>Your chat will appear here!</h2>
          {/* Tu możesz umieścić swój komponent czatu */}
        </div>
      )}
    </div>
  );
};

DragUploadSection.defaultProps = {
  onDrop: () => {},
  onFileUploaded: () => {}  // Domyślnie pusta funkcja
};


export default DragUploadSection;
