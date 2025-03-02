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
            cell.appendChild(draggedTile); // Move the tile to the new cell
        }
        dropSound.play();
    });
});
