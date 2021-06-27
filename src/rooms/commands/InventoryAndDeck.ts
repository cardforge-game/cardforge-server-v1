import { Command } from '@colyseus/command'
import { StandardState, Card, Player } from '../schema/StandardSchema'

interface IPayload {
    player: Player
    index: number
}

export class AddCardToDeckCommand extends Command<StandardState, IPayload> {
    validate({ player, index }: IPayload){
        if(this.state.phase != "BUYING") {
            return false
        }
        if(!player.inventory[index]) {
            return false
        }
        if(player.inventory.length === 7) {
            return false
        }

        return true
    }

    execute({ player, index }: IPayload) {
        player.deck.push(player.inventory[index])
        player.inventory.splice(index, 1)
    }
}

export class AddCardToInventoryCommand extends Command<StandardState, IPayload> {
    validate({ player, index }: IPayload){
        if(this.state.phase != "BUYING") {
            return false
        }
        if(!player.deck[index]) {
            return false
        }

        return true
    }

    execute({ player, index }: IPayload) {
        player.inventory.push(player.deck[index])
        player.deck.splice(index, 1)
    }
}