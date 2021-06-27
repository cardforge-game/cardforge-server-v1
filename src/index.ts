import { Server } from "colyseus";
import { createServer } from "http";
import express from "express";
import { monitor } from "@colyseus/monitor";

//Rooms
import {StandardRoom} from "./rooms/StandardRoom"


const port = Number(process.env.port) || 8080;
const app = express();
app.use(express.json());

const gameServer = new Server({
  server: createServer(app)
});

//Setup Routes
app.use("/colyseus", monitor());
app.get("/", (req, res) => {
    // res.send("Built with <3");
  res.send('<a href="https://www.instagram.com/therathulanand/">Built with <3</a>');
})

//Setup Rooms
gameServer.define("standard",StandardRoom)
gameServer.listen(port);
console.log(`Card server is up on port ${port}`)