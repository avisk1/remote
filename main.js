const {app, BrowserWindow, ipcMain } = require('electron');
const fs = require("fs");
const path = require('path');
const mongoose = require("mongoose");
const keytar = require("keytar");

const bcrypt = require("bcrypt");



mongoose.set('useNewUrlParser', true);
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);
mongoose.set('useUnifiedTopology', true);

// const url = require('url');

app.on('window-all-closed', app.quit);



let win;

function createWindow() {
    const { screen } = require("electron");
    const { width, height } = screen.getPrimaryDisplay().workAreaSize;
    win = new BrowserWindow({
        width: width,
        height: height,
        icon: "",
        webview: true,
        title: "Remote",
        webPreferences: {
            //I'm going to have to rewrite EVERYTHING, and even worse I'll have to do it with IPC...async...
            nodeIntegration: false,
            //I'm gonna regret this, aren't I
            //I hate Electron
            //I spend more time dealing with Electron's stupid warnings than actually programming my app 
            //oh wait never mind I'm dumb
            enableRemoteModule: false,
            worldSafeExecuteJavaScript: true,
            spellcheck: true,
            //no matter what I do, I can't get rid of Electron's ridiculous security warnings
            //well now one is gone but of course I'm getting errors again
            contextIsolation: true,
            preload: path.join(app.getAppPath(), 'preload.js')
        }
    });
    //    win.loadURL(url.format ({
    //       pathname: path.join(__dirname, 'index.html'),
    //       protocol: 'file:',
    //       slashes: true
    //    }));
    win.loadURL('http://127.0.0.1:27017/');
    win.focus();
}



app.on('ready', () => {
    createWindow();

//     const { session } = require('electron')

// session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
//   callback({
//     responseHeaders: {
//       ...details.responseHeaders,
//       'Content-Security-Policy': ['default-src \'none\'']
//     }
//   })
// })

    // const Message = mongoose.model("messages", { name : String, message : String, date: String });
    const User = mongoose.model("users", { name: String, password: String, email: String, os: String, dateJoined: String });

    const pass = keytar.getPassword("Remote", "Mongoose");

    const asyncBad = new Promise((resolve, reject) => {
        pass.then((data) => {
            resolve(data);
        })
    })

    asyncBad.then((password) => {
        
        const index = password.indexOf("/");
        const dbURL = `mongodb+srv://${password.slice(0, index)}:${password.slice(index + 1, password.length)}@cluster0.xpx7r.mongodb.net/siteDatabase?authSource=admin&w=1`;
        // const dbURL = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.PASSWORD}@cluster0.xpx7r.mongodb.net/siteDatabase?authSource=admin&w=1`;
        // const dbURL = `mongodb+srv://${process.env.USERNAME}:${process.env.PASSWORD}@cluster0.xpx7r.mongodb.net/myFirstDatabase?authMechanism=SCRAM-SHA-1&w=1`;
        // const dbURL = `mongodb+srv://${process.env.USERNAME}:${process.env.PASSWORD}@cluster0.xpx7r.mongodb.net/myFirstDatabase?authSource=admin&w=1`;

        
        

        mongoose.connect(dbURL)
        .then(() => {
            console.log("wait did it actually work?");
        })
        .catch(err => {
            console.error('App starting error:', err);
        });

    });

    const appData = app.getPath("userData");

    // fileSystem.initializeCache(path.join(appData, "cache.json"), appData);

    // ipcMain.on('asynchronous-message', (event, arg) => {
    //     event.reply('asynchronous-reply', 'pong');
    // })
    ipcMain.on('synchronous-message', (event, arg) => {
        event.returnValue = appData;
    })

    const express = require('express');
    var appExpress = express();
    var server = require('http').createServer(appExpress);
    var io = require('socket.io')(server);

    appExpress.use(express.json());
    appExpress.use(express.urlencoded({extended: false}))

    io.on("connect", (socket) => {
        // socket.emit("dm", "world");
        // socket.on("send-request", (data) => {
        //     console.log("Send request received");
        //     console.log(data.message);
        //     console.log(data.room);
        //     //use io.to for everyone except the sender
        //     io.in(data.room).emit("dm", data.message);
        //     socket.emit("dm", { msg: data.message });
        //     // socket.in(data.room).emit("dm", data.message);
        // })
        // socket.emit("dm", { msg: "test" });


        socket.on("join-request", (data) => {
            console.log(`Joined room "${data.room}"`)
            socket.join(data.room);
        })
    });

    //when a get request is sent to /stream (wants information)
    appExpress.get('/index.html', (req, res) => {
        console.log(req.query.cl);
        //return message data from database
        const roomName = req.query.cl;
        // const Room = mongoose.model(roomName, { name : String, message : String, date: String });
        let room;
        try {
            room = mongoose.model(roomName);
        } catch (error) {
            room = mongoose.model(roomName, {
                name: {
                    type: String,
                },
                message: {
                    type: String,
                },
                date: {
                    type: String,
                }
            })
        }
        room.find({}, (err, messages) => {
            if (err) console.log(err);
            res.json(messages);
        })
    });

    // appExpress.post("/logger.js", (req, res) => {
    //     console.log("Wow we actually got a request");
    //     console.log(req.body);
    // })


    //apparently appExpress is supposed to be socket?
    
    //when a post request is sent to /stream (giving information)
    appExpress.post('/index.html', (req, res) => {
        //replaces the name in the cache with the new name
        // if (fileSystem.getFile("cache.json").name != req.body.name) {
        //     fileSystem.setFileProperty("cache.json", "name", req.body.name);
        // }
        
        //posts this new information to the database
        const roomName = req.body.room;
        // const Room = mongoose.model(roomName, { name : String, message : String, date: String });
        // var room = new Room(req.body);
        let Room;
        try {
            Room = mongoose.model(roomName);
        } catch (error) {
            Room = mongoose.model(roomName, {
                name: {
                    type: String,
                },
                message: {
                    type: String,
                },
                date: {
                    type: String,
                }
            })
        }
        const room = new Room(req.body);
        room.save((err) => {
            if(err) {
                console.log("You have an error, sir:");
                console.log(err);
                res.sendStatus(500);
            } else {
                io.on("connect", (socket) => {
                    console.log(socket.id);
                    // socket.broadcast.emit('message', req.body);
                    // req.body.tempID = tempID;
                    // socket.broadcast.emit('message', req.body);
                    socket.emit("dm", req.body);
                })
                res.sendStatus(200);
            }
        })
    });

    appExpress.use("/", express.static("public"));
    server.listen(27017);    
});