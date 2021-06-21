import React,{useRef, useState, useEffect} from 'react'
import socket from "../../socket";


const Join = (props) => {

    // const usernameRef = useRef(null);
    const [err, setError] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [username, setUsername] = useState("");
    

 useEffect(()=>{
socket.on("F-user-already-exist", ({error}) => {
    if(!error){
        const roomID = props.match.params.roomID;
        // const username = usernameRef.current.value;
        sessionStorage.setItem("username", username)
        props.history.push(`/meet/${roomID}`)
    }
    else {
       setError(error);
       setErrorMessage("Username already joined the meeting")
       console.log(errorMessage)
    }


})

// eslint-disable-next-line
},[])   

function handleJoin() {
    const roomID = props.match.params.roomID;
    // const username =  usernameRef.current.value;
if(!username){
    setError(true);
}
else{
    socket.emit("B-check-for-user", {roomID, username})
}
}    

    return (
        <div>
        <label htmlFor="username">User Name</label>
        <input type="text" id="username" value={username} onChange={(e)=>setUsername(e.target.value)} />
        <button onClick ={handleJoin}>
            join
        </button>
        <span>{err?errorMessage:null}</span>
        </div>
      );
}
 
export default Join;