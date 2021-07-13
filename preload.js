//put functions here
//thanks Electron for actually making it slightly less painful
//RIP functions folder :/

//oh my gosh electron you're so freaking annoying

// ******** Browser Window ******** \\

// const customTitlebar = require('custom-electron-titlebar');

//so far, this is LITERALLY the ONLY line I can run without getting a freaking error
// const fs = require("fs");

// window.setTitlebar = () => {
//     const bar = new customTitlebar.Titlebar({
//         backgroundColor: customTitlebar.Color.fromH8('#fffff'),
//         icon: "",
//         shadow: true,
//     });
// }

//and Electron foils me again
/*
const { contextBridge } = require('electron')

contextBridge.exposeInMainWorld('myAPI', {
  doAThing: () => {}
})
*/

//STOP CHANGING YOUR FREAKING MIND ELECTRON

const { contextBridge } = require('electron')



// ******** App System ******** \\

//how ironic is it that this doesn't work
// window.test = () => {
//     return "electron sucks"
// }

const mongoose = require("mongoose");
const keytar = require("keytar");
const os = require("os");
const bcrypt = require("bcrypt");
const { test } = require('./public/Functions/fileSystem');
const saltRounds = 8;

//!!⚠⚠⚠!! - DON'T USE ALERT AS IT AFFECTS INPUT FIELDS IN ELECTRON - !!⚠⚠⚠!!

mongoose.set('useNewUrlParser', true);
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);
mongoose.set('useUnifiedTopology', true);

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

contextBridge.exposeInMainWorld('appSystem', {
    connectDatabase: async () => {
        const promiseBleh = new Promise((resolve, reject) => {
            asyncBad.then((password) => {
                const index = password.indexOf("/");
                dbURL = `mongodb+srv://${password.slice(0, index)}:${password.slice(index + 1, password.length)}@cluster0.xpx7r.mongodb.net/siteDatabase?authSource=admin&w=1`;  
                mongoose.connect(dbURL, { family: 4 }, () => {
                    console.log("Database connected")
                    // modalSystem.alert("Database connected");
                    User = mongoose.model("users", { name: String, password: String, email: String, os: Object, dateJoined: String, socketID: String });
                    resolve();
                });
            })
        });
        return promiseBleh;
    },
    findUser: async (userData) => {
        const promise = new Promise((resolve, reject) => {
            User.find(userData).lean().exec((err, user) => {
                resolve({ err: err, user: user });
            });
        });
        return promise;
    },
    comparePassword: async (password, hashedPassword) => {
        const promise = new Promise((resolve, reject) => {
            bcrypt.compare(password, hashedPassword, function(err, result) {
                resolve({ err: err, result: result });
            });
        });
        return promise;
    },
    getUser: () => { return User },
    hash: (password, saltRounds) => {
        const promise = new Promise((resolve, reject) => {
            bcrypt.hash(password, saltRounds, function(error, hash) {
                resolve({error: error, hash: hash});
            });
        })
        return promise;
    },
    saveUser: (user) => {
        const promise = new Promise((resolve, reject) => {
            user.save((err) => {
                resolve(err);
            });
        })
        return promise;
    },
    getOS: () => {
        return os.userInfo();
    },
    newUser: (data) => {
        return new User(data);
    },
    // getRoomData: (room) => {
    //     mongoose.connection.db.listCollections({name: room})
    //     .next((err, collinfo) => {
    //         if (!collinfo) {
    //             //creates a collection for that room if it doesn't exist
    //             //maybe delete this
    //             const test = mongoose.model(room, {
    //                 name: {
    //                     type: String,
    //                     index: true
    //                 },
    //                 message: {
    //                     type: String,
    //                     index: true
    //                 }
    //             });
    //             console.log(test);
    //         }
    //         console.log(collinfo);
            

    //     });
    // }
})  
// window.connectDatabase = async () => {
//     const promiseBleh = new Promise((resolve, reject) => {
//         asyncBad.then((password) => {
//             const index = password.indexOf("/");
//             dbURL = `mongodb+srv://${password.slice(0, index)}:${password.slice(index + 1, password.length)}@cluster0.xpx7r.mongodb.net/siteDatabase?authSource=admin&w=1`;  
//             mongoose.connect(dbURL, { family: 4 }, () => {
//                 console.log("Database connected")
//                 // modalSystem.alert("Database connected");
//                 User = mongoose.model("users", { name: String, password: String, email: String, os: Object, dateJoined: String, socketID: String });
//                 resolve();
//             });
//         })
//     });
//     return promiseBleh;
// }

// window.findUser = async (userData) => {
//     const promise = new Promise((resolve, reject) => {
//         User.find(userData).lean().exec((err, user) => {
//             resolve({ err: err, user: user });
//         });
//     });
//     return promise;
// }

//wait does "async" really matter here?
// window.comparePassword = async (password, hashedPassword) => {
//     const promise = new Promise((resolve, reject) => {
//         bcrypt.compare(password, hashedPassword, function(err, result) {
//             resolve({ err: err, result: result });
//         });
//     });
//     return promise;
// }

// window.getUser = () => {
//     return User;
// }

// window.hash = (password, saltRounds) => {
//     const promise = new Promise((resolve, reject) => {
//         bcrypt.hash(password, saltRounds, function(error, hash) {
//             resolve({error: error, hash: hash});
//         });
//     })
//     return promise;
// }

// window.saveUser = (user) => {
//     const promise = new Promise((resolve, reject) => {
//         user.save((err) => {
//             resolve(err);
//         });
//     })
//     return promise;
// }

// window.getOS = () => {
//     return os.userInfo();
// }

// window.newUser = (data) => {
//     return new User(data);
// }