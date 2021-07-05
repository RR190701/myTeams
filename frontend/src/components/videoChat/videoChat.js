import React,{useEffect, useState, useRef} from 'react';
import Peer from 'simple-peer';
import Video from '../../containers/video/video';
import socket from "../../socket";
import "./style.css"
import TopBar from "./../topbar/topbar";
import MicIcon from '@material-ui/icons/Mic';
import MicOffIcon from '@material-ui/icons/MicOff';
import PanToolIcon from '@material-ui/icons/PanTool';
import Chat from './../Chat/chat';
import Snackbar from '@material-ui/core/Snackbar';
import Slide from '@material-ui/core/Slide';
import Lottie from 'react-lottie';
import FullscreenIcon from '@material-ui/icons/Fullscreen';
import * as heart from './../../utils/heart-lottie.json'
import * as celebrate from "./../../utils/claps.json";
import Tooltip from '@material-ui/core/Tooltip';

function SlideTransition(props) {
  return <Slide {...props} direction="up" />;
}

const VideoChat = (props) => {
 
    const currentUser = sessionStorage.getItem('username');
    const roomID = props.match.params.roomID;
    //list of peers connected through same room
    const [peers, setPeers] = useState([]);
    const [videoDevices, setVideoDevices] = useState([]);
    const [screenShare, setScreenShare] = useState(false);
    const [showChat, setShowChat] = useState(false);
    const [userVideoAudio, setUserVideoAudio] = useState({
        localUser: { video: sessionStorage.getItem("video")==="true"?true:false, 
        audio: sessionStorage.getItem("audio")==="true"?true:false, handRaised: false, reaction:""},
      });
    const myVideoRef = useRef();
    const screenTrackRef = useRef();
    const myStream = useRef();
    const peersRef = useRef([]);
    const [state, setState] = useState(false);
    const [personRaisedHand,  setPersonRaisedHand] = useState("");
    
    const defaultOptions = {
      loop: true,
      autoplay: true, 
      animationData: heart.default,
      rendererSettings: {
        preserveAspectRatio: 'xMidYMid slice'
      }
    };

    const celebrateOptions ={
      loop: true,
      autoplay: true, 
      animationData: celebrate.default,
      rendererSettings: {
        preserveAspectRatio: 'xMidYMid slice'
      }
    }

    useEffect (()=> {

    // Get Video Devices
    navigator.mediaDevices.enumerateDevices().then((devices) => {
        const video_devices = devices.filter((device) => device.kind === 'videoinput');
        setVideoDevices(video_devices);
      });

    // Set Back Button Event
    window.addEventListener('popstate', goToBack); 

    //tab switch events
  //   window.addEventListener('beforeunload', function (e) {
  //     e.preventDefault();
  //     e.returnValue = '';
  // });
    

   // Connect Camera & Mic
    navigator.mediaDevices
    .getUserMedia({ video: true, audio: true })
    .then((stream) => {
      myVideoRef.current.srcObject = stream;
      myStream.current = stream;

      //making current user join the room with id:roomID
      socket.emit('B-join-room', { roomID, username: currentUser, video:userVideoAudio["localUser"].video, audio:userVideoAudio["localUser"].audio});

      //when a new user joins video room
      socket.on('F-user-join', (users) => {

        // all users
        const peers = [];
        users.forEach(({ userID, data }) => {
            //userID -> socket.id
            //{username, video, audio}

          let { username, video, audio, handRaised, reaction } = data;
      

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

            setUserVideoAudio((preList) => {
              return {
                ...preList,
                [peer.username]: { video, audio, handRaised ,reaction},
              };
            });
          }
        });

        setPeers(peers);
      });

    //receiving call from other room members
    socket.on('F-receive-call', ({ signal, from, data }) => {
        let { username, video, audio, handRaised, reaction } = data;
        const peerIdx = findPeer(from);
        
        //if not present already
        if (!peerIdx) {
          const peer = addPeer(signal, from, stream);

          peer.username = username;

          peersRef.current.push({
            peerID: from,
            peer,
            username: username,
          });

          //adding single peer
          setPeers((users) => {
            return [...users, peer];
          });

          setUserVideoAudio((preList) => {
            return {
              ...preList,
              [peer.username]: { video, audio, handRaised, reaction },
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
    console.log(`${peerIdx.username} left!!`);
    peerIdx.peer.destroy();


    setPeers((users) => {
      users = users.filter((user) => user.peerID !== peerIdx.peer.peerID);
      return [...users];
    });
    console.log(peers);

    setUserVideoAudio((preList) => {
      return {
        ...preList,
        [username]: { video:false, audio:false, handRaised:false, reaction:"" },
      };
    });
console.log(userVideoAudio);
    
  });

  //toggling video and audio
  socket.on('F-toggle-camera-audio', ({ userID, switchTarget }) => {
    const peerIdx = findPeer(userID);

    setUserVideoAudio((preList) => {
      let video = preList[peerIdx.username].video;
      let audio = preList[peerIdx.username].audio;
      let handRaised = preList[peerIdx.username].handRaised;
      let reaction = preList[peerIdx.username].reaction;

      if (switchTarget === 'video') video = !video;
      else if(switchTarget === 'audio') audio = !audio;
      else if(switchTarget === 'handRaised'){
      handRaised= !handRaised;
      if(handRaised && peerIdx.username!==currentUser){
        setState(true);
        setPersonRaisedHand(peerIdx.username);
      }
      
      }
      else if(switchTarget === 'heart'){
      if(reaction==='')
      reaction = switchTarget;
      else
      reaction='';
      }
      else if(switchTarget === 'celebrate'){
        if(reaction==='')
        reaction = switchTarget;
        else
        reaction='';
        }

      return {
        ...preList,
        [peerIdx.username]: { video, audio, handRaised, reaction },
      };
    });

//timer for who raised hand popup
      const timer = setTimeout(() => {
        if(switchTarget==='handRaised'){

          setState(false)
          setPersonRaisedHand("");
        }
        else return;
      }, 1300);
      return () => clearTimeout(timer);

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
  const username = peer.username;
  let borderClass = "";
  if (userVideoAudio.hasOwnProperty(username)){
  
  
 
    if(userVideoAudio[username].video && userVideoAudio[username].handRaised)
    borderClass ="video-on-and-handRaised";
    else if(userVideoAudio[username].video && userVideoAudio[username].audio)
    borderClass ="video-on-audio-on";
    else if(userVideoAudio[username].video)
    borderClass = "video-on";
  }
  


    return (
      <div className={`video-box ${borderClass}`}
        // className={`width-peer${peers.length > 8 ? '' : peers.length}`}
        // onClick={expandScreen}
        key={index}
      >
        {generateLottie(peer.username)}
        {writeUserName(peer.username)}
        {writeUserNameOnVideo(peer.username)}
        {/* <FaIcon className='fas fa-expand' /> */}
        <Video key={index} peer={peer} number={arr.length}
        fullScreen ={fullScreen} />
      </div>

    );
  }

  function generateLottie (username){

    if (userVideoAudio.hasOwnProperty(username)){
      let reaction;
      if(userVideoAudio[username].reaction === "heart")
      reaction = defaultOptions;
      else
      reaction = celebrateOptions;

      return(
        <React.Fragment>
        {
        userVideoAudio[username].reaction?
          <Lottie options={reaction}
          height={100}
          width={80}
          style={{position:"absolute", bottom:"0"}}/>:
          null
        }
        </React.Fragment>

      );
    }

  }

  function writeUserName(username) {

    if (userVideoAudio.hasOwnProperty(username)) {

      let addClass ='';
      if(userVideoAudio[username].audio && userVideoAudio[username].handRaised){
       
        addClass ="speaking-with-camera-off-hand-raised";
      }
      else if(userVideoAudio[username].handRaised){
     
        addClass ="camera-off-hand-raised";
      }
     
      else if(userVideoAudio[username].audio)
      addClass ="speaking-with-camera-off";

      if (!userVideoAudio[username].video) {
       
        return (                   
       <div className="username">
       <div className={`avatar ${addClass}`}>
          <h1>
          {username[0]}
          </h1>
        
        </div>
        <div className="real-name">
          {
           userVideoAudio[username].handRaised? 
           <PanToolIcon className= "hand-raised"/>
         : 
         null
          }
          <div>{username}</div>
          {
           userVideoAudio[username].audio? 
            <MicIcon/>
          : 
          <MicOffIcon></MicOffIcon> 
          }
                      </div>
        </div>);
      }
    }
  }

  function writeUserNameOnVideo(username){
    if (userVideoAudio.hasOwnProperty(username)) {


      if (userVideoAudio[username].video) {
       
        return (  
          <div class ="username-on-video">
          { userVideoAudio[username].handRaised?<PanToolIcon style={{color:"#FFCC00"}}></PanToolIcon>:null}
          <div>
            {username}
          </div>
          { userVideoAudio[username].audio?<MicIcon></MicIcon>:<MicOffIcon></MicOffIcon>}
                </div>   
             
      );
      }
    }
  }
    // BackButton
    const goToBack = (e) => {
      e.preventDefault();
      socket.emit('B-leave-room', { roomID, leaver: currentUser });
      sessionStorage.removeItem('username');
      window.location.href = '/';
    };
  
    //show Chat
const openChat = (e) => {
  e.stopPropagation();
  setShowChat(!showChat);
}
  
    //toggle camera and audio
   const toggleCameraAudio = (e) => {
      const target = e.currentTarget.getAttribute('data-switch');
 
      setUserVideoAudio((preList) => {
        let videoSwitch = preList['localUser'].video;
        let audioSwitch = preList['localUser'].audio;
        let handRaisedSwitch = preList['localUser'].handRaised;
        let reactionSwitch = preList['localUser'].reaction;
  
        if (target === 'video') {
          const userVideoTrack = myVideoRef.current.srcObject.getVideoTracks()[0];
          videoSwitch = !videoSwitch;
          userVideoTrack.enabled = videoSwitch;
        } 
        else if(target === 'audio') {
          const userAudioTrack = myVideoRef.current.srcObject.getAudioTracks()[0];
          const userVideoTrack = myVideoRef.current.srcObject.getVideoTracks()[0];
          audioSwitch = !audioSwitch;
  
          if (userAudioTrack) {
            userAudioTrack.enabled = audioSwitch;
            userVideoTrack.enabled = videoSwitch;
            
          } else {
            myStream.current.getAudioTracks()[0].enabled = audioSwitch;
          }
        }
        else if(target === 'handRaised'){
          handRaisedSwitch = !handRaisedSwitch;
        }
     else if( target === 'heart'){
        reactionSwitch = 'heart';
     }

     else if(target === 'celebrate'){
      reactionSwitch = 'celebrate';
     }

  
        return {
          ...preList,
          localUser: { video: videoSwitch, audio: audioSwitch, handRaised: handRaisedSwitch, reaction:reactionSwitch },
        };
      });
      

  //timer function
  const timer = setTimeout(() => {
    if(target === "heart" || target=== 'celebrate'){

      setUserVideoAudio((preList) => {
        let videoSwitch = preList['localUser'].video;
        let audioSwitch = preList['localUser'].audio;
        let handRaisedSwitch = preList['localUser'].handRaised;
        let reactionSwitch = preList['localUser'].reaction;
  
        reactionSwitch="";
        return {
          ...preList,
          localUser: { video: videoSwitch, audio: audioSwitch, handRaised: handRaisedSwitch, reaction:reactionSwitch },
        };
        
      });
      socket.emit('B-toggle-camera-audio', { roomID, switchTarget: target });
    }
    else return;
  }, 2000);
    
  
      socket.emit('B-toggle-camera-audio', { roomID, switchTarget: target });
      return () => clearTimeout(timer);
    };

    //SCREEN SHARING 
    const handleScreenSharing = () => {
      console.log("hello")
      if (!screenShare) {
        navigator.mediaDevices
          .getDisplayMedia({ cursor: true })
          .then((stream) => {
            const screenTrack = stream.getTracks()[0];
  
            peersRef.current.forEach(({ peer }) => {
              // replaceTrack (oldTrack, newTrack, oldStream);
              peer.replaceTrack(
                peer.streams[0]
                  .getTracks()
                  .find((track) => track.kind === 'video'),
                screenTrack,
                myStream.current
              );
            });
  
            // Listen click end
            screenTrack.onended = () => {
              peersRef.current.forEach(({ peer }) => {
                peer.replaceTrack(
                  screenTrack,
                  peer.streams[0]
                    .getTracks()
                    .find((track) => track.kind === 'video'),
                  myStream.current
                );
              });
              myVideoRef.current.srcObject = myStream.current;
              setScreenShare(false);
            };
  
            myVideoRef.current.srcObject = stream;
            screenTrackRef.current = screenTrack;
            setScreenShare(true);
          });
      } else {
        screenTrackRef.current.onended();
      }
    };

    //closing  chat
    const closeChat = () =>{
 setShowChat(false);
    };

    //full screen
    const fullScreen = (e) => {
      const elem = e.target;
  
      if (elem.requestFullscreen) {
        elem.requestFullscreen();
      } else if (elem.mozRequestFullScreen) {
        /* Firefox */
        elem.mozRequestFullScreen();
      } else if (elem.webkitRequestFullscreen) {
        /* Chrome, Safari & Opera */
        elem.webkitRequestFullscreen();
      } else if (elem.msRequestFullscreen) {
        /* IE/Edge */
        elem.msRequestFullscreen();
      }
    };
    
    //defining addClass
    let addClass ='';
    if(userVideoAudio["localUser"].audio && userVideoAudio["localUser"].handRaised){
  
      addClass ="speaking-with-camera-off-hand-raised";
    }
    else if(userVideoAudio["localUser"].handRaised){
    
      addClass ="camera-off-hand-raised";
    }   
    else if(userVideoAudio["localUser"].audio)
    addClass ="speaking-with-camera-off";


    //defining border class
    let borderClass = "";
    if(userVideoAudio["localUser"].video && userVideoAudio["localUser"].handRaised)
    borderClass ="video-on-and-handRaised";
    else if(userVideoAudio["localUser"].video && userVideoAudio["localUser"].audio)
    borderClass ="video-on-audio-on";
    else if(userVideoAudio["localUser"].video)
    borderClass = "video-on";

    //defining reaction
    let userReaction;
    if(userVideoAudio['localUser'].reaction === "heart")
    userReaction = defaultOptions;
    else
    userReaction = celebrateOptions;


    return ( 
        <div className ="video-chat-room">
      {/* app bar */}
    <TopBar
    leave = {goToBack}
    userVideoAudio={userVideoAudio['localUser']}
    peersVideoAudio={userVideoAudio}
    toggleCameraAudio={toggleCameraAudio}
    openChat={openChat}
    showChat={showChat}
    screenShare={screenShare}
    handleScreenSharing={handleScreenSharing}
    roomID={roomID}
    ></TopBar>
    {/* video container */}
      <div className={`video-container ${showChat?"showChat":"hideChat"}`}>
        <div className={`video-box ${borderClass}` }>
          {
            userVideoAudio['localUser'].reaction?
            <Lottie options={userReaction}
            height={100}
            width={80}
            style={{position:"absolute", bottom:"0"}}/>:
            null
          }
 
        {userVideoAudio['localUser'].video ? null : (
                      <div className="username">
                      <div className={`avatar ${addClass}`}>
                        <h1>
                        {currentUser[0]}
                        </h1>
                      
                      </div>
                      <div className="real-name">
                      {
           userVideoAudio["localUser"].handRaised? 
           <PanToolIcon className= "hand-raised"/>
         : 
         null
          }
                        <div>{currentUser}</div>
                        {
           userVideoAudio['localUser'].audio? 
            <MicIcon/>
          : 
          <MicOffIcon></MicOffIcon> 
          }
                      </div>
                      </div>
            )}
{
  userVideoAudio["localUser"].video?
  (
    <div class = "username-on-video">
{ userVideoAudio["localUser"].handRaised?<PanToolIcon style={{color:"#FFCC00"}}></PanToolIcon>:null}
<div>
  {currentUser}
</div>
{ userVideoAudio["localUser"].audio?<MicIcon></MicIcon>:<MicOffIcon></MicOffIcon>}
      </div>

  ):
  null
}
        <video 
        ref={myVideoRef} 
        onClick={fullScreen}
            autoPlay
            muted
            playInline></video>

        </div>
  
          {/* Joined User Vidoe */}
          {peers &&
            peers.map((peer, index, arr) => createUserVideo(peer, index, arr))}

      </div>    
       {/* chat application */}
     <Chat
     showChat={showChat}
     roomID={roomID}
    
    closeChat={closeChat}
     ></Chat>

<Snackbar
      className="hand-raised-pop-up"
      anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        open={state}
        TransitionComponent={SlideTransition}
        message={`${personRaisedHand} raised hand`}

      />

        </div>
     );
}
 
export default VideoChat;