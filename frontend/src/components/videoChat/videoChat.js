import React,{useEffect, useState, useRef} from 'react';
import Peer from 'simple-peer';
import socket from "../../socket";


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

        console.log("new user", users);
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


    return ( 
        <div id ="video-chat">
            <video ref={myVideoRef} 
            muted 
            autoPlay
            playsInline></video>
        </div>
     );
}
 
export default VideoChat;