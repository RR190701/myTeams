require("dotenv").config({ path: "./config.env" });
const express = require("express");
const app = express()
const server = require("http").createServer(app);
const io = require("socket.io")(server)
const cors = require("cors")
const connectDB = require("./config/db");
const errorHandler = require("./middleware/ErrorHandler");
const port = process.env.PORT||5000;
const Message = require("./models/chats")
const User = require("./models/User")

//db configure
connectDB();

//middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({extended:true}))
//routes
app.use('/', require("./routes/app"));
app.use('/user', require("./routes/User"));
app.use('/profile', require("./routes/profile"))

/**
 * error handling should be the last peice of the middleware
 */
 app.use(errorHandler); 


//list of sockets in a room
let socketList = {};


//sockets
io.on("connection", (socket) => {
console.log("new user : ", socket.id);

//user disconnected
socket.on("disconnect", ()=>{
    socket.disconnect();
    console.log('user disconnected');
})

//checking if user exist already
socket.on("B-check-for-user", ({roomID, username})=>{
let error = false;


io.sockets.in(roomID).clients((err, clients) => {
    clients.forEach((client) => {
      console.log("checking ", roomID)
      console.log(socketList[client].username, username)
      if (socketList[client].username == username) {
        error = true;
      }
    });
    socket.emit("F-user-already-exist", { error });
  });

})


//join vedio room
socket.on("B-join-room", ({roomID, username, video, audio})=>{


  //saving roomID to user database 
User.updateOne({
  username
}, {
  $set: {
      roomID
  }
}).then((res) =>{
  console.log("roomID saved");

})

    //socket joining in room with id:roomID

    socket.join(roomID);
    socketList[socket.id] = {username, video, audio, handRaised:false, reaction:""}   


    io.sockets.in(roomID).clients((err, clients) => {

        try{
            const users= [];

            clients.forEach(client => {
                //adding users to list
                users.push({userID: client, data: socketList[client]});
            });
            //informing other users of room

            socket.broadcast.to(roomID).emit("F-user-join", users);
        }
        catch(error){
            //user already exist in room
            io.sockets.in(roomID).emit("F-user-already-exist", {err: true})
        }
    });

});

//calling user
socket.on('B-call-user', ({ userToCall, from, signal }) => {
    io.to(userToCall).emit('F-receive-call', {
      signal,
      from,
      data: socketList[socket.id],
    });
  });

//accepting call from another user
socket.on('B-accept-call', ({ signal, to }) => {

    //answering the call
    io.to(to).emit('F-call-accepted', {
      signal,
      answerId: socket.id,
    });
  });

  //user leaving group meeting
    socket.on('B-leave-room', ({ roomID, leaver }) => {
    delete socketList[socket.id];
    console.log(`${leaver} left!`)
    //informing other members in room
    socket.broadcast
      .to(roomID)
      .emit('F-user-leave', { userID: socket.id, username:leaver });
    io.sockets.sockets[socket.id].leave(roomID);
  });

  //toggle video and audio
  socket.on('B-toggle-camera-audio', ({ roomID, switchTarget }) => {
    if (switchTarget === 'video') {
      socketList[socket.id].video = !socketList[socket.id].video;
    } else if(switchTarget === 'audio') {
      socketList[socket.id].audio = !socketList[socket.id].audio;
    }
    else if(switchTarget === 'handRaised'){
      socketList[socket.id].handRaised = !socketList[socket.id].handRaised;
    }
    else{
      if(socketList[socket.id].reaction === ''){
        // console.log("reaction on");
        socketList[socket.id].reaction = switchTarget;
      }
      else{
        // console.log("reaction off");
        socketList[socket.id].reaction = '';
      }
    }
    socket.broadcast
      .to(roomID)
      .emit('F-toggle-camera-audio', { userID: socket.id, switchTarget });
  });
//joining chat room
socket.on('B-join-chat-room', ({roomID, username}) => {

  //saving roomID to user database 
  User.updateOne({
    username
  }, {
    $set: {
        roomID
    }
  }).then((res) =>{
    console.log("roomID saved");
  })

  //joing room
  socket.join(roomID);

  //sending chats
  Message.find({roomID}).then((result) => {
      socket.emit("F-get-room-chat", result);
  });
  socket.broadcast.to(roomID).emit("F-join-chat-room", username);


})
  //sending message to others
  socket.on('B-send-message', ({ roomID, message, sender }) => {

   const setNewMessage = new Message({roomID, message, sender});
   setNewMessage.save().then(() => {

    io.sockets.in(roomID).emit('F-receive-message', { message, sender });
   })

  });

// end of socket 
});

server.listen(port, ()=>{
    console.log("sever running on", port);
})

process.on("unhandledRejection", (err, promise) => {
  console.log(`logged Error ${err}`);
  server.close(() => process.exit(1));
});
