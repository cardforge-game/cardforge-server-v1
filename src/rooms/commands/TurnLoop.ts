import { Command } from "@colyseus/command";
import { StandardState, Card, Attack, Player } from "../schema/StandardSchema";
import { InitRoundCommand } from "./InitRound";

export class TurnLoopCommand extends Command<StandardState> {
  async execute(): Promise<InitRoundCommand|TurnLoopCommand> {
    console.log("new Turn!")
    const roundNumOfTurn = JSON.parse(JSON.stringify(this.state.currentTurn));
    this.state.currentTurn++;

    // Everyone went
    if ((this.state.playerIdOrder.length as number) === 0) {
      return new InitRoundCommand();
    }

    this.state.activePlayerID = this.state.playerIdOrder.splice(0, 1)[0];
    console.log(this.state.activePlayerID)
    const activePlayer = this.state.players.get(this.state.activePlayerID);

    // Active player does not have any cards
    if (activePlayer.deck.length === 0) {
      return new TurnLoopCommand();
    }

    await this.delay(20 * 1000);
    // AFK!
    if (
      this.state.currentRound === roundNumOfTurn &&
      this.state.activePlayerID === activePlayer.id &&
      this.state.phase === "FIGHTING"
    ) {
      return new TurnLoopCommand();

    }
  }
}
