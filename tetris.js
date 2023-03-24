const canvas = document.getElementById('gameBoard');
const ctx = canvas.getContext('2d');
const blockSize = 20;
const boardColumns = canvas.width / blockSize;
const boardRows = canvas.height / blockSize;

// Initialize the game board
const gameBoard = Array.from({ length: boardRows }, () => Array(boardColumns).fill(0));

// Tetromino shapes
const tetrominoes = [
  [
    [1, 1, 1],
    [0, 1, 0]
  ],
  [
    [0, 2, 2],
    [2, 2, 0]
  ],
  [
    [3, 3, 0],
    [0, 3, 3]
  ],
  [
    [4, 4],
    [4, 4]
  ],
  [
    [5, 0, 0],
    [5, 5, 5]
  ],
  [
    [0, 0, 6],
    [6, 6, 6]
  ],
  [
    [7, 7, 7, 7]
  ]
];

// Tetromino object
class Tetromino {
  constructor() {
    this.shape = this.newShape();
    this.row = 0;
    this.col = Math.floor(boardColumns / 2) - Math.floor(this.shape[0].length / 2);
  }

  newShape() {
    const randomIndex = Math.floor(Math.random() * tetrominoes.length);
    return tetrominoes[randomIndex];
  }
}

// Initialize the current tetromino
const currentTetromino = new Tetromino();

const fps = 1000 / 2; // Frame rate (milliseconds between frames)
let lastTime = 0;

function gameLoop(timestamp) {
  const deltaTime = timestamp - lastTime;
  lastTime = timestamp;

  if (deltaTime >= fps) {
    updateGameBoard();
    drawGameBoard();
  }

  requestAnimationFrame(gameLoop);
}

function updateGameBoard() {
  // Move the current tetromino down by one row
  currentTetromino.row++;

  // Check for collisions and other game logic (to be implemented later)

  // If there's a collision, move the tetromino back up and generate a new one
  // This is a temporary solution, to be replaced by proper collision handling
  currentTetromino.row--;
  currentTetromino.shape = currentTetromino.newShape();
}

function drawGameBoard() {
  // Clear the canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Draw the game board
  for (let row = 0; row < boardRows; row++) {
    for (let col = 0; col < boardColumns; col++) {
      const block = gameBoard[row][col];

      if (block) {
        ctx.fillStyle = 'black';
        ctx.fillRect(col * blockSize, row * blockSize, blockSize, blockSize);
        ctx.strokeStyle = 'white';
        ctx.strokeRect(col * blockSize, row * blockSize, blockSize, blockSize);
      }
    }
  }

  // Draw the current tetromino
  ctx.fillStyle = 'black';
  for (let row = 0; row < currentTetromino.shape.length; row++) {
    for (let col = 0; col < currentTetromino.shape[row].length; col++) {
      if (currentTetromino.shape[row][col]) {
        ctx.fillRect((currentTetromino.col + col) * blockSize, (currentTetromino.row + row) * blockSize, blockSize, blockSize);
        ctx.strokeStyle = 'white';
        ctx.strokeRect((currentTetromino.col + col) * blockSize, (currentTetromino.row + row) * blockSize, blockSize, blockSize);
      }
    }
  }
}

// Start the game loop
requestAnimationFrame(gameLoop);

function handleKeyPress(event) {
  switch (event.key) {
    case 'ArrowLeft':
      moveTetromino(-1, 0);
      break;
    case 'ArrowRight':
      moveTetromino(1, 0);
      break;
    case 'ArrowDown':
      moveTetromino(0, 1);
      break;
    case 'ArrowUp':
      rotateTetromino();
      break;
  }
}

function moveTetromino(deltaCol, deltaRow) {
  const newRow = currentTetromino.row + deltaRow;
  const newCol = currentTetromino.col + deltaCol;

  // Check for collisions (to be implemented later)

  // If there's no collision, update the tetromino's position
  currentTetromino.row = newRow;
  currentTetromino.col = newCol;
}

function rotateTetromino() {
  const rotatedShape = currentTetromino.shape[0].map((_, colIndex) =>
    currentTetromino.shape.map(row => row[colIndex])
  ).reverse();

  // Check for collisions (to be implemented later)

  // If there's no collision, update the tetromino's shape
  currentTetromino.shape = rotatedShape;
}

// Attach event listener for key presses
document.addEventListener('keydown', handleKeyPress);

function hasCollision(newRow, newCol, shape) {
  for (let row = 0; row < shape.length; row++) {
    for (let col = 0; col < shape[row].length; col++) {
      if (shape[row][col] && (newRow + row < 0 || newRow + row >= boardRows || newCol + col < 0 || newCol + col >= boardColumns || gameBoard[newRow + row][newCol + col])) {
        return true;
      }
    }
  }
  return false;
}

function moveTetromino(deltaCol, deltaRow) {
  const newRow = currentTetromino.row + deltaRow;
  const newCol = currentTetromino.col + deltaCol;

  if (!hasCollision(newRow, newCol, currentTetromino.shape)) {
    currentTetromino.row = newRow;
    currentTetromino.col = newCol;
  }
}

function rotateTetromino() {
  const rotatedShape = currentTetromino.shape[0].map((_, colIndex) =>
    currentTetromino.shape.map(row => row[colIndex])
  ).reverse();

  if (!hasCollision(currentTetromino.row, currentTetromino.col, rotatedShape)) {
    currentTetromino.shape = rotatedShape;
  }
}

function lockTetromino() {
  for (let row = 0; row < currentTetromino.shape.length; row++) {
    for (let col = 0; col < currentTetromino.shape[row].length; col++) {
      if (currentTetromino.shape[row][col]) {
        gameBoard[currentTetromino.row + row][currentTetromino.col + col] = currentTetromino.shape[row][col];
      }
    }
  }
}

function clearLines() {
  outer: for (let row = boardRows - 1; row >= 0; row--) {
    for (let col = 0; col < boardColumns; col++) {
      if (!gameBoard[row][col]) {
        continue outer;
      }
    }
    gameBoard.splice(row, 1);
    gameBoard.unshift(Array(boardColumns).fill(0));
  }
}

function updateGameBoard() {
  currentTetromino.row++;

  if (hasCollision(currentTetromino.row, currentTetromino.col, currentTetromino.shape)) {
    currentTetromino.row--;
    lockTetromino();
    clearLines();

    // Check for game over condition
    if (hasCollision(0, Math.floor(boardColumns / 2) - 1, currentTetromino.shape)) {
      alert('Game Over');
      location.reload();
    }

    currentTetromino = new Tetromino();
  }
}

// Add score and level variables
let score = 0;
let level = 1;
const linesPerLevel = 10;
let linesCleared = 0;

// Add score and level display elements in HTML
// <div id="score">Score: 0</div>
// <div id="level">Level: 1</div>
const scoreDisplay = document.getElementById('score');
const levelDisplay = document.getElementById('level');

function updateScore(lines) {
  const scoreValues = [0, 40, 100, 300, 1200];
  score += scoreValues[lines] * level;
  scoreDisplay.textContent = `Score: ${score}`;
}

function updateLevel() {
  if (linesCleared >= linesPerLevel) {
    level++;
    levelDisplay.textContent = `Level: ${level}`;
    linesCleared -= linesPerLevel;
  }
}

function clearLines() {
  let lines = 0;

  outer: for (let row = boardRows - 1; row >= 0; row--) {
    for (let col = 0; col < boardColumns; col++) {
      if (!gameBoard[row][col]) {
        continue outer;
      }
    }

    lines++;
    gameBoard.splice(row, 1);
    gameBoard.unshift(Array(boardColumns).fill(0));
  }

  if (lines > 0) {
    updateScore(lines);
    linesCleared += lines;
    updateLevel();
  }
}


