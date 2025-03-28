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
    return Math.abs(p1[0] - p2[0]) + Math.abs(p1[1] - p2[1]);
  }

  findNextStates(current) {
    const result = [];

    if (current[1] && !this.map[current[0]][current[1] - 1]) {
      result.push([current[0], current[1] - 1]);
    }

    if (
      current[1] != this.map[0]?.length - 1 &&
      !this.map[current[0]][current[1] + 1]
    ) {
      result.push([current[0], current[1] + 1]);
    }

    if (current[0] && !this.map[current[0] - 1][current[1]]) {
      result.push([current[0] - 1, current[1]]);
    }

    if (
      current[0] != this.map.length - 1 &&
      !this.map[current[0] + 1][current[1]]
    ) {
      result.push([current[0] + 1, current[1]]);
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
        pops: [],
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