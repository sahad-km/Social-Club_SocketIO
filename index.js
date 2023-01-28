const io = require('socket.io')(7000,{
    cors :{
        origin: "https://social-club.onrender.com/"
    }
})

let activeUsers = [];

io.on("connection", (socket) => {
    // Register a new user
    socket.on('new-user-add', (newUserId) =>{
        // If user is not added previously
        if(!activeUsers.some((user) => user.userId === newUserId))
        {
            activeUsers.push({
                userId:newUserId,
                socketId:socket.id
            })
        }

        io.emit('get-users',activeUsers)
    })
	socket.emit("me", socket.id)

	socket.on("disconnect", () => {
		socket.broadcast.emit("callEnded")
        activeUsers = activeUsers.filter((user)=> user.socketId !== socket.id);
        io.emit('get-users', activeUsers)
	})

	socket.on("callUser", (data) => {
        const receiverId = data.userToCall;
        const user = activeUsers.find((user) => user.userId === receiverId)
        if(user){
            io.to(user.socketId).emit("callUser", { signal: data.signalData, from: data.from, name: data.name })
        }
	})

	socket.on("answerCall", (data) => {
		io.to(data.to).emit("callAccepted", data.signal)
	})

    //Send message
    socket.on("send-message", (data) => {
        const {receiverId} = data;
        const user = activeUsers.find((user) => user.userId === receiverId)
        if(user){
            io.to(user.socketId).emit("receive-message",data)
        }
    })

    //Send voice message
    socket.on("send-voice-message", (data) => {
        const {receiverId} = data;
        const user = activeUsers.find((user) => user.userId === receiverId)
        if(user){
            io.to(user.socketId).emit("receive-voice-message",data)
        }
    });
})

