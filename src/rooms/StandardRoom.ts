import { Room, Client, Delayed } from "colyseus";
import { StandardState, ClientCardMessage } from "./schema/StandardSchema";
import { Dispatcher } from "@colyseus/command";
import CommandHandler from "./commands/CommandHandler";

export class StandardRoom extends Room<StandardState> {
  dispatcher = new Dispatcher(this);
  phaseInterval!: Delayed;
  chooseCardInterval!: Delayed;
  waitTime: number = 0;
  onCreate(options: any) {
    this.setState(new StandardState());

    // TIMING
    this.clock.start();

    //Start Game if host
    this.onMessage("startGame", (client) => {
      if (
        this.state.players.get(client.sessionId).host &&
        !this.phaseInterval
      ) {
        //Start Loop
        this.state.phaseRounds = 0
        gameLoop(this);
      }
    });

    //INPUT = ClientCardMessage
    this.onMessage("submitCard", (client, message: ClientCardMessage) => {
      this.dispatcher.dispatch(new CommandHandler.CreateCardCommand(), {
        client,
        cardInput: message,
      });
    });

    //INPUT = ClientCardMessage
    this.onMessage("previewCard", (client, message: ClientCardMessage) => {
      this.dispatcher.dispatch(new CommandHandler.PreviewCardCommand(), {
        client,
        cardInput: message,
      });
    });

    //INPUT = {id}
    this.onMessage("buyCard", (client, message) => {
      const buyingPlayer = this.state.players.get(client.sessionId);
      const buyingCard = this.state.cardLibrary.find(
        (c) => c.id === message.id
      );
      this.dispatcher.dispatch(new CommandHandler.BuyCardCommand(), {
        client,
        buyingPlayer,
        buyingCard,
      });
    });

    //INPUT = {index}
    this.onMessage("setActive", (client, message) => {
      const player = this.state.players.get(client.sessionId);

      this.dispatcher.dispatch(new CommandHandler.SetActiveCardCommand(), {
        player,
        newActiveCardIndex: message.index,
      });
    });

    //INPUT = {id,attackIndex}
    this.onMessage("attack", (client, message) => {
      const attackingPlr = this.state.players.get(client.sessionId);
      const receivingPlr = this.state.players.get(message.id);
      this.dispatcher.dispatch(new CommandHandler.AttackCommand(), {
        attackingPlr,
        receivingPlr,
        attackIndex: message.attackIndex,
      });
    });

    //INPUT = {index}
    this.onMessage("addCardToDeck", (client, message) => {
      const player = this.state.players.get(client.sessionId);
      this.dispatcher.dispatch(new CommandHandler.AddCardToDeckCommand(), {
        player,
        index: message.index,
      });
    });

    //INPUT = {index}
    this.onMessage("addCardToInventory", (client, message) => {
      const player = this.state.players.get(client.sessionId);
      this.dispatcher.dispatch(new CommandHandler.AddCardToInventoryCommand(), {
        player,
        index: message.index,
      });
    });
  }

  onJoin(client: Client, options: any) {
    this.dispatcher.dispatch(new CommandHandler.OnJoinCommand(), {
      client,
      name: options.name,
    });
  }

  onLeave(client: Client, consented: boolean) {
    console.log(client.sessionId, "left!");
    this.dispatcher.dispatch(new CommandHandler.OnLeaveCommand(), {
      sessionId: client.sessionId,
    });
  }

  onDispose() {
    console.log("room", this.roomId, "disposing...");
    this.dispatcher.stop();
  }
}

function getRound(phase: string, currentPhaseRound: number, room: StandardRoom) {
  let newPhase = "" as
    | "WAITING"
    | "CREATING"
    | "BUYING"
    | "FIGHTING"
    | "RESULTS";
  let newWaitTime = 0;
  if (phase === "WAITING") {
    newPhase = "CREATING";
    newWaitTime = 2 * 60 * 1000;
    room.clock.start();
  } else if (phase === "CREATING") {
    newPhase = "BUYING";
    newWaitTime = 0.75 * 60 * 1000;
  } else if (phase === "BUYING") {
    newPhase = "FIGHTING";
    newWaitTime = 150 * 1000;
  } else if (phase === "FIGHTING") {
    if (currentPhaseRound >= 5) {
      newPhase = "RESULTS";
      newWaitTime = 30 * 1000;
    } else {
      newPhase = "CREATING";
      newWaitTime = 2 * 60 * 1000;
    }
  }
  return { newPhase, newWaitTime };
}

function gameLoop(room: StandardRoom) {
  console.log(`Current phase is ${room.state.phase}`);
  // Round Changer
  const newRound = getRound(room.state.phase, room.state.phaseRounds, room);
  room.state.phase = newRound.newPhase;
  room.waitTime = newRound.newWaitTime;

  //Game loop scheduler
  room.clock.setTimeout(() => {
    if (room.state.phase != "RESULTS") {
      gameLoop(room);
    }
  }, room.waitTime);

  room.broadcast("resetClock", room.waitTime);

  // Round over
  if (room.state.phase === "RESULTS") {
    room.phaseInterval.clear();
    room.dispatcher.dispatch(new CommandHandler.DisplayResultsCommand());
  }
  // entering creation
  if (room.state.phase === "CREATING"){
    room.dispatcher.dispatch(new CommandHandler.GiveMoneyCommand());
  }
  // Exiting creation round, entering buy round
  if (room.state.phase === "BUYING") {
    room.broadcast("library", room.state.cardLibrary);
  }

  // Exiting buy round, entering fight round
  if (room.state.phase === "FIGHTING") {
    room.state.currentRound = 0;
    //First turn conditions
    if (room.state.currentTurn === 0) {
      //25 seconds to pick a card
      room.clock.setTimeout(() => {
        //Auto give a card if afk
        room.state.players.forEach((player) => {
          if (!player.activeCard && player.deck.length > 0)
            room.dispatcher.dispatch(
              new CommandHandler.SetActiveCardCommand(),
              {
                player: player,
                newActiveCardIndex: 0,
              }
            );
        });

        // Calc turns and give players profits from buy round
        room.dispatcher.dispatch(new CommandHandler.InitRoundCommand());
      }, 5000);
    }
  }
  if (room.state.phase === "RESULTS") {
    //Send Points
    const results = {} as Record<string,number>
    //Add to results and reset
    room.state.players.forEach(p=>{
      results[p.name] = p.points
      p.points = 0
    })
    //Send results
    room.broadcast("results",results)
  }
}
