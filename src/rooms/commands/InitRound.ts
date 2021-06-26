import { Command } from '@colyseus/command'
import { StandardState, Card, Player } from '../schema/StandardSchema'

export class InitRoundCommand extends Command<StandardState> {
    validate = () => true

    execute() {

    }
}