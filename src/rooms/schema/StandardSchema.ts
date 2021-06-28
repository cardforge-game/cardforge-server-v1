import { Client } from "colyseus";
import {
  Schema,
  Context,
  MapSchema,
  ArraySchema,
  type,
  filter,
} from "@colyseus/schema";

export class Attack extends Schema {
  @type("string") name: string;
  @type("number") damage: number;
  @type("number") heal: number;
  @type("string") desc: string;
}

export class Card extends Schema {
  @type("string") id: string;
  @type("string") name: string;
  @type("number") health: number;
  @type("number") cardCost: number;
  @type("string") imgURL: string;
  @type("number") maxHealth: number;
  @type([Attack]) attacks = new ArraySchema<Attack>();
  ownerID: string;
}

export class Player extends Schema {
  points = 0;
  @type("string") name: string;
  @type("boolean") host: boolean;
  @type(Card) activeCard: Card = null;
  @type("string") id: string;

  @filter((client: Client, value: string,state) => {
    return client.sessionId === (this as Player).id;
  })
  @type("number")
  money: number;

  @filter((client: Client, value: string) => {
    return client.sessionId === (this as Player).id;
  })
  @type([Card])
  inventory = new ArraySchema<Card>();

  @filter((client: Client, value: string) => {
    return client.sessionId === (this as Player).id;
  })
  @type([Card])
  deck = new ArraySchema<Card>();

  profits: number = 0;
}

export class StandardState extends Schema {
  phaseRounds = 0;
  @type("string") phase:
    | "WAITING"
    | "CREATING"
    | "BUYING"
    | "FIGHTING"
    | "RESULTS" = "WAITING"; // WAITING CREATING BUYING FIGHTING
  @type({ map: Player }) players = new MapSchema<Player>();
  @type(["string"]) playerIdOrder: string[] = []  ;
  @type("string") activePlayerID: string = null;
  @type("number") currentRound = 0;
  currentTurn = 0;
  cardLibrary = new ArraySchema<Card>();
}

export interface ICreatingAttack {
  name: string;
  desc: string;
}

export interface ClientCardMessage {
  name: string;
  imgURL: string;
  health: number;
  attacks: ICreatingAttack[];
}
