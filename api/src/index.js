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
let game = new Game();

let count = 0;
app.post("/connect", (req, res) => {
  console.log(req.id);
  console.log("USER ", count++);
  res.json("ok");
});

app.post("/play", (req, res) => {
  console.log("GAME CREATED");

  const { board, ships, id, computer } = req.body;
  game.addPlayer(id, board, new Map(ships));

  // console.log(game)
  if (computer) {
    const board2 = Board.placeShips();
    game.addPlayer(board2.boardC, board2.shipsC);
  }

  res.json(game.id);
});

app.get("/game/:id", (req, res) => {
  // console.log(req.params.gameId)
  
  if (!game.p2) {
    res.sendStatus(404);
  } else {
    if(req.params.id === game.getCurrPlayer().id){
      res.json({turn:true});
    }
    else{
      res.json({turn:false});
    }
    console.log("MATCH FOUND");
    
  }
});

app.post("/fire", (req, res) => {
  const { row, col, id } = req.body;


  console.log("sent ID ", id);
  console.log("ID ", game.getCurrPlayer().id);
  if (id !== game.getCurrPlayer().id){
    res.status(404);
    return;
 }

  console.log("FIRED AT ", row, col);

  game.handleAttack(row, col);
  const won = game.checkWin();
  if (won) game.hasEnded = true;
  game.nextTurn();
  let hitsBoard = game.getCurrPlayer().hitsBoard;
  res.json({ board: hitsBoard, hasWon: won, hasEnded: game.hasEnded});
  
});

app.get("/receiveFire/:id", (req, res) => {
//   const { row, col, id } = req.body;
  if (req.params.id !== game.getCurrPlayer().id){
     res.sendStatus(404);
     return;
  }

  console.log("FIRE RECEIVED");

  // Board.randomMove(game.p1)
  const won = game.checkWin();

  let secretBoard = game.getCurrPlayer().secretBoard;
//   setTimeout(() => {
//     res.json({ board: secretBoard, hasWon: won });
//   }, 0);

  res.json({ board: secretBoard, hasWon: won, hasEnded: game.hasEnded });
  //TODO delete game
});

app.get("/reset", (req, res) => {
  console.log("RESET CALLED");
  game = new Game();
});
