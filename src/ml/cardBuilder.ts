import {
  Card,
  Attack,
  ClientCardMessage,
} from "../rooms/schema/StandardSchema";
import { ArraySchema } from "@colyseus/schema";
import uniqid from "uniqid";

const winkNLP = require("wink-nlp");
const its = require("wink-nlp/src/its.js");
const as = require("wink-nlp/src/as.js");
const model = require("wink-eng-lite-model");

//Setup nlp
const nlp = winkNLP(model);
const damageWords = ["damage"];
const healthWords = ["health", "hp", "hit"];
const patterns = [
  {
    name: "damage",
    patterns: [`[CARDINAL|NUM] [${damageWords.join("|")}]`],
    mark: [0, 0],
  },
  {
    name: "damage",
    patterns: [`[${damageWords.join("|")}] [ADP] [CARDINAL|NUM]`],
    mark: [2, 2],
  },
  {
    name: "damage",
    patterns: [`[CARDINAL|NUM] [|ADP] [PRON] [${damageWords.join("|")}]`],
    mark: [0, 0],
  },
  {
    name: "heal",
    patterns: [`[CARDINAL|NUM] [|ADP] [PRON] [${healthWords.join("|")}]`],
    mark: [0, 0],
  },
  {
    name: "heal",
    patterns: [`[${healthWords.join("|")}] [ADP] [CARDINAL|NUM]`],
    mark: [2, 2],
  },
  {
    name: "heal",
    patterns: [`[CARDINAL|NUM] [${healthWords.join("|")}]`],
    mark: [0, 0],
  },
];
nlp.learnCustomEntities(patterns);

//Function to convert text to attack attributes
function parseAttack(attack: string) {
  const moveAttributes = {} as Record<string, number>;
  const doc = nlp.readDoc(attack);
  doc.customEntities().each((e: any) => {
    const sentiment = e.parentSentence().out(its.sentiment);
    const type = trueType(e.out(its.type), sentiment);
    const value = e.out();
    moveAttributes[type] = parseInt(value);
  });
  return moveAttributes;
}

//Build a card from ClientCardMessage
export function buildCard(msg: ClientCardMessage, sessionId: string) {
  //Build attacks
  const summed = {
    attack: 0,
    heal: 0,
  } as Record<string, number>;
  const attacks = msg.attacks.map((attack) => {
    const att = parseAttack(attack.desc);
    for (const k in att) {
      summed[k] += att[k];
    }
    console.log(att);
    return new Attack({ damage: 0, heal: 0, desc: attack.desc, name: attack.name, ...att });
  });

  const card = new Card({
    id: uniqid(),
    name: msg.name,
    health: msg.health,
    imgURL: msg.imgURL,
    ownerID: sessionId,
  });

  card.attacks = card.attacks.concat(attacks);
  card.cardCost = Math.round(
    card.health * 1.5 + attacks.length + summed.attack * 0.5 + summed.heal * 0.5
  );

  console.log(card.attacks[0]);
  
  return card;
}

//Validate that the card built correctly
export function validateCard(card: Card) {
  return (
    card.attacks.every((a) => {
      return a.damage > 0 || a.heal > 0
    }) && card.health > 0
  );
}

//Utils
function trueType(type: string, sentiment: Number) {
  const trueIndex = sentiment < 0 ? 0 : 1;

  const typePairs = [["damage", "heal"]];

  const typePair = typePairs.filter((pair) => pair.includes(type))[0];
  return typePair[trueIndex];
}
