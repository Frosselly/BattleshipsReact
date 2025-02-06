const { Game } = require("./Game");
const { Board } = require("./Board");

const express = require("express");
const cors = require("cors");

const {createServer} = require("node:http");
const {Server} = require("socket.io");


const PORT = 8000;

const app = express();
app.use(express.json());
app.use(
  cors({
    credentials: true,
    origin: "http://localhost:5173",
  })
);
const server = createServer(app)
const io = new Server(server)

app.listen(PORT, () => {
  console.log(`Listening port ${PORT}`);
});

let games = new Map();
let gamesUsers = new Map(); // userId : gameId
var queue = []; //store games with one player

// let game = new Game();

let count = 0;

io.on("connection", (socket) => {
  const userId = socket.id

  socket.on("searchGame", (board, ships, id, computer) => {
    if (queue.length <= 0) {
      let game = new Game();
      game.addPlayer(userId, board, new Map(ships));
      games.set(game.id, game);
      if (gamesUsers.has(userId)) {
        endPreviousGame(userId)
      }
      gamesUsers.set(userId, game.id);
      queue.push(game.id);
    }
    else if(queue.at(-1) !== gamesUsers.get(userId)){
      let game = games.get(queue.pop());
      if (gamesUsers.has(userId)) {
        endPreviousGame(userId)
      }
      gamesUsers.set(userId, game.id);
  
      game.addPlayer(userId, board, new Map(ships));
      games.set(game.id, game);
    }

    let game = games.get(gamesUsers.get(userId))
    if (game.p2) {
      if (userId === game.getCurrPlayer().id) {
        socket.emit("found", { turn: true });
      }
      else {
        socket.emit("found", { turn: false });
      }
      console.log("MATCH FOUND");
    }

  })

  socket.on("handleMove", (row, col, id ) => {
    let game = games.get(gamesUsers.get(id))

    game.handleAttack(row, col);
    console.log("P1",game.p1.shots)
    const won = game.checkWin(id);
    if (won) game.hasEnded = true;
    game.nextTurn();
    games.set(game.id, game);
    let hitsBoard = game.getCurrPlayer().hitsBoard;
    
    socket.emit("handleMove", { board: hitsBoard, hasWon: won, hasEnded: game.hasEnded });
    if(won){
      socket.emit("end", "IDK who won")
    }
  })

  
})

function endPreviousGame(id) {
  if(!gamesUsers.has(id) || !games.has(gamesUsers.get(id))) return;
  let gameId = gamesUsers.get(id)
  let endGame = games.get(gameId);
      endGame.hasEnded = true;
      endGame.winner = endGame.p1.id === id ? endGame.p2 : endGame.p1;
      endGame.checkWin(id)
      games.set(gameId, endGame);
}


app.get("/reset/:id", (req, res) => {
  // console.log("RESET CALLED");
  endPreviousGame(req.params.id)
  res.json("ok")
});
