import React from 'react';
import DigitalClock from './DigitalClock';

class ClockContainer extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      clock1: 0,
      clock2: 0,
      activeClock: 0,
      firstMessage: false,
    };
  }

  componentDidMount() {
    const ws = new WebSocket('ws://localhost:1982/api/v1.0');
    ws.addEventListener('open', () => {
      ws.send('{ "call": "subscribe", "id": 83, "param": { "feed": "eboardevent", "id": 7, "param": { "serialnr": "47588" } } }');
    });

    ws.addEventListener('message', event => {
      const message = JSON.parse(event.data);

      if (message.param && message.param.clock) {
        console.log('Got a clock message');
        this.setState(prevState => ({
          clock1: message.param.clock.white,
          clock2: message.param.clock.black,

          firstMessage: !prevState.firstMessage,
          activeClock: !prevState.firstMessage ? (message.param.clock.run === null ? 0 : prevState.activeClock === 2 ? 1 : 2) : prevState.activeClock,
        }));
      }
    });
  }

  render() {
    const { clock1, clock2, activeClock } = this.state;

    return (
      <div>
        <div style={{'marginBottom': '40px'}}>
          <DigitalClock time={clock1} isActive={activeClock === 1} />
        </div>
        <DigitalClock time={clock2} isActive={activeClock === 2} />
      </div>
    );
  }
}

export default ClockContainer;
