import { Room, Client, Delayed } from "colyseus";
import { StandardState, ClientCardMessage } from "./schema/StandardSchema";
import { Dispatcher } from "@colyseus/command"
import CommandHandler from "./commands/CommandHandler"

export class StandardRoom extends Room<StandardState> {
  dispatcher = new Dispatcher(this);
  phaseInterval!: Delayed;
  chooseCardInterval!: Delayed;
  waitTime: number = 20 * 1000;
  onCreate(options: any) {
    this.setState(new StandardState());

    // TIMING
    this.clock.start()

    // Update phase
    this.phaseInterval = this.clock.setInterval(() => {

      console.log(`Current phase is ${this.state.phase}`)
      // Round Changer
      const newRound = getRound(this.state.phase, this.state.currentRound)
      this.state.phase = newRound.newPhase
      this.waitTime = newRound.newWaitTime

      // Round over
      if (this.state.phase === 'RESULTS') {
        this.phaseInterval.clear()
        this.dispatcher.dispatch(new CommandHandler.DisplayResultsCommand())
      }

      // Exiting creation round, entering buy round
      if (this.state.phase === 'BUYING') {
        this.dispatcher.dispatch(new CommandHandler.GiveMoneyCommand())
        this.broadcast(
          "library",
          this.state.cardLibrary
        )
      }

      // Exiting buy round, entering fight round
      if (this.state.phase === 'FIGHTING') {
        this.state.currentRound = 0
        //First turn conditions
        if (this.state.currentTurn === 0) {
          //25 seconds to pick a card
          this.clock.setTimeout(() => {
            //Auto give a card if afk
            this.state.players.forEach(player => {
              if (!player.activeCard && player.deck.length > 0)
                this.dispatcher.dispatch(new CommandHandler.SetActiveCardCommand(), {
                  player: player, newActiveCardIndex: 0
                })
            })

            // Calc turns and give players profits from buy round
            this.dispatcher.dispatch(new CommandHandler.InitRoundCommand())
    

          }, 25000)
        }



      }
    }, this.waitTime)

    //INPUT = ClientCardMessage
    this.onMessage("submitCard", (client, message: ClientCardMessage) => {
      this.dispatcher.dispatch(new CommandHandler.CreateCardCommand(), {
        client, cardInput: message
      })
    })

    //INPUT = ClientCardMessage
    this.onMessage("previewCard", (client, message: ClientCardMessage) => {
      this.dispatcher.dispatch(new CommandHandler.PreviewCardCommand(), {
        client, cardInput: message
      })
    })


    //INPUT = {id}
    this.onMessage("buyCard", (client, message) => {
      const buyingPlayer = this.state.players.get(client.sessionId)
      const buyingCard = this.state.cardLibrary.find(c => c.id === message.id)
      this.dispatcher.dispatch(new CommandHandler.BuyCardCommand(), {
        client, buyingPlayer, buyingCard
      })
    })

    //INPUT = {index}
    this.onMessage("setActive", (client, message) => {
      const player = this.state.players.get(client.sessionId)

      this.dispatcher.dispatch(new CommandHandler.SetActiveCardCommand(), {
        player, newActiveCardIndex: message.index
      })
    })

    //INPUT = {id,attackIndex}
    this.onMessage("attack", (client, message) => {
      const attackingPlr = this.state.players.get(client.sessionId)
      const receivingPlr = this.state.players.get(message.id)
      this.dispatcher.dispatch(new CommandHandler.AttackCommand(), {
        attackingPlr, receivingPlr, attackIndex: message.attackIndex
      })
    })

    //INPUT = {index}
    this.onMessage("addCardToDeck", (client, message) => {
      const player = this.state.players.get(client.sessionId)
      this.dispatcher.dispatch(new CommandHandler.AddCardToDeckCommand(), {
        player, index: message.index
      })
    })

    //INPUT = {index}
    this.onMessage("addCardToInventory", (client, message) => {
      const player = this.state.players.get(client.sessionId)
      this.dispatcher.dispatch(new CommandHandler.AddCardToInventoryCommand(), {
        player, index: message.index
      })
    })

  }

  onJoin(client: Client, options: any) {
    this.dispatcher.dispatch(new CommandHandler.OnJoinCommand(), {
      client, name: options.name
    })
  }

  onLeave(client: Client, consented: boolean) {
    console.log(client.sessionId, "left!");
    this.dispatcher.dispatch(new CommandHandler.OnLeaveCommand(), {
      sessionId: client.sessionId
    })
  }

  onDispose() {
    console.log("room", this.roomId, "disposing...");
    this.dispatcher.stop()
  }
}

function getRound(phase: string, currentRound: number) {
  let newPhase = "" as "WAITING" | "CREATING" | "BUYING" | "FIGHTING" | "RESULTS"
  let newWaitTime = 0;
  if (phase === 'WAITING') {
    phase = 'CREATING'
    newWaitTime = 120 * 1000
  } else if (phase === 'CREATING') {
    phase = 'BUYING'
    newWaitTime = 60 * 1000
  } else if (phase === 'BUYING') {
    phase = 'FIGHTING'
    newWaitTime = 150 * 1000
  } else if (phase === 'FIGHTING') {
    if (currentRound >= 5) {
      phase = 'RESULTS'
      newWaitTime = 30 * 1000
    } else {
      phase = 'CREATING'
      newWaitTime = 120 * 1000
    }
  }
  return { newPhase, newWaitTime }
}