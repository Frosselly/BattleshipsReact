function placeShips() {
    const normal = [1, 1, 1, 2, 2, 2, 3, 3, 4, 5];

    let boardC = Array.from(Array(10), () => Array.from(Array(10)));

    let pV = Array.from(Array(10), () => Array.from(Array(10)));
    let pVLen = 0
    let pH = Array.from(Array(10), () => Array.from(Array(10)));
    let pHLen = 0

    let shipsC = new Map();
    let limit = 10000;
    let xR = Math.floor(Math.random() * 10);
    let yR = Math.floor(Math.random() * 10);
    

    for (let index = 0; index < normal.length; ) {
      let axis = Math.random() > 0.5 ? "v" : "h";
      if(axis === "h" && pHLen >= 100) axis = "v"
      if(axis === "v" && pVLen >= 100) axis = "h"

      if(axis === "v")
      {
        while(pV[xR][yR] && pVLen <= 100){
          xR = Math.floor(Math.random() * 10);
          yR = Math.floor(Math.random() * 10);
          console.log("X Y", xR, yR);
          limit--;
          if(limit <= 0){
            console.log("BREAK V")
            console.log("INDEX: ", index)
            console.log("Ships:", shipsC)
            console.log("V:", pV)
            console.log("H:", pH)
            break;
          }
        }
      }
      else{
        while(pH[xR][yR] && pHLen <= 100){
          xR = Math.floor(Math.random() * 10);
          yR = Math.floor(Math.random() * 10);
          console.log("X Y", xR, yR);
          limit--;
          if(limit <= 0){
            console.log("BREAK H")
            console.log("INDEX: ", index)
            console.log("Ships:", shipsC)
            console.log("V:", pV)
            console.log("H:", pH)
            break;
          }
        }
      }
      limit--;
      
      if(limit <= 0){
        console.log("BREAK H")
            console.log("INDEX: ", index)
            console.log("Ships:", shipsC)
            console.log("V:", pV)
            console.log("H:", pH)
        break;
      }
      
      
      let length = undefined;
      length = normal[index];

      

      if (checkValid(boardC, xR, yR, length, axis)) {
        shipsC.set(shipsC.size, { len: length, hits: [], color:colors[Math.floor(Math.random() * 6)] });
        fillShip(boardC, xR, yR, length, axis, shipsC.size - 1);
        index++;
      }
      else{
        if(axis === "v"){
          for(let x = xR-1; x <= xR + length; x++){
            for(let y = yR-1; y <= yR + 1; y++){
              if (x < 0 || y < 0 || 10 <= y || 10 <= x) continue;
              pV[x][y] = 1;
              pVLen++
            }
          }
        }
        if(axis === "h"){
          for(let x = xR-1; x <= xR +1; x++){
            for(let y = yR-1; y <= yR + length; y++){
              if (x < 0 || y < 0 || 10 <= y || 10 <= x) continue;
              pH[x][y] = 1;
              pHLen++
            }
          }
        }
      }
      
    }
    onShipPlace(boardC, shipsC);
    // setBoard(boardC)
    // setShips(shipsC);
  }