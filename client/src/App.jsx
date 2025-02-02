import { useState, useEffect } from "react";
import Board from "./board";
import "./App.css";
import BoardMethods from "./BoardMethods.js";

function App() {
  const [text, setText] = useState("Press PLAY");
  const [canFire, setCanFire] = useState(false)
  const [gameId, setGameId] = useState(null);
  const [id, setId] = useState(null);
  
  useEffect(() => {
    if(gameId)
      connectGame()
  }, [gameId])

  useEffect(() => {
    if(!id)
      setId(crypto.randomUUID());
  }, [id])


  const [boardOne, setBoardOne] = useState(
    Array.from(Array(10), () => Array.from(Array(10)))
  );
  const [ships, setShips] = useState(new Map());


  const [boardTwo, setBoardTwo] = useState(
    Array.from(Array(10), () => Array.from(Array(10)))
  );

  async function play() {
    await reset()
    
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
    let res = await fetch(`http://localhost:8000/game/${id}`)
    console.log("CONNECTING")
    
   
    if(res.ok){
      let data = await res.json()
      console.log(data)
      console.log("FOUND")
      if(data.turn){
        setText("Your turn")
        console.log("Your turn")
        setCanFire(true)
      }
      else{
        setCanFire(false)
        setText("Enemy turn")
        receiveFire()
        console.log("Enemy turn")
      }
      
    }
    else{
      setTimeout(() => {
        connectGame()
      }, 1000)
    }
  }

  function fire(r, c, b) {
    if(!canFire) return;
    if(b[r][c]) return

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
        if(data.hasEnded)
          announceWinner(data.hasWon)
        else{
          setText("Enemy turn")
          setCanFire(false)
          receiveFire();
        }
      });
  }

  async function receiveFire(){
    
    let res = await fetch(`http://localhost:8000/receiveFire/${id}`)
    console.log("WAITING")

    if(res.ok){
      let data = await res.json()
      
      if(data.hasEnded)
        announceWinner(data.hasWon)
      else
      {
        setBoardOne(data.board);
        setText("Your turn")
        setCanFire(true)
      } 
    }
    else{
      setTimeout(() => {
        receiveFire()
      }, 1000)
    }

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
    await fetch(`http://localhost:8000/reset/${id}`)

    setBoardTwo(Array.from(Array(10), () => Array.from(Array(10))))
    setGameId(null)
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
          <input type="checkbox" name="" id="" />
        </label>
        
      </div>
    </>
  );
}

export default App;
