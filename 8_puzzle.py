# I = [
#     [3, 4, 8],
#     [6, 0, 7],
#     [5, 2, 1]
# ]
# G = [
#     [1, 2, 3],
#     [4, 5, 6],
#     [7, 8, 0]
# ]
# push this AI 8-puzzle game solver to github. Then add to resume. Build a frontend(possibly a website or add it to your portfolio). Take user input for initial state or generate random start state(ensure it's not goal by setting heuristic>6), then ask users to try and solve, at the end solve the problem with step by step moves

import copy
import heapq
inf = float('inf')

I = [
        [8,3,7],
        [2,6,1],
        [4,5,0]
    ]

G = [
    [3, 4, 8],
    [6, 0, 7],
    [5, 2, 1]
]
goal_sequence = []

def MoveGen(S):
    # determine the number of possible moves(neighbors) from current state
    # determine position of 0
    neighbors = []
    i0 = -1
    j0 = -1
    for i in range(3):
        for j in range(3):
            if(S[i][j] == 0):
                i0 = i
                j0 = j

    new_neighbor = copy.deepcopy(S)
    if (i0-1)>=0: # top swap
        new_neighbor[i0][j0], new_neighbor[i0-1][j0] = new_neighbor[i0-1][j0], new_neighbor[i0][j0]
        neighbors.append(new_neighbor)
        new_neighbor = copy.deepcopy(S)
    if (j0-1)>=0: # left swap
        new_neighbor[i0][j0], new_neighbor[i0][j0-1] = new_neighbor[i0][j0-1], new_neighbor[i0][j0]
        neighbors.append(new_neighbor)
        new_neighbor = copy.deepcopy(S)
    if (j0+1)<=2: # bottom swap
        new_neighbor[i0][j0], new_neighbor[i0][j0+1] = new_neighbor[i0][j0+1], new_neighbor[i0][j0]
        neighbors.append(new_neighbor)
        new_neighbor = copy.deepcopy(S)
    if(i0+1)<=2: # right swap
        new_neighbor[i0][j0], new_neighbor[i0+1][j0] = new_neighbor[i0+1][j0], new_neighbor[i0][j0]
        neighbors.append(new_neighbor)
        new_neighbor = copy.deepcopy(S)
    return neighbors



def h(S):
    mismatch = 0
    for i in range(3):
        for j in range(3):
            if S[i][j] != G[i][j]:
                mismatch += 1
    return mismatch



def A_star(S): # S is a matrix
    global goal_sequence
    best_cost = inf
    min_heap = [(h(S),0,h(S),S,[])] # NodeTriplet:(g(n),n,path_to_n)
    while min_heap:
        f, g, heuristic, curr, path = heapq.heappop(min_heap)
        path.append(curr)
        if heuristic == 0: # goal_test(S) is passed then
            if g < best_cost:
                best_cost = g
                best_path = path
                print("Minimum number of moves = ", best_cost)
                # print("Best sequence of moves = ", best_path)
                goal_sequence = best_path
        else:
            if g > best_cost: # then prune that subtree
                continue
            else:
                neighbors = MoveGen(curr)
                for child in neighbors:
                    if child not in path:
                        new_g = g+1 # increment the number of moves for the child node
                        heapq.heappush(min_heap, (new_g+h(child), new_g, h(child), child, path.copy()))
    return

# print(Heuristic(G))
A_star(I)

def get0(S):
    for i in range(3):
        for j in range(3):
            if(S[i][j] == 0):
                return i, j

print("\n\nSteps to solve the puzzle:\n ")
c = 1
for step in goal_sequence:
    i, j = get0(step)
    if step == I:
        prev_i, prev_j = i, j
        continue
    if prev_i < i:
        print(f"{c}. Swap up")
    elif prev_i > i:
        print(f"{c}. Swap down")
    elif prev_j < j:
        print(f"{c}. Swap left")
    elif prev_j > j:
        print(f"{c}. Swap right")
    prev_i, prev_j = i, j
    c += 1
print("You have reached the goal!\n\n")

print("Move Sequence: ")
for state in goal_sequence:
    for i in range(len(state)):
        for j in range(len(state)):
            print(state[i][j], end = " ")
        print("")
    print('  \u2193')  # ↓ (downward arrow)
print("GOAL!")