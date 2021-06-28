import { Client } from "colyseus";
import { Command } from "@colyseus/command";
import { StandardState, Card, Player } from "../schema/StandardSchema";

interface IPayload {
  client: Client;
  buyingPlayer: Player;
  buyingCard: Card;
}

export class BuyCardCommand extends Command<StandardState, IPayload> {
  validate({ client, buyingPlayer, buyingCard }: IPayload) {
    if (!buyingCard) {
      client.send("error", "This card does not exist");
      return false;
    }
    if (this.state.phase != "BUYING") {
      client.send("error", "You cannot buy cards at this time.");
      return false;
    }
    if (buyingPlayer.id === buyingCard.ownerID) {
      client.send("error", "You cannot buy your own cards.");
      return false;
    }
    if (buyingPlayer.money < buyingCard.cardCost) {
      client.send("error", "You do not have enough money to buy this.");
      return false;
    }

    return true;
  }

  execute({ client, buyingPlayer, buyingCard }: IPayload) {

    if(buyingPlayer.deck.length < 7){
      buyingPlayer.deck.push(buyingCard.clone());
    }else{
      buyingPlayer.inventory.push(buyingCard.clone());
    }
    
    buyingPlayer.money -= buyingCard.cardCost;
    this.state.players.get(buyingCard.ownerID).profits += Math.round(
      buyingCard.cardCost / 2
    );
    this.state.players.get(buyingCard.ownerID).points++
  }
}
