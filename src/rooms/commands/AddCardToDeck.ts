import { Command } from '@colyseus/command'
import { StandardState, Card, Player } from '../schema/StandardSchema'

interface IPayload {
    player: Player
    card: Card
}

export class AddCardToDeckCommand extends Command<StandardState, IPayload> {
    validate = ({ player, card }: IPayload) => this.state.phase === 'CREATING'

    execute({ player, card }: IPayload) {
        player.deck.push(card)
    }
}