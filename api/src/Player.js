
class Player{
    secretBoard = Array.from(Array(10), () => Array.from(Array(10)));
    hitsBoard = Array.from(Array(10), () => Array.from(Array(10)));
    ships = new Map()
    shipsAlive = 10

    constructor(board, ships = null){
        this.board = board
        this.ships = ships
    }

    receiveAttack(row, col) {
        let key = this.secretBoard[row][col];
        key = Array.isArray(key) ? key[0] : key;
        if (this.ships.has(key)) {
            this.hitsBoard[row][col] = "hit";
    
          let shipData = this.ships.get(key);
          shipData.hits.push([row, col]);
          this.ships.set(key, shipData);
    
          if (shipData.hits.length >= shipData.len) {
            this.destroyShip(this.hitsBoard, shipData.hits);
          }
        } else if(this.hitsBoard[row][col] === undefined){
            this.hitsBoard[row][col] = "miss";
        }
        else{
            return false;
        }
        this.secretBoard = this.mergeBoards(this.secretBoard, this.hitsBoard)
        return true
      }

      destroyShip(boardC, hits) {
        for (let [row, col] of hits) {
          boardC[row][col] = "destroyed";
        }
        this.shipsAlive--;
      }

      mergeBoards(b1, b2){
        for (let row = 0; row < 10; row++) {
            for (let col = 0; col < 10; col++){
                if(b2[row][col])
                    b1[row][col] = b2[row][col]
            }
        }
        return b1;
      }

}

module.exports = {Player}