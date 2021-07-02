import React, {useState, useEffect} from 'react';
import Divider from '@material-ui/core/Divider';
import { makeStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import CallEndIcon from '@material-ui/icons/CallEnd';
import ChatIcon from '@material-ui/icons/Chat';
import VideocamIcon from '@material-ui/icons/Videocam';
import MicIcon from '@material-ui/icons/Mic';
import MicOffIcon from '@material-ui/icons/MicOff';
import IconButton from '@material-ui/core/IconButton';
import VideocamOffIcon from '@material-ui/icons/VideocamOff';
import PanToolIcon from '@material-ui/icons/PanTool';
import Badge from '@material-ui/core/Badge';
import FavoriteIcon from '@material-ui/icons/Favorite';
import InsertEmoticonIcon from '@material-ui/icons/InsertEmoticon';
import Tooltip from '@material-ui/core/Tooltip';
import PresentToAllIcon from '@material-ui/icons/PresentToAll';
import "./style.css";
//material UI styling 


const useStyles = makeStyles((theme) => ({
    topBar:{
      backgroundColor:"#212121",
    },
    topBarGrid: {
      alignItems:"center",
     display:"flex",
     flexDirection:"row-reverse",
    //  border:"white solid 2px!important",
      color: "#f4f4f4"
    },

      topBarIcons: {
        color: "#f4f4f4",
        margin: theme.spacing(1.5),
        padding:0,
        width:"1.25rem",
        cursor:"pointer"
      },
  

    leaveButton:{
     padding:"0 .5rem 0 .3rem!important",
      margin:".35rem 1rem .35rem .2rem",
      height:"30px",
      textTransform:"capitalize",
      fontWeight:"bold",
      '& svg': {
        marginRight:".1rem"
      }
    },

    handRaised:{
      color:"#FFCC00",
      margin: theme.spacing(1.5),
      padding:0,
      // border:"white solid 2px!important",
      width:"1.25rem",
      cursor:"pointer",
    }
  }));
  
const TopBar = ({
    leave,
    userVideoAudio,
    toggleCameraAudio,
    peersVideoAudio,
    openChat,
    showChat,
    handleScreenSharing,
    screenShare
}) => {

    const classes = useStyles();
   

const getHandRaised = ()=> {
  const keys = Object.keys(peersVideoAudio);
  let handRaised=0;
  keys.forEach((key, index) => {
if(peersVideoAudio[key].handRaised)
handRaised+=1;
});
  return handRaised;
}

    return (
        <div       
        className={`${classes.topBar} ${showChat?"showChat":"hideChat"}`}>

<div className={classes.topBarGrid}>

        <Button
        variant="contained"
        color="secondary"
        onClick={leave}
        className={classes.leaveButton}
        startIcon={<CallEndIcon  className={classes.topBarIcons}/>}
      >
        Leave
      </Button>
      {/* microphone button */}
      <Tooltip title ={userVideoAudio.audio?"Turn off mic":"Turn on mic"}>
      <IconButton onClick={toggleCameraAudio} className={classes.topBarIcons} data-switch='audio'>
      {
           userVideoAudio.audio? 
            <MicIcon/>
          : 
          <MicOffIcon></MicOffIcon> 
          }
       </IconButton>
      </Tooltip>

{/* camera Button */}
<Tooltip title ={userVideoAudio.video?"Turn off camera":"Turn on camera"}>
<IconButton onClick={toggleCameraAudio} className={classes.topBarIcons} data-switch='video'>
      {
           userVideoAudio.video? 
           <VideocamIcon />
          : 
          <VideocamOffIcon></VideocamOffIcon>
          }
       </IconButton>
</Tooltip>

{/* shcreen share */}
<Tooltip title="share screen">
  <PresentToAllIcon className ={classes.topBarIcons} onClick={handleScreenSharing}/>
</Tooltip>


      <Divider orientation="vertical" flexItem  />
      
      {/* chat icon */}
      <Tooltip title="Chat">
      <ChatIcon className={classes.topBarIcons} onClick={openChat} />
      </Tooltip>
      
      {/* hand raised button */}
      <Tooltip title={`${userVideoAudio.handRaised?"Put hand down":"Raise hand"}`}>
      <Badge badgeContent={getHandRaised()} color="primary" className="handRaisedCount">
      <PanToolIcon 
      onClick={toggleCameraAudio} 
      className={`${userVideoAudio.handRaised?classes.handRaised:classes.topBarIcons}`} 
       data-switch='handRaised'></PanToolIcon>
      </Badge>
      </Tooltip>



      {/* //heart reaction */}
      <Tooltip title ="React love">
      <FavoriteIcon
      onClick={toggleCameraAudio} 
      className={`${classes.topBarIcons}`} 
       data-switch='heart'></FavoriteIcon>
      </Tooltip>

 {/* celebrate reaction */}
 <Tooltip title="Send applause">
 <InsertEmoticonIcon
      onClick={toggleCameraAudio} 
      className={`${classes.topBarIcons}`} 
       data-switch='celebrate'></InsertEmoticonIcon>
 </Tooltip>


       
      </div>
</div>
      );
}
 
export default TopBar;