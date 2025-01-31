const {Player} = require("./Player")

class Game{
    id = "#"
    turn = 'p1'

    p1 = new Player()
    p2 = new Player()

    constructor(){
        
    }

    checkWin(){
        if(this.p1.shipsAlive <= 0){
            return "p2"
        }
        if(this.p2.shipsAlive <= 0){
            return "p1"
        }
        return false;
    }

    nextTurn(){
        this.turn = this.turn === 'p2'? 'p1' : 'p2'
        
    }

}

module.exports = {Game}