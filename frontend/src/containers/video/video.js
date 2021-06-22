import React,{useEffect,useRef} from 'react';
import "./style.css"

const Video = (props) => {
const ref = useRef();
const peer = props.peer;

useEffect(()=>{

    peer.on("stream", (stream) => {
        ref.current.srcObject = stream;
    });
    peer.on("track", (track, stream) => {

    })

},[peer]);

    return ( 

        <video
        playsInline
        autoPlay
        muted
        ref={ref}>

        </video>

 
     );

}
 
export default Video;