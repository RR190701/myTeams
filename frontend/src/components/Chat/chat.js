import React, {useState, useEffect} from 'react';
import socket from '../../socket';
import { makeStyles} from '@material-ui/core/styles';
import Drawer from '@material-ui/core/Drawer';
import IconButton from '@material-ui/core/IconButton';
import SendIcon from '@material-ui/icons/Send';
import ScrollToBottom from "react-scroll-to-bottom";
import Snackbar from '@material-ui/core/Snackbar';
import CloseIcon from '@material-ui/icons/Close';
import Slide from '@material-ui/core/Slide';
import ClearIcon from '@material-ui/icons/Clear';
import "./style.css"

function SlideTransition(props) {
  return <Slide {...props} direction="down" />;
}

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
    justifyContent:'space-between',
    boxShadow: "rgba(0, 0, 0, 0.05) 0px 6px 24px 0px, rgba(0, 0, 0, 0.08) 0px 0px 0px 1px",
    '& > h1':{
      fontSize:"1.3rem",
      marginLeft:".5rem"
    }
  },
}));

export default function Chat({showChat, 
  roomID,
closeChat}) {
  const classes = useStyles();
  const currentUser = localStorage.getItem('username');
  const [msg, setMsg] = useState([]);
  const [message, setMessage] = useState("")
  const [state, setState] = useState(false);
  const [newMessage,  setNewMessage] = useState("");
  const [sender, setSender] = useState("")
 // const inputRef = useRef();

  useEffect(() => {

//getting chats from room
socket.on("F-get-room-chat", (results) => {
 
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


 //adding new messages to the list
    socket.on('F-receive-message', ({ message, sender }) => {
   
      setMsg((msgs) => [...msgs, { sender, message }]);

      if(sender!==currentUser){
        setState(true);
        setNewMessage(message);
        setSender(sender);
      }


      const timer = setTimeout(() => {
        setState(false)
        setNewMessage("");
        setSender("");

      }, 1000);
      return () => clearTimeout(timer);
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);



  //helper function
  const sendMessage = () => {
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
<IconButton onClick ={closeChat}>
  <ClearIcon></ClearIcon>
</IconButton>
</div>
{/* messages area */}
<div className="chat-area">
  <div className= "messages">
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
{/* input text box */}
<div className="textbox-div">
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
      </Drawer>

{/* snackbar */}
      <Snackbar
      className="new-message"
      anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        open={state}
        TransitionComponent={SlideTransition}
        message={`${sender} : ${newMessage}`}
        action={
          <React.Fragment>
            <IconButton size="small" aria-label="close" color="inherit" onClick={()=>setState(false)}>
              <CloseIcon fontSize="small" />
            </IconButton>
          </React.Fragment>
        }
      />
      
    </div>
  );
}
