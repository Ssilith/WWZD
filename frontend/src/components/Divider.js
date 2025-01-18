import React from 'react';
import './Divider.css';

const Divider = ({ text }) => {
  return (
    <div className="divider-container">
      <div className="divider-line"></div>
      <span className="divider-text">{text}</span>
      <div className="divider-line"></div>
    </div>
  );
};

Divider.defaultProps = {
  text: 'OR'
};

export default Divider;
