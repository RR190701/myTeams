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

function App() {
  return (
    <div className="App">
<Router>
  <Route exact path="/" component = {Home}></Route>
  <Route exact path ="/join/:roomID" component={Join}></Route>
  <Route exact path = "/meet/:roomID" component={VideoChat}></Route>
</Router>
    </div>
  );
}

export default App;
