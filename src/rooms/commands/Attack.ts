import { Command } from '@colyseus/command'
import { StandardState, Card, Attack, Player } from '../schema/StandardSchema'
import CommandHandler from './CommandHandler'

interface IPayload {
    attackingPlr: Player
    receivingPlr: Player
    attackIndex: number
}

export class AttackCommand extends Command<StandardState, IPayload> {
    validate({attackingPlr, receivingPlr,attackIndex }: IPayload){
        return this.state.phase === 'FIGHTING' && this.state.activePlayerID === attackingPlr.id && attackingPlr.id !== receivingPlr.id
    }

    execute({attackingPlr, receivingPlr,attackIndex }: IPayload) {
        const attack = attackingPlr.activeCard.attacks[attackIndex]

        //Apply attack attributes
        receivingPlr.activeCard.health -= attack.damage
        attackingPlr.activeCard.health += attack.heal
        //KNOCKOUT!
        if (receivingPlr.activeCard.health <= 0) {

            this.room.broadcast("knockout",{
                attacker:attackingPlr.id,
                receivingPlr:receivingPlr.id
            })
            receivingPlr.inventory.push(receivingPlr.activeCard)
            receivingPlr.activeCard = null
        }
        //Incerment Current Turn
        this.state.currentTurn++
        //TODO: call TurnLoop Again :) 
        return new CommandHandler.TurnLoopCommand()
    }
}