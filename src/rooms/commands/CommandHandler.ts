import { OnJoinCommand } from "./OnJoin"
import { OnLeaveCommand } from "./OnLeave"
import {AttackCommand} from "./Attack"
import {CreateCardCommand} from "./CreateCard"
import {BuyCardCommand} from "./BuyCards"
import {SetActiveCardCommand} from "./SetActiveCard"
import {AddCardToDeckCommand,AddCardToInventoryCommand} from "./InventoryAndDeck"
import { NextPhaseCommand } from "./NextPhase"

//TODO: automatically do that?
export default {
    AddCardToInventoryCommand,
    AddCardToDeckCommand,
    BuyCardCommand,
    OnJoinCommand,
    OnLeaveCommand,
    AttackCommand,
    CreateCardCommand,
    SetActiveCardCommand,
    NextPhaseCommand
}