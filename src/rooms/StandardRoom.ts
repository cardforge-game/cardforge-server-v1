import { Room, Client, Delayed } from "colyseus";
import { StandardState, ClientCardMessage } from "./schema/StandardSchema";
import { Dispatcher } from "@colyseus/command";
import CommandHandler from "./commands/CommandHandler"

export class StandardRoom extends Room<StandardState> {
  dispatcher = new Dispatcher(this);
  phaseInterval!: Delayed;
  onCreate (options: any) {
    this.setState(new StandardState());

    //TIMING
    this.clock.start()

    this.phaseInterval = this.clock.setInterval(() =>{
      console.log(`Current phase is ${this.state.phase}`)
      if (this.state.phase !== 'FIGHTING') 
        this.state.phase = (this.state.phase === 'WAITING') ? 'CREATING'
          : (this.state.phase === 'CREATING') ? 'BUYING'
          : 'FIGHTING'
      else 
        this.phaseInterval.clear()
      if (this.state.phase === 'BUYING')
        this.broadcast(
          "library", 
          this.state.cardLibrary.toJSON
        )
    }, 10000)
    
    // this.clock.setTimeout(() => {
      
    // }, 10000);

    //INPUT = ClientCardMessage
    this.onMessage("submitCard", (client, message:ClientCardMessage) => {
      this.dispatcher.dispatch(new CommandHandler.CreateCardCommand(),{
        client,cardInput:message
      })
    })

    //INPUT = {id}
    this.onMessage("buyCard", (client, message) => {
      const buyingPlayer = this.state.players.get(client.sessionId)
      const buyingCard = this.state.cardLibrary.find(c=>c.id === message.id)
      this.dispatcher.dispatch(new CommandHandler.BuyCardCommand(),{
        client,buyingPlayer,buyingCard
      })
    })

    //INPUT = {index}
    this.onMessage("setActive", (client, message) => {
      const player = this.state.players.get(client.sessionId)
      
      this.dispatcher.dispatch(new CommandHandler.SetActiveCardCommand(),{
        player,newActiveCardIndex:message.index
      })
    })  

    //INPUT = {id,attackIndex}
    this.onMessage("attack", (client, message) => {
      const attackingPlr = this.state.players.get(client.sessionId)
      const receivingPlr = this.state.players.get(message.id)
      this.dispatcher.dispatch(new CommandHandler.AttackCommand(),{
        attackingPlr,receivingPlr,attackIndex:message.attackIndex
      })
    })
  }

  onJoin (client: Client, options: any) {
    this.dispatcher.dispatch(new CommandHandler.OnJoinCommand(),{
      client,name:options.name
    })
  }

  onLeave (client: Client, consented: boolean) {
    console.log(client.sessionId, "left!");
    this.dispatcher.dispatch(new CommandHandler.OnLeaveCommand(),{
      sessionId:client.sessionId
    })
  }

  onDispose() {
    console.log("room", this.roomId, "disposing...");
    this.dispatcher.stop()
  }

}