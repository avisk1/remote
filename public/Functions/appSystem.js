const modalSystem = require("./modalSystem.js");
const bcrypt = require("bcrypt");
const saltRounds = 8;
const mongoose = require("mongoose");
const keytar = require("keytar");
const os = require("os");

//!!⚠⚠⚠!! - DON'T USE ALERT AS IT AFFECTS INPUT FIELDS IN ELECTRON - !!⚠⚠⚠!!

mongoose.set('useNewUrlParser', true);
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);
mongoose.set('useUnifiedTopology', true);

const socket = io.connect();

// JUST A REMINDER THAT ALL MODAL FUNCTIONS CAN NOW BE CALLED WITH THE MODAL ARGUMENT, SO getSelectedModal...() WILL ALL BE DEPRECATED

const pass = keytar.getPassword("Remote", "Mongoose");
//WHY DOES THIS EXIST (oh right, async bad)
const asyncBad = new Promise((resolve, reject) => {
    pass.then((data) => {
        resolve(data);
    })
})

let dbURL;
let User;
asyncBad.then((password) => {
    const index = password.indexOf("/");
    dbURL = `mongodb+srv://${password.slice(0, index)}:${password.slice(index + 1, password.length)}@cluster0.xpx7r.mongodb.net/siteDatabase?authSource=admin&w=1`;  
    mongoose.connect(dbURL, { family: 4 }, () => {
        console.log("Database connected")
        modalSystem.alert("Database connected");
        User = mongoose.model("users", { name: String, password: String, email: String, os: Object, dateJoined: String, socketID: String });
    });
})

const nameField = document.getElementById("name");

//returns an object with user credentials
//This should be safe, right?
exports.getCredentials = () => {
    return client;
}

class Client {
    //add more credentials later
    constructor(name, email, id) {
        this.name = name;
        this.email = email;
        this.id = id;
    }
}
let client;

function loadingMessage (message, modal) {
    modal.innerHTML = `<p>${message}...</p>`;
    const waiting = setInterval(() => {
        if (modal.innerHTML == `<p>${message}...</p>`) {
            modal.innerHTML = modal.innerHTML.slice(0, -7) + "</p>";
        } else {
            modal.innerHTML = modal.innerHTML.slice(0, -4) + ".</p>";
        }
    }, 500);
    return waiting;
}

async function asyncGAH (modal) {
    const ihatepromises = new Promise((resolve, reject) => {
        if (User) {
            resolve();
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
            if (User) {
                clearInterval(waiting);
                resolve();
            }
        }, 500);
    })
    return ihatepromises;
}

exports.login = () => {
    function submit(modal) {
        const modalLogin = document.getElementById("modal-login");
        function mongoSucks(data) {
            console.log(modal);
            // modal.innerHTML = "<p>Searching for user...</p>";
            // const waiting = setInterval(() => {
            //     if (modal.innerHTML == "<p>Searching for user...</p>") {
            //         modal.innerHTML = modal.innerHTML.slice(0, -7) + "</p>";
            //     } else {
            //         modal.innerHTML = modal.innerHTML.slice(0, -4) + ".</p>";
            //     }
            // }, 500);
            const waiting = loadingMessage("Searching for user", modal);
            User.find({ email: data.email }).lean().exec((err, user) => {
                console.log("here");
                if (err) console.error(err);
                clearInterval(waiting);
                if (user.length != 0) {
                    user = user[0];
                    // modal.innerHTML = "<p>Checking password...</p>";
                    // const waitingPassword = setInterval(() => {
                    //     if (modal.innerHTML == "<p>Checking password...</p>") {
                    //         modal.innerHTML = modal.innerHTML.slice(0, -7) + "</p>";
                    //     } else {
                    //         modal.innerHTML = modal.innerHTML.slice(0, -4) + ".</p>";
                    //     }
                    // }, 500);
                    const waitingPassword = loadingMessage("Checking password", modal);
                    bcrypt.compare(data.password, user.password, function(err, result) {
                        //I just realized I could just clearInterval here smh
                        // checked = true;
                        clearInterval(waitingPassword);
                        modalSystem.closeModal(modal.parentNode.parentNode);
                        if (result) {
                            modalSystem.alert("Login successful!");
                            nameField.value = user.name;
                            client = new Client(user.name, user.email, socket.id);
                            User.findOneAndUpdate({ email: user.email }, { socketID: socket.id }, { upsert: false }, (err, doc) => {
                                if (err) {
                                    console.log("Error finding and updating socket id for user:");
                                    console.error(err);
                                    return;
                                }
                                console.log("Saved successfully");
                            });
                        } else {
                            modalSystem.alert("Incorrect password! (yes I'm practically the only developer who has this very basic feature)");
                            //probably cause everyone uses a different encrypter/validator
                        }
                    });
                } else {
                    modalSystem.closeModal(modal.parentNode.parentNode);
                    modalSystem.alert("User not found! (yes, I'm practically the only developer who has this very basic feature)");
                }
            })
        }
        modalLogin.addEventListener("click", () => {
            const data = modalSystem.getModalInput(modal);
            //check from database
            //ummm...
            asyncGAH(modal).then(() => {
                mongoSucks(data);
            })
            
            // bcrypt.compare(myPlaintextPassword, hash, function(err, result) {
            //     // result == true
            // });
            
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
  modalSystem.createModal(loginHTML, submit, false, false, true);
}

//yes, I know
// function post(data, AGHHHHHHHH) {
//     const xhr = new XMLHttpRequest();
//     xhr.open("POST", AGHHHHHHHH, true);
//     xhr.setRequestHeader('Content-Type', 'application/json');
//     xhr.send(JSON.stringify(data));
// }

exports.logout = () => {
    if (client) {
        client = undefined;
        nameField.value = "";
        modalSystem.alert("Successfully logged out");
    } else {
        modalSystem.alert("You aren't logged in!");
    }
}

exports.register = () => {
    function submit(modal) {
        const modalRegister = document.getElementById("modal-register");
        function mongoSucks(data) {
            if (data.password.length < 8) {
                modalSystem.alert("Your password must have at least 8 characters!");
                return;
            }
            //change the following to getRegisterModal and write that function inside modalSystem.js
            // modal.innerHTML = "<p>Hashing password...</p>";
            // const waiting = setInterval(() => {
            //     if (modal.innerHTML == "<p>Hashing password...</p>") {
            //         modal.innerHTML = modal.innerHTML.slice(0, -7) + "</p>";
            //     } else {
            //         modal.innerHTML = modal.innerHTML.slice(0, -4) + ".</p>";
            //     }
            //     // if (hashed) {
            //     //     modal.innerHTML = "<p>Registration imminent...</p>";
            //     //     if (modal.innerHTML == "<p>Registration imminent...</p>") {
            //     //         modal.innerHTML = modal.innerHTML.slice(0, -7) + "</p>";
            //     //     } else {
            //     //         modal.innerHTML = modal.innerHTML.slice(0, -4) + ".</p>";
            //     //     }
            //     //     if (registrated) {
            //     //         clearInterval(waiting);
            //     //     }
            //     // }
            // }, 500);
            const waiting = loadingMessage("Hashing password", modal);
            //encrypt and send it to the database
            bcrypt.hash(data.password, saltRounds, function(error, hash) {
                //DON'T, and I mean DON'T make ANY errors inside the bcrypt callback function

                //THIS is what I had to resort to
                // post({message: "been hashed", err: error, type: typeof(err), new: true }, "/logger.js")

                //OH. MY. GOSH. THIS LINE SHOULD THROW AN ERROR, NOT CRASH EVERYTHING! Another one of Electron's many excruciatingly painful bugs
                // const modal = modalSystem.getSelectedParentModal();

                //Happy?
                //(this line wasn't even necessary until later lol)
                // const modal = modalSystem.getSelectedModalParent();

                //Come to think of it, this might be bcrypt's fault, because it only occurs inside bcrypt's hash's callback function

                if (error) {
                    console.error(error);
                    modalSystem.alert("error with hashing password oops I've said too much");
                    return;
                }
                clearInterval(waiting);
                data.password = hash;
                data.socketID = socket.id;
                const user = new User(data);
                const saving = loadingMessage("Saving user", modal);
                user.save((err) => {
                    clearInterval(saving);
                    modalSystem.closeModal(modal.parentNode.parentNode);
                    if (err) {
                        if (err.name === 'MongoError' && err.code === 11000) {
                            // Duplicate email
                            console.log('User already exists under this email!');
                            modalSystem.alert("User already exists under this email!");
                            return;
                        } else {
                            console.log("You have an error, sir:");
                            modalSystem.alert("Error registering");
                            console.error(err);
                        }
                    } else {
                        console.log("Saved user successfully.");
                        modalSystem.alert("You have been registered successfully!");
                    }
                });
            });
        }
        modalRegister.addEventListener("click", () => {
            const data = modalSystem.getModalInput(modal);
            data.dateJoined = new Date().toISOString().slice(0, 10);
            data.os = os.userInfo();
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
  modalSystem.createModal(registerHTML, submit, false, false, true);
}

exports.room = (roomName, modal) => {
    //take that, async
    asyncGAH(modal).then(() => {
        modalSystem.closeModal(modal.parentNode.parentNode);
        // User.find({ email: userEmail }).lean().exec((err, user) => {
        //     if (err) {
        //         console.error(err);
        //         return;
        //     }
            socket.emit("join-request", { room: roomName });
            // socket.emit("send-request", { userSocketID: user.socketID, targetSocketID: socket.id, message: "Hello World!" });
            // socket.to(user.socketID).emit("dm", socket.id, "Hello World!");
        // });
    })
}

exports.roomSend = (message, modal) => {
    //this is going to be badly coded, but only because it's a test
    asyncGAH(modal).then(() => {
        console.log(message);
        modalSystem.closeModal(modal.parentNode.parentNode);
        // socket.emit("send-request", { message: message, room: "pleasework" });
        // socket.emit("dm", (response) => {
            // socket.
        // });
        
    })
}