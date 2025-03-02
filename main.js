const dropSound = new Audio('./static/click.wav');
const youWon = new Audio('./static/you_won.mp3');
let draggedTile = null;
let startCoord = 0;       // Pointer coordinate at drag start (x or y)
let currentDelta = 0;     // Current movement offset along allowed axis
let emptyCell = null;     // Current empty cell in the puzzle
let cellWidth = 0, cellHeight = 0;
let direction = null;     // Allowed movement: 'left', 'right', 'up', or 'down'

// Example goal configuration for a 3x3 puzzle:
const goalConfig = [
  ['1', '2', '3'],
  ['4', '5', '6'],
  ['7', '8', null]
];

let initialConfig = null; // Global variable to store the initial random configuration

function getCurrentConfiguration() {
  const config = [];
  const rows = document.querySelectorAll('.puzzle tr');
  rows.forEach(row => {
    const configRow = [];
    const cells = row.querySelectorAll('td');
    cells.forEach(cell => {
      const tile = cell.querySelector('img');
      // Use the tile's data-id attribute to represent its value.
      configRow.push(tile ? tile.getAttribute('data-id') : null);
    });
    config.push(configRow);
  });
  return config;
}

function arraysEqual(a, b) {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    if (a[i].length !== b[i].length) return false;
    for (let j = 0; j < a[i].length; j++) {
      if (a[i][j] !== b[i][j]) return false;
    }
  }
  return true;
}

function Solved() {
  return arraysEqual(getCurrentConfiguration(), goalConfig);
}

// Helper: robustly extract pointer coordinates.
function getPointer(e) {
  if (e.touches && e.touches.length > 0) {
    return { x: e.touches[0].clientX, y: e.touches[0].clientY };
  } else if (typeof e.clientX === 'number' && typeof e.clientY === 'number') {
    return { x: e.clientX, y: e.clientY };
  }
  return null;
}

// --- Reset / Randomize Puzzle Functionality --- //

// Fisher–Yates shuffle to randomize an array.
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

// Check if a configuration is solvable.
// For the 3x3 puzzle, it's solvable if the number of inversions is even.
function isSolvable(arr) {
  const tiles = arr.filter(val => val !== null).map(Number);
  let inversions = 0;
  for (let i = 0; i < tiles.length; i++) {
    for (let j = i + 1; j < tiles.length; j++) {
      if (tiles[i] > tiles[j]) inversions++;
    }
  }
  return inversions % 2 === 0;
}

// Adjust config by swapping two non-null tiles if inversions are odd.
function adjustConfig(config) {
  let i = config.findIndex(val => val !== null);
  let j = config.findIndex((val, idx) => val !== null && idx !== i);
  [config[i], config[j]] = [config[j], config[i]];
  return config;
}

// Apply a given configuration array (length 9) to the puzzle board.
function applyConfig(config) {
  const rows = document.querySelectorAll('.puzzle tr');
  let index = 0;
  rows.forEach(row => {
    const cells = row.querySelectorAll('td');
    cells.forEach(cell => {
      // Clear existing content.
      cell.innerHTML = '';
      const value = config[index++];
      if (value !== null) {
        // Create a new image element.
        const img = document.createElement('img');
        // Set its source based on the tile value.
        img.src = `./static/${value}.jpg`;
        // Set a data-id attribute for goal-checking.
        img.setAttribute('data-id', value);
        // Attach event listeners for drag functionality.
        img.addEventListener('mousedown', dragStart);
        img.addEventListener('touchstart', dragStart, { passive: false });
        cell.appendChild(img);
      }
    });
  });
  
  // Update the global reference to the empty cell.
  document.querySelectorAll('.puzzle td').forEach(cell => {
    if (!cell.querySelector('img')) {
      emptyCell = cell;
    }
  });
  
  // Set cell dimensions if they haven't been set.
  if (cellWidth === 0) {
    document.querySelectorAll('.puzzle td').forEach(cell => {
      if (cell.querySelector('img') && cellWidth === 0) {
        cellWidth = cell.offsetWidth;
        cellHeight = cell.offsetHeight;
      }
    });
  }
}

// Generate and store the initial random configuration.
function generateInitialConfig() {
  const tileValues = ['1', '2', '3', '4', '5', '6', '7', '8', null];
  shuffleArray(tileValues);
  if (!isSolvable(tileValues)) {
    adjustConfig(tileValues);
  }
  initialConfig = tileValues.slice(); // Store a copy
  applyConfig(initialConfig);
}

// Reset moves: Reapply the stored initial configuration.
function resetMoves() {
  if (initialConfig) {
    applyConfig(initialConfig);
  }
}

// --- End Reset Functionality --- //

// Prevent text/image selection during dragging.
document.addEventListener('selectstart', (e) => {
  if (draggedTile) e.preventDefault();
});

// Attach event listeners for mouse and touch events on each tile.
// (These will also be reattached when applying a configuration.)
document.querySelectorAll('td img').forEach(tile => {
  tile.addEventListener('mousedown', dragStart);
  tile.addEventListener('touchstart', dragStart, { passive: false });
});

// Helper: returns true if two cells are adjacent (Manhattan distance equals 1).
function isAdjacent(cell1, cell2) {
  const row1 = cell1.parentNode.rowIndex, col1 = cell1.cellIndex;
  const row2 = cell2.parentNode.rowIndex, col2 = cell2.cellIndex;
  return (Math.abs(row1 - row2) + Math.abs(col1 - col2)) === 1;
}

function dragStart(e) {
  const pointer = getPointer(e);
  if (!pointer) return;
  if (e.type.startsWith('touch')) e.preventDefault();

  const cell = this.parentElement;
  // Only allow dragging if this tile is adjacent to the empty cell.
  if (!isAdjacent(cell, emptyCell)) return;

  draggedTile = this;
  draggedTile.originalCell = cell; // Save original cell for potential reversion.

  // Determine allowed direction based on the tile’s position vs. the empty cell.
  const cellRow = cell.parentNode.rowIndex, cellCol = cell.cellIndex;
  const emptyRow = emptyCell.parentNode.rowIndex, emptyCol = emptyCell.cellIndex;
  if (cellRow === emptyRow) {
    direction = (cellCol > emptyCol) ? 'left' : 'right';
  } else if (cellCol === emptyCol) {
    direction = (cellRow > emptyRow) ? 'up' : 'down';
  } else {
    return;
  }

  // Record the starting pointer coordinate along the allowed axis.
  startCoord = (direction === 'left' || direction === 'right') ? pointer.x : pointer.y;
  currentDelta = 0;

  // Prepare the tile for dragging.
  draggedTile.style.transition = 'none';
  draggedTile.style.zIndex = '1000';

  // Attach document-level listeners.
  document.addEventListener('mousemove', drag);
  document.addEventListener('mouseup', dragEnd);
  document.addEventListener('touchmove', drag, { passive: false });
  document.addEventListener('touchend', dragEnd);
}

function drag(e) {
  if (!draggedTile) return;
  const pointer = getPointer(e);
  if (!pointer) return;
  if (e.type.startsWith('touch')) e.preventDefault();

  let currentPos = (direction === 'left' || direction === 'right') ? pointer.x : pointer.y;
  let delta = currentPos - startCoord;
  
  // Define a maximum drag distance that keeps the tile within its cell.
  const maxDrag = (direction === 'left' || direction === 'right') ? cellWidth * 0.92 : cellHeight * 0.92;
  
  // Clamp delta so that during drag the tile doesn't leave its cell visually.
  if (direction === 'left') {
    delta = Math.min(0, delta);
    delta = Math.max(-maxDrag, delta);
  } else if (direction === 'right') {
    delta = Math.max(0, delta);
    delta = Math.min(maxDrag, delta);
  } else if (direction === 'up') {
    delta = Math.min(0, delta);
    delta = Math.max(-maxDrag, delta);
  } else if (direction === 'down') {
    delta = Math.max(0, delta);
    delta = Math.min(maxDrag, delta);
  }
  currentDelta = delta;
  
  // Update the tile's transform.
  if (direction === 'left' || direction === 'right') {
    draggedTile.style.transform = `translate(${delta}px, 0)`;
  } else {
    draggedTile.style.transform = `translate(0, ${delta}px)`;
  }
}

function dragEnd(e) {
  if (!draggedTile) return;
  
  // Remove document-level listeners.
  document.removeEventListener('mousemove', drag);
  document.removeEventListener('mouseup', dragEnd);
  document.removeEventListener('touchmove', drag);
  document.removeEventListener('touchend', dragEnd);
  
  // Define a threshold (35% of cell dimension) for completing the move.
  const threshold = (direction === 'left' || direction === 'right') ? cellWidth * 0.35 : cellHeight * 0.35;
  draggedTile.style.transition = 'transform 0.1s ease';
  
  // Use the same maxDrag value as in drag() so the tile doesn't overshoot.
  const maxDrag = (direction === 'left' || direction === 'right') ? cellWidth * 0.92 : cellHeight * 0.92;

  if (Math.abs(currentDelta) >= threshold) {
    // Animate the tile to the cell's boundary using maxDrag.
    const finalDelta = (direction === 'left' || direction === 'up') ? -maxDrag : maxDrag;
    if (direction === 'left' || direction === 'right') {
      draggedTile.style.transform = `translate(${finalDelta}px, 0)`;
    } else {
      draggedTile.style.transform = `translate(0, ${finalDelta}px)`;
    }
    // Finalize the drop after the transition.
    setTimeout(() => {
      const origCell = draggedTile.originalCell;
      // Reparent the tile into the empty cell.
      emptyCell.appendChild(draggedTile);
      draggedTile.style.transition = '';
      draggedTile.style.transform = '';
      draggedTile.style.zIndex = '';
      dropSound.play();
      // Update the empty cell to be the one just vacated.
      emptyCell = origCell;

      // Check if the puzzle is solved.
      if (Solved()) {
        youWon.play();
      }

      // Clear drag state.
      draggedTile = null;
      direction = null;
      currentDelta = 0;
    }, 220);
  } else {
    // Revert the tile to its original position.
    draggedTile.style.transform = '';
    setTimeout(() => {
      draggedTile.style.transition = '';
      draggedTile.style.zIndex = '';
      draggedTile = null;
      direction = null;
      currentDelta = 0;
    }, 220);
  }
}

// Initialize the puzzle with a random configuration on page load.
document.addEventListener('DOMContentLoaded', generateInitialConfig);

// (Optional) Attach reset functionality to a button with name "reset_moves".
// Each time the reset button is pressed, the board reverts to the initial configuration.
document.getElementsByName('reset_moves')[0].addEventListener('click', function(e) {
  e.preventDefault();
  resetMoves();
});

// Attach new game functionality to a button with name "new_game".
// This generates a new initial configuration.
document.querySelector('button[name="new_game"]').addEventListener('click', function(e) {
  e.preventDefault();
  generateInitialConfig();
});
