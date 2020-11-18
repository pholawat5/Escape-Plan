const socket = io();

let roomsDiv = document.querySelector('.rooms');
socket.emit("fromAdmin", "true");

socket.on('population', (population) => {
    console.log(population)
    const popNum = document.querySelector('.popNum');
    const items = popNum.children
    popNum.innerText = population;
})

socket.on('RoomUpdate',(roomNames) => {
    roomsDiv.innerHTML = '';
    console.log(roomNames)
    roomNames.map((room)=>{
        let button = document.createElement('button');
        button.innerText = `Reset Room ${room}`
        button.addEventListener('click', ()=>{
            socket.emit('resetRoom', room);
        });
        roomsDiv.appendChild(button)
    })
})

let reset = document.querySelector(".reset");

reset.addEventListener("click", (event) => {
    socket.emit("resetRoom", "true");
});