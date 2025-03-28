import "./css/styles.css";
import GameGui from "./js/game-gui.js";
import Maze from "./js/maze.js";
import mazeGenerator from "./js/maze-generator.js";

// Gắn Maze và GameGui vào window (dù không cần thiết nữa vì script inline đã bị xóa)
window.Maze = Maze;
window.GameGui = GameGui;
window.mazeGenerator = mazeGenerator;

window.addEventListener("load", () => {
  const gameGui = new GameGui(document.getElementById("maze-game"));

  function gameGenerate(width = 10, height = 10, delay = 200) {
    const { map, start, target, rows, cols } = mazeGenerator(width, height);
    const maze = new Maze(map, start, target);

    gameGui.init(maze, {
      cellSize: Math.min(
        (document.body.offsetHeight - 80) / cols,
        (document.body.offsetWidth - 80) / rows,
        900 / cols,
        900 / rows
      ),
      delay,
    });
  }

  // Khởi tạo mê cung lần đầu với giá trị mặc định
  gameGenerate();

  const acceptButton = document.getElementById("maze-accept");

  function handleAccept() {
    const width = Number(document.getElementById("maze-width").value);
    const height = Number(document.getElementById("maze-height").value);
    const delay = Number(document.getElementById("maze-delay").value);

    gameGenerate(width, height, delay);
  }

  acceptButton.addEventListener("click", handleAccept);

  document
    .getElementById("maze-play")
    .addEventListener("click", gameGui.play.bind(gameGui));

  document
    .getElementById("maze-login-play-btn")
    .addEventListener("click", () => {
      gameGui.audio.enable();
      gameGui.audio.click.play();
      gameGui.audio.theme.play();
      setTimeout(() => {
        document.getElementById("maze-login").classList.add("hide");
        handleAccept();
      }, 500);
    });

  document
    .getElementById("maze-login-play-btn-without-sound")
    .addEventListener("click", () => {
      // Tắt âm thanh
      gameGui.audio = {
        theme: { pause: () => {}, play: () => {} },
        win: { play: () => {} },
        swimming: { play: () => {} },
        return: { play: () => {} },
        click: { play: () => {} },
        enable: () => {},
      };
      setTimeout(() => {
        document.getElementById("maze-login").classList.add("hide");
        handleAccept();
      }, 500);
    });

  function toggleModal() {
    document.querySelector(".modal").classList.toggle("show");
  }

  window.toggleModal = toggleModal;
});