import React, {useState, useEffect,useRef} from 'react';
import socket from '../../socket';
import { makeStyles} from '@material-ui/core/styles';
import Drawer from '@material-ui/core/Drawer';
import IconButton from '@material-ui/core/IconButton';
import SendIcon from '@material-ui/icons/Send';
import ScrollToBottom from "react-scroll-to-bottom";
import "./style.css"


const drawerWidth = 240;

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
  },
  drawer: {
    width: drawerWidth,
    flexShrink: 0,
    
    position:"relative"
  },
  drawerPaper: {
    width: drawerWidth,

  },
  drawerHeader: {
    display: 'flex',
    height:"47px",
    width:"100%",
    alignItems: 'center',
    boxShadow: "rgba(0, 0, 0, 0.05) 0px 6px 24px 0px, rgba(0, 0, 0, 0.08) 0px 0px 0px 1px",
    '& > h1':{
      fontSize:"1.3rem",
      marginLeft:".5rem"
    }
  },
}));

export default function Chat({showChat, roomID}) {
  const classes = useStyles();
  const currentUser = sessionStorage.getItem('username');
  const [msg, setMsg] = useState([]);
  const [message, setMessage] = useState("")
 // const inputRef = useRef();

  useEffect(() => {
    socket.on('F-receive-message', ({ message, sender }) => {
      setMsg((msgs) => [...msgs, { sender, message }]);
    });
  }, []);



  //helper function
  const sendMessage = () => {
   console.log(msg);
      if (message) {
        socket.emit('B-send-message', { roomID, message, sender: currentUser });
        setMessage("");
      }
   
  };

  return (
    <div className={classes.root}>
      <Drawer
        className={classes.drawer}
        variant="persistent"
        anchor="right"

        open={showChat}
        classes={{
          paper: classes.drawerPaper,
        }}
      >
{/* drawer head */}
<div  className={classes.drawerHeader}>
<h1>Meeting Chat</h1>
</div>
{/* messages area */}
<div className="chat-area">
<ScrollToBottom>
{msg &&
            msg.map(({ sender, message }, idx) => {
              if (sender !== currentUser) {
                return (
                  <div className="member-message" key={idx}>
                    <strong>{sender}</strong>
                    <p>{message}</p>
                  </div>
                );
              } else {
                return (
                  <div className="my-message" key={idx}>
                    <strong>{sender}</strong>
                    <p>{message}</p>
                  </div>
                );
              }
            })}
</ScrollToBottom>
</div>
{/* input text box */}
<div className="textbox-div">
<input placeholder="Enter your message" 
value={message}
onChange={e => setMessage(e.target.value)}
onKeyPress={e => e.key==="Enter"?sendMessage(e):null}
>
</input>
<IconButton color="primary" 
aria-label="add to shopping cart"
onClick={sendMessage}>
      <SendIcon
     ></SendIcon> 
      </IconButton>
</div>

      </Drawer>
    </div>
  );
}
