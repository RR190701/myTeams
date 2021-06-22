import React,{useEffect, useState, useRef} from 'react';
import Peer from 'simple-peer';
import Video from '../../containers/video/video';
import socket from "../../socket";
import AppBar from '@material-ui/core/AppBar';
import "./style.css"
import Grid from '@material-ui/core/Grid';
import Divider from '@material-ui/core/Divider';
import { makeStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import CallEndIcon from '@material-ui/icons/CallEnd';
import ChatIcon from '@material-ui/icons/Chat';
import VideocamIcon from '@material-ui/icons/Videocam';
import MicIcon from '@material-ui/icons/Mic';
import Paper from '@material-ui/core/Paper';

//material UI styling 

const useStyles = makeStyles((theme) => ({
  topBar:{
    backgroundColor:"#212121",
    width:"100%"
  

  },
  topBarGrid: {
    alignItems:"center",
   display:"flex",
   flexDirection:"row-reverse",
  //  border:"white solid 2px!important",
    color: "#f4f4f4",
    '& svg': {
      margin: theme.spacing(1),
      // border:"white solid 2px!important",
      width:"1.25rem"
    },

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
  }
}));

const VideoChat = (props) => {
  const classes = useStyles();
    const currentUser = sessionStorage.getItem('username');
    const roomID = props.match.params.roomID;
    //list of peers connected through same room
    const [peers, setPeers] = useState([]);
    const [videoDevices, setVideoDevices] = useState([]);
    const [userVideoAudio, setUserVideoAudio] = useState({
        localUser: { video: true, audio: true },
      });
    const myVideoRef = useRef();
    const myStream = useRef();
    const peersRef = useRef([]);


    useEffect (()=> {

    // Get Video Devices
    navigator.mediaDevices.enumerateDevices().then((devices) => {
        const video_devices = devices.filter((device) => device.kind === 'videoinput');
        setVideoDevices(video_devices);
      });

    // Set Back Button Event
    window.addEventListener('popstate', goToBack);    

   // Connect Camera & Mic
    navigator.mediaDevices
    .getUserMedia({ video: true, audio: true })
    .then((stream) => {
      myVideoRef.current.srcObject = stream;
      myStream.current = stream;

      //making current user join the room with id:roomID
      socket.emit('B-join-room', { roomID, username: currentUser });

      //when a new user joins video room
      socket.on('F-user-join', (users) => {

        // all users
        const peers = [];
        users.forEach(({ userID, data }) => {
            //userID -> socket.id
            //{username, video, audio}

          let { username, video, audio } = data;

          //calling all the other members of the video room
          if (username !== currentUser) {

            //fuction for calling user with id:UserID and sharing our video stream
            const peer = createPeer(userID, socket.id, stream);

            peer.username = username;
            peer.peerID = userID;

            peersRef.current.push({
              peerID: userID,
              peer,
              username,
            });
            peers.push(peer);
            console.log(peers)

            setUserVideoAudio((preList) => {
              return {
                ...preList,
                [peer.userName]: { video, audio },
              };
            });
          }
        });

        setPeers(peers);
      });

    //receiving call from other room members
    socket.on('F-receive-call', ({ signal, from, data }) => {
        let { username, video, audio } = data;
        const peerIdx = findPeer(from);
        
        //if not present already
        if (!peerIdx) {
          const peer = addPeer(signal, from, stream);

          peer.username = username;

          peersRef.current.push({
            peerID: from,
            peer,
            userName: username,
          });

          //adding single peer
          setPeers((users) => {
            return [...users, peer];
          });

          setUserVideoAudio((preList) => {
            return {
              ...preList,
              [peer.userName]: { video, audio },
            };
          });
        }
      });

      //accepting call from new user
      socket.on('F-call-accepted', ({ signal, answerId }) => {
        const peerIdx = findPeer(answerId);
        peerIdx.peer.signal(signal);
      });

    //removing leaving member from peers connection
    socket.on('F-user-leave', ({ userID, username }) => {
    const peerIdx = findPeer(userID);
    console.log(`${username} left!!`)
    peerIdx.peer.destroy();
    setPeers((users) => {
      users = users.filter((user) => user.peerID !== peerIdx.peer.peerID);
      return [...users];
    });
    
  });

    });


        return () => {
            socket.disconnect();
          };

    // eslint-disable-next-line
    },[])


    //helper fuctions
    //creating a new connection
function createPeer(userID, caller, stream) {
        const peer = new Peer({
          initiator: true,
          trickle: false,
          stream,
        });
    
        peer.on('signal', (signal) => {
          socket.emit('B-call-user', {
            userToCall: userID,
            from: caller,
            signal,
          });
        });
        peer.on('disconnect', () => {
          peer.destroy();
        });
    
        return peer;
      }
    
    //getting ID of peer
function findPeer(id) {
        return peersRef.current.find((p) => p.peerID === id);
      }
//adding calling peer
function addPeer(incomingSignal, callerId, stream) {
    const peer = new Peer({
      initiator: false,
      trickle: false,
      stream,
    });

    peer.on('signal', (signal) => {
      socket.emit('B-accept-call', { signal, to: callerId });
    });

    peer.on('disconnect', () => {
      peer.destroy();
    });

    peer.signal(incomingSignal);

    return peer;
  }    

  //adding other members video to screen
function createUserVideo(peer, index, arr) {
    return (
      <div className="video-box"
        // className={`width-peer${peers.length > 8 ? '' : peers.length}`}
        // onClick={expandScreen}
        key={index}
      >
        {/* {writeUserName(peer.userName)} */}
        {/* <FaIcon className='fas fa-expand' /> */}
        <Video key={index} peer={peer} number={arr.length} />
      </div>
      // <Video key={index}
      // peer={peer}>

      // </Video>
    );
  }

    // BackButton
    const goToBack = (e) => {
      e.preventDefault();
      socket.emit('B-leave-room', { roomID, leaver: currentUser });
      sessionStorage.removeItem('username');
      window.location.href = '/';
    };
  

    return ( 
        <div className ="video-chat-room">
<div className={classes.topBar}>
<div className={classes.topBarGrid}>

        <Button
        variant="contained"
        color="secondary"
        className={classes.leaveButton}
        startIcon={<CallEndIcon />}
      >
        Leave
      </Button>
      <MicIcon/>
      <VideocamIcon />
      <Divider orientation="vertical" flexItem />
      
      <ChatIcon  />
       
      </div>
</div>
      <div className="video-container">
        <div className="video-box">
        <video ref={myVideoRef} 
            muted 
            autoPlay
            playsInline></video>

        </div>
  
          {/* Joined User Vidoe */}
          {peers &&
            peers.map((peer, index, arr) => createUserVideo(peer, index, arr))}

      </div>

        </div>
     );
}
 
export default VideoChat;