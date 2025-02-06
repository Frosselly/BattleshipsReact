import { useState, useEffect } from "react";
import Board from "./board";
import "./App.css";
import BoardMethods from "./BoardMethods.js";

import {io} from "socket.io-client"

const socket = io("http://localhost:8000")



function App() {
  const [text, setText] = useState("Press PLAY");
  const [canFire, setCanFire] = useState(false)
  const [useComputer, setUseComputer] = useState(false);
  
  

  useEffect(() => {
    socket.on("found", ({turn}) => {
      setText(turn ? "Your turn" : "Enemy turn");
      setCanFire(turn);
    });
  
    socket.on("handleMove", (data) => {
      if(data.hasEnded) {
        announceWinner(data.hasWon);
        return;
      }
  
      if(data.isAttacker) {
        setBoardTwo(data.board);
        setText("Enemy turn");
        setCanFire(false);
      } else {
        setBoardOne(data.board);
        setText("Your turn");
        setCanFire(true);
      }
    });

    socket.on("end", ({winner}) => {
      setText(winner ? "YOU WON!!!" : "YOU LOST...");
      setCanFire(false);
    });
  }, []);


  const [boardOne, setBoardOne] = useState(
    Array.from(Array(10), () => Array.from(Array(10)))
  );
  const [ships, setShips] = useState(new Map());


  const [boardTwo, setBoardTwo] = useState(
    Array.from(Array(10), () => Array.from(Array(10)))
  );

  async function play() {
    await reset()
    
    let data = { board: boardOne, ships: Array.from(ships), computer:useComputer};
    console.log("PLAY", data)

    socket.emit("searchGame", data)
    setText("CONNECTING")

  }

  function fire(r, c, b) {
    if(!canFire || b[r][c]) return;
    socket.emit("handleMove", { row: r, col: c });
  }


  function announceWinner(winner) {
    if(!winner){
      setText(`YOU LOST...`)
    }else{
      setText(`YOU WON!!!`)
    }
    
    setCanFire(false)
  }

  function updateBoard(board, ships) {
    
    setBoardOne(board);
    setShips(ships)
    
  }

  async function reset() {
    socket.emit("reset")

    setBoardTwo(Array.from(Array(10), () => Array.from(Array(10))))
    let {boardC, shipsC} = BoardMethods.placeShips()
    updateBoard(boardC, shipsC);

    setText("Press PLAY");
    return;
  }

  return (
    <>
    <div>{text}</div>
      <div className="game">
        <Board owner={true} board={boardOne} onShipPlace={updateBoard} ships={ships}></Board>
        <Board owner={false} board={boardTwo} onFire={fire}></Board>
      </div>
      <div className="controls">
        <button onClick={play}>PLAY</button>
        <button onClick={reset}>RESET</button>
        <label htmlFor="">
          Computer
          <input type="checkbox" name="" id="" onChange={(e) => setUseComputer(e.target.value)}/>
        </label>
        
      </div>
    </>
  );
}

export default App;
