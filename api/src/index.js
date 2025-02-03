const { Game } = require("./Game");
const { Board } = require("./Board");

const express = require("express");
const cors = require("cors");

const PORT = 8000;

const app = express();
app.use(express.json());
app.use(
  cors({
    credentials: true,
    origin: "http://localhost:5173",
  })
);

app.listen(PORT, () => {
  console.log(`Listening port ${PORT}`);
});

let games = new Map();
let gamesUsers = new Map(); // userId : gameId
var queue = []; //store games with one player

// let game = new Game();

let count = 0;
app.post("/connect", (req, res) => {
  // console.log(req.id);
  // console.log("USER ", count++);
  res.json("ok");
});

function endPreviousGame(id) {
  if(!gamesUsers.has(id) || !games.has(gamesUsers.get(id))) return;
  let gameId = gamesUsers.get(id)
  let endGame = games.get(gameId);
      endGame.hasEnded = true;
      endGame.winner = endGame.p1.id === id ? endGame.p2 : endGame.p1;
      endGame.checkWin(id)
      games.set(gameId, endGame);
}

app.post("/play", (req, res) => {
  // console.log("GAME CREATED");
  const { board, ships, id, computer } = req.body;

  if (computer) {
    let game = new Game();
    game.addPlayer(id, board, new Map(ships));
    games.set(game.id, game);
    if (gamesUsers.has(id)) {
      endPreviousGame(id)
    }
    gamesUsers.set(id, game.id);
    const board2 = Board.placeShips();
    game.addPlayer(null, board2.boardC, board2.shipsC);
    game.computer = true;
    games.set(game.id, game);

    res.json(gamesUsers.get(id));
    return;
  } 

  if (queue.length <= 0) {
    let game = new Game();
    game.addPlayer(id, board, new Map(ships));
    games.set(game.id, game);
    if (gamesUsers.has(id)) {
      endPreviousGame(id)
    }
    gamesUsers.set(id, game.id);
    queue.push(game.id);
  }else if(queue.at(-1) !== gamesUsers.get(id)){
    let game = games.get(queue.pop());
    if (gamesUsers.has(id)) {
      endPreviousGame(id)
    }
    gamesUsers.set(id, game.id);

    game.addPlayer(id, board, new Map(ships));
    games.set(game.id, game);
  }
  

  res.json(gamesUsers.get(id));
});

app.get("/game/:id", (req, res) => {
  
  
  let id = req.params.id
  if (!gamesUsers.has(id) || !games.has(gamesUsers.get(id))) {
    res.sendStatus(404);
    return;
  }
  let game = games.get(gamesUsers.get(id))
  if (!game.p2) {
    res.sendStatus(404);
  } else {
    if (id === game.getCurrPlayer().id) {
      res.json({ turn: true });
    } else {
      res.json({ turn: false });
    }
    // console.log("MATCH FOUND");
  }
});

app.post("/fire", (req, res) => {
  
  const { row, col, id } = req.body;

  let game = games.get(gamesUsers.get(id))
  if (id !== game.getCurrPlayer().id) {
    res.status(404);
    return;
  }

  // // console.log("FIRED AT ", row, col);
  game.handleAttack(row, col);
  console.log("P1",game.p1.shots)
  const won = game.checkWin(id);
  if (won) game.hasEnded = true;
  game.nextTurn();
  let hitsBoard = game.getCurrPlayer().hitsBoard;
  games.set(game.id, game);
  res.json({ board: hitsBoard, hasWon: won, hasEnded: game.hasEnded });
});

app.get("/receiveFire/:id", (req, res) => {
  
  let id = req.params.id

  if (!gamesUsers.has(id) || !games.has(gamesUsers.get(id))) {
    res.sendStatus(404);
    return;
  }
  let game = games.get(gamesUsers.get(id))
  if (game.hasEnded) {
    const won = game.checkWin(id);
    res.json({ hasWon: won, hasEnded: true });
    return;
  }

  if(game.computer && game.getCurrPlayer().id === null){
    Board.randomMove(game.p1)
    game.p2.shots--;
    
   

    const won = game.checkWin(null);
    if (won) game.hasEnded = true;
    game.nextTurn();
    
    let secretBoard = game.getCurrPlayer().secretBoard;
    games.set(game.id, game);
    res.json({ board: secretBoard, hasWon: !won, hasEnded: game.hasEnded });
    return;
  }

  if (id !== game.getCurrPlayer().id) {
    res.sendStatus(404);
    return;
  }
  

  console.log("FIRE RECEIVED");
  
  // Board.randomMove(game.p1)

  const won = game.checkWin(id);
  // if (won) game.hasEnded = true;
  let secretBoard = game.getCurrPlayer().secretBoard;
  //   setTimeout(() => {
  //     res.json({ board: secretBoard, hasWon: won });
  //   }, 0);

  res.json({ board: secretBoard, hasWon: won, hasEnded: game.hasEnded });
});

app.get("/reset/:id", (req, res) => {
  // console.log("RESET CALLED");
  endPreviousGame(req.params.id)
  res.json("ok")
});
