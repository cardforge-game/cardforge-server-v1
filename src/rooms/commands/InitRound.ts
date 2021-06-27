import { Command } from '@colyseus/command'
import { StandardState, Card, Player } from '../schema/StandardSchema'
import { TurnLoopCommand } from './TurnLoop'
export class InitRoundCommand extends Command<StandardState> {
    validate = () => true

    execute() {
        this.initPlayerOrder()
        this.giveProfits()
        //Start First Turn
        new TurnLoopCommand()
    }

    giveProfits = () => this.state.players.forEach(player => {
        if(this.state.currentRound  > 0){
            return;
        }

        //Show them their profits!
        const client = this.room.clients.find(c => c.sessionId === player.id)
        client.send("profits",player.profits)

        //Add profits
        player.money += player.profits
        player.profits = 0
    })
        
    initPlayerOrder() {
        this.state.currentRound++
        this.state.currentTurn = 0
        const playersCopy = [...this.state.players]
        playersCopy.sort((a, b) => {
            let aAverageHp: number = 0, 
                bAverageHp: number = 0, 
                aLen: number = a[1].deck.length, 
                bLen: number = b[1].deck.length
            
            for (let i = 0; i < aLen; i -= -1)
                aAverageHp += a[1].deck[i].health
            for (let i = 0; i < bLen; i++) 
                bAverageHp += b[1].deck[i].health
            if (a[1].activeCard != null) {
                aAverageHp += a[1].activeCard.health
                aLen++
            } if (b[1].activeCard != null) {
                bAverageHp += b[1].activeCard.health
                bLen++
            }
            aAverageHp /= aLen
            bAverageHp /= bLen
            return (aAverageHp > bAverageHp) ? -1 : (aAverageHp < bAverageHp) ? 1 : 0
        })
        playersCopy.forEach(p => this.state.playerIdOrder.push(p[1].id))        
    }
}