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
    this.lastFen = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR';
    this.currentMove = 'w'; 
    this.castling = {
      'w': {
        'k': true,
        'q': true,
      },
      'b': {
        'k': true,
        'q': true,
      }
    }
    this.enPassant = null;
    // Using an object so it can be a hashmap
    this.arrows = {};
    this.clearArrowsOnMove = true;
    this.evaluation = 0;

    // Connect to the websocket for stockfish evaluation
    this.ws = new WebSocket("ws://localhost:8080");
    // When the websocket is open, send the initial position
    this.ws.onopen = () => {
      this.ws.send("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1");
    }
    // When the websocket receives a message, update the evaluation
    this.ws.onmessage = (event) => {
      this.evaluation = parseInt(event.data);
      // If it's black's move, negate the evaluation
      if (this.currentMove === 'b') {
        this.evaluation = -this.evaluation;
      }
      // Log the evaluation
      console.log("Evaluation: ", this.evaluation/ 100.0);
      // Force a re-render 
      this.forceUpdate();
    }
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
           // Check if there was no change
          if (this.lastFen === param.board)
            return;
          // Clear the arrows if the clearArrowsOnMove flag is set
          if (this.clearArrowsOnMove) {
            this.arrows = {};

          }


          this.setState({ fen: param.board });
         
          
          
          
          // See what piece has moved
          let lastBoard = this.lastFen.split('/').map(row => row.split(''));
          let board = param.board.split('/').map(row => row.split(''));
          // FEN is read from bottom to top, so reverse the board
          lastBoard.reverse();
          board.reverse();
          // Replace lastFen with the new fen
          this.lastFen = param.board;


          // Parse each row to make the board a 2d array
          for (let i = 0; i < 8; i++) {
            // Replace the numbers with empty strings
            for (let j = 0; j < 8; j++) {
              if (lastBoard[i][j] >= '1' && lastBoard[i][j] <= '8') {
                let num = parseInt(lastBoard[i][j]);
                lastBoard[i].splice(j, num, ...Array(num).fill(''));
              }
              if (board[i][j] >= '1' && board[i][j] <= '8') {
                let num = parseInt(board[i][j]);
                board[i].splice(j, num, ...Array(num).fill(''));
              }
            }
          }
          
          let movedPiece = null;
          let movedFrom = null;
          let movedTo = null;
          for (let i = 0; i < 8 && movedPiece == null; i++) {
            for (let j = 0; j < 8; j++) {
              if (board[i][j] !== lastBoard[i][j]) {
                movedPiece = board[i][j];
                movedFrom = [j, i];
                movedTo = [j, i];
                break;
              }
            }
          }
          // Check if the piece is upper case
          if (movedPiece === movedPiece.toUpperCase())
            // This means it was a white piece, so set the current move to black
            this.currentMove = 'b';
          else
            // This means it was a black piece, so set the current move to white
            this.currentMove = 'w';
          // Check if the piece is a pawn that moved two squares
          if (movedPiece === 'p' && movedFrom[1] === 6 && movedTo[1] === 4) {
            // This means it was a black pawn that moved two squares, so set the en passant square
            this.enPassant = [movedTo[0], movedTo[1] + 1];
          } else if (movedPiece === 'P' && movedFrom[1] === 1 && movedTo[1] === 3) {
            // This means it was a white pawn that moved two squares, so set the en passant square
            this.enPassant = [movedTo[0], movedTo[1] - 1];
          } else {
            // This means it was not a pawn that moved two squares, so remove the en passant square
            this.enPassant = null;
          }
          // Change en passant array to a string
          if (this.enPassant !== null) {
            // Get the square as a string
            this.enPassant = String.fromCharCode(this.enPassant[0] + 65) + (this.enPassant[1] + 1);
          }

          // Check if the piece is a king
          if (movedPiece === 'k') {
            // This means it was a black king, so remove the black king castling rights
            this.castling['b']['k'] = false;
            this.castling['b']['q'] = false;
          } else if (movedPiece === 'K') {
            // This means it was a white king, so remove the white king castling rights
            this.castling['w']['k'] = false;
            this.castling['w']['q'] = false;
          }

          // Check if the piece is a rook
          if (movedPiece === 'r') {
            // This means it was a black rook, so check if it was the left or right rook
            if (movedFrom[0] === 0) {
              // This means it was the left rook, so remove the black queen side castling rights
              this.castling['b']['q'] = false;
            } else if (movedFrom[0] === 7) {
              // This means it was the right rook, so remove the black king side castling rights
              this.castling['b']['k'] = false;
            }
          } else if (movedPiece === 'R') {
            // This means it was a white rook, so check if it was the left or right rook
            if (movedFrom[0] === 0) {
              // This means it was the left rook, so remove the white queen side castling rights
              this.castling['w']['q'] = false;
            } else if (movedFrom[0] === 7) {
              // This means it was the right rook, so remove the white king side castling rights
              this.castling['w']['k'] = false;
            }
          }

          // Send a message to the server for evaluation purposes
          // Create an actual fen
          let fen = param.board + ' ' + this.currentMove + ' ' + 
            (this.castling['w']['k'] ? 'K' : '') + 
            (this.castling['w']['q'] ? 'Q' : '') + 
            (this.castling['b']['k'] ? 'k' : '') + 
            (this.castling['b']['q'] ? 'q' : '') + ' ' + 
            (this.enPassant ? this.enPassant : '') + ' - 0 1';

          this.ws.send(fen);

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

    // Arrow stuff
    const lineWidth = 15;
    const headWidth = 7;
    const circleWidth = 5;
    const arrowColors = ["rgba(10,180,40,0.8)", "rgba(240,60,60,0.8)", "rgba(10,10,240,0.8)"];
    const arrowAngle = Math.PI/4;
    const arrowHeadLength = 30;

    const scarlet = "#b73c3c";
    const gray = "#8c8c8c";
    const white = "#ffffff";
    
    // Optional: Add subtle shading to the squares
    const scarletShadow = "inset 0 0 5px rgba(0, 0, 0, 0.2)";
    const grayShadow = "inset 0 0 5px rgba(0, 0, 0, 0.2)";

    

    return (
      <div onContextMenu={(e) => {
        e.preventDefault()
        // Get the square as an html element
        let square = e.target;
        // Could be a piece, so if it is get its parent
        if (square.tagName === 'IMG') square = square.parentNode;
        let newArrow = [+this.arrowStart, +square.dataset.key, this.controlPressed ? 1 : (this.altPressed ? 2 : 0)];
        // Key of the arrow, should be unique

        let key = +this.arrowStart * boardSize * boardSize +  +square.dataset.key;
        // This is inefficient, I should probably represent the arrows as a hashtable
        // But it is small so it's fine
        if (this.arrows.hasOwnProperty(key)) {
          delete this.arrows[key]
        } else {
          this.arrows[key] = newArrow;
        }

        // Get the canvas
        let canvas = document.getElementById('arrow-canvas');
        let ctx = canvas.getContext('2d')
        
        let w = canvas.width;
        let h = canvas.height;
        ctx.clearRect(0,0,w,h);
        

        // Get the starting x and y
        const keyToXY = (key) => {
          return [key % boardSize, Math.floor(key / boardSize)];
        }

        // Go from an x or y position to the canvas coordinate
        const posToCoord = (val) => {
          return val * cellSize + cellSize / 2;
        }

        // Draw all arrows
        for (let arrowProp in this.arrows) {
          let arrow = this.arrows[arrowProp];
          // Draw the line
          let from = keyToXY(arrow[0]).map(posToCoord);
          let to = keyToXY(arrow[1]).map(posToCoord);
          // Check if from and to are the same
          ctx.strokeStyle=arrowColors[arrow[2]];
          if (from[0] === to[0] && from[1] === to[1]) {
            // Draw a circle at that position
            ctx.beginPath();
            ctx.lineWidth = circleWidth;
            ctx.arc(...from, cellSize/2 - circleWidth/2, 0, 2 * Math.PI);
            
            ctx.stroke();

            continue
          };
          ctx.beginPath();
          ctx.lineWidth = lineWidth;
          
          ctx.moveTo(...from);
          ctx.lineTo(...to);
          ctx.stroke();

          // Draw the arrow head
          ctx.lineWidth = headWidth;
          
          // Get angle to the beginning
          let angle = Math.atan2(from[1] - to[1], from[0] - to[0]);
          // Angles of the arrowhead lines
          let angles = [angle + arrowAngle, angle - arrowAngle];
          for (let a of angles) {
            // Draw each arrow line
            ctx.beginPath();
            ctx.moveTo(...to);
            // Get the end of the arrow head line
            let endHead = [to[0] + Math.cos(a) * arrowHeadLength, to[1] + Math.sin(a) * arrowHeadLength];
            ctx.lineTo(...endHead);
            ctx.stroke();
          }


        }
        
        
        
        
      }} 
      onMouseDown = {(e) => {
        // if right click
        if (e.button === 2) {
          e.preventDefault();
            // Get the square as an html element
          let square = e.target;
          // Could be a piece, so if it is get its parent
          if (square.tagName === 'IMG') square = square.parentNode;
          this.arrowStart = square.dataset.key;
          // Check if control key is pressed
          this.controlPressed = e.ctrlKey;
          this.altPressed = e.altKey;
        }
        // If left click
        else if (e.button === 0) {
          // Remove all arrows
          this.arrows = {};
          let canvas = document.getElementById('arrow-canvas');
          let ctx = canvas.getContext('2d')
          let w = canvas.width;
          let h = canvas.height;
          ctx.clearRect(0,0,w,h);

        }
      }

      }
      style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
        <div id = "eval-bar" style = {{height: cellSize * boardSize + 2}}>
          <div id = "eval-white" style = {{height: `${ 100/(1 + Math.exp(-this.evaluation / 300.0)) }%`}}><p class = {this.evaluation >= 0 ? 'white' : 'black' }>{Math.abs((this.evaluation / 100.0)).toFixed(1)}</p></div>
        </div>
        <div style={{ position: "relative" }}>
        <canvas id = "arrow-canvas" width = {cellSize * boardSize} height = {cellSize * boardSize} style = {{position:"absolute", top:1, left: 1, zIndex:1000, pointerEvents:'none'}}></canvas>
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
                <div key={index} data-key={index} style={{ width: cellSize, height: cellSize, backgroundColor: isScarlet ? scarlet : gray, position: "relative", boxShadow: isScarlet ? scarletShadow : grayShadow }}>
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