const express = require("express");
const app = express();
const server = require("http").createServer(app);
const io = require("socket.io")(server);

app.use("/", express.static(__dirname + "/Client/"));

app.use("/admin", express.static(__dirname + "/Server/"));

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/Client/index.html");
});

app.get("/admin", (req, res) => {
  res.sendFile(__dirname + "/Server/admin.html");
});

async function checkPath(pos1, pos2, availablePath) {
  let pos_1_Traversal = [];
  pos_1_Traversal.push(pos1);
  await checkPathRecur(pos1, pos2, availablePath, pos_1_Traversal);
  if (pos_1_Traversal.includes(pos2)) {
    return false;
  } else {
    return true;
  }
}

async function checkPathRecur(pos1, pos2, availablePath, pos_1_Traversal) {
  let rightPos =
    "x" + parseInt(pos1.charAt(1)) + "y" + (parseInt(pos1.charAt(3)) + 1);
  let leftPos =
    "x" + parseInt(pos1.charAt(1)) + "y" + (parseInt(pos1.charAt(3)) - 1);
  let upPos =
    "x" + (parseInt(pos1.charAt(1)) - 1) + "y" + parseInt(pos1.charAt(3));
  let downPos =
    "x" + (parseInt(pos1.charAt(1)) + 1) + "y" + parseInt(pos1.charAt(3));

  if (availablePath.includes(rightPos)) {
    if (!pos_1_Traversal.includes(rightPos)) {
      pos_1_Traversal.push(rightPos);
      await checkPathRecur(rightPos, pos2, availablePath, pos_1_Traversal);
    }
  }
  if (availablePath.includes(leftPos)) {
    if (!pos_1_Traversal.includes(leftPos)) {
      pos_1_Traversal.push(leftPos);
      await checkPathRecur(leftPos, pos2, availablePath, pos_1_Traversal);
    }
  }
  if (availablePath.includes(upPos)) {
    if (!pos_1_Traversal.includes(upPos)) {
      pos_1_Traversal.push(upPos);
      await checkPathRecur(upPos, pos2, availablePath, pos_1_Traversal);
    }
  }
  if (availablePath.includes(downPos)) {
    if (!pos_1_Traversal.includes(downPos)) {
      pos_1_Traversal.push(downPos);
      await checkPathRecur(downPos, pos2, availablePath, pos_1_Traversal);
    }
  }
}

class GameServer {
  constructor() {
    this.USER_LIST = {};
    this.ROOM_LIST = {};
  }

  userListLength() {
    let length = 0;
    for (var i in this.USER_LIST) {
      length++;
    }
    return length;
  }

  checkUsername(userNameInput, socket) {
    let numCheck = "0123456789";
    let duplicate = false;
    for (var i in this.USER_LIST) {
      if (
        this.USER_LIST[i].name == userNameInput ||
        numCheck.includes(userNameInput.charAt(0))
      ) {
        duplicate = true;
      }
    }
    if (!duplicate) {
      this.USER_LIST[socket.id].name = userNameInput;
    }
    return !duplicate;
  }

  checkRoom(roomName) {
    //check Room Name Availability
    //return True if room Available or False Otherwise
    let exist = false;
    for (var i in this.ROOM_LIST) {
      if (roomName == this.ROOM_LIST[i].name) {
        exist = true;
        let length = 0;
        for (var j in this.ROOM_LIST[i].users) {
          length++;
        }
        if (length == 2) {
          return false;
        }
        return true;
      }
    }
    if (!exist) {
      return true;
    }
  }
}

const gameServer = new GameServer();

io.sockets.on("connection", (socket) => {
  socket.on("fromIndex", () => {
    console.log("User Join !");
    gameServer.USER_LIST[socket.id] = socket;
    socket.to("admin").emit("population", gameServer.userListLength());
  });
  socket.on("fromAdmin", () => {
    socket.join("admin");
    console.log("Admin Login!");
    socket.emit("population", gameServer.userListLength());
  });

  socket.on("checkUsername", (data) => {
    let ret = gameServer.checkUsername(data, socket);
    for (var i in gameServer.USER_LIST) {
      console.log(gameServer.USER_LIST[i].name);
    }
    socket.emit("checkUsername", ret);
  });

  socket.on("checkRoomStatus", (data) => {
    let avail = gameServer.checkRoom(data);
    if (avail) {
      if (gameServer.ROOM_LIST[data] != null) {
        socket.join(data);
        let users = [];
        let thisUser = [];

        thisUser.push(gameServer.USER_LIST[socket.id].name);
        for (var i in gameServer.ROOM_LIST[data].users) {
          users.push(gameServer.ROOM_LIST[data].users[i].name);
        }
        socket.emit("existingUser", JSON.stringify(users));
        socket.to(data).emit("existingUser", JSON.stringify(thisUser));
        gameServer.USER_LIST[socket.id].inRoom = data;
        gameServer.ROOM_LIST[data].users[socket.id] = socket;
      } else {
        socket.join(data);
        gameServer.ROOM_LIST[data] = {
          name: data,
          users: {},
        };
        gameServer.USER_LIST[socket.id].inRoom = data;
        gameServer.ROOM_LIST[data].users[socket.id] = socket;
      }
    }
    socket.emit("checkRoomStatus", avail);
  });

  socket.on("startGame", async (data) => {
    console.log("Room " + data + " has started the game!");
    io.to(data).emit("cleanGrid");
    let gameState = {
      gridPositions: [],
    };

    //Generate Grid
    let k = 0;
    for (let i = 1; i <= 5; i++) {
      for (let j = 1; j <= 5; j++) {
        gameState.gridPositions[k] = "x" + i + "y" + j;
        k++;
      }
    }

    //Random Obstacles
    let ObstaclePos = [];
    for (let i = 0; i < 5; i++) {
      let indexRemove = Math.floor(
        Math.random() * gameState.gridPositions.length
      );
      ObstaclePos.push(gameState.gridPositions[indexRemove]);
      gameState.gridPositions.splice(indexRemove, 1);
    }

    //Random Tunnel Pos
    let TunnelPos = [];
    let indexRemove =
      Math.floor(Math.random() * (gameState.gridPositions.length + 1)) %
      gameState.gridPositions.length;
    TunnelPos.push(gameState.gridPositions[indexRemove]);
    gameState.gridPositions.splice(indexRemove, 1);

    //Random Player Pos
    let UserPos = [];
    let length = 0;
    for (var i in gameServer.ROOM_LIST[data].users) {
      length++;
    }
    for (let i = 0; i < length; i++) {
      let indexRemove =
        Math.floor(Math.random() * (gameState.gridPositions.length + 1)) %
        gameState.gridPositions.length;
      UserPos.push(gameState.gridPositions[indexRemove]);
      gameState.gridPositions.splice(indexRemove, 1);
    }
    for (var i in UserPos) {
      gameState.gridPositions.push(UserPos[i]);
    }

    let stuck = await checkPath(
      UserPos[0],
      UserPos[1],
      gameState.gridPositions
    );

    while (stuck) {
      UserPos = [];
      let z = 0;
      for (var i in gameServer.ROOM_LIST[data].users) {
        z = z + 1;
      }
      for (let i = 0; i < length; i++) {
        let indexRemove =
          Math.floor(Math.random() * (gameState.gridPositions.length + 1)) %
          gameState.gridPositions.length;
        UserPos.push(gameState.gridPositions[indexRemove]);
        gameState.gridPositions.splice(indexRemove, 1);
      }
      for (var i in UserPos) {
        gameState.gridPositions.push(UserPos[i]);
      }
      stuck = await checkPath(UserPos[0], UserPos[1], gameState.gridPositions);
    }
    console.log(stuck);
    for (var i in TunnelPos) {
      gameState.gridPositions.push(TunnelPos[i]);
    }

    //Crafting message
    let userPosMsg = {};
    gameState.users = [];
    for (var i in gameServer.ROOM_LIST[data].users) {
      gameState.users.push(gameServer.ROOM_LIST[data].users[i].name);
    }
    for (var i in gameState.users) {
      userPosMsg[gameState.users[i]] = UserPos[i];
    }

    gameState.playerPos = userPosMsg;
    gameState.obstaclePos = ObstaclePos;
    gameState.tunnelPos = TunnelPos;
    if (gameServer.ROOM_LIST[data].gameState != undefined) {
      gameState.warderIndex = gameServer.ROOM_LIST[data].gameState.warderIndex;
    } else {
      gameState.warderIndex = Math.round(Math.random());
    }

    if (gameState.warderIndex == 0) {
      gameState.prisonerIndex = 1;
    } else {
      gameState.prisonerIndex = 0;
    }
    gameState.playerIndex = gameState.warderIndex;
    gameState.turn = gameState.users[gameState.warderIndex];
    //
    if (gameServer.ROOM_LIST[data].gameState != undefined) {
      gameState.turn =
        gameState.users[gameServer.ROOM_LIST[data].gameState.winnerIndex];
      gameState.playerIndex = gameServer.ROOM_LIST[data].gameState.winnerIndex;
      gameState.score = [
        gameServer.ROOM_LIST[data].gameState.score[0],
        gameServer.ROOM_LIST[data].gameState.score[1],
      ];
    } else {
      gameState.score = [0, 0];
    }
    //
    gameServer.ROOM_LIST[data].gameState = gameState;
    io.to(data).emit("gameStart", gameServer.ROOM_LIST[data].gameState);
  });

  socket.on("finishTurn", ([roomName, newPos]) => {
    gameServer.ROOM_LIST[roomName].gameState.playerPos[
      gameServer.ROOM_LIST[roomName].gameState.users[
        gameServer.ROOM_LIST[roomName].gameState.playerIndex %
          gameServer.ROOM_LIST[roomName].gameState.users.length
      ]
    ] = newPos;

    gameServer.ROOM_LIST[roomName].gameState.playerIndex += 1;
    gameServer.ROOM_LIST[roomName].gameState.turn =
      gameServer.ROOM_LIST[roomName].gameState.users[
        gameServer.ROOM_LIST[roomName].gameState.playerIndex %
          gameServer.ROOM_LIST[roomName].gameState.users.length
      ];

    //check Win
    let gameOver = false;
    if (
      gameServer.ROOM_LIST[roomName].gameState.playerPos[
        gameServer.ROOM_LIST[roomName].gameState.users[0]
      ] ==
      gameServer.ROOM_LIST[roomName].gameState.playerPos[
        gameServer.ROOM_LIST[roomName].gameState.users[1]
      ]
    ) {
      gameOver = true;
      gameServer.ROOM_LIST[roomName].gameState.winnerIndex =
        gameServer.ROOM_LIST[roomName].gameState.warderIndex;
      gameServer.ROOM_LIST[roomName].gameState.score[
        gameServer.ROOM_LIST[roomName].gameState.winnerIndex
      ] += 1;
    }

    if (
      gameServer.ROOM_LIST[roomName].gameState.playerPos[
        gameServer.ROOM_LIST[roomName].gameState.users[
          gameServer.ROOM_LIST[roomName].gameState.prisonerIndex
        ]
      ] == gameServer.ROOM_LIST[roomName].gameState.tunnelPos[0]
    ) {
      gameOver = true;
      gameServer.ROOM_LIST[roomName].gameState.winnerIndex =
        gameServer.ROOM_LIST[roomName].gameState.prisonerIndex;
      gameServer.ROOM_LIST[roomName].gameState.score[
        gameServer.ROOM_LIST[roomName].gameState.winnerIndex
      ] += 1;
    }

    if (!gameOver) {
      io.to(roomName).emit(
        "gameStart",
        gameServer.ROOM_LIST[roomName].gameState
      );
    } else {
      io.to(roomName).emit(
        "gameOver",
        gameServer.ROOM_LIST[roomName].gameState
      );
    }
  });

  socket.on("disconnect", () => {
    if (gameServer.USER_LIST[socket.id] != null) {
      let roomBeforeLeave = gameServer.USER_LIST[socket.id].inRoom;
      socket
        .to(roomBeforeLeave)
        .emit("userLeftRoom", gameServer.USER_LIST[socket.id].name);
      for (var i in gameServer.ROOM_LIST) {
        let roomI = gameServer.ROOM_LIST[i].users;
        delete roomI[socket.id];
        let empty = true;
        for (var j in roomI) {
          if (roomI[j] != undefined) {
            empty = false;
          }
        }
        if (empty) {
          delete gameServer.ROOM_LIST[i];
        }
      }
    }
    delete gameServer.USER_LIST[socket.id];
    socket.to("admin").emit("population", gameServer.userListLength());
  });
});

var port = process.env.PORT || 8080;

server.listen(port, () => {
  console.log("Server is listening to port " + port);
});
