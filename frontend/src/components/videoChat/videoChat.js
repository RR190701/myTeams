import React,{useEffect, useState, useRef} from 'react';
import Peer from 'simple-peer';
import Video from '../../containers/video/video';
import socket from "../../socket";
import "./style.css"
import TopBar from "./../topbar/topbar";
import MicIcon from '@material-ui/icons/Mic';
import MicOffIcon from '@material-ui/icons/MicOff';

const VideoChat = (props) => {
 
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

            setUserVideoAudio((preList) => {
              return {
                ...preList,
                [peer.username]: { video, audio },
              };
            });
          }
        });

        setPeers(peers);
        console.log(userVideoAudio)
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
            username: username,
          });

          //adding single peer
          setPeers((users) => {
            return [...users, peer];
          });

          setUserVideoAudio((preList) => {
            return {
              ...preList,
              [peer.username]: { video, audio },
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

      if (switchTarget === 'video') video = !video;
      else audio = !audio;

      return {
        ...preList,
        [peerIdx.username]: { video, audio },
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
    return (
      <div className="video-box"
        // className={`width-peer${peers.length > 8 ? '' : peers.length}`}
        // onClick={expandScreen}
        key={index}
      >
        {writeUserName(peer.username)}
        {/* <FaIcon className='fas fa-expand' /> */}
        <Video key={index} peer={peer} number={arr.length} />
      </div>

    );
  }

  function writeUserName(username) {
    console.log("uu",username)
    if (userVideoAudio.hasOwnProperty(username)) {
      if (!userVideoAudio[username].video) {
        console.log("username ",username)
        return (                   
       <div className="username" key ={username}>
        <div className="avatar">
          <h1>
          {username[0]}
          </h1>
        
        </div>
        <div className="real-name">
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

    // BackButton
    const goToBack = (e) => {
      e.preventDefault();
      socket.emit('B-leave-room', { roomID, leaver: currentUser });
      sessionStorage.removeItem('username');
      window.location.href = '/';
    };
  
  
    //toggle camera and audio
   const toggleCameraAudio = (e) => {
      const target = e.currentTarget.getAttribute('data-switch');
 
      setUserVideoAudio((preList) => {
        let videoSwitch = preList['localUser'].video;
        let audioSwitch = preList['localUser'].audio;
  
        if (target === 'video') {
          const userVideoTrack = myVideoRef.current.srcObject.getVideoTracks()[0];
          videoSwitch = !videoSwitch;
          userVideoTrack.enabled = videoSwitch;
        } else {
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

  
        return {
          ...preList,
          localUser: { video: videoSwitch, audio: audioSwitch },
        };
      });
  
      socket.emit('B-toggle-camera-audio', { roomID, switchTarget: target });
    };

    return ( 
        <div className ="video-chat-room">
      {/* app bar */}
    <TopBar
    leave = {goToBack}
    userVideoAudio={userVideoAudio['localUser']}
    toggleCameraAudio={toggleCameraAudio}
    ></TopBar>
    {/* video container */}
      <div className="video-container">
        <div className="video-box">
        {userVideoAudio['localUser'].video ? null : (
                                         <div className="username">
                      <div className="avatar">
                        <h1>
                        {currentUser[0]}
                        </h1>
                      
                      </div>
                      <div className="real-name">
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