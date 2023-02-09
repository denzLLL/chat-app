import express from 'express';
import {utils as u} from './utils/utils.js';
import path from 'path';
import {fileURLToPath} from 'url';
import * as http from 'http';
import * as io from 'socket.io';
import Filter from 'bad-words';
import generateMessage, {generateLocationMessage} from './utils/messages.js';
import {addUser, getUser, getUsersInRoom, removeUser} from './utils/users.js';

const app = express(),
    port = process.env.PORT || 3000,
    __filename = fileURLToPath(import.meta.url),
    __dirname = path.dirname(__filename);
const publicDirectoryPath = path.join(__dirname, 'public');


const server = http.createServer(app);
const socketIO = new io.Server(server); // теперь наш сервер support WebSockets

app.use(express.static(publicDirectoryPath));
app.use(express.json());

socketIO.on('connection', (socket) => {
    u.log('new WebSocket connection');

    socket.on('join', ({username, room}, cb) => {
        const {user, error} = addUser({id: socket.id, username, room});
        if (error) {
            return cb(error);
        }

        socket.join(user.room) // join to the room
        // join + new methods:
        // socketIO.to.emit - emit everybody in a specific room
        // socket.broadCast.to.emit - emit everybody except the specific client in a specific chat room

        socket.emit('message', generateMessage(`Welcome ${user.username}`));  // to particular socket (I)
        socket.broadcast.to(user.room).emit(
            'message',
            generateMessage(`${user.username} has joined!`)); // send it to everybody except this particular socket (II)

        socketIO.to(user.room).emit('roomData', {
            room: user.room,
            users: getUsersInRoom(user.room)
        })

        cb();
    })

    socket.on('sendMessage', (data, cb) => {
        const user = getUser(socket.id);
        if (!user) return;
        const filter = new Filter();

        if (filter.isProfane(data)) {
            return cb('Profanity is not allowed');
        }

        socketIO.to(user.room).emit('message', generateMessage(data, user.username));            // to all socket (III)
        cb();                                                                                       // acknowledgement
    });

    socket.on('sendLocation', (url, cb) => {
        const user = getUser(socket.id);

        socketIO.to(user.room).emit('locationMessage', generateLocationMessage(url, user.username));

        cb('Location shared');
    });

    socket.on('disconnect', () => { // ex. close browser
        const user = removeUser(socket.id);

        if (user) {
            socketIO.to(user.room).emit('message', generateMessage(`${user.username} has left`));

            socketIO.to(user.room).emit('roomData', {
                room: user.room,
                users: getUsersInRoom(user.room)
            });
        }
    });
});

server.listen(port, () => {
    u.log(`Server is up on port ${port}`);
});
