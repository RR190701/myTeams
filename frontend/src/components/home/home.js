import React, {useEffect, useState, useRef} from 'react'
import axios from "axios";
import Lottie from 'react-lottie';
import * as teams from './../../utils/teams.json';
import Button from '@material-ui/core/Button';
import VideoCallIcon from '@material-ui/icons/VideoCall';
import ChatIcon from '@material-ui/icons/Chat';
import HistoryIcon from '@material-ui/icons/History';
import Snackbar from '@material-ui/core/Snackbar';
import "./style.css";
import Navbar from '../Navbar/navbar';



const Home = (props) => {
  const recentRoomID =useRef("");
  const [popMessge, setPopMessage] =useState("");
  const [open, setOpen] = React.useState(false);

  const handleClose = (event, reason) => {
      if (reason === 'clickaway') {
        return;
      }
  
      setOpen(false);
      setPopMessage("");
    };
        
    const defaultOptions = {
        loop: true,
        autoplay: true, 
        animationData: teams.default,
        rendererSettings: {
          preserveAspectRatio: 'xMidYMid slice'
        }
      };

      const recentChatRoom = () =>{

        if(recentRoomID.current === ""){
          setPopMessage("No chat room in history")  
          setOpen(true);
          return;
        }
       
        
      props.history?.push(`/chat/${recentRoomID.current}`)
    }

      useEffect(() => {
        if (!localStorage.getItem("authToken")) {
          window.location.href = '/login';
        }
      
        const fetchPrivateData = async () => {
          const config = {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("authToken")}`,
            },
          };
          
          
      
          try {
      
            const { data } = await axios.get(`https://teams-clone-backend.herokuapp.com/profile/${localStorage.getItem("username")}`, config);
            
            if(data.roomID === "undefined"){
               recentRoomID.current ="";
            }
            else{
              recentRoomID.current=data.roomID;
            }


          } catch (error) {
            localStorage.removeItem("authToken");
            localStorage.removeItem("username");
          }
        };
        fetchPrivateData();
      }, [props.history]);

const handleMeet = async() =>{

    try {
        const {data} = await axios.get("https://teams-clone-backend.herokuapp.com/getRoomID")
      
        props.history?.push(`/join/${data.roomID}`)
    }
    catch(error){
        console.log(error);
    }
}
const handleChat = async() =>{

  try {
      const {data} = await axios.get("https://teams-clone-backend.herokuapp.com/getRoomID")
   
      props.history?.push(`/chat/${data.roomID}`)
  }
  catch(error){
      console.log(error);
  }
}

    return (
        <div className ="home-page">
          {/* navbar */}
          <Navbar
          recentRoomID= {recentRoomID.current}></Navbar>

<h1>Welcome to Microsoft Teams clone</h1>
        <Lottie options={defaultOptions}
          height={350}
          width={350}
          />
<Button variant="contained" 
onClick ={handleMeet}>
    <VideoCallIcon style ={{marginRight:".5rem"}}></VideoCallIcon>
  meet now
</Button>
<Button variant="contained" 
onClick ={handleChat}>
    <ChatIcon style ={{marginRight:".5rem"}}></ChatIcon>
  Chat now
</Button>

{/* recent chat room */}
<Button variant="contained" 
onClick ={recentChatRoom}>
   <HistoryIcon style ={{marginRight:".5rem"}}></HistoryIcon>
  Recent Chat Room
</Button>

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
 
export default Home;