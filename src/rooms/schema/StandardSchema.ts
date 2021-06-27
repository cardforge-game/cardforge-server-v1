import { Client } from 'colyseus'
import { Schema, Context, MapSchema, ArraySchema, type, filter } from "@colyseus/schema";

export class Attack extends Schema {
  @type('string') name: string
  @type('number') damage = 0
  @type('number') heal= 0
  @type('string') desc: string
}

export class Card extends Schema {
  @type('string') id: string
  @type('string') name: string;
  @type('number') health:number;
  @type('number') cardCost:number;
  @type('string') imgURL: string;
  @type([Attack]) attacks = new ArraySchema<Attack>();
  ownerID: string;
}

export class Player extends Schema {
  
  @type('string') name: string;
  @type('boolean') host: boolean;
  @type(Card) activeCard: Card = null;
  @type('string') id: string;

  @filter(function(client:Client, value:string) {
    return client.sessionId === value
  }) @type('number') money: number;

  @filter(function(client:Client, value:string) {
    return client.sessionId === value
  }) @type([Card]) inventory = new ArraySchema<Card>();

  @filter(function(client:Client, value:string) {
    return client.sessionId === value
  }) @type([Card]) deck = new ArraySchema<Card>();

  profits: number = 0;

}

export class StandardState extends Schema {
  @type("string") phase: "WAITING"|"CREATING"|"BUYING"|"FIGHTING"|"RESULTS" = "WAITING"; // WAITING CREATING BUYING FIGHTING
  @type({map:Player}) players = new MapSchema<Player>();
  @type(["string"]) playerIdOrder: [string];
  @type(["string"]) activePlayerID: string = null;
  @type("number") currentRound = 0;
  @type("number") currentTurn = 0;
  cardLibrary = new ArraySchema<Card>();
}

export interface ClientCardMessage {
  name: string;
  imgURL: string;
  health:number;
  attacks:string[];
}