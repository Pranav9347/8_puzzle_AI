// Define the initial (I) and goal (G) states.
const I = [
    [3, 2, 1],
    [4, 5, 6],
    [0, 8, 7]
];
  
const G = [
    [1, 2, 3],
    [4, 5, 6],
    [7, 8, 0]
];

let goalSequence = []; // This will hold the sequence of moves (states)

// ------------------- Utility Functions -------------------

// Deep clone a 2D array representing a puzzle state.
function cloneState(state) {
return state.map(row => row.slice());
}
  
  // ------------------- Puzzle Solver Functions -------------------
  
// MoveGen: Given state S, generate all valid neighbor states.
function moveGen(S) {
const neighbors = [];
let i0, j0;
for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
    if (S[i][j] === 0) {
        i0 = i;
        j0 = j;
    }
    }
}
let newNeighbor = cloneState(S);
// Top swap: swap 0 with tile above if exists.
if (i0 - 1 >= 0) {
    [newNeighbor[i0][j0], newNeighbor[i0 - 1][j0]] = [newNeighbor[i0 - 1][j0], newNeighbor[i0][j0]];
    neighbors.push(newNeighbor);
    newNeighbor = cloneState(S);
}
// Left swap: swap 0 with tile to left.
if (j0 - 1 >= 0) {
    [newNeighbor[i0][j0], newNeighbor[i0][j0 - 1]] = [newNeighbor[i0][j0 - 1], newNeighbor[i0][j0]];
    neighbors.push(newNeighbor);
    newNeighbor = cloneState(S);
}
// Right swap: swap 0 with tile to right.
if (j0 + 1 <= 2) {
    [newNeighbor[i0][j0], newNeighbor[i0][j0 + 1]] = [newNeighbor[i0][j0 + 1], newNeighbor[i0][j0]];
    neighbors.push(newNeighbor);
    newNeighbor = cloneState(S);
}
// Down swap: swap 0 with tile below.
if (i0 + 1 <= 2) {
    [newNeighbor[i0][j0], newNeighbor[i0 + 1][j0]] = [newNeighbor[i0 + 1][j0], newNeighbor[i0][j0]];
    neighbors.push(newNeighbor);
}
return neighbors;
}
  
// Heuristic h(S): counts mismatched tiles compared to the goal state.
function h(S) {
let mismatch = 0;
for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
    if (S[i][j] !== G[i][j]) mismatch++;
    }
}
return mismatch;
}

// Best_first Search to solve the puzzle.
function Best_first_search(S) {
let minHeap = []; // Our "heap" will be an array we sort on f.
// Each node: { f, g, h, state, path }
minHeap.push({ h: h(S), state: S, path: [] });

while (minHeap.length > 0) {
    // Sort the heap by f value (lowest first)
    minHeap.sort((a, b) => a.h - b.h);
    const node = minHeap.shift();
    let { h: heuristic, state: curr, path } = node;
    path = path.concat([curr]);
    
    if (heuristic === 0) { // Goal reached.
        goalSequence = path;
        return;
    }
        else {
    const neighbors = moveGen(curr);
    for (let child of neighbors) {
        // Check if child state is already in the path (avoid cycles)
        const childStr = JSON.stringify(child);
        const inPath = path.some(s => JSON.stringify(s) === childStr);
        if (!inPath) {
        const newH = h(child);
        minHeap.push({ h: newH, state: child, path: path.slice() });
        }
    }
    }
}
}

// Get position of blank (0) in state S.
function get0(S) {
for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
    if (S[i][j] === 0) return [i, j];
    }
}
}
  
  // ------------------- Run the Solver and Display Moves -------------------
  
Best_first_search(I); // Run A* on the initial state
  
if (isSolvable(I)) {
console.log("\n\nSteps to solve the puzzle:\n");
let c = 1;
let prev = null;
for (let step of goalSequence) {
    const pos = get0(step);
    if (!prev) {
    prev = pos;
    continue;
    }
    if (prev[0] < pos[0]) {
    console.log(`${c}. Swap up`);
    } else if (prev[0] > pos[0]) {
    console.log(`${c}. Swap down`);
    } else if (prev[1] < pos[1]) {
    console.log(`${c}. Swap left`);
    } else if (prev[1] > pos[1]) {
    console.log(`${c}. Swap right`);
    }
    prev = pos;
    c++;
}
console.log("You have reached the goal!\n\n");

console.log("Move Sequence: ");
for (let state of goalSequence) {
    for (let i = 0; i < state.length; i++) {
    console.log(state[i].join(" "));
    }
    console.log("  ↓"); // Downward arrow
}
console.log("GOAL!");
} else {
console.log("Puzzle is not solvable.");
}

// document.getElementsByName('solution')[0].addEventListener('click', function(e) {
// e.preventDefault();
// Best_first_search();
// });