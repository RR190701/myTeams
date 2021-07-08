import React from 'react';
import ExitToAppIcon from '@material-ui/icons/ExitToApp';
import Tooltip from '@material-ui/core/Tooltip';
import "./style.css";

const Navbar = ({recentRoomID}) => {

    const logoutHandler = () => {
        localStorage.removeItem("authToken");
        localStorage.removeItem("username");
        window.location.href = '/login';
      };


    return ( <div className="navbar">
        <Tooltip title="Log out" arrow>
        <ExitToAppIcon
        onClick ={logoutHandler}
        className ="logout-icon" ></ExitToAppIcon>
    </Tooltip>

    </div> );
}
 
export default Navbar;