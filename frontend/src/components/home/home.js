import React from 'react'
import axios from "axios";

const Home = (props) => {

const handleMeet = async() =>{

    try {
        const {data} = await axios.get("/getRoomID")
        props.history?.push(`/join/${data.roomID}`)
    }
    catch(error){
        console.log(error);
    }
}

    return ( <button onClick={handleMeet}>
        meet
    </button> );
}
 
export default Home;