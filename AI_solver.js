class MinHeap {
  constructor(comparator = (a, b) => a - b) {
    this.heap = [];
    this.comparator = comparator;
  }
  
  size() {
    return this.heap.length;
  }
  
  isEmpty() {
    return this.heap.length === 0;
  }
  
  peek() {
    return this.heap[0];
  }
  
  push(value) {
    this.heap.push(value);
    this._heapifyUp();
  }
  
  pop() {
    if (this.isEmpty()) return null;
    const top = this.peek();
    const bottom = this.heap.pop();
    if (!this.isEmpty()) {
      this.heap[0] = bottom;
      this._heapifyDown();
    }
    return top;
  }
  
  _heapifyUp() {
    let index = this.heap.length - 1;
    const element = this.heap[index];
    while (index > 0) {
      const parentIndex = Math.floor((index - 1) / 2);
      const parent = this.heap[parentIndex];
      if (this.comparator(element, parent) >= 0) break;
      this.heap[index] = parent;
      this.heap[parentIndex] = element;
      index = parentIndex;
    }
  }
  
  _heapifyDown() {
    let index = 0;
    const length = this.heap.length;
    const element = this.heap[0];
    while (true) {
      let leftChildIndex = 2 * index + 1;
      let rightChildIndex = 2 * index + 2;
      let swapIndex = null;
      
      if (leftChildIndex < length) {
        if (this.comparator(this.heap[leftChildIndex], element) < 0) {
          swapIndex = leftChildIndex;
        }
      }
      
      if (rightChildIndex < length) {
        if (
          (swapIndex === null && this.comparator(this.heap[rightChildIndex], element) < 0) ||
          (swapIndex !== null && this.comparator(this.heap[rightChildIndex], this.heap[leftChildIndex]) < 0)
        ) {
          swapIndex = rightChildIndex;
        }
      }
      
      if (swapIndex === null) break;
      this.heap[index] = this.heap[swapIndex];
      this.heap[swapIndex] = element;
      index = swapIndex;
    }
  }
}
solutionDiv = null;
function print2DArray(matrix) {
  for (let i = 0; i < matrix.length; i++) {
    console.log(matrix[i].join(" "));
  }
}
function arrayToMatrix(arr) {
  let matrix = [];
  for (let i = 0; i < 3; i++) {
      matrix.push(arr.slice(i * 3, i * 3 + 3).map(val => val === null ? 0 : val));
  }
  return matrix;
}
// let initialConfig = [4,6,1,7,2,5,0,8,3];
const G = [
  [1, 2, 3],
  [4, 5, 6],
  [7, 8, 0]
];
let goalSequence = []; // This will hold the sequence of moves (states)
// Best_first_search(arrayToMatrix(initialConfig));
// displaySolution();



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

// Heuristic h(S): Manhattan Distance: better heuristic than mismatched tiles count
function h(S) {
let distance = 0;
for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
        const val = S[i][j];
        if (val === 0) continue;
        const targetRow = Math.floor((val - 1) / 3);
        const targetCol = (val - 1) % 3;
        distance += Math.abs(i - targetRow) + Math.abs(j - targetCol);
    }
}
return distance;
}

// Modified A_star with progress reporting and timeout
let nodeCount = 0; // Global counter for progress tracking

function A_star(S) {
  return new Promise((resolve, reject) => {
      nodeCount = 0; // Reset counter for each run
      let best_cost = Infinity;
      let best_path = [];
      let minHeap = new MinHeap((a, b) => a.f - b.f);
      let visited = new Map();
      
      // Increase timeout to 30 seconds for complex puzzles
      const timeoutId = setTimeout(() => {
          reject(new Error("Solution timeout (30s exceeded)"));
      }, 30000);

      minHeap.push({ f: h(S), g: 0, h: h(S), state: S, path: [] });
      visited.set(JSON.stringify(S), 0);

      const processNode = () => {
          try {
              if (minHeap.isEmpty()) {
                  clearTimeout(timeoutId);
                  resolve(false);
                  return;
              }

              const node = minHeap.pop();
              nodeCount++;
              
              const { g, h: heuristic, state: curr, path } = node;
              const currStr = JSON.stringify(curr);

              // Prune if better path exists
              if (g > visited.get(currStr)) {
                  setTimeout(processNode, 0);
                  return;
              }

              const newPath = [...path, curr];

              // Goal check
              if (heuristic === 0) {
                  clearTimeout(timeoutId);
                  goalSequence = newPath;
                  resolve(true);
                  return;
              }

              // Generate and process neighbors
              const neighbors = moveGen(curr);
              for (const child of neighbors) {
                  const childStr = JSON.stringify(child);
                  const new_g = g + 1;
                  
                  if (!visited.has(childStr) || new_g < visited.get(childStr)) {
                      visited.set(childStr, new_g);
                      const new_h = h(child);
                      minHeap.push({
                          f: new_g + new_h,
                          g: new_g,
                          h: new_h,
                          state: child,
                          path: newPath
                      });
                  }
              }

              // Yield control every 100 nodes
              if (nodeCount % 100 === 0) {
                  setTimeout(processNode, 0);
              } else {
                  processNode();
              }
          } catch (err) {
              clearTimeout(timeoutId);
              reject(err);
          }
      };

      setTimeout(processNode, 0);
  });
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
function displaySolution() {
  let c = 1;
  let prev = null;
  console.log("goalSequence"+goalSequence.length)
  for (let step of goalSequence) {
    const pos = get0(step);
    if (!prev) {
      prev = pos;
      continue;
    }
    
    let moveText = "";
    if (prev[0] < pos[0]) {
      moveText = `${c}. Swap up`;
    } else if (prev[0] > pos[0]) {
      moveText = `${c}. Swap down`;
    } else if (prev[1] < pos[1]) {
      moveText = `${c}. Swap left`;
    } else if (prev[1] > pos[1]) {
      moveText = `${c}. Swap right`;
    }
    
    // Create a paragraph element and append it.
    const p = document.createElement('p');
    p.textContent = moveText;
    solutionDiv.appendChild(p);
    
    prev = pos;
    c++;
  }
  
  // Append final message.
  const finalPara = document.createElement('p');
  finalPara.textContent = "You have reached the goal!";
  solutionDiv.appendChild(finalPara);
}

// Updated event handler with proper progress tracking
document.getElementsByName('solution')[0].addEventListener('click', async function(e) {
e.preventDefault();
const button = e.target;
const originalText = button.innerHTML;
solutionDiv = document.getElementById('solutionOutput');

try {
    button.innerHTML = "⏳ Solving...";
    button.disabled = true;
    solutionDiv.innerHTML = `<p>🔍 Analyzing puzzle... <span id="progress">0</span> states explored</p>`;

    // Update progress every 500ms
    const progressSpan = document.getElementById('progress');
    const progressUpdater = setInterval(() => {
        if (progressSpan) progressSpan.textContent = nodeCount.toLocaleString();
    }, 500);

    const matrixInitial = arrayToMatrix(initialConfig.map(x => x === null ? 0 : x));
    const success = await A_star(matrixInitial);

    clearInterval(progressUpdater);
    solutionDiv.innerHTML = "";
    
    if (success) {
        displaySolution();
    } else {
        solutionDiv.innerHTML = "<p>❌ No valid solution found</p>";
    }
     // Scroll down to the solution output smoothly
     document.getElementById('solutionOutput').scrollIntoView({ behavior: 'smooth', block: 'end' });
} catch (error) {
    console.error("Solver error:", error);
    solutionDiv.innerHTML = `<p>⚠️ ${error.message}</p>`;
} finally {
    button.innerHTML = originalText;
    button.disabled = false;
}
});