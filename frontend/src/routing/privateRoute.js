import {Redirect, Route} from 'react-router-dom';

//private routing for protected routes.

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