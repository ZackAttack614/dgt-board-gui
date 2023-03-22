import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import Chessboard from './Board';
import ClockContainer from './ClockContainer';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <div className='main-container'>
      <div className='board'>
        <Chessboard />
      </div>
      <div className="clock-container">
        <ClockContainer />
      </div>
    </div>
  </React.StrictMode>
);
