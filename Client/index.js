const socket = io();

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
    //Waiting Page
    this.waitingSection = document.querySelector(".waitingRoom");
    this.userList = document.querySelector(".users");
    this.playBtn = document.querySelector(".playNow");
    this.nextRoundBtn = document.querySelector(".nextRound");
    //Game Page
    this.gameSection = document.querySelector(".gamePage");
    this.allGrid = document.querySelectorAll(".box");
    this.currentPos = { x: 1, y: 1 };
    this.currentBlock = document.querySelector(
      ".x" + this.currentPos.x + "y" + this.currentPos.y
    );
    this.moveButton = document.querySelector(".controls");
    this.moveItems = this.moveButton.children;
    this.scoreList = document.querySelector(".userScores");
    this.itemss = this.scoreList.children;
  }

  init() {
    //Welcome Page
    this.loginForm.addEventListener("submit", (event) => {
      event.preventDefault();
      socket.emit("checkUsername", this.displayNameInput.value);
    });
    //FindGame Page
    this.joingameForm.addEventListener("submit", (event) => {
      event.preventDefault();
      this.gameCodeInput = this.joingameForm.querySelector("input");
      socket.emit("checkRoomStatus", this.gameCodeInput.value);
      socket.on("checkRoomStatus", (data) => {
        if (data) {
          this.findGameSection.style.display = "none";
          this.waitingSection.style.display = "flex";
          this.roomWarning.classList.remove("active");
          this.inRoom = this.gameCodeInput.value;
          let user = document.createElement("li");
          user.innerText = gameClient.displayName;
          this.userList.append(user);
        } else {
          this.roomWarning.classList.add("active");
        }
      });
    });

    this.playBtn.addEventListener("click", (event) => {
      socket.emit("startGame", this.inRoom);
    });

    this.nextRoundBtn.addEventListener("click", (event) => {
      socket.emit("startGame", this.inRoom);
      this.nextRoundBtn.style.opacity = 0;
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

    socket.on("checkUsername", (data) => {
      if (data) {
        this.displayName = this.displayNameInput.value;
        this.loginSection.style.display = "none";
        this.findGameSection.style.display = "flex";
        this.nameWarning.classList.remove("active");
      } else {
        this.nameWarning.classList.add("active");
      }
    });

    socket.on("gameStart", (gameData) => {
      console.log(gameData);
      this.nextRoundBtn.style.opacity = 0;
      this.waitingSection.style.display = "none";
      this.gameSection.style.display = "flex";
      console.log(gameData);
      if (gameData.turn == gameClient.displayName) {
        console.log("Your Turn!");
        gameClient.moveButton.style.opacity = 1;
        timer.timerHTML.style.opacity = 1;
        timer.start();
      }

      for (var i in gameData.obstaclePos) {
        let obstacleSprite = document.querySelector(
          "." + gameData.obstaclePos[i]
        );
        obstacleSprite.innerHTML =
          '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="iconmonstr-x-mark-1 1" clip-path="url(#clip0)"><path id="Vector" d="M24 20.188L15.685 11.979L23.885 3.697L20.188 0L11.976 8.318L3.666 0.115L0 3.781L8.321 12.021L0.115 20.334L3.781 24L12.018 15.682L20.303 23.885L24 20.188Z" fill="white"/></g><defs><clipPath id="clip0"><rect width="24" height="24" fill="white"/></clipPath></defs></svg>';
      }

      for (var i in gameData.tunnelPos) {
        let obstacleSprite = document.querySelector(
          "." + gameData.tunnelPos[i]
        );
        obstacleSprite.innerHTML =
          '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="iconmonstr-door-5 1"><path id="Vector" fill-rule="evenodd" clip-rule="evenodd" d="M13 2V0L23 3V21L13 24V22H4V15H5V21H13V3H5V10H4V2H13ZM10.053 12L6.76 8.707L7.467 8L11.967 12.5L7.467 17L6.76 16.293L10.053 13H1V12H10.053Z" fill="white"/></g></svg>';
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
          if (gameData.users[gameData.warderIndex] == key) {
            otherPlayerBlock.innerHTML =
              '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"> <g id="iconmonstr-police-1 1"> <path id="Vector" d="M20.377 11.082C20.317 13.011 18.148 14.208 11.968 14.208C5.775 14.208 3.61 13.005 3.559 11.069C5.067 11.069 7.938 9.111 11.968 9.111C15.895 9.11 19.112 11.082 20.377 11.082ZM11.969 15.172C9.907 15.172 8.229 15.041 6.891 14.775C6.953 15.33 7.36 18.097 9.3 18.097C11.021 18.097 10.973 16.781 12.021 16.781C13.068 16.781 13.19 18.097 14.873 18.097C16.963 18.097 17.333 15.034 17.367 14.708C15.98 15.019 14.198 15.172 11.969 15.172V15.172ZM18.374 14.431C18.334 16.602 17.657 19.2 16.094 20.868C15.046 21.987 13.717 22.555 12.145 22.555C10.57 22.555 9.247 22.022 8.214 20.973C6.568 19.3 5.912 16.628 5.818 14.512C5.295 14.354 4.808 14.165 4.334 13.884C4.318 16.356 5.038 19.826 7.155 21.978C8.476 23.319 10.155 24 12.145 24C14.117 24 15.857 23.255 17.178 21.847C19.309 19.574 19.938 16.168 19.839 13.736C19.38 14.044 18.895 14.257 18.374 14.431V14.431ZM12.137 3.447L11.824 4.07L11.123 4.17L11.63 4.655L11.511 5.34L12.137 5.016L12.764 5.34L12.644 4.655L13.151 4.17L12.451 4.07L12.137 3.447ZM19.348 3.241C19.348 3.241 16.811 2.555 12 0C7.188 2.555 4.652 3.241 4.652 3.241C4.652 3.241 3.357 5.641 1 8.257L3.266 10.165C4.799 10 7.906 8.083 12 8.083C16.094 8.083 19.201 10 20.734 10.166L23 8.257C20.643 5.641 19.348 3.241 19.348 3.241V3.241ZM13.003 6.455C12.477 6.586 12.398 6.643 12.128 6.857C11.859 6.643 11.779 6.586 11.253 6.455C10.522 6.272 10.102 5.799 10.102 5.156C10.102 4.797 10.249 4.465 10.42 4.01C10.612 3.497 10.503 3.335 10.301 3.128L10.13 2.952L11.117 2.133C11.215 2.231 11.352 2.411 11.603 2.411C11.851 2.411 12.019 2.236 12.131 2.14C12.233 2.23 12.399 2.411 12.654 2.411C12.902 2.411 13.035 2.24 13.144 2.13L14.127 2.953L13.955 3.129C13.753 3.336 13.644 3.498 13.836 4.011C14.006 4.466 14.154 4.797 14.154 5.157C14.154 5.798 13.734 6.272 13.003 6.455V6.455Z" fill="black"/> </g></svg>';
          } else {
            otherPlayerBlock.innerHTML =
              '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="iconmonstr-generation-3 1" clip-path="url(#clip0)"><path id="Vector" d="M16.5 11.5C16.5 12.328 15.94 13 15.25 13C14.56 13 14 12.328 14 11.5C14 10.672 14.56 10 15.25 10C15.94 10 16.5 10.672 16.5 11.5ZM8.75 10C8.06 10 7.5 10.672 7.5 11.5C7.5 12.328 8.06 13 8.75 13C9.44 13 10 12.328 10 11.5C10 10.672 9.44 10 8.75 10ZM12 18.354C14.235 18.354 15 16 15 16H9C9 16 9.847 18.354 12 18.354ZM24 12.551C24 14.476 23.104 17.289 20.683 17.739C18.724 21.231 15.806 23 12 23C8.195 23 5.276 21.231 3.317 17.74C0.897 17.289 0 14.477 0 12.551C0 10.412 0.804 8.458 2.843 8.328C3.296 3.229 6.789 0 12 0C17.211 0 20.704 3.229 21.157 8.329C23.193 8.458 24 10.402 24 12.551ZM22 12.551C22 11.467 21.771 10.695 21.369 10.434C21.097 10.257 20.754 10.33 20.613 10.393C19.955 10.686 19.207 10.203 19.207 9.479C19.207 8.724 19.107 7.233 18.464 5.779C17.305 3.623 15.777 7.087 12 7.087C8.223 7.087 6.695 3.623 5.536 5.78C4.893 7.233 4.793 8.724 4.793 9.48C4.793 10.199 4.049 10.689 3.387 10.394C3.244 10.331 2.904 10.258 2.631 10.435C1.529 11.152 1.833 15.761 3.967 15.802C4.335 15.809 4.67 16.018 4.838 16.345C7.228 21 10.82 21 12 21C13.181 21 16.771 21 19.162 16.345C19.33 16.017 19.665 15.809 20.032 15.802C21.885 15.766 22 12.583 22 12.551V12.551Z" fill="black"/></g><defs><clipPath id="clip0"><rect width="24" height="24" fill="white"/></clipPath></defs></svg>';
          }
        }
      });
      gameClient.gameState = gameData;
      gameClient.currentBlock = document.querySelector(
        "." + gameClient.currentPos
      );
      gameClient.currentBlock.classList.add("currentBlock");
      if (gameData.users[gameData.warderIndex] == gameClient.displayName) {
        gameClient.currentBlock.innerHTML =
          '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"> <g id="iconmonstr-police-1 1"> <path id="Vector" d="M20.377 11.082C20.317 13.011 18.148 14.208 11.968 14.208C5.775 14.208 3.61 13.005 3.559 11.069C5.067 11.069 7.938 9.111 11.968 9.111C15.895 9.11 19.112 11.082 20.377 11.082ZM11.969 15.172C9.907 15.172 8.229 15.041 6.891 14.775C6.953 15.33 7.36 18.097 9.3 18.097C11.021 18.097 10.973 16.781 12.021 16.781C13.068 16.781 13.19 18.097 14.873 18.097C16.963 18.097 17.333 15.034 17.367 14.708C15.98 15.019 14.198 15.172 11.969 15.172V15.172ZM18.374 14.431C18.334 16.602 17.657 19.2 16.094 20.868C15.046 21.987 13.717 22.555 12.145 22.555C10.57 22.555 9.247 22.022 8.214 20.973C6.568 19.3 5.912 16.628 5.818 14.512C5.295 14.354 4.808 14.165 4.334 13.884C4.318 16.356 5.038 19.826 7.155 21.978C8.476 23.319 10.155 24 12.145 24C14.117 24 15.857 23.255 17.178 21.847C19.309 19.574 19.938 16.168 19.839 13.736C19.38 14.044 18.895 14.257 18.374 14.431V14.431ZM12.137 3.447L11.824 4.07L11.123 4.17L11.63 4.655L11.511 5.34L12.137 5.016L12.764 5.34L12.644 4.655L13.151 4.17L12.451 4.07L12.137 3.447ZM19.348 3.241C19.348 3.241 16.811 2.555 12 0C7.188 2.555 4.652 3.241 4.652 3.241C4.652 3.241 3.357 5.641 1 8.257L3.266 10.165C4.799 10 7.906 8.083 12 8.083C16.094 8.083 19.201 10 20.734 10.166L23 8.257C20.643 5.641 19.348 3.241 19.348 3.241V3.241ZM13.003 6.455C12.477 6.586 12.398 6.643 12.128 6.857C11.859 6.643 11.779 6.586 11.253 6.455C10.522 6.272 10.102 5.799 10.102 5.156C10.102 4.797 10.249 4.465 10.42 4.01C10.612 3.497 10.503 3.335 10.301 3.128L10.13 2.952L11.117 2.133C11.215 2.231 11.352 2.411 11.603 2.411C11.851 2.411 12.019 2.236 12.131 2.14C12.233 2.23 12.399 2.411 12.654 2.411C12.902 2.411 13.035 2.24 13.144 2.13L14.127 2.953L13.955 3.129C13.753 3.336 13.644 3.498 13.836 4.011C14.006 4.466 14.154 4.797 14.154 5.157C14.154 5.798 13.734 6.272 13.003 6.455V6.455Z" fill="black"/> </g></svg>';
      } else {
        gameClient.currentBlock.innerHTML =
          '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="iconmonstr-generation-3 1" clip-path="url(#clip0)"><path id="Vector" d="M16.5 11.5C16.5 12.328 15.94 13 15.25 13C14.56 13 14 12.328 14 11.5C14 10.672 14.56 10 15.25 10C15.94 10 16.5 10.672 16.5 11.5ZM8.75 10C8.06 10 7.5 10.672 7.5 11.5C7.5 12.328 8.06 13 8.75 13C9.44 13 10 12.328 10 11.5C10 10.672 9.44 10 8.75 10ZM12 18.354C14.235 18.354 15 16 15 16H9C9 16 9.847 18.354 12 18.354ZM24 12.551C24 14.476 23.104 17.289 20.683 17.739C18.724 21.231 15.806 23 12 23C8.195 23 5.276 21.231 3.317 17.74C0.897 17.289 0 14.477 0 12.551C0 10.412 0.804 8.458 2.843 8.328C3.296 3.229 6.789 0 12 0C17.211 0 20.704 3.229 21.157 8.329C23.193 8.458 24 10.402 24 12.551ZM22 12.551C22 11.467 21.771 10.695 21.369 10.434C21.097 10.257 20.754 10.33 20.613 10.393C19.955 10.686 19.207 10.203 19.207 9.479C19.207 8.724 19.107 7.233 18.464 5.779C17.305 3.623 15.777 7.087 12 7.087C8.223 7.087 6.695 3.623 5.536 5.78C4.893 7.233 4.793 8.724 4.793 9.48C4.793 10.199 4.049 10.689 3.387 10.394C3.244 10.331 2.904 10.258 2.631 10.435C1.529 11.152 1.833 15.761 3.967 15.802C4.335 15.809 4.67 16.018 4.838 16.345C7.228 21 10.82 21 12 21C13.181 21 16.771 21 19.162 16.345C19.33 16.017 19.665 15.809 20.032 15.802C21.885 15.766 22 12.583 22 12.551V12.551Z" fill="black"/></g><defs><clipPath id="clip0"><rect width="24" height="24" fill="white"/></clipPath></defs></svg>';
      }

      console.log(gameClient.gameState);
      this.scoreList.innerHTML = "";
      for (var i in gameClient.gameState.users) {
        let element = document.createElement("p");
        element.innerText =
          gameClient.gameState.users[i] + ":" + gameClient.gameState.score[i];

        this.scoreList.appendChild(element);
      }
    });

    socket.on("gameOver", (gameData) => {
      this.nextRoundBtn.style.opacity = 1;
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
        obstacleSprite.innerHTML =
          '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="iconmonstr-x-mark-1 1" clip-path="url(#clip0)"><path id="Vector" d="M24 20.188L15.685 11.979L23.885 3.697L20.188 0L11.976 8.318L3.666 0.115L0 3.781L8.321 12.021L0.115 20.334L3.781 24L12.018 15.682L20.303 23.885L24 20.188Z" fill="white"/></g><defs><clipPath id="clip0"><rect width="24" height="24" fill="white"/></clipPath></defs></svg>';
      }

      for (var i in gameData.tunnelPos) {
        let obstacleSprite = document.querySelector(
          "." + gameData.tunnelPos[i]
        );
        obstacleSprite.innerHTML =
          '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="iconmonstr-door-5 1"><path id="Vector" fill-rule="evenodd" clip-rule="evenodd" d="M13 2V0L23 3V21L13 24V22H4V15H5V21H13V3H5V10H4V2H13ZM10.053 12L6.76 8.707L7.467 8L11.967 12.5L7.467 17L6.76 16.293L10.053 13H1V12H10.053Z" fill="white"/></g></svg>';
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
          if (gameData.users[gameData.warderIndex] == key) {
            otherPlayerBlock.innerHTML =
              '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"> <g id="iconmonstr-police-1 1"> <path id="Vector" d="M20.377 11.082C20.317 13.011 18.148 14.208 11.968 14.208C5.775 14.208 3.61 13.005 3.559 11.069C5.067 11.069 7.938 9.111 11.968 9.111C15.895 9.11 19.112 11.082 20.377 11.082ZM11.969 15.172C9.907 15.172 8.229 15.041 6.891 14.775C6.953 15.33 7.36 18.097 9.3 18.097C11.021 18.097 10.973 16.781 12.021 16.781C13.068 16.781 13.19 18.097 14.873 18.097C16.963 18.097 17.333 15.034 17.367 14.708C15.98 15.019 14.198 15.172 11.969 15.172V15.172ZM18.374 14.431C18.334 16.602 17.657 19.2 16.094 20.868C15.046 21.987 13.717 22.555 12.145 22.555C10.57 22.555 9.247 22.022 8.214 20.973C6.568 19.3 5.912 16.628 5.818 14.512C5.295 14.354 4.808 14.165 4.334 13.884C4.318 16.356 5.038 19.826 7.155 21.978C8.476 23.319 10.155 24 12.145 24C14.117 24 15.857 23.255 17.178 21.847C19.309 19.574 19.938 16.168 19.839 13.736C19.38 14.044 18.895 14.257 18.374 14.431V14.431ZM12.137 3.447L11.824 4.07L11.123 4.17L11.63 4.655L11.511 5.34L12.137 5.016L12.764 5.34L12.644 4.655L13.151 4.17L12.451 4.07L12.137 3.447ZM19.348 3.241C19.348 3.241 16.811 2.555 12 0C7.188 2.555 4.652 3.241 4.652 3.241C4.652 3.241 3.357 5.641 1 8.257L3.266 10.165C4.799 10 7.906 8.083 12 8.083C16.094 8.083 19.201 10 20.734 10.166L23 8.257C20.643 5.641 19.348 3.241 19.348 3.241V3.241ZM13.003 6.455C12.477 6.586 12.398 6.643 12.128 6.857C11.859 6.643 11.779 6.586 11.253 6.455C10.522 6.272 10.102 5.799 10.102 5.156C10.102 4.797 10.249 4.465 10.42 4.01C10.612 3.497 10.503 3.335 10.301 3.128L10.13 2.952L11.117 2.133C11.215 2.231 11.352 2.411 11.603 2.411C11.851 2.411 12.019 2.236 12.131 2.14C12.233 2.23 12.399 2.411 12.654 2.411C12.902 2.411 13.035 2.24 13.144 2.13L14.127 2.953L13.955 3.129C13.753 3.336 13.644 3.498 13.836 4.011C14.006 4.466 14.154 4.797 14.154 5.157C14.154 5.798 13.734 6.272 13.003 6.455V6.455Z" fill="black"/> </g></svg>';
          } else {
            otherPlayerBlock.innerHTML =
              '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="iconmonstr-generation-3 1" clip-path="url(#clip0)"><path id="Vector" d="M16.5 11.5C16.5 12.328 15.94 13 15.25 13C14.56 13 14 12.328 14 11.5C14 10.672 14.56 10 15.25 10C15.94 10 16.5 10.672 16.5 11.5ZM8.75 10C8.06 10 7.5 10.672 7.5 11.5C7.5 12.328 8.06 13 8.75 13C9.44 13 10 12.328 10 11.5C10 10.672 9.44 10 8.75 10ZM12 18.354C14.235 18.354 15 16 15 16H9C9 16 9.847 18.354 12 18.354ZM24 12.551C24 14.476 23.104 17.289 20.683 17.739C18.724 21.231 15.806 23 12 23C8.195 23 5.276 21.231 3.317 17.74C0.897 17.289 0 14.477 0 12.551C0 10.412 0.804 8.458 2.843 8.328C3.296 3.229 6.789 0 12 0C17.211 0 20.704 3.229 21.157 8.329C23.193 8.458 24 10.402 24 12.551ZM22 12.551C22 11.467 21.771 10.695 21.369 10.434C21.097 10.257 20.754 10.33 20.613 10.393C19.955 10.686 19.207 10.203 19.207 9.479C19.207 8.724 19.107 7.233 18.464 5.779C17.305 3.623 15.777 7.087 12 7.087C8.223 7.087 6.695 3.623 5.536 5.78C4.893 7.233 4.793 8.724 4.793 9.48C4.793 10.199 4.049 10.689 3.387 10.394C3.244 10.331 2.904 10.258 2.631 10.435C1.529 11.152 1.833 15.761 3.967 15.802C4.335 15.809 4.67 16.018 4.838 16.345C7.228 21 10.82 21 12 21C13.181 21 16.771 21 19.162 16.345C19.33 16.017 19.665 15.809 20.032 15.802C21.885 15.766 22 12.583 22 12.551V12.551Z" fill="black"/></g><defs><clipPath id="clip0"><rect width="24" height="24" fill="white"/></clipPath></defs></svg>';
          }
        }
      });
      gameClient.gameState = gameData;
      gameClient.currentBlock = document.querySelector(
        "." + gameClient.currentPos
      );
      gameClient.currentBlock.classList.add("currentBlock");
      if (gameData.users[gameData.warderIndex] == gameClient.displayName) {
        gameClient.currentBlock.innerHTML =
          '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"> <g id="iconmonstr-police-1 1"> <path id="Vector" d="M20.377 11.082C20.317 13.011 18.148 14.208 11.968 14.208C5.775 14.208 3.61 13.005 3.559 11.069C5.067 11.069 7.938 9.111 11.968 9.111C15.895 9.11 19.112 11.082 20.377 11.082ZM11.969 15.172C9.907 15.172 8.229 15.041 6.891 14.775C6.953 15.33 7.36 18.097 9.3 18.097C11.021 18.097 10.973 16.781 12.021 16.781C13.068 16.781 13.19 18.097 14.873 18.097C16.963 18.097 17.333 15.034 17.367 14.708C15.98 15.019 14.198 15.172 11.969 15.172V15.172ZM18.374 14.431C18.334 16.602 17.657 19.2 16.094 20.868C15.046 21.987 13.717 22.555 12.145 22.555C10.57 22.555 9.247 22.022 8.214 20.973C6.568 19.3 5.912 16.628 5.818 14.512C5.295 14.354 4.808 14.165 4.334 13.884C4.318 16.356 5.038 19.826 7.155 21.978C8.476 23.319 10.155 24 12.145 24C14.117 24 15.857 23.255 17.178 21.847C19.309 19.574 19.938 16.168 19.839 13.736C19.38 14.044 18.895 14.257 18.374 14.431V14.431ZM12.137 3.447L11.824 4.07L11.123 4.17L11.63 4.655L11.511 5.34L12.137 5.016L12.764 5.34L12.644 4.655L13.151 4.17L12.451 4.07L12.137 3.447ZM19.348 3.241C19.348 3.241 16.811 2.555 12 0C7.188 2.555 4.652 3.241 4.652 3.241C4.652 3.241 3.357 5.641 1 8.257L3.266 10.165C4.799 10 7.906 8.083 12 8.083C16.094 8.083 19.201 10 20.734 10.166L23 8.257C20.643 5.641 19.348 3.241 19.348 3.241V3.241ZM13.003 6.455C12.477 6.586 12.398 6.643 12.128 6.857C11.859 6.643 11.779 6.586 11.253 6.455C10.522 6.272 10.102 5.799 10.102 5.156C10.102 4.797 10.249 4.465 10.42 4.01C10.612 3.497 10.503 3.335 10.301 3.128L10.13 2.952L11.117 2.133C11.215 2.231 11.352 2.411 11.603 2.411C11.851 2.411 12.019 2.236 12.131 2.14C12.233 2.23 12.399 2.411 12.654 2.411C12.902 2.411 13.035 2.24 13.144 2.13L14.127 2.953L13.955 3.129C13.753 3.336 13.644 3.498 13.836 4.011C14.006 4.466 14.154 4.797 14.154 5.157C14.154 5.798 13.734 6.272 13.003 6.455V6.455Z" fill="black"/> </g></svg>';
      } else {
        gameClient.currentBlock.innerHTML =
          '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="iconmonstr-generation-3 1" clip-path="url(#clip0)"><path id="Vector" d="M16.5 11.5C16.5 12.328 15.94 13 15.25 13C14.56 13 14 12.328 14 11.5C14 10.672 14.56 10 15.25 10C15.94 10 16.5 10.672 16.5 11.5ZM8.75 10C8.06 10 7.5 10.672 7.5 11.5C7.5 12.328 8.06 13 8.75 13C9.44 13 10 12.328 10 11.5C10 10.672 9.44 10 8.75 10ZM12 18.354C14.235 18.354 15 16 15 16H9C9 16 9.847 18.354 12 18.354ZM24 12.551C24 14.476 23.104 17.289 20.683 17.739C18.724 21.231 15.806 23 12 23C8.195 23 5.276 21.231 3.317 17.74C0.897 17.289 0 14.477 0 12.551C0 10.412 0.804 8.458 2.843 8.328C3.296 3.229 6.789 0 12 0C17.211 0 20.704 3.229 21.157 8.329C23.193 8.458 24 10.402 24 12.551ZM22 12.551C22 11.467 21.771 10.695 21.369 10.434C21.097 10.257 20.754 10.33 20.613 10.393C19.955 10.686 19.207 10.203 19.207 9.479C19.207 8.724 19.107 7.233 18.464 5.779C17.305 3.623 15.777 7.087 12 7.087C8.223 7.087 6.695 3.623 5.536 5.78C4.893 7.233 4.793 8.724 4.793 9.48C4.793 10.199 4.049 10.689 3.387 10.394C3.244 10.331 2.904 10.258 2.631 10.435C1.529 11.152 1.833 15.761 3.967 15.802C4.335 15.809 4.67 16.018 4.838 16.345C7.228 21 10.82 21 12 21C13.181 21 16.771 21 19.162 16.345C19.33 16.017 19.665 15.809 20.032 15.802C21.885 15.766 22 12.583 22 12.551V12.551Z" fill="black"/></g><defs><clipPath id="clip0"><rect width="24" height="24" fill="white"/></clipPath></defs></svg>';
      }
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
      this.timerHTML.innerText = "Time's Up";
      gameClient.moveButton.style.opacity = 0;
      socket.emit("finishTurn", [gameClient.inRoom, gameClient.currentPos]);
    }
  },
};

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
    socket.emit("finishTurn", [gameClient.inRoom, newPos]);
    gameClient.currentBlock.classList.remove("currentBlock");
    gameClient.currentBlock.innerHTML = "";
    gameClient.currentPos = newPos;
  }
});

gameClient.init();
