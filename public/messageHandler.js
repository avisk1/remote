const placeholder = document.getElementById("data");
document.addEventListener('keydown', (event) => {
    if (event.code == "Enter" && document.getElementById("message") == document.activeElement) submit();
});

function submit() {
    const message = document.getElementById("message");
    console.log("Sending message...");
    const credentials = appSystem.getCredentials();
    if (!credentials) {
        modalSystem.alert("You must login before sending a message!");
        return;
    }
    // const tempID = document.getElementsByClassName("pending").length;

    //sending the data
    const xhr = new XMLHttpRequest();
    xhr.open("POST", "/index.html", true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.send(JSON.stringify({
        name: credentials.name,
        message: message.value,
        // tempID: tempID
    }));
    const messageEl = newMessage({ name: credentials.name, message: message.value });
    // messageEl.tempID = tempID; //0, 1, 2, etc
    // messageEl.classList.add("pending");
    message.value = "";
}

//socket.io
const socket = io.connect();

socket.on("message", newMessage);
socket.on("dm", (message) => {
    modalSystem.alert("YESSSSSSS!!!");
    console.log("HERE!!");
    console.log(message);
})
//There's definitely a better way of doing this, but until I come up with a message ID system, it's gonna be this
//Never mind this is just dumb
// function receivedMessage(message) {
//     const pendingMessages = document.getElementsByClassName("pending");
//     for (let i = 0; i < pendingMessages.length; i++) {
//         if (pendingMessages[i].tempID == message.tempID) {

//         }
//     }
// }

function newMessage(message) {
    const messageEl = document.createElement("span");
    messageEl.innerHTML = `${message.name}: ${message.message}<br />`;
    placeholder.appendChild(messageEl);
    return messageEl;
}

function requestData() {
    console.log("Requesting data...");

    //requesting the data
    const xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function() { 
        if (this.readyState == 4 && this.status == 200) {
            placeholder.innerHTML = "";
            const messages = JSON.parse(this.responseText);
            for (let i = 0; i < messages.length; i++) {
                placeholder.innerHTML = `${placeholder.innerHTML}${messages[i].name}: ${messages[i].message}<br />`;
            }
        } else {
            console.log(this.status);
        }
    }
    xhr.open("GET", `/index.html`, true); // true for asynchronous 
    xhr.send();
}

requestData();