class Maze {
  constructor(
    map = [[]],
    start = [0, 0],
    target = [map.length - 1, map[0].length - 1]
  ) {
    this.map = map;
    this.start = start;
    this.target = target;
    this.visited = new Set(); // Thay hashed bằng Set để theo dõi các ô đã thăm
    this.steps = []; // Lưu các bước để trực quan hóa
    this.path = []; // Lưu đường đi cuối cùng
  }

  isGoal(state = []) {
    return state[0] === this.target[0] && state[1] === this.target[1];
  }

  // Hàm heuristic: Khoảng cách Manhattan
  heuristic(p1, p2) {
    return Math.abs(p1[0] - p2[0]) + Math.abs(p1[1] - p2[1]);
  }

  // Tìm các ô lân cận hợp lệ (giữ nguyên từ code cũ, nhưng bỏ sắp xếp vì A* sẽ tự xử lý)
  findNextStates(current) {
    const result = [];

    // To left
    if (current[1] && !this.map[current[0]][current[1] - 1]) {
      result.push([current[0], current[1] - 1]);
    }

    // To right
    if (
      current[1] != this.map[0]?.length - 1 &&
      !this.map[current[0]][current[1] + 1]
    ) {
      result.push([current[0], current[1] + 1]);
    }

    // To up
    if (current[0] && !this.map[current[0] - 1][current[1]]) {
      result.push([current[0] - 1, current[1]]);
    }

    // To down
    if (
      current[0] != this.map.length - 1 &&
      !this.map[current[0] + 1][current[1]]
    ) {
      result.push([current[0] + 1, current[1]]);
    }

    return result;
  }

  // Thuật toán A*
  aStar() {
    // Hàng đợi ưu tiên: mỗi phần tử là [fScore, gScore, state, parent]
    const openSet = [
      [this.heuristic(this.start, this.target), 0, this.start, null],
    ];
    const cameFrom = new Map(); // Lưu parent của mỗi ô để tái tạo đường đi
    const gScore = new Map(); // Chi phí từ start đến state
    const fScore = new Map(); // f(n) = g(n) + h(n)

    // Khởi tạo gScore và fScore cho điểm bắt đầu
    const startKey = this.start.toString();
    gScore.set(startKey, 0);
    fScore.set(startKey, this.heuristic(this.start, this.target));

    while (openSet.length > 0) {
      // Sắp xếp openSet theo fScore và lấy phần tử có fScore nhỏ nhất
      openSet.sort((a, b) => a[0] - b[0]);
      const [currentFScore, currentGScore, current, parent] = openSet.shift();

      // Thêm vào visited
      const currentKey = current.toString();
      this.visited.add(currentKey);

      // Lưu bước hiện tại để trực quan hóa
      const nextStates = this.findNextStates(current);
      this.steps.push({ current, nextStates, pops: [] });

      // Nếu đến đích, tái tạo đường đi và trả về
      if (this.isGoal(current)) {
        this.path = this.reconstructPath(cameFrom, current);
        return true;
      }

      // Duyệt các ô lân cận
      for (const nextState of nextStates) {
        const nextKey = nextState.toString();

        // Nếu đã thăm, bỏ qua
        if (this.visited.has(nextKey)) continue;

        // Tính gScore tạm thời
        const tentativeGScore = currentGScore + 1; // Mỗi bước có chi phí 1

        // Nếu chưa có gScore cho nextState hoặc gScore mới tốt hơn
        if (!gScore.has(nextKey) || tentativeGScore < gScore.get(nextKey)) {
          cameFrom.set(nextKey, current);
          gScore.set(nextKey, tentativeGScore);
          const hScore = this.heuristic(nextState, this.target);
          const fScoreValue = tentativeGScore + hScore;
          fScore.set(nextKey, fScoreValue);

          // Thêm vào openSet
          openSet.push([fScoreValue, tentativeGScore, nextState, current]);
        }
      }
    }

    // Không tìm thấy đường đi
    return false;
  }

  // Tái tạo đường đi từ cameFrom
  reconstructPath(cameFrom, current) {
    const path = [current];
    let currentKey = current.toString();

    while (cameFrom.has(currentKey)) {
      current = cameFrom.get(currentKey);
      currentKey = current.toString();
      path.push(current);
    }

    return path.reverse(); // Đảo ngược để đi từ start đến target
  }

  // Hàm khởi chạy A*
  startAStar() {
    this.path = [];
    this.steps = [];
    this.visited = new Set();

    return this.aStar();
  }
}

export default Maze;
