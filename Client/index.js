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
    this.gameSection = document.querySelector(".gamePage");
    this.waitingSection = document.querySelector(".waitingRoom");
    this.userList = document.querySelector(".users");
    this.playBtn = document.querySelector(".playNow");
  }

  init() {
    //Welcome Page
    this.loginForm.addEventListener("submit", (event) => {
      event.preventDefault();
      socket.emit("checkUsername", this.displayNameInput.value);
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

    socket.on("existingUser", (data) => {
      let users = JSON.parse(data);
      for (var i in users) {
        let otherUser = document.createElement("li");
        otherUser.id = users[i];
        otherUser.innerText = users[i];
        this.userList.appendChild(otherUser);
      }
    });

    this.playBtn.addEventListener("click", (event) => {
      socket.emit("startGame", this.inRoom);
    });

    socket.on("gameStart", () => {
      this.waitingSection.style.display = "none";
      this.gameSection.style.display = "flex";
    });

    socket.on("userLeftRoom", (data) => {
      this.userList.querySelector("#" + data).remove();
    });
  }
}
socket.emit("fromIndex", " true");
const gameClient = new GameClient();
gameClient.init();
