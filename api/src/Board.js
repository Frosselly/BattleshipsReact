 class Board{
    static randomMove(p){

        let xR = Math.floor(Math.random() * 10);
        let yR = Math.floor(Math.random() * 10);
    
        while(!p.receiveAttack(xR, yR))
        {
            xR = Math.floor(Math.random() * 10);
            yR = Math.floor(Math.random() * 10);
        }
        console.log("FIRE RECEIVED AT ", xR, yR)
    
        //currPlayer = currPlayer === p1.name ? p2.name : p1.name;
    }
    
    
    static placeShips() {
        // const normal = [1, 1, 1, 2, 2, 2, 3, 3, 4, 5];
        const normal = [5];
    
        let boardC = Array.from(Array(10), () => Array.from(Array(10)));
        let shipsC = new Map();
    
        for (let index = 0; index < normal.length; ) {
          let xR = Math.floor(Math.random() * 9) + 1;
          let yR = Math.floor(Math.random() * 9) + 1;
    
          let length = undefined;
          length = normal[index];
    
          let axis = Math.random() > 0.5 ? "v" : "h";
    
          if (this.checkValid(boardC, xR, yR, length, axis)) {
            shipsC.set(shipsC.size +1, { len: length, hits: [] });
            this.fillShip(boardC, xR, yR, length, axis, shipsC.size);
            index++;
          }
        }
        return {boardC, shipsC}
      }
    
      static checkValid(boardC, x, y, length, axis) {
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
              placed++;
              if (placed >= length) break;
            }
          }
          if (placed >= length) break;
        }
        return true;
      }
    
      static fillShip(boardC, x, y, length, axis, ship) {
        x--;
        y--;
        let placed = 0;
        for (let row = 0; row < 10; row++) {
          for (let col = 0; col < 10; col++) {
            if (
              (axis == "h" && row === y && x <= col && col < x + length) ||
              (axis == "v" && col === x && y <= row && row < y + length)
            ) {
              boardC[row][col] = [ship, 'ship'];
              placed++;
              if (placed >= length) break;
            }
          }
          if (placed >= length) break;
        }
        return true;
      }
}

module.exports = {Board}