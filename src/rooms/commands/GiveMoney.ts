import { Command } from "@colyseus/command";
import { StandardState, Player } from "../schema/StandardSchema";

export class GiveMoneyCommand extends Command<StandardState> {
  validate = () => this.state.phase === "BUYING";
  execute = () => this.state.players.forEach((player) => (player.money += 75));
}
