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

// let initialConfig = [4,6,1,7,2,5,0,8,3];
const G = [
    [1, 2, 3],
    [4, 5, 6],
    [7, 8, 0]
];

// ------------------- Utility Functions -------------------
function arrayToMatrix(arr) {
  let matrix = [];
  for (let i = 0; i < 3; i++) {
    matrix.push(arr.slice(i * 3, i * 3 + 3).map(val => val === null ? 0 : val));
  }
  return matrix;
}
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

// A_Star Search to solve the puzzle.
function A_star(S) {
  let best_cost = Infinity;
  let best_path = [];
  let minHeap = new MinHeap((a, b) => a.f - b.f);
  let visited = new Set();
  
  minHeap.push({ f: h(S), g: 0, h: h(S), state: S, path: [] });
  visited.add(JSON.stringify(S));
  
  while (!minHeap.isEmpty()) {
    const node = minHeap.pop();
    // Debug log (optional)
    console.log("Expanding node with h =", node.h);
    let { f, g, h: heuristic, state: curr, path } = node;
    let newPath = path.slice();
    newPath.push(curr);
    
    // Goal test.
    if (heuristic === 0) {
      if (g < best_cost) {
        best_cost = g;
        best_path = newPath;
        return { best_cost, goalSequence: best_path };
      }
    } else {
      if (g > best_cost) continue;
      const neighbors = moveGen(curr);
      for (let child of neighbors) {
        const childStr = JSON.stringify(child);
        if (!visited.has(childStr)) {
          visited.add(childStr);
          let new_g = g + 1;
          let new_h = h(child);
          let new_f = new_g + new_h;
          minHeap.push({ f: new_f, g: new_g, h: new_h, state: child, path: newPath.slice() });
        }
      }
    }
  }
  return { best_cost, goalSequence: best_path };
}

// Listen for messages from the main thread.
self.onmessage = function(event) {
  const { initialConfig } = event.data;
  const matrix = arrayToMatrix(initialConfig);
  const result = A_star(matrix);
  self.postMessage(result);
};
