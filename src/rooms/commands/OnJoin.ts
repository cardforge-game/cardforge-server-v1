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

	if ([...this.state.players.values()].some(p => p.name === name)) {
		client.send("error","That name is already in use!")
		return false
	}
	
	return true
  }

  execute({ client,name }: IPayload) {
	this.state.players.set(client.sessionId, new Player({
			name,
			money: 300,
			host: (this.state.players.size === 1 || this.state.players.size == 0)
		}
	))


  }

}