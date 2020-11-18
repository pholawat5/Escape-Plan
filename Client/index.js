// Socket


function bg(){
  const audio = document.querySelector(".theme-music");
  audio.volume = 1;
  audio.play();
  console.log('Music')
}

bg();
const socket = io();


let rocket = gsap.timeline({ repeat: 0, ease: "power2.inOut" });
rocket.fromTo(
  "#rocket",
  5,
  { top: "-10%", left: "-10%", rotate: -90 },
  { rotate: -45, left: "70%", top: "70%" }
);

let welcomeTl = gsap.timeline();
welcomeTl.fromTo(
  ".login h1",
  3,
  { opacity: 0, scale: 0.2 },
  { opacity: 1, scale: 1 }
);
welcomeTl.fromTo(
  ".displayNameForm",
  3,
  { opacity: 0, scale: 0.2 },
  { opacity: 1, scale: 1 }
);

class GameClient {
  constructor() {
    //Game Client Variables
    this.displayName = "";
    this.inRoom = "";
    //Welcome Page DOM
    this.loginSection = document.querySelector(".login");
    this.loginForm = document.querySelector(".displayNameForm");
    this.nameWarning = document.querySelector(".nameWarning");
    this.displayNameInput = document.querySelector(".displayName");
    //FindGame Page
    this.findGameSection = document.querySelector(".roomCreation");
    this.joingameForm = document.querySelector(".joinGame");
    this.roomWarning = document.querySelector(".roomWarning");
    this.randomBtn = document.querySelector(".random");
    //Waiting Page
    this.waitingSection = document.querySelector(".waitingRoom");
    this.userList = document.querySelector(".users");
    this.nextRoundBtn = document.querySelector(".gameOver");
    this.playBtn = document.querySelector(".playNow");
    //Game Page
    this.gameSection = document.querySelector(".gamePage");
    this.allGrid = document.querySelectorAll(".box");
    this.currentPos = { x: 1, y: 1 };
    this.currentBlock = document.querySelector(
      ".x" + this.currentPos.x + "y" + this.currentPos.y
    );
    this.moveButton = document.querySelector(".controls");
    this.endGame = document.querySelector(".endGame");
    this.moveItems = this.moveButton.children;
    this.scoreList = document.querySelector(".userScores");
    this.itemss = this.scoreList.children;
    this.playerChar = document.querySelector(".playerType");
  }

  init() {
    this.loginForm.addEventListener("submit", (event) => {
      event.preventDefault();
      socket.emit("checkUsername", this.displayNameInput.value);
    });

    this.joingameForm.addEventListener("submit", (event) => {
      event.preventDefault();
      this.gameCodeInput = this.joingameForm.querySelector("input");
      console.log(this.gameCodeInput);
      socket.emit("checkRoomStatus", this.gameCodeInput.value);
    });

    this.randomBtn.addEventListener("click", (event) => {
      socket.emit("randomRoom");
      event.target.style.pointerEvents = "none";
    });

    this.playBtn.addEventListener("click", (event) => {
      if (this.userList.childElementCount == 1) {
        window.alert("Go find a friend!");
      } else {
        socket.emit("startGame", this.inRoom);
      }
    });

    this.nextRoundBtn.addEventListener("click", (event) => {
      socket.emit("startGame", this.inRoom);
      this.nextRoundBtn.style.opacity = 0;
      this.nextRoundBtn.style.pointerEvents = "none";
    });

    this.endGame.addEventListener("click", (event) => {
      socket.emit("terminateRoom", this.inRoom);
    });

    socket.on("resetRoom2", () => {
      socket.emit("terminateRoom", this.inRoom);
    })

    socket.on("roomTerminated", () => {
      gameClient.gameData = undefined;
      this.userList.innerHTML = "";
      this.findGameSection.style.display = "flex";
      this.findGameSection.style.opacity = 1;
      this.gameSection.style.display = "none";
      this.inRoom = undefined;
    });

    socket.on("existingUser", (data) => {
      let users = JSON.parse(data);
      console.log(users);
      for (var i in users) {
        let otherUser = document.createElement("li");
        otherUser.id = users[i];
        otherUser.innerText = users[i];
        this.userList.appendChild(otherUser);
      }
    });

    socket.on("checkRoomStatus", (data) => {
      if (data) {
        welcomeTl.fromTo(
          ".roomCreation",
          1,
          { opacity: 1, display: "flex" },
          { opacity: 0, scale: 1, display: "none" }
        );
        welcomeTl.fromTo(
          ".waitingRoom",
          1,
          { opacity: 0, display: "flex" },
          { opacity: 1, scale: 1, display: "flex" }
        );
        this.roomWarning.classList.remove("active");
        this.inRoom = this.gameCodeInput.value;
        let user = document.createElement("li");
        user.innerText = gameClient.displayName;
        this.userList.append(user);
      } else {
        this.roomWarning.classList.add("active");
      }
    });

    socket.on("randomStatus", ({ data, roomName }) => {
      if (data) {
        welcomeTl.fromTo(
          ".roomCreation",
          1,
          { opacity: 1, display: "flex" },
          { opacity: 0, scale: 1, display: "none" }
        );
        welcomeTl.fromTo(
          ".waitingRoom",
          1,
          { opacity: 0, display: "flex" },
          { opacity: 1, scale: 1, display: "flex" }
        );
        this.roomWarning.classList.remove("active");
        this.inRoom = roomName;
        let user = document.createElement("li");
        user.innerText = gameClient.displayName;
        this.userList.append(user);
      } else {
        this.roomWarning.classList.add("active");
      }
    });

    socket.on("checkUsername", (data) => {
      if (data) {
        this.displayName = this.displayNameInput.value;
        rocket.fromTo(
          "#rocket",
          5,
          { rotate: -45, x: "500", y: "200" },
          { x: "-100%", y: "-300%", rotate: -90 }
        );
        welcomeTl.fromTo(
          ".displayNameForm",
          3,
          { opacity: 1, scale: 1 },
          { opacity: 0, scale: 0.2 }
        );
        welcomeTl.fromTo(
          ".login",
          1,
          { opacity: 1, scale: 1 },
          { opacity: 0, display: "none" }
        );
        welcomeTl.fromTo(
          ".gameInstructions",
          1,
          { opacity: 0, display: "none" },
          { opacity: 1, display: "flex" }
        );
        welcomeTl.fromTo(
          "#rocket2",
          7,
          { left: "-10%", bottom: "70%", display: "flex", rotate: 20 },
          { left: "110%", bottom: "70%" }
        );
        welcomeTl.fromTo(
          ".gameInstructions",
          1,
          { opacity: 1, scale: 1 },
          { opacity: 0, display: "none" }
        );
        welcomeTl.fromTo(
          ".roomCreation",
          1,
          { opacity: 0, display: "flex" },
          { opacity: 1, scale: 1 }
        );
        this.nameWarning.classList.remove("active");
      } else {
        this.nameWarning.classList.add("active");
      }
    });

    socket.on("gameStart", (gameData) => {
      console.log(gameData);
      this.nextRoundBtn.style.opacity = 0;
      gameClient.nextRoundBtn.style.pointerEvents = "none";
      this.waitingSection.style.display = "none";
      this.gameSection.style.display = "flex";

      // background select

      var background = document.getElementById("bg").value;
      console.log(background);
      if (background == "Jupiter") {
        this.gameSection.style.background = "url('./img/Jupitor.jpg')";
      } else if (background == "Venus") {
        this.gameSection.style.background = "url('./img/Venus.jpg')";
      } else {
        this.gameSection.style.background = "url('./img/Mercury.jpg')";
      }

      console.log(gameData);
      if (gameData.turn == gameClient.displayName) {
        console.log("Your Turn!");
        gameClient.moveButton.style.opacity = 1;
        gameClient.moveButton.style.pointerEvents = "auto";
        timer.timerHTML.style.opacity = 1;
        timer.start();
      }

      for (var i in gameData.obstaclePos) {
        let obstacleSprite = document.querySelector(
          "." + gameData.obstaclePos[i]
        );
        obstacleSprite.innerHTML = '<img src="./img/ufo.svg" />';
      }

      for (var i in gameData.tunnelPos) {
        let obstacleSprite = document.querySelector(
          "." + gameData.tunnelPos[i]
        );
        obstacleSprite.innerHTML = '<img src="./img/escape.svg" />';
      }

      for (var i in gameData.trapPos) {
        let obstacleSprite = document.querySelector("." + gameData.trapPos[i]);
        obstacleSprite.innerHTML = '<img src="./img/blackhole.png" />';
      }

      Object.keys(gameData.playerPos).forEach(function (key) {
        if (key == gameClient.displayName) {
          gameClient.currentPos = gameData.playerPos[key];
        } else {
          let otherPlayerBlock = document.querySelector(
            "." + gameData.playerPos[key]
          );
          let existingSprite = document.querySelector("#Pos" + key);
          if (existingSprite != undefined) {
            existingSprite.classList.remove("otherPlayerBlock");
            existingSprite.innerHTML = "";
            existingSprite.id = undefined;
          }
          let id = "Pos" + key;
          otherPlayerBlock.classList.add("otherPlayerBlock");
          otherPlayerBlock.id = id;

          // color select
          var photo = document.getElementById("photo").value;
          console.log(photo);
          if (gameData.users[gameData.warderIndex] == key) {
            if (photo == "blue") {
              otherPlayerBlock.innerHTML = '<img src="./img/alien.svg" />';
            } else if (photo == "white") {
              otherPlayerBlock.innerHTML = '<img src="./img/alien2.svg" />';
            } else {
              otherPlayerBlock.innerHTML = '<img src="./img/alien3.svg" />';
            }
          } else {
            if (photo == "blue") {
              otherPlayerBlock.innerHTML = '<img src="./img/astro.svg" />';
            } else if (photo == "white") {
              otherPlayerBlock.innerHTML = '<img src="./img/astro2.svg" />';
            } else {
              otherPlayerBlock.innerHTML = '<img src="./img/astro3.svg" />';
            }
          }
        }
      });
      gameClient.gameState = gameData;
      gameClient.currentBlock = document.querySelector(
        "." + gameClient.currentPos
      );

      // color select
      var photo = document.getElementById("photo").value;
      gameClient.currentBlock.classList.add("currentBlock");
      if (gameData.users[gameData.warderIndex] == gameClient.displayName) {
        this.playerChar.innerText = "You are the Alien";
        if (photo == "white") {
          gameClient.currentBlock.innerHTML = '<img src="./img/alien.svg" />';
        } else if (photo == "green") {
          gameClient.currentBlock.innerHTML = '<img src="./img/alien2.svg" />';
        } else {
          gameClient.currentBlock.innerHTML = '<img src="./img/alien3.svg" />';
        }
      } else {
        this.playerChar.innerText = "You are the Astronaut";
        if (photo == "white") {
          gameClient.currentBlock.innerHTML = '<img src="./img/astro.svg" />';
        } else if (photo == "green") {
          gameClient.currentBlock.innerHTML = '<img src="./img/astro2.svg" />';
        } else {
          gameClient.currentBlock.innerHTML = '<img src="./img/astro3.svg" />';
        }

        console.log(gameClient.gameState);
        this.scoreList.innerHTML = "";
        for (var i in gameClient.gameState.users) {
          let element = document.createElement("p");
          element.innerText =
            gameClient.gameState.users[i] + ":" + gameClient.gameState.score[i];

          this.scoreList.appendChild(element);
        }
      }
    });

    socket.on("gameOver", (gameData) => {
      this.nextRoundBtn.style.opacity = 1;
      gameClient.nextRoundBtn.style.pointerEvents = "auto";
      this.scoreList.innerHTML = "";
      for (var i in gameClient.gameState.users) {
        let element = document.createElement("p");
        element.innerText =
          gameClient.gameState.users[i] + ":" + gameData.score[i];
        this.scoreList.appendChild(element);
      }
      let element = document.createElement("p");
      element.innerText = "Winner is " + gameData.users[gameData.winnerIndex];
      this.scoreList.appendChild(element);

      for (var i in gameData.obstaclePos) {
        let obstacleSprite = document.querySelector(
          "." + gameData.obstaclePos[i]
        );
        obstacleSprite.innerHTML = obstacleSprite.innerHTML =
          '<img src="./img/ufo.svg" />';
      }

      for (var i in gameData.tunnelPos) {
        let obstacleSprite = document.querySelector(
          "." + gameData.tunnelPos[i]
        );
        obstacleSprite.innerHTML = '<img src="./img/escape.svg" />';
      }
      Object.keys(gameData.playerPos).forEach(function (key) {
        if (key == gameClient.displayName) {
          gameClient.currentPos = gameData.playerPos[key];
        } else {
          let otherPlayerBlock = document.querySelector(
            "." + gameData.playerPos[key]
          );
          let existingSprite = document.querySelector("#Pos" + key);
          if (existingSprite != undefined) {
            existingSprite.classList.remove("otherPlayerBlock");
            existingSprite.innerHTML = "";
            existingSprite.id = undefined;
          }
          let id = "Pos" + key;
          otherPlayerBlock.classList.add("otherPlayerBlock");
          otherPlayerBlock.id = id;

          // color select
          var photo = document.getElementById("photo").value;
          console.log("Next game color: " + photo);
          if (gameData.users[gameData.warderIndex] == key) {
            if (photo == "blue") {
              otherPlayerBlock.innerHTML = '<img src="./img/alien.svg" />';
            } else if (photo == "white") {
              otherPlayerBlock.innerHTML = '<img src="./img/alien2.svg" />';
            } else {
              otherPlayerBlock.innerHTML = '<img src="./img/alien3.svg" />';
            }
          } else {
            if (photo == "blue") {
              otherPlayerBlock.innerHTML = '<img src="./img/astro.svg" />';
            } else if (photo == "white") {
              otherPlayerBlock.innerHTML = '<img src="./img/astro2.svg" />';
            } else {
              otherPlayerBlock.innerHTML = '<img src="./img/astro3.svg" />';
            }
          }
        }
      });
      gameClient.gameState = gameData;
      gameClient.currentBlock = document.querySelector(
        "." + gameClient.currentPos
      );
      gameClient.currentBlock.classList.add("currentBlock");

      // color select
      var photo = document.getElementById("photo").value;
      if (gameData.users[gameData.warderIndex] == gameClient.displayName) {
        if (photo == "white") {
          gameClient.currentBlock.innerHTML = '<img src="./img/alien.svg" />';
        } else if (photo == "green") {
          gameClient.currentBlock.innerHTML = '<img src="./img/alien2.svg" />';
        } else {
          gameClient.currentBlock.innerHTML = '<img src="./img/alien3.svg" />';
        }
      } else {
        if (photo == "white") {
          gameClient.currentBlock.innerHTML = '<img src="./img/astro.svg" />';
        } else if (photo == "green") {
          gameClient.currentBlock.innerHTML = '<img src="./img/astro2.svg" />';
        } else {
          gameClient.currentBlock.innerHTML = '<img src="./img/astro3.svg" />';
        }
      }
    });

    socket.on("reGame", (gameData) => {
      console.log("ReGame");
      socket.emit("startGame", this.inRoom);
    });

    socket.on("userLeftRoom", (data) => {
      this.userList.querySelector("#" + data).remove();
    });

    socket.on("cleanGrid", () => {
      this.allGrid.forEach((grid) => {
        grid.classList.remove("currentBlock");
        grid.classList.remove("otherPlayerBlock");
        grid.innerHTML = "";
        grid.id = "";
      });
    });
  }
}

socket.emit("fromIndex", " true");
const gameClient = new GameClient();

let timer = {
  interval: undefined,
  countFrom: 10,
  count: this.countFrom,
  timerHTML: document.querySelector(".timer"),
  moveButton: document.querySelector(".controls"),

  start: function () {
    if (this.interval) {
      clearInterval(this.interval);
    }
    this.count = this.countFrom;
    this.timerHTML.innerText = this.count;
    this.interval = setInterval(this.tick.bind(this), 1000);
  },
  stop: function () {
    this.timerHTML.innerText = "";
    clearInterval(this.interval);
  },
  tick: function () {
    this.count -= 1;
    this.timerHTML.innerText = this.count;
    if (this.count <= 0) {
      this.count = 0;
      clearInterval(this.interval);
      this.timerHTML.innerText = "Time's up! Opponent's turn";
      gameClient.moveButton.style.opacity = 0;
      gameClient.moveButton.style.pointerEvents = "none";
      socket.emit("finishTurn", [gameClient.inRoom, gameClient.currentPos]);
    }
  },
};

// ExtendTimer

let extendTimer = document.querySelector(".extendTimer");
extendTimer.addEventListener("click", () => { 
  timer.start();
  extendTimer.style.display = "none";
});

// BreakObstacle

let breakOb = document.querySelector(".breakObstacle");
breakOb.addEventListener("click", () => {
  let obstacleSprite = document.querySelector(
      "." + gameData.obstaclePos[0]
    );
  obstacleSprite.innerHTML = "";
  breakOb.style.display = "none";
});


const moveUp = document.querySelector(".moveUp");
const moveDown = document.querySelector(".moveDown");
const moveLeft = document.querySelector(".moveLeft");
const moveRight = document.querySelector(".moveRight");



moveUp.addEventListener("click", () => {
  let newPos =
    "x" +
    (parseInt(gameClient.currentPos.charAt(1)) - 1) +
    "y" +
    parseInt(gameClient.currentPos.charAt(3));
  let possible = false;
  for (var i in gameClient.gameState.gridPositions) {
    if (gameClient.gameState.gridPositions[i] == newPos) {
      possible = true;
      if (
        gameClient.gameState.gridPositions[i] ==
          gameClient.gameState.tunnelPos[0] &&
        gameClient.gameState.users[gameClient.gameState.warderIndex] ==
          gameClient.displayName
      ) {
        possible = false;
      }
    }
  }
  if (possible) {
    timer.stop();
    gameClient.moveButton.style.opacity = 0;
    gameClient.moveButton.style.pointerEvents = "none";
    socket.emit("finishTurn", [gameClient.inRoom, newPos]);
    gameClient.currentBlock.classList.remove("currentBlock");
    gameClient.currentBlock.innerHTML = "";
    gameClient.currentPos = newPos;
  }
});
moveDown.addEventListener("click", () => {
  let newPos =
    "x" +
    (parseInt(gameClient.currentPos.charAt(1)) + 1) +
    "y" +
    parseInt(gameClient.currentPos.charAt(3));
  let possible = false;
  for (var i in gameClient.gameState.gridPositions) {
    if (gameClient.gameState.gridPositions[i] == newPos) {
      possible = true;
      if (
        gameClient.gameState.gridPositions[i] ==
          gameClient.gameState.tunnelPos[0] &&
        gameClient.gameState.users[gameClient.gameState.warderIndex] ==
          gameClient.displayName
      ) {
        possible = false;
      }
    }
  }
  if (possible) {
    timer.stop();
    gameClient.moveButton.style.opacity = 0;
    gameClient.moveButton.style.pointerEvents = "none";
    socket.emit("finishTurn", [gameClient.inRoom, newPos]);
    gameClient.currentBlock.classList.remove("currentBlock");
    gameClient.currentBlock.innerHTML = "";
    gameClient.currentPos = newPos;
  }
});
moveLeft.addEventListener("click", () => {
  let newPos =
    "x" +
    parseInt(gameClient.currentPos.charAt(1)) +
    "y" +
    (parseInt(gameClient.currentPos.charAt(3)) - 1);
  let possible = false;
  for (var i in gameClient.gameState.gridPositions) {
    if (gameClient.gameState.gridPositions[i] == newPos) {
      possible = true;
      if (
        gameClient.gameState.gridPositions[i] ==
          gameClient.gameState.tunnelPos[0] &&
        gameClient.gameState.users[gameClient.gameState.warderIndex] ==
          gameClient.displayName
      ) {
        possible = false;
      }
    }
  }
  if (possible) {
    timer.stop();
    gameClient.moveButton.style.opacity = 0;
    gameClient.moveButton.style.pointerEvents = "none";
    socket.emit("finishTurn", [gameClient.inRoom, newPos]);
    gameClient.currentBlock.classList.remove("currentBlock");
    gameClient.currentBlock.innerHTML = "";
    gameClient.currentPos = newPos;
  }
});
moveRight.addEventListener("click", () => {
  let newPos =
    "x" +
    parseInt(gameClient.currentPos.charAt(1)) +
    "y" +
    (parseInt(gameClient.currentPos.charAt(3)) + 1);
  let possible = false;
  for (var i in gameClient.gameState.gridPositions) {
    if (gameClient.gameState.gridPositions[i] == newPos) {
      possible = true;
      if (
        gameClient.gameState.gridPositions[i] ==
          gameClient.gameState.tunnelPos[0] &&
        gameClient.gameState.users[gameClient.gameState.warderIndex] ==
          gameClient.displayName
      ) {
        possible = false;
      }
    }
  }
  if (possible) {
    timer.stop();
    gameClient.moveButton.style.opacity = 0;
    gameClient.moveButton.style.pointerEvents = "none";
    socket.emit("finishTurn", [gameClient.inRoom, newPos]);
    gameClient.currentBlock.classList.remove("currentBlock");
    gameClient.currentBlock.innerHTML = "";
    gameClient.currentPos = newPos;
  }
});

gameClient.init();
