import { OnJoinCommand } from "./OnJoin"
import { OnLeaveCommand } from "./OnLeave"
import { AttackCommand } from "./Attack"
import { CreateCardCommand,PreviewCardCommand } from "./CreateCard"
import { BuyCardCommand } from "./BuyCards"
import { SetActiveCardCommand } from "./SetActiveCard"
import { AddCardToDeckCommand, AddCardToInventoryCommand } from "./InventoryAndDeck"
import { NextPhaseCommand } from "./NextPhase"
import { InitRoundCommand } from "./InitRound"
import { TurnLoopCommand } from "./TurnLoop"
import { DisplayResultsCommand } from "./DisplayResults"
import { GiveMoneyCommand } from "./GiveMoney"

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
    NextPhaseCommand,
    InitRoundCommand,
    TurnLoopCommand,
    DisplayResultsCommand,
    GiveMoneyCommand,
    PreviewCardCommand
}