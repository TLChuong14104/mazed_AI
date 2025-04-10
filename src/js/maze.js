import PriorityQueue from 'js-priority-queue';

class Maze {
  constructor(
    map = [[]],
    start = [0, 0],
    target = [map.length - 1, map[0].length - 1]
  ) {
    this.map = map;
    this.start = start;
    this.target = target;
    this.visited = new Set();
    this.steps = [];
    this.path = [];
  }

  isGoal(state = []) {
    return state[0] === this.target[0] && state[1] === this.target[1];
  }

  heuristic(p1, p2) {
    let h = Math.abs(p1[0] - p2[0]) + Math.abs(p1[1] - p2[1]);
    // Kiểm tra các ô trên đường thẳng từ p1 đến p2
    let x1 = p1[0], y1 = p1[1];
    let x2 = p2[0], y2 = p2[1];
    let penalty = 0;

    // Di chuyển theo hướng x trước
    let stepX = x1 < x2 ? 1 : (x1 > x2 ? -1 : 0);
    let stepY = y1 < y2 ? 1 : (y1 > y2 ? -1 : 0);

    let x = x1, y = y1;
    while (x !== x2) {
      if (this.map[x][y] === 1) penalty += 1; // Thêm phạt nhẹ nếu gặp tường
      x += stepX;
    }
    while (y !== y2) {
      if (this.map[x][y] === 1) penalty += 1; // Thêm phạt nhẹ nếu gặp tường
      y += stepY;
    }

    return h + penalty;
  }

  findNextStates(current) {
    const directions = [
      [0, -1], // left
      [0, 1],  // right
      [-1, 0], // up
      [1, 0]   // down
    ];
    
    const result = [];
    
    for (const [dx, dy] of directions) {
      const newX = current[0] + dx;
      const newY = current[1] + dy;
      
      // Kiểm tra trong biên giới hạn và ô không phải là tường
      if (newX >= 0 && newX < this.map.length && 
          newY >= 0 && newY < this.map[0].length && 
          !this.map[newX][newY]) {
        result.push([newX, newY]);
      }
    }
    
    return result;
  }

  aStar() {
    const openSet = new PriorityQueue({
      comparator: (a, b) => a[0] - b[0],
    });
    openSet.queue([this.heuristic(this.start, this.target), 0, this.start, null]);

    const cameFrom = new Map();
    const gScore = new Map();
    const fScore = new Map();

    const startKey = this.start.toString();
    gScore.set(startKey, 0);
    fScore.set(startKey, this.heuristic(this.start, this.target));

    while (openSet.length > 0) {
      const [currentFScore, currentGScore, current, parent] = openSet.dequeue();

      const currentKey = current.toString();
      this.visited.add(currentKey);

      const nextStates = this.findNextStates(current);
      const hScore = this.heuristic(current, this.target);
      
      // Lưu các giá trị fScore, gScore, hScore vào steps
      this.steps.push({
        current,
        nextStates,
        fScore: currentFScore,
        gScore: currentGScore,
        hScore: hScore,
      });

      if (this.isGoal(current)) {
        this.path = this.reconstructPath(cameFrom, current);
        const pathSet = new Set(this.path.map(pos => pos.toString()));
        const deadEnds = Array.from(this.visited).filter(pos => !pathSet.has(pos));
        this.steps.push({ current, nextStates: [], deadEnds });
        return true;
      }

      for (const nextState of nextStates) {
        const nextKey = nextState.toString();

        if (this.visited.has(nextKey)) continue;

        const tentativeGScore = currentGScore + 1;

        if (!gScore.has(nextKey) || tentativeGScore < gScore.get(nextKey)) {
          cameFrom.set(nextKey, current);
          gScore.set(nextKey, tentativeGScore);
          const hScore = this.heuristic(nextState, this.target);
          const fScoreValue = tentativeGScore + hScore;
          fScore.set(nextKey, fScoreValue);

          openSet.queue([fScoreValue, tentativeGScore, nextState, current]);
        }
      }
    }

    // Trường hợp không tìm thấy đường đi
    this.steps.push({ message: "Không tìm thấy đường đi đến đích" });
    return false;
  }

  reconstructPath(cameFrom, current) {
    const path = [current];
    let currentKey = current.toString();

    while (cameFrom.has(currentKey)) {
      current = cameFrom.get(currentKey);
      currentKey = current.toString();
      path.push(current);
    }

    return path.reverse();
  }

  startAStar() {
    this.path = [];
    this.steps = [];
    this.visited = new Set();

    return this.aStar();
  }
}

export default Maze;