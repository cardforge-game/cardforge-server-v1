import { Client } from "colyseus";
import { buildCard, validateCard } from "../../ml/cardBuilder";
import { Command } from "@colyseus/command";
import {
  StandardState,
  Player,
  ClientCardMessage,
} from "../schema/StandardSchema";

interface IPayload {
  client: Client;
  cardInput: ClientCardMessage;
}

export class CreateCardCommand extends Command<StandardState, IPayload> {
  execute({ client, cardInput }: IPayload) {
    const newCard = buildCard(cardInput, client.sessionId);
    //Ensure that the card is valid
    if (validateCard(newCard)) {
      //Add card to the library
      this.state.cardLibrary.push(newCard);
      client.send("cardAccepted", newCard);
    } else {
      client.send(
        "error",
        "Our AI couldn't read the attacks on your card! Check the rules if you need help!"
      );
    }
  }
}

export class PreviewCardCommand extends Command<StandardState, IPayload> {
  execute({ client, cardInput }: IPayload) {
    const newCard = buildCard(cardInput, client.sessionId);
    //Ensure that the card is valid
    if (validateCard(newCard)) {
      //Send preview to player
      client.send("previewCard", newCard);
    } else {
      client.send(
        "error",
        "Our AI couldn't read the attacks on your card! Check the rules if you need help!"
      );
    }
  }
}
