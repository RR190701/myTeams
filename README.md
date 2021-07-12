# My Microsoft Teams Clone
> This project is a fully functional prototype of a video call, meet web app, where you will be able to share real time audio and video stream and chat with your friends with lots of other cool features intact :fire:.

## Features
</br>

- [x] User login and SignUp facility
- [x] Welcome home page
- [x] Ability to create meeting and chatting rooms
- [x] Audio and Video check before meeting
- [x] Ability to toggle microphone and camera
- [x] Raising hand facility
- [x] Ability to send animated reactions e.g. love, applause
- [x] Ability to share screen
- [x] Ability to have full screen view with one click
- [x] chat room in meeting
- [x] Chat bubbles pop ups with incoming messages
- [x] Ability to chat real time before, in and after the meeting, **Adapt feature**
- [x] UI is similar to **Microsoft Teams** to get follow along easily :heart:

## Demo version
</br>
A demo version is automatically deployed from our repositories:

- Deployment for frontend part -[https://my-microsoft-teams-clone.netlify.app](https://my-microsoft-teams-clone.netlify.app)
- Deployment for backend part - [https://teams-clone-backend.herokuapp.com](https://teams-clone-backend.herokuapp.com)

## Technology Stack 
</br>
Please get familiar with the components of the project in order to be able to contribute.

### components
- CSS: Styling web pages, html files
- Javascript: Primary programing language
- ReactJS: Javascript library for building User Interfaces
- nodejs: Used in the backend
- express: To create the calling API
- Material-UI: UI library for design system
- socket.io: To established real time socket connection
- WebRTC: for exchanging video and audio streams between peers
- simple-peer: Simple one-to-one WebRTC video/voice and data channels

#### External Service Dependencies
- MongoDB Atlas: A cloud database used to store user personal data username, passwords and individuals chats

## Requirements
</br>

- node --version >= 6
- npm --version >= 3


## Local Installation
</br>

### Steps
- `git clone <repository-url>` where `<repository-url>`is the link to the forked repository
- `cd myTeams`

Note : If you want to contribute, first fork the original repository and clone the forked repository into your local machine followed by `cd` into the directory

```
git clone https://github.com/USERNAME/myTeams.git
cd myTeams
```

#### Config Variables
Define config variables in config.env.

- Create a free mongoDB atlas account at [https://www.mongodb.com](https://www.mongodb.com) and set a new cluster connection url equal to `db_connection_URL`
- Set `JWT_SECRET = <your_jwt_secret_string>` where `<your_jwt_secret_string>` is long alphanumerical string 
- Set `JWT_EXPIRE = <jwt_token_life_time>` where `<jwt_token_life_time>` is a string e.g. 10min, 30min

#### Starting server

```
cd server
```
- Install all the dependencies with `npm install`
- Start the server with `npm start`
- Visit your API at [http://localhost:5000](http://localhost:5000.) :tada:

#### Starting frontend

```
cd frontend
```
- Install all the dependencies with `npm install`
- Start the server with `npm start`
- Visit your app at [http://localhost:3000](http://localhost:3000.) :tada: