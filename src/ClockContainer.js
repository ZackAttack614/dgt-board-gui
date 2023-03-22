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
    const ws = new WebSocket('wss://websocket-server-gyotsobjdq-ue.a.run.app');
    ws.addEventListener('open', () => {
      console.log('websocket connection successful')
      ws.send('{ "type": "subscribe" }');
    });

    ws.addEventListener('message', event => {
      const message = JSON.parse(event.data);

      if (message.type === 'clock_data') {
        console.log(message);
        this.setState(prevState => ({
          clock1: message.data.white_time,
          clock2: message.data.black_time,

          firstMessage: !prevState.firstMessage,
          activeClock: message.data.active_player,
        }));
      }
    });
  }

  render() {
    const { clock1, clock2, activeClock } = this.state;

    return (
      <div>
        <div style={{'marginBottom': '40px'}}>
          <DigitalClock time={Number(clock1.toFixed(1))} isActive={activeClock === 1} />
        </div>
        <DigitalClock time={Number(clock2.toFixed(1))} isActive={activeClock === 2} />
      </div>
    );
  }
}

export default ClockContainer;
