const {Game} = require("./Game")
const {Board} = require("./Board")


const express = require('express')
const cors = require('cors')

const PORT = 8000

const app = express();
app.use(express.json());
app.use(cors({
    credentials:true,
    origin:"http://localhost:5173"
}))

app.listen(PORT, () => {
    console.log(`Listening port ${PORT}`);
})



let games = new Map()
let game = new Game()


app.post("/test", (req, res) => {
    console.log("Test ok")
    res.json("ok")
})

app.post("/play", (req, res) => {
    console.log("GAME STARTED")

    const { board, ships } = req.body;
    game.p1.secretBoard = board
    game.p1.ships = new Map(ships)

    const board2 = Board.placeShips()
    game.p2.secretBoard = board2.boardC
    game.p2.ships = board2.shipsC

    res.json(game.p2.hitsBoard)

})

app.post("/fire", (req, res) => {
    const { row, col } = req.body;
    console.log("FIRED AT ", row, col)
    
    game.p2.receiveAttack(row, col)
    const won = game.checkWin()
    if(won)
        game = new Game()
    else
        game.nextTurn()
    console.log(game.p2.secretBoard)
    console.log(game.p2.ships)
    res.json({board:game.p2.hitsBoard, hasWon: won})
})


app.get("/receiveFire", (req, res) => {
    const { row, col } = req.body;
    console.log("FIRE RECEIVED AT ", row, col)
    console.log(game.p1.secretBoard)
    Board.randomMove(game.p1)
    const won = game.checkWin()
    if(won)
        game = new Game()
    else
        game.nextTurn()

    setTimeout(() => {
        res.json({board: game.p1.secretBoard, hasWon: won})
    }, 0)
    
})

app.get("/reset", (req, res) => {
    console.log("RESET CALLED")
    game = new Game()
})





