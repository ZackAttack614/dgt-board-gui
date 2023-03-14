import React, { Component } from 'react';
import './DigitalClock.css'; // Import the CSS file for styling

class DigitalClock extends Component {
  constructor(props) {
    super(props);
    this.state = {
      minutes: 0,
      seconds: 0
    };
  }

  componentDidMount() {
    this.parseSeconds(this.props.inputSeconds);
  }

  parseSeconds = (totalSeconds) => {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    this.setState({ minutes, seconds });
  };

  renderClockDisplay = () => {
    const { minutes, seconds } = this.state;

    return (
      <div className="clock-display">
        {minutes.toString().padStart(2, '0')}:{seconds.toString().padStart(2, '0')}
      </div>
    );
  };

  render() {
    const { isActive } = this.props;
    const clockClassName = isActive ? 'sleek-boundary active-clock' : 'sleek-boundary';

    return <div className={clockClassName}>{this.renderClockDisplay()}</div>;
  }
}

export default DigitalClock;
