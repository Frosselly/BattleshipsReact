const {Player} = require("./Player")

class Game{
    id = "#"
    turn = 'p1'

    p1 = null
    p2 = null

    hasEnded = false
    winner = null;

    constructor(){
        this.id = crypto.randomUUID()
    }

    addPlayer(id, board, ships){
        if(!this.p1)
        {
            this.p1 = new Player(id, board, ships)
        }
        else{
            this.p2 = new Player(id, board, ships)
        }
        
    }

    checkWin(id){
        if(this.p1.shots <= 0 && id === this.p2.id){
            return true
        }
        if(this.p2.shots <= 0 && id === this.p2.id){
            return true
        }

        if(this.p1.shipsAlive <= 0 && id === this.p2.id){
            return true
        }
        if(this.p2.shipsAlive <= 0 && id === this.p1.id){
            return true
        }
        if(this.hasEnded && this.winner && id === this.winner.id){
            
            return true
        }
        

        return false;
    }

    nextTurn(){
        this.turn = this.turn === 'p2'? 'p1' : 'p2'
    }

    handleAttack(row, col){
        if(this.turn === 'p1'){
            this.p2.receiveAttack(row, col)
            this.p1.shots--;
        }
        else{
            this.p1.receiveAttack(row, col)
            this.p2.shots--;
        }

    }

    getCurrPlayer(){
        if(this.turn === 'p1'){
            return this.p1
        }
        else{
            return this.p2
        }
    }

}

module.exports = {Game}