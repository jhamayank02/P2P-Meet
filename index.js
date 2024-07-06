const express = require('express');
const app = express();

const { createServer } = require('http');
const server = createServer(app);

const { Server } = require('socket.io');
const io = new Server(server, { cors: true });

const cors = require('cors');

const authRoutes = require('./routes/authRoutes');
const meetingRoutes = require('./routes/meetingRoutes');
const { isAuthenticated } = require('./controllers/auth');
const userModel = require('./models/User');
const { ErrorMiddleware } = require('./middlewares/error');
const connectDB = require('./helpers/connectDB');

app.use(cors());
app.use(express.json());

app.use('/api/auth/', authRoutes);

app.use('/api/meeting/', isAuthenticated, meetingRoutes);

app.use(ErrorMiddleware);

const emailToSocketIds = new Map();
const socketIdsToEmail = new Map();

io.on('connection', (socket) => {

    socket.on('MEETING_JOINED', async (data) => {
        const { email, meetingCode, name } = data;
        
        const sockets = await io.in(meetingCode).fetchSockets();
        const socketIds = sockets.map(socket => socket.id);
        const prevClients = socketIds.filter( id=> id !== socket.id);
        
        if(prevClients.length >= 2){
            io.to(socket.id).emit("ROOM_FULL");
        }
        
        emailToSocketIds.set(email, socket.id);
        socketIdsToEmail.set(socket.id, email);

        io.to(meetingCode).emit('USER_JOINED', { email, meetingCode, id: socket.id, name });
        socket.join(meetingCode);

        io.to(socket.id).emit('MEETING_JOINED', { email, meetingCode, id: socket.id });
        
        
        if(prevClients.length > 0){
            const user = await userModel.findOne({email: socketIdsToEmail.get(prevClients[0])});
            if(user){
                io.to(socket.id).emit("USER_JOINED_BEFORE", { email: user.email, meetingCode, id: prevClients[0], name: user.name });
            }
        }
    })

    socket.on("USER_CALL", ({ to, offer }) => {
        io.to(to).emit("INCOMING_CALL", { from: socket.id, offer });
    })

    socket.on("CALL_ACCEPTED", ({ to, ans }) => {
        io.to(to).emit("CALL_ACCEPTED", { from: socket.id, ans });
    })

    socket.on("PEER_NEGOTIATION_NEEDED", ({ to, offer }) => {
        io.to(to).emit("PEER_NEGOTIATION_NEEDED", { from: socket.id, offer });
    })

    socket.on("PEER_NEGOTIATION_DONE", ({ to, ans }) => {
        io.to(to).emit("PEER_NEGOTIATION_FINAL", { from: socket.id, ans });
    })

    socket.on("MEETING_ENDED", async ({ to, meetingCode }) => {
        const sockets = await io.in(meetingCode).fetchSockets();
        sockets.map(socket => socket.leave(meetingCode));
        if(meetingCode !== undefined){
            io.to(to).emit("MEETING_ENDED", { from: socket.id });
        }
    })

    socket.on("PARTICIPANT_LEFT", async ({ to, meetingCode }) => {
        socket.leave(meetingCode);
        if(meetingCode !== undefined){
            io.to(to).emit("PARTICIPANT_LEFT", { from: socket.id });
        }
    })

    socket.on("NEGOTIATION_DONE", ({ to, offer }) => {
        io.to(to).emit("NEGOTIATION_DONE", { from: socket.id, offer });
    })

    socket.on("NEGOTIATION_FINAL", ({ to, ans }) => {
        io.to(to).emit("NEGOTIATION_FINAL", { from: socket.id, ans });
    })

    socket.on("REMOTE_VIDEO_ENABLED", ({ to }) => {
        io.to(to).emit("REMOTE_VIDEO_ENABLED");
    })

    socket.on("REMOTE_VIDEO_DISABLED", ({ to }) => {
        io.to(to).emit("REMOTE_VIDEO_DISABLED");
    })

    socket.on("REMOTE_AUDIO_ENABLED", ({ to }) => {
        io.to(to).emit("REMOTE_AUDIO_ENABLED");
    })

    socket.on("REMOTE_AUDIO_DISABLED", ({ to }) => {
        io.to(to).emit("REMOTE_AUDIO_DISABLED");
    })
})


server.listen(80, () => {
    connectDB();
    console.log("Server is running on port 80")
})