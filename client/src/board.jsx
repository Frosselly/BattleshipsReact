import { useEffect, useState } from "react";
import "./App.css";
import BoardMethods from "./BoardMethods.js";

export default function Board({ owner, onShipPlace, onFire, board, ships}) {
  

  useEffect(() => {
    if (owner){ 
      console.log("PLACING")
      placeShips();
    }

  }, []);

  const Cell = ({ state }) => {
    

    let data = state;
    if (Array.isArray(data)){

      return <div 
      style={
        {backgroundColor : ships.get(data[0]).color}
      }
      className={`${data[0]} cell`}></div>;
    } 

    return <div className={`${data} cell`}></div>;
  };

  function placeShips() {
    let {boardC, shipsC} = BoardMethods.placeShips()

    onShipPlace(boardC, shipsC);
  }
  //TODO change to server side async Fire
  function checkCell(row, col) {
    if (owner) return;
    onFire(row, col, board);
  }

  return (
    <>
      <table>
        <tbody className="board">
          {board.map((row, i) => (
            <tr key={`${i}`}>
              {row.map((col, j) => (
                <td
                  key={`${i}+${j}`}
                  value={col}
                  onClick={() => checkCell(i, j)}
                >
                  <Cell state={col}></Cell>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}


// function fireCell(row, col) {}
