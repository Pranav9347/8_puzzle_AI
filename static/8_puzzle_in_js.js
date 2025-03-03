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
  
// Define the initial (I) and goal (G) states.
const I = [
  [8, 6, 7],
  [2, 5, 4],
  [3, 0, 1]
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
  
  // function A_star(S) {
  //   let best_cost = Infinity;
  //   let best_path = [];
  //   // Create a min heap with a comparator based on the f value (g + h)
  //   let minHeap = new MinHeap((a, b) => a.f - b.f);
    
  //   // Push the initial node: f = h(S), g = 0, h = h(S), state = S, path = []
  //   minHeap.push({ f: h(S), g: 0, h: h(S), state: S, path: [] });
    
  //   while (!minHeap.isEmpty()) {
  //     // Pop the node with the lowest f value
  //     const node = minHeap.pop();
  //     let { f, g, h: heuristic, state: curr, path } = node;
      
  //     // Make a copy of the current path and add the current state.
  //     let newPath = path.slice();
  //     newPath.push(curr);
      
  //     // Goal test: if heuristic is 0, we have reached the goal.
  //     if (heuristic === 0) {
  //       if (g < best_cost) {
  //         best_cost = g;
  //         best_path = newPath;
  //         goalSequence = best_path;
  //         console.log("Minimum number of moves =", best_cost);
  //         return;
  //       }
  //     } else {
  //       // Prune paths that already cost more than our best solution.
  //       if (g > best_cost) {
  //         continue;
  //       }
        
  //       // Expand neighbors
  //       const neighbors = moveGen(curr);
  //       for (let child of neighbors) {
  //         // Check if child is already in the path to avoid cycles.
  //         const childStr = JSON.stringify(child);
  //         const inPath = newPath.some(s => JSON.stringify(s) === childStr);
  //         if (!inPath) {
  //           let new_g = g + 1;       // cost increment for the child node
  //           let new_h = h(child);      // heuristic for the child node
  //           let new_f = new_g + new_h; // total cost f = g + h
  //           // Push a new node with a copy of the current path.
  //           minHeap.push({ f: new_f, g: new_g, h: new_h, state: child, path: newPath.slice() });
  //         }
  //       }
  //     }
  //   }
    
  //   // Save the best sequence found into goalSequence (global variable)
  // }
  
  function A_star(S) {
    let best_cost = Infinity;
    let best_path = [];
    // Create a min heap with a comparator based on the f value (g + h)
    let minHeap = new MinHeap((a, b) => a.f - b.f);
    
    // Global visited set to store stringified states
    let visited = new Set();
    
    // Push the initial node: f = h(S), g = 0, h = h(S), state = S, path = []
    minHeap.push({ f: h(S), g: 0, h: h(S), state: S, path: [] });
    visited.add(JSON.stringify(S));  // Mark the initial state as visited
    
    while (!minHeap.isEmpty()) {
      // Pop the node with the lowest f value
      const node = minHeap.pop();
      let { f, g, h: heuristic, state: curr, path } = node;
      // Make a copy of the current path and add the current state.
      let newPath = path.slice();
      newPath.push(curr);
      
      // Goal test: if heuristic is 0, we have reached the goal.
      if (heuristic === 0) {
        if (g < best_cost) {
          best_cost = g;
          best_path = newPath;
          goalSequence = best_path;
          console.log("Minimum number of moves =", best_cost);
          return;
        }
      } else {
        // Prune paths that already cost more than our best solution.
        if (g > best_cost) continue;
        
        // Expand neighbors
        const neighbors = moveGen(curr);
        for (let child of neighbors) {
          // Convert the child state to a string
          const childStr = JSON.stringify(child);
          // Only process this child if it hasn't been visited
          if (!visited.has(childStr)) {
            visited.add(childStr);
            let new_g = g + 1;       // Increment cost for the child node
            let new_h = h(child);      // Compute heuristic for the child
            let new_f = new_g + new_h; // Total cost f = g + h
            // Push a new node with a copy of the current path.
            minHeap.push({ f: new_f, g: new_g, h: new_h, state: child, path: newPath.slice() });
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
  
  // ------------------- Run the Solver -------------------
  A_star(I);
  //goalSequence.forEach(state => console.log(state));
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
