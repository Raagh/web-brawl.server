import express from "express";
import * as http from "http";
import * as socketio from "socket.io";

const app = express();
const server = new http.Server(app);
const io = socketio.listen(server);

let players = {};
const port = 8081;

io.on("connection", socket => {
  console.log(socket.id + " user connected");
  players[socket.id] = {
    x: 500,
    y: 500,
    playerId: socket.id,
    team: Math.floor(Math.random() * 2) == 0 ? "imperial" : "caos"
  };

  socket.emit("currentPlayers", players);
  socket.broadcast.emit("newPlayer", players[socket.id]);

  socket.on("disconnect", () => {
    console.log(socket.id + "user disconnected");
    delete players[socket.id];
    io.emit("disconnect", socket.id);
  });

  socket.on("playerMovement", movementData => {
    players[socket.id].x = movementData.x;
    players[socket.id].y = movementData.y;
    socket.broadcast.emit("playerMoved", players[socket.id]);
  });
});

app.get("/", (req, res) => {
  res.send("Reached web-brawl server");
});

server.listen(port, () => {
  console.log("Listening on " + port);
});
