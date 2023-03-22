// DigitalClock.js

import React from 'react';
import './DigitalClock.css';

class DigitalClock extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      currentTime: props.time,
    };
    this.timer = null;
  }

  componentDidUpdate(prevProps) {
    if (prevProps.isActive !== this.props.isActive) {
      if (this.props.isActive) {
        this.startTimer();
      } else {
        this.stopTimer();
      }
    }

    if (prevProps.time !== this.props.time) {
      this.setState({ currentTime: this.props.time });
    }
  }

  componentWillUnmount() {
    this.stopTimer();
  }

  startTimer() {
    this.timer = setInterval(() => {
      this.setState(prevState => ({
        currentTime: Math.max(prevState.currentTime - 0.1, 0),
      }));
    }, 100);
  }

  stopTimer() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  formatTime(time) {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    const tenths = Math.floor((time % 1) * 10);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${tenths.toString()}`;
  }

  render() {
    const { isActive } = this.props;
    const { currentTime } = this.state;
    const formattedTime = this.formatTime(currentTime);

    return (
      <div className={`sleek-boundary ${isActive ? 'active-clock' : ''}`}>
        <div className="clock-display">{formattedTime}</div>
      </div>
    );
  }
}

export default DigitalClock;
