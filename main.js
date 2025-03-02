const dropSound = new Audio('./static/click.wav');
    
// Select all required html objects:

let reset_moves = document.getElementsByName('reset_moves');
let solution = document.getElementsByName('solution');
let new_game = document.getElementsByName('new_game');

const tiles = document.querySelectorAll('td img');
let draggedTile = null;

// Add drag events to each tile
tiles.forEach(tile => {
    // When dragging starts
    tile.addEventListener('dragstart', (e) => {
        draggedTile = e.target; // Store the dragged tile
        console.log(draggedTile)
        setTimeout(() => {
            draggedTile.style.opacity = '0.5'; // Visual feedback
        }, 0);
    });

    // When dragging ends
    tile.addEventListener('dragend', () => {
        draggedTile.style.opacity = '1'; // Reset opacity
        draggedTile = null; // Clear reference
    });
});

// Enable dragging over empty cells
document.querySelectorAll('td').forEach(cell => {
    cell.addEventListener('dragover', (e) => {
        e.preventDefault(); // Necessary for allowing drops
    });

    // Handle the drop event
    cell.addEventListener('drop', (e) => {
        e.preventDefault();
        if (!cell.querySelector('img')) { // Only drop into empty cells
            const originalCell = draggedTile.parentElement;
            const targetCell = cell;

            // Get positions of original and target cells
            const originalRow = originalCell.parentNode.rowIndex;
            const originalCol = originalCell.cellIndex;
            const targetRow = targetCell.parentNode.rowIndex;
            const targetCol = targetCell.cellIndex;

            // Check if adjacent (horizontally or vertically)
            const rowDiff = Math.abs(originalRow - targetRow);
            const colDiff = Math.abs(originalCol - targetCol);
            
            if (rowDiff + colDiff === 1) { // Adjacent cells
                targetCell.appendChild(draggedTile);
                dropSound.play();
            }
        }
    });
});
