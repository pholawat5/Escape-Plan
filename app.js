const express = require("express");
const app = express();
const server = require("http").createServer(app);
const io = require("socket.io")(server);

app.use("/", express.static(__dirname + "/client/"));

app.use("/admin", express.static(__dirname + "/server/"));

app.get("/", (req, res) => {
  res.sendFile(__dirname + "client/index.html");
});

app.get("/admin", (req, res) => {
  res.sendFile(__dirname + "/Server/admin.html");
});

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

  checkUsername(userNameInput) {
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
      this.USER_LIST[i].name = userNameInput;
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
    socket.emit("checkUsername", gameServer.checkUsername(data));
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

  socket.on("startGame", (data) => {
    console.log("Room " + data + " has started the game!");
    io.to(data).emit("gameStart");
  });

  socket.on("disconnect", () => {
    let roomBeforeLeave = gameServer.USER_LIST[socket.id].inRoom;
    socket
      .to(roomBeforeLeave)
      .emit("userLeftRoom", gameServer.USER_LIST[socket.id].name);
    for (var i in gameServer.ROOM_LIST) {
      let roomI = gameServer.ROOM_LIST[i].users;
      delete roomI[socket.id];
    }
    delete gameServer.USER_LIST[socket.id];
    socket.to("admin").emit("population", gameServer.userListLength());
  });
});

server.listen(8080, () => {
  console.log("Server is listening to port 8080");
});
