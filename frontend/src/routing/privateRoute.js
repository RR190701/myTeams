import { Component } from 'react';
import {Redirect, Route, route} from 'react-router-dom';

const PrivateRoute = ({component: Component, ...rest}) => {
    return (
        <Route
        {...rest}
        render={
            (props) => 
                localStorage.getItem("authToken") ? (
                    <Component {...props}/>
                ) : (
                    <Redirect to="/login"/>
                )
                
            
        }
        />
    )
}
export default PrivateRoute;