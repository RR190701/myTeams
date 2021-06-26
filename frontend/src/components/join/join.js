import React,{useRef, useState, useEffect} from 'react'
import socket from "../../socket";
import VideocamOffIcon from '@material-ui/icons/VideocamOff';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Switch from '@material-ui/core/Switch';
import VideocamIcon from '@material-ui/icons/Videocam';
import MicIcon from '@material-ui/icons/Mic';
import MicOffIcon from '@material-ui/icons/MicOff';

import "./style.css";


const Join = (props) => {

    const usernameRef = useRef();
    const [err, setError] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [localUser, setLocalUser] = useState({
        video: true,
        audio: true,
      });
    
    const myVideo = useRef();
    const myStream = useRef();
    const userVideo =useRef(true)
    const userAudio =useRef(true);


//handle camera and audio swtich
    const handleSwitch = (event) => {
        setLocalUser({ ...localUser, [event.target.name]: event.target.checked });
   
      if(event.target.name==="video"){
          userVideo.current = !userVideo.current;
      }
      else{
        userAudio.current = !userAudio.current;
      }
      };
    
    

 useEffect(()=>{
      // Connect Camera & Mic
      navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then((stream) => {
        myVideo.current.srcObject = stream;
        myStream.current = stream;
      });


socket.on("F-user-already-exist", ({error}) => {
    if(!error){
        const roomID = props.match.params.roomID;
        const username = usernameRef.current.value;
        sessionStorage.setItem("username", username) 
        sessionStorage.setItem("video", userVideo.current);
        sessionStorage.setItem("audio",userAudio.current);
        props.history.push(`/meet/${roomID}`)
    }
    else {
       setError(error);
       setErrorMessage("Username already joined the meeting")
    }
})

// eslint-disable-next-line
},[props.history])   

function handleJoin() {
    const roomID = props.match.params.roomID;
    const username =  usernameRef.current.value;
if(!username){
    setError(true);
    setErrorMessage('Enter Room Name or User Name');
}
else{
    socket.emit("B-check-for-user", {roomID, username})
}
}    

    return (
        <div className="audio-video-check">
            <div className="audio-video-check-div">
<span>
    choose your audio and video settings for
</span>
                <h1>
                    New Meeting
                </h1>
{/* video check div */}
<div className="video-check-div">
    {
        userVideo.current? null:(
            <div className="video-off">
                <VideocamOffIcon>                    
                </VideocamOffIcon>
               <span>Your camera is turned off</span> 
                </div>
        )}

<video ref={myVideo} 
            muted 
            autoPlay
            playsInline></video>

</div>

{/* video and audio toggle */}
<div className="video-audio-toggle">
       <div className="mic-video-icon">
        {
            userVideo.current?<VideocamIcon></VideocamIcon>:<VideocamOffIcon></VideocamOffIcon>
        }
        </div>
        <FormControlLabel
          control={<Switch checked={userVideo.current} onChange={handleSwitch} name="video"
          color="primary" />}
        
        >
        </FormControlLabel>
        <div className="mic-video-icon">
        {
            userAudio.current?<MicIcon></MicIcon>:<MicOffIcon></MicOffIcon>
        }
        </div>
        <FormControlLabel
          control={<Switch checked={userAudio.current} onChange={handleSwitch} name="audio" 
          color="primary"/>}
        />
</div>

          {/* username text feild */}
         <div className="username-text-feild">
        <label htmlFor="username">User Name</label>
        <input type="text" id="username" ref={usernameRef} />
        <button onClick ={handleJoin}>
            join
        </button>
        <span>{err?errorMessage:null}</span>
        </div>
            </div>
        </div>

      );
}
 
export default Join;