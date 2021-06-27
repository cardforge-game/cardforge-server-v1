import { Command } from '@colyseus/command'
import { StandardState, Card, Attack, Player } from '../schema/StandardSchema'
import {InitRoundCommand} from "./InitRound"

export class TurnLoopCommand extends Command<StandardState> {
    async execute() {
      const roundNumOfTurn = JSON.parse(JSON.stringify(this.state.currentTurn))
      if((this.state.playerIdOrder.length as number) === 0){
            return new InitRoundCommand()
      }
      this.state.activePlayerID = this.state.playerIdOrder.splice(0,1)[0]
      const activePlayer = this.state.players.get(this.state.activePlayerID)
      
      await this.delay(20 * 1000);

      if(this.state.currentTurn === this.state.currentTurn && this.state.activePlayerID === activePlayer.id && this.state.phase === "FIGHTING"){
        new TurnLoopCommand()
        return
      }
    }
}