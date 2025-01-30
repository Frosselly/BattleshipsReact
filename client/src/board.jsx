import { useEffect, useState } from 'react'
import './App.css'

function Board() {
  const [board, setBoard] = useState(Array.from(Array(10), () => Array.from(Array(10))))

  const [ships, setShips] = useState(new Map());


  useEffect(() => {
    placeShips();
  }, [])

    const Cell = ({state}) => {
        // if(state === 'miss')
        //     console.log( "curr state ", state )
        return(
            <div className={`${state} cell`} >
                
            </div>
        )
    }

    function placeShips(){
        const normal = [1,1,1,2,2,2,3,3,4,5];

        let boardC = Array.from(Array(10), () => Array.from(Array(10)))
        let shipsC = new Map();

        for (let index = 0; index < normal.length;) {
            let xR = Math.floor(Math.random() * 9)+1;
            let yR = Math.floor(Math.random() * 9)+1;
            
            let length = undefined;
            length = normal[index];
            
            let axis = Math.random() > 0.5 ? 'v' : 'h';

            if (checkValid(boardC, xR, yR, length, axis)){
                shipsC.set(shipsC.size, length)
                fillShip(boardC, xR, yR, length, axis, shipsC.size-1) 
                index++;
            }
        }

        setBoard(boardC)
        setShips(shipsC)

    }

    

    function checkValid(boardC, x, y, length, axis)
    {
      x--;
      y--;
      if (x < 0  || y < 0 || 10 <= y ||10 <= x ) return false;
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
            placed++;
            if(placed >= length) break;
          }
        }
        if(placed >= length) break;
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
                boardC[row][col] = ship;
              placed++;
              if(placed >= length) break;
            }
          }
          if(placed >= length) break;
        }
        return true;
    }

    function checkCell(row, col){
        let copy = structuredClone(board);
        const key = board[row][col];
        if(ships.has(key)){
            copy[row][col] = 'hit'

            let shipsUpdate = structuredClone(ships);
            shipsUpdate.set(key, ships.get(key) - 1)
            setShips(shipsUpdate)
        }
        else{
            copy[row][col] = 'miss'
        }
        console.log(ships)
        setBoard(copy)
    }

  return (
    <>
    <table>
    <tbody className='board'>
        {
            board.map((row, i) => (
                <tr key={`${i}`}>
                    {
                       row.map((col, j)=>(
                        <td key={`${i}+${j}`} value={col} onClick={() => checkCell(i, j)}>
                            <Cell state={col}></Cell>
                        </td>
                    )) 
                    }
                    
                </tr>
            ))
        }
    </tbody>
    </table>
    </>
  )
}

export default Board
