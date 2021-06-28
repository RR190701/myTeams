import './App.css';
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link
} from "react-router-dom";
import React from 'react';
import Home from './components/home/home';
import Join from './components/join/join';
import VideoChat from './components/videoChat/videoChat';
import SignUp from './components/signUp/signUp';
import SignIn from './components/login/login';
import PrivateRoute from './routes/privateRoute';

function App() {
  return (
    <div className="App">
<Router>
  <Switch>    
  <PrivateRoute exact path="/" component={Home}/>
  <PrivateRoute exact path="/join/:roomID" component={Join}/>
  <PrivateRoute exact path="/meet/:roomID" component={VideoChat}/>
  <Route exact path="/" component = {Home}></Route>
 <Route exact path="/signUp" component={SignUp}></Route>
  <Route exact path="/signIn" component={SignIn}></Route>
  </Switch>
</Router>
    </div>
  );
}

export default App;
