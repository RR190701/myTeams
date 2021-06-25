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
import clsx from 'clsx';
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
    showChat
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
      <IconButton onClick={toggleCameraAudio} className={classes.topBarIcons} data-switch='audio'>
      {
           userVideoAudio.audio? 
            <MicIcon/>
          : 
          <MicOffIcon></MicOffIcon> 
          }
       </IconButton>
       <IconButton onClick={toggleCameraAudio} className={classes.topBarIcons} data-switch='video'>
      {
           userVideoAudio.video? 
           <VideocamIcon />
          : 
          <VideocamOffIcon></VideocamOffIcon>
          }
       </IconButton>
      <Divider orientation="vertical" flexItem  />
      
      <ChatIcon className={classes.topBarIcons} onClick={openChat} />
      <Badge badgeContent={getHandRaised()} color="primary" className="handRaisedCount">
      <PanToolIcon 
      onClick={toggleCameraAudio} 
      className={`${userVideoAudio.handRaised?classes.handRaised:classes.topBarIcons}`} 
       data-switch='handRaised'></PanToolIcon>
      </Badge>

       
      </div>
</div>
      );
}
 
export default TopBar;