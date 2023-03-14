import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import Chessboard from './Board';
import DigitalClock from './DigitalClock';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <div className='main-container'>
      <div className='board'>
        <Chessboard />
      </div>
      <div className="clock-container">
        <DigitalClock inputSeconds={1000} isActive={false} />
        <div className="first-clock">
          <DigitalClock inputSeconds={2000} isActive={true} />
        </div>
      </div>
    </div>
  </React.StrictMode>
);
