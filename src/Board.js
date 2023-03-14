import React from 'react';

// Import piece images
import BKing from './pieces/bK.svg';
import BQueen from './pieces/bQ.svg';
import BBishop from './pieces/bB.svg';
import BKnight from './pieces/bN.svg';
import BRook from './pieces/bR.svg';
import BPawn from './pieces/bP.svg';
import WKing from './pieces/wK.svg';
import WQueen from './pieces/wQ.svg';
import WBishop from './pieces/wB.svg';
import WKnight from './pieces/wN.svg';
import WRook from './pieces/wR.svg';
import WPawn from './pieces/wP.svg';


class ChessBoard extends React.Component {
  constructor(props) {
    super(props);
    this.pieceMap = {
      'k': BKing,
      'q': BQueen,
      'b': BBishop,
      'n': BKnight,
      'r': BRook,
      'p': BPawn,
      'K': WKing,
      'Q': WQueen,
      'B': WBishop,
      'N': WKnight,
      'R': WRook,
      'P': WPawn,
    }
    this.pieces = {};

    this.state = { fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR' };
  }

  componentDidMount() {
    const ws = new WebSocket('ws://localhost:1982/api/v1.0');
    ws.addEventListener('open', () => {
      ws.send('{ "call": "subscribe", "id": 83, "param": { "feed": "eboardevent", "id": 7, "param": { "serialnr": "47588" } } }');
    });

    // listen for the 'message' event
    ws.addEventListener('message', event => {
      const param = JSON.parse(event.data).param;
      if (param) {
        if (param.board !== null && param.board !== undefined) {
          this.setState({ fen: param.board });
          this.updatePosition();
        }
      }
    });
  }

  render() {
    this.updatePosition();

    const boardSize = 8;
    const cellSize = 50;
    const boardWidth = boardSize * cellSize;
    const boardHeight = boardSize * cellSize;
    const notationSize = cellSize / 2;
    const columnNotation = ["A", "B", "C", "D", "E", "F", "G", "H"];
    const rowNotation = [8, 7, 6, 5, 4, 3, 2, 1];

    const scarlet = "#b73c3c";
    const gray = "#8c8c8c";
    const white = "#ffffff";
    
    // Optional: Add subtle shading to the squares
    const scarletShadow = "inset 0 0 5px rgba(0, 0, 0, 0.2)";
    const grayShadow = "inset 0 0 5px rgba(0, 0, 0, 0.2)";

    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
        <div style={{ position: "relative" }}>
          <div style={{ position: "absolute", bottom: -notationSize, left: 0, color: white }}>
            {columnNotation.map((c, index) => (
              <div key={index} style={{ display: "inline-block", width: cellSize, height: notationSize, textAlign: "center" }}>{c}</div>
            ))}
          </div>
          <div style={{ position: "absolute", top: 0, right: -notationSize, color: white }}>
            {rowNotation.map((r, index) => (
              <div key={index} style={{ display: "flex", alignItems: "center", justifyContent: "center", width: notationSize, height: cellSize }}>{r}</div>
            ))}
          </div>
          <div style={{ width: boardWidth, height: boardHeight, display: "flex", flexWrap: "wrap", border: `2px solid ${scarlet}` }}>
            {Array.from({ length: boardSize * boardSize }, (_, index) => {
              // ...
              const row = Math.floor(index / boardSize);
              const column = index % boardSize;
              const isScarlet = (row + column) % 2 === 1;

              return (
                <div key={index} style={{ width: cellSize, height: cellSize, backgroundColor: isScarlet ? scarlet : gray, position: "relative", boxShadow: isScarlet ? scarletShadow : grayShadow }}>
                  {this.pieces[index] && <img src={this.pieces[index]} />}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  updatePosition() {
    // Clear the previous pieces from the array.
    this.pieces = [];

    // Parse the FEN to update the component's piece tracking
    for (let row = 0; row < 8; row++) {
      const fenRow = this.state.fen.split('/')[row];
      let col = 0;
      Array.from(fenRow).forEach((char) => {
        const probe = +char;
        if (isNaN(probe)) {
          this.pieces[row * 8 + col] = this.pieceMap[char];
          col++;
        } else {
          col += probe;
        }
      });
    }
  }
}

export default ChessBoard;