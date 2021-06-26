import { Command } from '@colyseus/command'
import { StandardState, Card, Player } from '../schema/StandardSchema'

interface IPayload {
    player: Player
    newActiveCardIndex: number
}

export class SetActiveCardCommand extends Command<StandardState, IPayload> {
    validate = ({ player, newActiveCardIndex }: IPayload) => this.state.phase === 'FIGHTING'
    
    execute({ player, newActiveCardIndex }: IPayload) {
        const newActiveCard = player.deck.splice(newActiveCardIndex,1)[0]
        if (player.activeCard !== null) {
            player.deck.push(player.activeCard)
        }
        player.activeCard = newActiveCard
    }
}