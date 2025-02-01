import { useState, useEffect } from "react";
import Board from "./board";
import "./App.css";

function App() {
  const [text, setText] = useState("Press PLAY");

  useEffect(() => {
    
  }, [])


  const [boardOne, setBoardOne] = useState(
    Array.from(Array(10), () => Array.from(Array(10)))
  );
  const [ships, setShips] = useState(new Map());


  const [boardTwo, setBoardTwo] = useState(
    Array.from(Array(10), () => Array.from(Array(10)))
  );

  async function play() {

    
    let data = { board: boardOne, ships: Array.from(ships)};

    let res = await fetch("http://localhost:8000/play", {
      method: "POST",
      headers: {
        'Content-Type': 'application/json', // Set the content type
    },
      body: JSON.stringify(data),
    })
    if(res.ok){
      setText("Your turn")
      //TODO update to show found player 2
    }

  }

  function fire(r, c, b) {
    console.log(b);
    let data = { row: r, col: c };
    console.log(data)

    fetch("http://localhost:8000/fire", {
      method: "POST",
      headers: {
        'Content-Type': 'application/json', // Set the content type
    },
      body: JSON.stringify(data),
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => {
        console.log(data)
        setBoardTwo(data.board);
        if(data.hasWon)
          announceWinner(data.hasWon)
        else
          receiveFire();
      });
  }

  function receiveFire(){
    setText("Enemy turn")
    fetch("http://localhost:8000/receiveFire").then((response) => response.json())
    .then((data) => {
      setBoardOne(data.board);
      if(data.hasWon)
        announceWinner(data.hasWon)
      else
        setText("Your turn")
    })

  }

  function announceWinner(winner) {
    
    setText(`${winner} WON!!!`)
    
  }

  function updateBoard(board, ships) {
    
    setBoardOne(board);
    setShips(ships)
    
  }

  function reset() {
    fetch("http://localhost:8000/reset")
    setBoardTwo(Array.from(Array(10), () => Array.from(Array(10))))
    // setBoardOne(Array.from(Array(10), () => Array.from(Array(10))))
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
          <input type="checkbox" name="" id="" />
        </label>
        
      </div>
    </>
  );
}

export default App;
