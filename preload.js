//put functions here
//thanks Electron for actually making it slightly less painful
//RIP functions folder :/

//oh my gosh electron you're security warnings are so annoying

const { contextBridge } = require('electron');

//releaseType=release


// ******** App System ******** \\

const mongoose = require("mongoose");
const keytar = require("keytar");
const os = require("os");
const bcrypt = require("bcryptjs");
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