// OnJoinCommand.ts
import { Command } from "@colyseus/command";
import {Client} from "colyseus";
import { StandardState,Player } from "../schema/StandardSchema";


interface IPayload {
  client: Client;
  name: string;
}

export class OnJoinCommand extends Command<StandardState, IPayload> {
  validate({client,name}: IPayload){
    const players = [...this.state.players.values()]

    if(players.some(p=>p.name === name)){
        client.send("error","That name is already in use!")
        return false
    }
    
    return true
  }

  execute({ client,name }: IPayload) {
    this.state.players.set(client.sessionId, new Player(
        {
            name,
            money:300,
            //Set as host if the first player
            host: (this.state.players.size === 1)
        }
    ))


  }

}