import { Room } from "colyseus";
import { Command } from "@colyseus/command";
import { StandardState, Player } from "../schema/StandardSchema";
import { StandardRoom } from "../StandardRoom";

export class DisplayResultsCommand extends Command<StandardState> {
  validate = () => true;
  execute = () => new StandardRoom().broadcast("The results are here!");
}
