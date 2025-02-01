import { useState, useEffect } from "react";
import Board from "./board";
import "./App.css";

function App() {
  const [text, setText] = useState("Press PLAY");
  const [gameId, setGameId] = useState(null);
  const id = crypto.randomUUID();
  
  useEffect(() => {
    if(gameId)
      connectGame()
  }, [gameId])


  const [boardOne, setBoardOne] = useState(
    Array.from(Array(10), () => Array.from(Array(10)))
  );
  const [ships, setShips] = useState(new Map());


  const [boardTwo, setBoardTwo] = useState(
    Array.from(Array(10), () => Array.from(Array(10)))
  );

  async function play() {

    
    let data = { board: boardOne, ships: Array.from(ships), id, computer:false};

    fetch("http://localhost:8000/play", {
      method: "POST",
      headers: {
        'Content-Type': 'application/json', // Set the content type
    },
      body: JSON.stringify(data),
    }).then((res) => res.json())
    .then((data) => {
      setGameId(data)
      setText("CONNECTING")
      
    })

  }

  async function connectGame(){
    // console.log(gameId)
    let res = await fetch(`http://localhost:8000/game/${gameId}`)
    console.log("CONNECTING")

    if(res.ok){
      setText("Your turn")
      console.log("FOUND")
    }
    else{
      setTimeout(() => {
        connectGame()
      }, 1000)
    }
  }

  function fire(r, c, b) {
    console.log(b);
    let data = { row: r, col: c , id};
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

  async function receiveFire(){
    setText("Enemy turn")
    let res = await fetch(`http://localhost:8000/receiveFire/${id}`)
    // .then((response) => response.json())

    if(res.ok){
      let data = res.json()
      setBoardOne(data.board);
      if(data.hasWon)
        announceWinner(data.hasWon)
      else
        setText("Your turn")
    }
    else{
      setTimeout(() => {
        receiveFire()
      }, 1000)
    }

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
