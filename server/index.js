const express = require("express");
const app = express()
const server = require("http").createServer(app);
const io = require("socket.io")(server)
const cors = require("cors")
const { v4: uuidv4 } = require('uuid');
const port = process.env.port||5000;

//middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({extended:true}))

//list of sockets in a room
let socketList = {};

//route 
app.get( "/getRoomID", (req, res) => {
res.status(200).json({
    roomID:uuidv4()
})
})

// Route
// app.get('/ping', (req, res) => {
//     res.send({
//         success: true,
//       })
//       .status(200);
//   });


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

    // var clients= io.sockets.clients(roomID);
    // clients.forEach((client) => {
    //   if (socketList[client] == userName) {
    //     error = true;
    //   }
    // });
    // socket.emit("F-user-already-exist", { error });

io.sockets.in(roomID).clients((err, clients) => {
    clients.forEach((client) => {
      if (socketList[client] == username) {
        error = true;
      }
    });
    socket.emit("F-user-already-exist", { error });
  });

})


//join vedio room
socket.on("B-join-room", ({roomID, username})=>{

    //socket joining in room with id:roomID

    socket.join(roomID);
    socketList[socket.id] = {username, video:true, audio: true}   


    // var clients= io.sockets.clients(roomID);
    //     try{
    //         const users= [];
    //         clients.forEach(client => {
    //             //adding users to list
    //             users.push({userID: client, data: socketList[client]});
    //         });
    //         //informing other users of room
    //         users.broadcast.to(roomID).emit("F-user-join", users);
    //     }
    //     catch(error){
    //         //user already exist in room
    //         io.sockets.in(roomID).emit("F-user-already-exist", {err: true})
    //     }

    //generating list of users in same room
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

// end of socket 
});


server.listen(port, ()=>{
    console.log("sever running on", port);
})