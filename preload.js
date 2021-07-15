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

//!!⚠⚠⚠!! - DON'T USE ALERT AS IT AFFECTS INPUT FIELDS IN ELECTRON - !!⚠⚠⚠!!

mongoose.set('useNewUrlParser', true);
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);
mongoose.set('useUnifiedTopology', true);

// JUST A REMINDER THAT ALL MODAL FUNCTIONS CAN NOW BE CALLED WITH THE MODAL ARGUMENT, SO getSelectedModal...() WILL ALL BE DEPRECATED

//I think every system I've used for this app has given me some sort of trouble, none of which were my fault
//Let's see:
//Mongoose, keytar, bcrypt, ELECTRON, git
//10 to 1 this doesn't work
//At this point I may as well have a bot that looks up my error messages, visits the first stack overflow and grabs the answer with the most upvotes
//Actually that's a really good idea I'm gonna do that
//I'll even make an npm package for it
// keytar.setPassword('Remote', 'Mongoose', 'avisk1/whattoputhere3');
//Are you telling me that it only sets the password locally? That completely defeats the point of an external password keeper
//There is nothing in the docs at all about any of this
//Time to get a new password keeper I guess
//Fun fact, keytar is actually incredibly insecure, and isn't MEANT to be secure
//So don't use it 
// const pass = keytar.getPassword("Remote", "Mongoose");
// pass.then((thing) => {
//     console.log(thing);
// })

//WHY DOES THIS EXIST (oh right, async bad)
// const asyncBad = new Promise((resolve, reject) => {
//     pass.then((data) => {
//         resolve(data);
//     })
// })

let dbURL;
let User;

//Oh my gosh this is so easy WHY didn't I do this before
const dbUsername = process.env.DB_USERNAME;
const dbKey = process.env.DB_KEY;

contextBridge.exposeInMainWorld('appSystem', {
    connectDatabase: async () => {
        const promiseBleh = new Promise((resolve, reject) => {
            dbURL = `mongodb+srv://${dbUsername}:${dbKey}@cluster0.xpx7r.mongodb.net/siteDatabase?authSource=admin&w=1`;  
            mongoose.connect(dbURL, { family: 4 }, () => {
                console.log("Database connected")
                // modalSystem.alert("Database connected");
                User = mongoose.model("users", { name: String, password: String, email: String, os: Object, dateJoined: String, socketID: String });
                resolve();
            });
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