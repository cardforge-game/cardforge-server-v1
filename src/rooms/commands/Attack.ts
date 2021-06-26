import { Command } from '@colyseus/command'
import { StandardState, Card, Attack, Player } from '../schema/StandardSchema'

interface IPayload {
    attackingPlr: Player
    receivingPlr: Player
    attackIndex: number
}

export class AttackCommand extends Command<StandardState, IPayload> {
    validate({attackingPlr, receivingPlr,attackIndex }: IPayload){
        return this.state.phase === 'FIGHTING'
    }

    execute({attackingPlr, receivingPlr,attackIndex }: IPayload) {
        const attack = attackingPlr.activeCard.attacks[attackIndex]

        //Apply attack attributes
        receivingPlr.activeCard.health -= attack.damage
        attackingPlr.activeCard.health += attack.heal
        if (receivingPlr.activeCard.health <= 0) {
            // TODO
            console.log(`${attackingPlr.activeCard.name} has knocked out ${receivingPlr.activeCard.name}`)
        }
    }
}