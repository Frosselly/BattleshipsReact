const { Game } = require("./Game");
const { Board } = require("./Board");

const express = require("express");
const cors = require("cors");

const { createServer } = require("node:http");
const { Server } = require("socket.io");

const PORT = 8000;

const app = express();
app.use(
  cors({
    credentials: true,
    origin: "http://localhost:5173",
  })
);
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    credentials: true,
  },
});

server.listen(PORT, () => {
  console.log(`Listening port ${PORT}`);
});

let games = new Map();
let gamesUsers = new Map(); // userId : gameId
var queue = []; //store games with one player

// let game = new Game();

let count = 0;

io.on("connection", (socket) => {
  const userId = socket.id;
  console.log("connection");
  socket.on("searchGame", ({ board, ships, computer }) => {
    if (gamesUsers.has(userId)) {
      endPreviousGame(userId);
    }

    if (queue.length === 0) {
      let game = new Game();
      game.addPlayer(userId, board, new Map(ships));
      games.set(game.id, game);
      gamesUsers.set(userId, game.id);
      queue.push(game.id);
    } else {
      let gameId = queue.pop();
      let game = games.get(gameId);
      game.addPlayer(userId, board, new Map(ships));
      games.set(game.id, game);
      gamesUsers.set(userId, game.id);

      // Notify both players about the game start and turn
      let players = [game.p1.id, game.p2.id];
      players.forEach((playerId, index) => {
        console.log("found", playerId);
        console.log("turn", playerId === game.getCurrPlayer().id);
        io.to(playerId).emit("found", {
          turn: playerId === game.getCurrPlayer().id,
        });
      });
      console.log("Game matched");
    }
  });

  socket.on("handleMove", ({ row, col }) => {
    let game = games.get(gamesUsers.get(userId));
    if (!game || game.hasEnded) return;

    game.handleAttack(row, col);
    const won = game.checkWin(userId);
    if (won) game.hasEnded = true;

    let currPlayer = game.getCurrPlayer();
    let otherPlayer = currPlayer.id === game.p1.id ? game.p2 : game.p1;

    game.nextTurn();
    games.set(game.id, game);

    io.to(currPlayer.id).emit("handleMove", {
      board: otherPlayer.hitsBoard,
      isAttacker: true,
      hasWon: won,
      hasEnded: game.hasEnded,
    });

    io.to(otherPlayer.id).emit("handleMove", {
      board: otherPlayer.secretBoard,
      isAttacker: false,
      hasWon: !won,
      hasEnded: game.hasEnded,
    });

    if (won) {
      io.to(currPlayer.id).emit("end", { winner: true });
      io.to(otherPlayer.id).emit("end", { winner: false });
    }
  });

  socket.on("reset", () => {
    endPreviousGame(userId);
  });

  socket.on("disconnect", () => {
    endPreviousGame(userId);
  });
});

function endPreviousGame(id) {
  if (!gamesUsers.has(id) || !games.has(gamesUsers.get(id))) return;
  let gameId = gamesUsers.get(id);
  let endGame = games.get(gameId);

  endGame.hasEnded = true;
  endGame.winner = endGame.p1.id === id ? endGame.p2 : endGame.p1;
  let otherPlayerId = endGame.p1.id === id ? endGame.p2.id : endGame.p1.id;
  io.to(otherPlayerId).emit("end", { winner: true });

  gamesUsers.delete(id);
  games.delete(gameId);
}
