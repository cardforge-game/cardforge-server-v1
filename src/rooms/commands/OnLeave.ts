// OnJoinCommand.ts
import { Command } from "@colyseus/command";
import { StandardState, Player } from "../schema/StandardSchema";


interface IPayload {
  sessionId: string;
}

export class OnLeaveCommand extends Command<StandardState, IPayload> {

  execute({ sessionId }: IPayload) {
    const leftPlayer =  this.state.players.get(sessionId)
    this.state.players.delete(sessionId)

    //Reassign if they were host
    if (leftPlayer.host) {

        //Assign first player as host
        const firstKey = this.state.players.keys().next().value()

        if (firstKey){
            this.state.players.get(firstKey).host = true
        }
        
    }
  }

}