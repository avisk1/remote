//GAHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHH!!!

// ******** Modal System ******** \\

// console.log(window.test());

const getModalInput = (modal) => {
    if (!modal) return;
    const inputs = modal.getElementsByTagName("input");
    const returnObj = { };
    for (let i = 0; i < inputs.length; i++) {
        returnObj[inputs[i].id] = inputs[i].value;
    }
    return returnObj;
}

const createAlert = (message) => {
  createModal(`<p>${message}</p><button class="alert-button">Ok</button>`, ((modal) => {
    // const alertButtons = document.getElementsByClassName("alert");
    // const button = alertButtons[alertButtons[alertButtons.length - 1]];
    const button = modal.querySelector(".alert-button");
    button.addEventListener("click", () => {
      closeModal(modal.parentNode.parentNode);
    })
    //for some reason closeModal is being called multiple times?
    // document.addEventListener("keydown", (event) => {
    //     //if the key pressed is "enter" and there are no inputs in this modal
    //     console.log(modal);
    //     if (!document.body.contains(modal)) return;
    //     console.log(modal.getElementsByTagName("input").length);
    //     if (event.code == "Enter" && modal.getElementsByTagName("input").length == 0) {
    //         //this might need changing later
    //         console.log("here");
    //         closeModal(modal.parentNode.parentNode);
    //     }
    // });
  }), true, true, true, "20%");
}

const prompt = (prompt) => {
  const promptModal = createModal(`<p>${prompt}</p><br /><input class="prompt-input" /><br /><button class="prompt-button">Ok</button>`, null, true, false, true, "20%");
  return promptModal;
}


const createModal = (content, functionCall, centered = false, mandatory = false, top = false, width) => {

  //modal
  const modal = document.createElement("DIV");
  modal.classList.add("modal");

  modal.mandatory = mandatory;

  document.body.appendChild(modal);

  console.log(modal);

  document.activeElement.blur();

  //modal content
  const modalContent = document.createElement("DIV");
  modalContent.classList.add("modal-content");

 

  if (width) {
    modalContent.style.width = width;
  }

  modal.appendChild(modalContent);

  if (!mandatory) {
    modal.addEventListener("click", (event) => {
      if (event.target !== modal) return;
      closeModal(modal);
    });
    //modal close button
    const modalClose = document.createElement("SPAN");
    modalClose.classList.add("modal-close");
    modalClose.innerHTML = "✕";


    modalClose.addEventListener("click", (event) => {
      if (event.target !== modalClose) return;
      closeModal(modal);
    });
    modalContent.appendChild(modalClose);

  }

  const contentContainer = document.createElement("DIV");
  contentContainer.classList.add("modal-content-inner");
  contentContainer.innerHTML = content;

  modalContent.appendChild(contentContainer);

  const innerModal = modalContent.querySelector(".modal-content-inner");

  if (centered) {
    innerModal.classList.add("centered");
  }

  //checks if there's a function call that goes along with the modal
  if (functionCall) {
    //yes, I know, it's confusing
    functionCall(innerModal);
  }

  if (top) {
      console.log(window.getComputedStyle(modalContent).height)
      modalContent.style.top = "-" + (parseInt(window.getComputedStyle(modalContent).height.slice(0, -2)) + 115) + "px"; //add 20
      setTimeout(() => {
        modalContent.style.top = "0px";
      }, 10);
  }

  const firstInput = modalContent.querySelector("input");
  if (firstInput) firstInput.focus();

  return modal;

}



const getSelectedModal = () => {
    const modals = document.getElementsByClassName("modal");
    if (modals.length != 0) {
        return modals[modals.length - 1];
    } else {
        return false;
    }
}

const closeModal = (modal) => {
  console.log("Closing a modal...");
  //not necessary, but ok
  modal.style.display = "none";
  if (modal.parentNode) {
    modal.parentNode.removeChild(modal);
  } else {
      console.warn("No parent node found")
  }
}


// ******** Database ******** \\

//i hate async
window.appSystem.connectDatabase().then(() => {
    createAlert("Database connected!");
})





// ******** App System ******* \\

const saltRounds = 8;

const loadingMessage = (message, modal) => {
    console.log(modal);
    modal.innerHTML = `<p>${message}...</p>`;
    console.log(modal.innerHTML);
    //what the heck
    //this is by far the most annoying and confusing glitch I've ever encountered
    const waiting = setInterval(() => {
        if (modal.innerHTML == `<p>${message}...</p>` || modal.innerHTML == `<p>${message}....</p>`) {
            let whatthefreakingheckisgoingon;
            //I give up
            if (modal.innerHTML == `<p>${message}...</p>`) {
                whatthefreakingheckisgoingon = -7;
            } else {
                whatthefreakingheckisgoingon = -8;
            }
            modal.innerHTML = modal.innerHTML.slice(0, whatthefreakingheckisgoingon) + "</p>";
        } else {
            //GAHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHH
            //WHY
            //HOW IN THE WORLD AM I SUPPOSED TO FIX THIS
            //IT'S LITERALLY NOT EVEN GOING IN HERE BEFORE ANYTHING
            modal.innerHTML = modal.innerHTML.slice(0, -4) + ".</p>";
        }
    }, 500);
    return waiting;
}

// createAlert("test!");
// loadingMessage("testing", document.getElementsByClassName("modal-content-inner")[document.getElementsByClassName("modal-content-inner").length - 1])

async function asyncGAH (modal) {
    
    const ihatepromises = new Promise((resolve, reject) => {
        if (window.appSystem.getUser()) {
            resolve();
        } else if (!modal) {
            createModal(``, null, false, true, true, "20%");
        }
        //I use this so much I may as well make a function for it
        modal.innerHTML = "<p>Connecting to database...</p>";
        //setInterval is so annoying it's gonna make me use async
        const waiting = setInterval(() => {
            if (modal.innerHTML == "<p>Connecting to database...</p>") {
                modal.innerHTML = modal.innerHTML.slice(0, -7) + "</p>";
            } else {
                modal.innerHTML = modal.innerHTML.slice(0, -4) + ".</p>";
            }
            if (window.appSystem.getUser()) {
                clearInterval(waiting);
                resolve();
            }
        }, 500);
    })
    return ihatepromises;
}

const getRooms = () => {
    return io.of("/").adapter.rooms;
}

class Client {
    //add more credentials later
    constructor(name, email) {
        this.name = name;
        this.email = email;
        this.selectedRoom;
    }
    selectRoom(selectedRoom) {
        this.selectedRoom = selectedRoom;
    }
}
let client;

const nameField = document.getElementById("name");

const rooms = document.getElementById("rooms");
rooms.addEventListener("input", () => {
    requestData(rooms.value);
})

const login = () => {
    //modal stuff before submit()
    function submit(modal) {
        const modalLogin = document.getElementById("modal-login");
        function mongoSucks(data) {
            console.log(modal);
            const waiting = loadingMessage("Searching for user", modal);
            window.appSystem.findUser({ email: data.email }).then((userData) => {
                if (userData.err) console.error(userData.err);
                let user = userData.user;
                clearInterval(waiting);
                if (user.length != 0) {
                    user = user[0];
                    const waitingPassword = loadingMessage("Checking password", modal);
                    window.appSystem.comparePassword(data.password, user.password).then((passwordData) => {

                        //I just realized I could just clearInterval here smh
                        if (passwordData.err) console.error(passwordData.err);
                        clearInterval(waitingPassword);
                        closeModal(modal.parentNode.parentNode);
                        let result = passwordData.result;
                        if (result) {
                            createAlert("Login successful!");
                            nameField.value = user.name;
                            client = new Client(user.name, user.email);

                            //uncomment this when I add an actual cache
                            // const roomsList = document.getElementById("rooms");
                            // const rooms = getRooms();
                            // for (let i = 0; i < rooms.length; i++) {

                            // }
                        } else {
                            createAlert("Incorrect password! (yes I'm practically the only developer who has this very basic feature)");
                            //probably cause everyone uses a different encrypter/validator
                        }
                    });
                } else {
                    closeModal(modal.parentNode.parentNode);
                    createAlert("User not found! (yes, I'm practically the only developer who has this very basic feature)");
                }
            });
        }
        modalLogin.addEventListener("click", () => {
            const data = getModalInput(modal);
            //check from database
            //ummm...
            asyncGAH(modal).then(() => {
                mongoSucks(data);
            })
        })
    
    }
    const loginHTML = `
        <h2>Login</h2>
        <hr><br>

        <span class="setting">Email</span>
        <input id="email" />
        <br />
        <span class="setting" title="(don't worry, it's probably safe)">Password</span>
        <input id="password" type="password" />
        <br />
        <button id="modal-login">Login</button>
    `;
    createModal(loginHTML, submit, false, false, true);
}

//at some point create a collection for each room
const joinRoom = (roomName) => {
    socket.emit("join-request", { room: roomName });
    const roomsList = document.getElementById("rooms");
    const option = document.createElement("option");
    option.value = roomName;
    option.innerText = roomName;
    roomsList.appendChild(option);
    createAlert("Successfully joined room \"test\"");
}

const register = () => {
    function submit(modal) {
        const modalRegister = document.getElementById("modal-register");
        function mongoSucks(data) {
            const waiting = loadingMessage("Hashing password", modal);
            //encrypt and send it to the database
            window.appSystem.hash(data.password, saltRounds).then((result) => {

                //DON'T, and I mean DON'T make ANY errors inside the bcrypt callback function

                //THIS is what I had to resort to
                // post({message: "been hashed", err: error, type: typeof(err), new: true }, "/logger.js")

                //OH. MY. GOSH. THIS LINE SHOULD THROW AN ERROR, NOT CRASH EVERYTHING! Another one of Electron's many excruciatingly painful bugs
                // const modal = modalSystem.getSelectedParentModal();

                //Happy?
                //(this line wasn't even necessary until later lol)
                // const modal = modalSystem.getSelectedModalParent();

                //Come to think of it, this might be bcrypt's fault, because it only occurs inside bcrypt's hash's callback function

                if (result.error) {
                    console.error(result.error);
                    createAlert("error with hashing password oops I've said too much");
                    return;
                }
                clearInterval(waiting);
                data.password = result.hash;
                // const user = new User(data);
                const user = window.appSystem.newUser(data);
                const saving = loadingMessage("Saving user", modal);
                window.appSystem.saveUser(user).then((err) => {
                    clearInterval(saving);
                    closeModal(modal.parentNode.parentNode);
                    if (err) {
                        if (err.name === 'MongoError' && err.code === 11000) {
                            // Duplicate email
                            console.log('User already exists under this email!');
                            createAlert("User already exists under this email!");
                            return;
                        } else {
                            console.log("You have an error, sir:");
                            createAlert("Error registering");
                            console.error(err);
                        }
                    } else {
                        console.log("Saved user successfully.");
                        createAlert("You have been registered successfully!");
                    }
                });
            });
        }
        modalRegister.addEventListener("click", () => {
            const data = getModalInput(modal);
            data.dateJoined = new Date().toISOString().slice(0, 10);
            data.os = window.appSystem.getOS();
            if (data.password.length < 8) {
                createAlert("Your password must have at least 8 characters!");
                return;
            }
            if (data.name.length == 0) {
                createAlert("Please enter a valid name (aka not nothing)");
                return;
            }
            if (data.email.length == 0) {
                createAlert("Please enter a valid email (aka not nothing)");
                return;
            }
            //this used to be so long...
            asyncGAH(modal).then(() => {
                mongoSucks(data);
            })
        })
    }
    const registerHTML = `
        <h2>Register</h2>
        <hr><br>

        <span class="setting">Name</span>
        <input id="name" />
        <br />
        <span class="setting">Email</span>
        <input id="email" />
        <br />
        <span class="setting" title="(don't worry, it's probably safe)">Password</span>
        <input id="password" type="password" />
        <br />
        <button id="modal-register">Register</button>
    `;
  createModal(registerHTML, submit, false, false, true);
}

const logout = () => {
    if (client) {
        client = undefined;
        nameField.value = "";
        createAlert("Successfully logged out");
    } else {
        createAlert("You aren't logged in!");
    }
}

const loginButton = document.getElementById("login-button");
loginButton.addEventListener("click", login)

const registerButton = document.getElementById("register-button");
registerButton.addEventListener("click", register);

const logoutButton = document.getElementById("logout-button");
logoutButton.addEventListener("click", logout);

const roomButton = document.getElementById("room-button");
roomButton.addEventListener("click", () => {
    //async sucks
    const outerModal = prompt("Enter a room name");
    const modal = outerModal.querySelector(".modal-content-inner");
    const button = modal.querySelector(".prompt-button");
    const input = modal.querySelector(".prompt-input");
    button.addEventListener("click", () => {
        asyncGAH(modal).then(() => {
            //two ts?
            closeModal(outerModal);
            joinRoom(input.value);
        });
    });
});

// const roomSendButton = document.getElementById("room-send-button");
// roomSendButton.addEventListener("click", () => {
//     const outerModal = modalSystem.prompt("Enter a message");
//     const modal = outerModal.querySelector(".modal-content-inner");
//     const button = modal.querySelector(".prompt-button");
//     const input = modal.querySelector(".prompt-input");
//     button.addEventListener("click", () => {
//         console.log(input.value);
//         appSystem.roomSend(input.value, modal);
//     })
// })


// ******* Message Handler ******* \\

const send = () => {
    const message = document.getElementById("message");
    console.log("Sending message...");
    if (!client) {
        createAlert("You must login before sending a message!");
        return;
    }
    if (message.value == "") {
        createAlert("You can't send nothing!");
        return;
    }
    asyncGAH().then(() => {
        const rooms = document.getElementById("rooms");
        //sending the data
        const xhr = new XMLHttpRequest();
        xhr.open("POST", "/index.html", true);
        xhr.setRequestHeader('Content-Type', 'application/json');
        xhr.send(JSON.stringify({
            name: client.name,
            message: message.value,
            room: rooms.value
        }));
        newMessage({ name: client.name, message: message.value });
        message.value = "";
    });
}

const placeholder = document.getElementById("data");
document.addEventListener("keydown", (event) => {
    if (event.code == "Enter") {
        const modal = getSelectedModal();
        if (document.getElementById("message") == document.activeElement) {
            send();
        } else if (document.activeElement.tagName.toLowerCase() == "input") {
            console.log("input is selected");
            const inputList = modal.getElementsByTagName("input");
            for (let i = 0; i < inputList.length; i++) {
                if (inputList[i] == document.activeElement) {
                    if (inputList[i + 1]) {
                        inputList[i + 1].focus();
                        return;
                    } else if (i == inputList.length - 1) {
                        //if it's the last input in the modal
                        // const event = document.createEvent('Events');
                        // event.initEvent("click", true, false);
                        //only works if there's one button, but there should only ever be one
                        // modal.querySelector("button").dispatchEvent(event);
                        modal.querySelector("button").click();
                    }
                }
            }
        } else if (modal && modal.getElementsByTagName("input").length == 0) {
            //might have to chahnge this later on
            let button = modal.getElementsByTagName("button");
            if (button.length > 1 || button.length == 0) return;
            button = button[0];
            button.click();
        }
    }
});

const sendButton = document.getElementById("send-button");
sendButton.addEventListener("click", send);

//socket.io
const socket = io.connect();

const newMessage = (message) => {
    const messageEl = document.createElement("span");
    messageEl.innerHTML = `${message.name}: ${message.message}<br />`;
    placeholder.appendChild(messageEl);
    return messageEl;
}

socket.on("message", newMessage);
socket.on("dm", (message) => {
    console.log(message);
    const rooms = document.getElementById("rooms");
    if (rooms.value == message.room) newMessage(message);
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



function requestData(collection) {
    console.log("Requesting data...");

    //requesting the data
    const xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function() { 
        if (this.readyState == 4 && this.status == 200) {
            placeholder.innerHTML = "";
            console.log(this.responseText);
            const messages = JSON.parse(this.responseText);
            for (let i = 0; i < messages.length; i++) {
                placeholder.innerHTML = `${placeholder.innerHTML}${messages[i].name}: ${messages[i].message}<br />`;
            }
        } else {
            console.log(this.status);
        }
    }
    xhr.open("GET", `/index.html?cl=${collection}`, true); // true for asynchronous 
    xhr.send();
}

requestData("messages");




//finished





























//needs to be run in the main process, not the renderer
// const { autoUpdater } = require("electron-updater");

// const fileSystem = require("./Functions/fileSystem.js");
// const modalSystem = require("./public/Functions/modalSystem.js");
// const appSystem = require("./public/Functions/appSystem.js");
// const test = require("../style.css")

//sets autoDownload to false for manual updating

//implement this for text app and server
// autoUpdater.autoDownload = false;

// autoUpdater.on("update-available", () => {
//   console.log("Update available");
//   const restartOnClick = () => {
//     const restartButton = document.getElementById("restart");
//     restartButton.addEventListener("click", () => {
//       const error = document.getElementById("error");
//       error.innerHTML = "";
//       autoUpdater.downloadUpdate();
//     });
//   }
//   //if there is an update available, create an update modal that downloads the update on the click of the button
//   const restartModal = modalSystem.createModal(`
//     <h4>Flawfull is ready to update</h4>
//     <h5 id="progress"></h5>
//     <h5 id="error" style="color: red !important"></h5>
//     <button id="restart">Update</button>
//   `, restartOnClick, true, true);

//   autoUpdater.on("error", (err) => {
//     const error = document.getElementById("error");
//     error.innerHTML = "Sorry, but there has been an error. Please restart Flawfull and try again. ";
//     // alert(err.message);
//     console.error(err);
//   })
//   //once the update has downloaded, quit and install
//   //Flawfull should restart after this
//   autoUpdater.on("update-downloaded", () => {
//     console.log("Update has been downloaded");
//     setImmediate(() => {
//       autoUpdater.quitAndInstall(false, true);
//     })
//   });
//   //this just _doesn't_ work
//   //It looks nice though, or it would if it worked
//   autoUpdater.on("download-progress", (progressInfo) => {
//     var progress = document.getElementById("progress");
//     console.log(progressInfo);
//     progress.innerHTML = "Download: " + Math.floor(progressInfo.percent) + "%";
//   })
// });
// autoUpdater.on("update-not-available", () => {
//   console.log("Update not available!");
// })

// autoUpdater.checkForUpdates();


// fileSystem.initialize(dataSystem.getPath("history.json"), "[]");
// fileSystem.initialize(dataSystem.getPath("bookmarks.json"), "[]");

//removes default menu/shortcuts
// Menu.setApplicationMenu(null);