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

const VideoChat = (props) => {
 
    const currentUser = sessionStorage.getItem('username');
    const roomID = props.match.params.roomID;
    //list of peers connected through same room
    const [peers, setPeers] = useState([]);
    const [videoDevices, setVideoDevices] = useState([]);
    const [showChat, setShowChat] = useState(false);
    const [userVideoAudio, setUserVideoAudio] = useState({
        localUser: { video: true, audio: true , handRaised: false},
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

          let { username, video, audio, handRaised } = data;
          console.log("here", handRaised)

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
                [peer.username]: { video, audio, handRaised },
              };
            });
          }
        });

        setPeers(peers);
      });

    //receiving call from other room members
    socket.on('F-receive-call', ({ signal, from, data }) => {
        let { username, video, audio, handRaised } = data;
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
              [peer.username]: { video, audio, handRaised },
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

  //toggling video and audio
  socket.on('F-toggle-camera-audio', ({ userID, switchTarget }) => {
    const peerIdx = findPeer(userID);

    setUserVideoAudio((preList) => {
      let video = preList[peerIdx.username].video;
      let audio = preList[peerIdx.username].audio;
      let handRaised = preList[peerIdx.username].handRaised;

      if (switchTarget === 'video') video = !video;
      else if(switchTarget === 'audio') audio = !audio;
      else handRaised= !handRaised;

      return {
        ...preList,
        [peerIdx.username]: { video, audio, handRaised },
      };
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
        {writeUserName(peer.username)}
        {writeUserNameOnVideo(peer.username)}
        {/* <FaIcon className='fas fa-expand' /> */}
        <Video key={index} peer={peer} number={arr.length} />
      </div>

    );
  }

  function writeUserName(username) {

    if (userVideoAudio.hasOwnProperty(username)) {

      let addClass ='';
      if(userVideoAudio[username].audio && userVideoAudio[username].handRaised){
        // console.log("raised")
        addClass ="speaking-with-camera-off-hand-raised";
      }
      else if(userVideoAudio[username].handRaised){
        // console.log("raised")
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
        else{
          handRaisedSwitch = !handRaisedSwitch;
        }

  
        return {
          ...preList,
          localUser: { video: videoSwitch, audio: audioSwitch, handRaised: handRaisedSwitch },
        };
      });
  
      socket.emit('B-toggle-camera-audio', { roomID, switchTarget: target });
    };

    
    //defining addClass
    let addClass ='';
    if(userVideoAudio["localUser"].audio && userVideoAudio["localUser"].handRaised){
      // console.log("raised")
      addClass ="speaking-with-camera-off-hand-raised";
    }
    else if(userVideoAudio["localUser"].handRaised){
      // console.log("raised")
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
    ></TopBar>
    {/* video container */}
      <div className={`video-container ${showChat?"showChat":"hideChat"}`}>
        <div className={`video-box ${borderClass}` }>
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
        <video ref={myVideoRef} 
            muted 
            autoPlay
            playsInline></video>

        </div>
  
          {/* Joined User Vidoe */}
          {peers &&
            peers.map((peer, index, arr) => createUserVideo(peer, index, arr))}

      </div>
     {/* chat application */}
     <Chat
     showChat={showChat}
     roomID={roomID}
     ></Chat>

        </div>
     );
}
 
export default VideoChat;