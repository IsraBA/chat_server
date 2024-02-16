const express = require("express");
const { createServer } = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: {
        origin: "http://localhost:5173"
    }
});

// מונה משתמשים
let userCount = 0;
// פונקציה ליצירת שם משתמש אנונימי
function generateUsername() {
    userCount++;
    return `user_${userCount}`;
}

// פונקציה ליצירת זמן השליחה
function getIsraelTime() {
    const now = new Date();
    const options = {
        timeZone: 'Asia/Jerusalem',
        hour12: false,
        hour: '2-digit',
        minute: '2-digit',
    };
    return now.toLocaleTimeString('en-IL', options);
}

// מערך לאחסון כל ההודעות
let messages = [];

io.on("connection", (socket) => {
    console.log(`user ${socket.id} connected`);
    const username = socket.handshake.query.myName ? socket.handshake.query.myName : "anonymous";
    const myColor = socket.handshake.query.myColor ? socket.handshake.query.myColor : "black";

    // messages שלח למשתמש את כל ההודעות הקיימות במערך
    socket.emit("allMessages", messages);

    socket.on("disconnect", () => {
        console.log("User disconnected");
    });

    socket.on("message", (message) => {
        // console.log("Message received:", message);
        // socket.emit("message", message);
        const data = {
            username,
            myColor,
            message,
            time: getIsraelTime()
        };
        messages.push(data); // הוסף את ההודעה למערך
        io.emit("message", data);
    });
});

httpServer.listen(3000, () => console.log("server is listening on http://localhost:3000"));