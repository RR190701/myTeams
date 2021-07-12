import React, {useEffect, useState} from 'react';
import socket from "../../socket";
import ScrollToBottom from "react-scroll-to-bottom";
import IconButton from '@material-ui/core/IconButton';
import SendIcon from '@material-ui/icons/Send';
import {CopyToClipboard} from 'react-copy-to-clipboard';
import Tooltip from '@material-ui/core/Tooltip';
import ShareIcon from '@material-ui/icons/Share';
import Snackbar from '@material-ui/core/Snackbar';
import Paper from '@material-ui/core/Paper';
import Button from '@material-ui/core/Button';

import "./style.css"

const ChatRoom = (props) => {
 
    const currentUser = localStorage.getItem('username');
    const roomID = props.match.params.roomID;
    const [msg, setMsg] = useState([]);
    const [message, setMessage] = useState("");
    const [open, setOpen] = React.useState(false);
    const [popMessge, setPopMessage] =useState("");

    const handleClick = () => {
      setPopMessage("Link copied to clipboard")  
      setOpen(true);
    };
    const handleClose = (event, reason) => {
        if (reason === 'clickaway') {
          return;
        }
    
        setOpen(false);
        setPopMessage("");
      };

      const leaveChatRoom =()=>{
        window.location.href = '/';
      }
    useEffect(()=>{


    // Set Back Button Event
    window.addEventListener('popstate', leaveChatRoom); 

        socket.emit("B-join-chat-room", {roomID, username:currentUser});
        socket.on("F-get-room-chat", (results) => {
            console.log(results);
            let msgs =[];
            results.forEach(({sender, message}) => {
                msgs.push({
                    sender,
                    message
                })
            });

            //getting room chats
            setMsg(msg => [...msg, ...msgs]);
        });


        //getting member in user
        socket.on("F-join-chat-room", (username) => {
            setPopMessage(`${username} joined`) 
            setOpen(true)
        });

        socket.on('F-receive-message', ({ message, sender }) => {
            console.log("getting something", {message, sender});
            setMsg((msgs) => [...msgs, { sender, message }]);
          });

// eslint-disable-next-line
    },[]);


    //helper function
  const sendMessage = () => {
      console.log("working");
    if (message) {
      socket.emit('B-send-message', { roomID, message, sender: currentUser });
      setMessage("");
    }
 
};

    
    return ( 
    <div className ="chat-room-div">
        <h1>
        Chat Room
    </h1> 

    {/* chat room contents */}
    <div className="chat-room-content">
      {/* part one */}
      <div className="chat-room-details"> 
             <Paper elevation={5} className="room-key-details">
            <div className="chat-room-id">
                <span>
                    Chat room ID :
                </span>
                {/* link */}
                <div>
                 <p>{roomID}</p>
<CopyToClipboard text={`https://my-microsoft-teams-clone.netlify.app/chat/${props.match.params.roomID}`}
onCopy={handleClick}>
<Tooltip title="Click to copy chat room link to clipboard" arrow>
        <ShareIcon 
        className="meeting-link"></ShareIcon>
    </Tooltip>
</CopyToClipboard>
                </div>
                {/* leave button */}
    <Button variant="contained"
    color="secondary" 
onClick ={leaveChatRoom}>
  leave
</Button>

      {/*copy meeting link icon */}
      <CopyToClipboard text={`https://my-microsoft-teams-clone.netlify.app/join/${roomID}`} onCopy={handleClick}>
      <Button variant="contained"
    color="primary"
    className ="join-meeting-again">
  Copy meeting link
</Button>
</CopyToClipboard>

                
            </div>
             </Paper>
      </div>

      {/* part two */}
      <div className ="chat-area-div">
          <div className="chatting-area">
              {/* messsages */}
              <div className="chat-room-messages">
              <div className="all-chats">
              <ScrollToBottom>
{msg &&
          msg.map(({ sender, message }, idx) => {
              if (sender !== currentUser) {
                return (
                  <div className="member-message" key={idx}>
                    <span>{sender}</span>
                    <p>{message}</p>
                  </div>
                );
              } else {
                return (
                  <div className="my-message" key={idx}>
                    <span>{sender}</span>
                    <p>{message}</p>
                  </div>
                );
              }
            })}
</ScrollToBottom>
              </div>
              </div>

              {/* text message div */}
              <div className="chatroom-textbox-div">
<input placeholder="Enter your message" 
value={message}
onChange={e => setMessage(e.target.value)}
onKeyPress={e => e.key==="Enter"?sendMessage(e):null}
>
</input>
<IconButton color="primary" 
aria-label="send"
onClick={sendMessage}>
      <SendIcon
     ></SendIcon> 
      </IconButton>
</div>

          </div>
      </div>
    </div>
            {/* snackbar */}
            <Snackbar
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'center',
        }}
        open={open}
        autoHideDuration={1500}
        onClose={handleClose}
        message={popMessge}
      />
        </div>);
}
 
export default ChatRoom;