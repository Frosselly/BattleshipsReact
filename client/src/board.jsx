import { useEffect, useState } from "react";
import "./App.css";

export default function Board({ owner, onShipPlace, onFire, board, ships}) {
  const colors = [
    "oklch(0.924 0.12 95.746)",
    "oklch(0.945 0.129 101.54)",
    "oklch(0.91 0.096 180.426)",
    "oklch(0.882 0.059 254.128)",
    "oklch(0.87 0.065 274.039)",
    "oklch(0.903 0.076 319.62)"
  ]

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
    const normal = [1, 1, 1, 2, 2, 2, 3, 3, 4, 5];
    // const normal = [5];

    let boardC = Array.from(Array(10), () => Array.from(Array(10)));
    let shipsC = new Map();

    // let randomTries = 1000

    for (let index = 0; index < normal.length; ) {
      let xR = Math.floor(Math.random() * 10);
      let yR = Math.floor(Math.random() * 10);

      let length = undefined;
      length = normal[index];

      let axis = Math.random() > 0.5 ? "v" : "h";

      if (checkValid(boardC, xR, yR, length, axis)) {
        shipsC.set(shipsC.size, { len: length, hits: [], color:colors[Math.floor(Math.random() * 6)] });
        fillShip(boardC, xR, yR, length, axis, shipsC.size - 1);
        index++;
      }
      // randomTries--;
      if(index >= 4){
        let fullBoard = placeEmpty(boardC, index, normal, shipsC)
        boardC = fullBoard.boardC
        shipsC = fullBoard.shipsC
        break;
      }
    }
    if(shipsC.length < 10) placeShips()

    onShipPlace(boardC, shipsC);
  }

  function placeEmpty(boardC, index, normal, shipsC){

    for (let row = 0; row < 10; row++) {
      for (let col = 0; col < 10; col++) {
        let length = normal[index]

        if (checkValid(boardC, row, col, length, "v")) {
          index++
          shipsC.set(shipsC.size, { len: length, hits: [], color:colors[Math.floor(Math.random() * 6)] });
          fillShip(boardC, row, col, length, "v", shipsC.size - 1);
        }
        else if(checkValid(boardC, row, col, length, "h")){
          index++
          shipsC.set(shipsC.size, { len: length, hits: [], color:colors[Math.floor(Math.random() * 6)] });
          fillShip(boardC, row, col, length, "h", shipsC.size - 1);
        }

        if(index >= normal.length) break;
      }
      if(index >= normal.length) break;
    }

    return {boardC, shipsC}
  }
  

  function checkValid(boardC, x, y, length, axis) {
    x--;
    y--;
    if (x < 0 || y < 0 || 10 <= y || 10 <= x) return false;
    if (axis == "h" && 10 <= x + length) return false;
    if (axis == "v" && 10 <= y + length) return false;
    if (axis.length !== 1 || !axis.match(/[hv]/)) return false;

    let placed = 0;
    for (let row = 0; row < 10; row++) {
      for (let col = 0; col < 10; col++) {
        if (
          (axis == "h" && row === y && x <= col && col < x + length) ||
          (axis == "v" && col === x && y <= row && row < y + length)
        ) {
          if (boardC[row][col] !== undefined) return false;
          if(!checkAround(row, col, boardC)) return false
          placed++;
          if (placed >= length) break;
        }
      }
      if (placed >= length) break;
    }
    return true;
  }

  function checkAround(r,c,boardC){
    for (let row = r-1; row <= r+1; row++) {
      for (let col = c-1; col <= c+1; col++) {
        if(row < 0 || col < 0 || row > 9 || col > 9) continue;
        if (boardC[row][col] !== undefined) return false;
    }
  }
    return true;
  }

  function fillShip(boardC, x, y, length, axis, ship) {
    x--;
    y--;
    let placed = 0;
    for (let row = 0; row < 10; row++) {
      for (let col = 0; col < 10; col++) {
        if (
          (axis == "h" && row === y && x <= col && col < x + length) ||
          (axis == "v" && col === x && y <= row && row < y + length)
        ) {
          boardC[row][col] = [ship, "ship"];
          placed++;
          if (placed >= length) break;
        }
      }
      if (placed >= length) break;
    }
    return true;
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
