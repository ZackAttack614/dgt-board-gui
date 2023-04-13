// Simple websocket server that listens for messages from the client and sends stockfish evaluations back to the client
// at ws://localhost:8080

// Uses ws library
// https://www.npmjs.com/package/ws


const { WebSocketServer } = require('ws');

// Import child_process
const { spawn } = require('node:child_process');

const wss = new WebSocketServer({ port: 8080 });

// Start stockfish in a spawned process

const stockfish = spawn('node', ['node_modules/stockfish']);

let client;
// Listen for messages from stockfish
stockfish.stdout.on('data', (data) => {
    // Log the data
    // console.log(data.toString());
    // Check if the line says "score cp"
    if (data.includes("score cp")) {
        // Get the evaluation numeric value, which sill follow "score cp"
        let evaluation = data.toString().split("score cp ")[1].split(" ")[0];
        // Check if it's a number
        if (isNaN(evaluation) || evaluation.length === 0) {
            // If it's not a number, do nothing
            return;
        }
        console.log("Evaluation: " + evaluation);
        // Send it to the client
        client.send(evaluation);
    }
});


wss.on('connection', function connection(ws) {
    console.log ("New connection");
    // Set ws to the new connection
    client = ws;
    ws.on('message', function incoming(message) {
        console.log('received: %s', message);
        // Send message to stockfish
        // Tell stockfish to stop first
        stockfish.stdin.write('\nstop\n');
        // Tell stockfish to start calculating
        stockfish.stdin.write('position fen ' + message + '\n');
        // Tell it to go but only output evaluations
        stockfish.stdin.write('go depth 20\n');
    });
});
