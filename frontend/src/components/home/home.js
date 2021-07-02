import React from 'react'
import axios from "axios";
import Lottie from 'react-lottie';
import * as teams from './../../utils/teams.json';
import Button from '@material-ui/core/Button';
import VideoCallIcon from '@material-ui/icons/VideoCall';
import "./style.css";

const Home = (props) => {
        
    const defaultOptions = {
        loop: true,
        autoplay: true, 
        animationData: teams.default,
        rendererSettings: {
          preserveAspectRatio: 'xMidYMid slice'
        }
      };

const handleMeet = async() =>{

    try {
        const {data} = await axios.get("https://teams-clone-backend.herokuapp.com/getRoomID")
        //  const {data} = await axios.get("/getRoomID")
        props.history?.push(`/join/${data.roomID}`)
    }
    catch(error){
        console.log(error);
    }
}

    return (
        <div className ="home-page">
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
        </div>);
}
 
export default Home;