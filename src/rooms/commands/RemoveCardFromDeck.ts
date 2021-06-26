import { Command } from '@colyseus/command'
import { StandardState, Card, Player } from '../schema/StandardSchema'

interface IPayload {
    player: Player
    card: Card
}

export class RemoveCardFromDeckCommand extends Command<StandardState, IPayload> {
    validate = ({ player, card }: IPayload) => player.deck.includes(card)
    
    execute({ player, card }: IPayload) {
        player.deck.splice(player.deck.indexOf(card), 1)
    }
}