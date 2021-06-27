// Should we delete this
import { Command } from "@colyseus/command";
import { StandardState, Player } from "../schema/StandardSchema";

export class NextPhaseCommand extends Command<StandardState> {
  execute() {
    // "WAITING"|"CREATING"|"BUYING"|"FIGHTING"
    this.state.phase =
      this.state.phase === "WAITING"
        ? "CREATING"
        : this.state.phase === "CREATING"
        ? "BUYING"
        : "FIGHTING";
  }
}
