import io from 'socket.io-client';
// const sockets = io('/');
const sockets = io('https://teams-clone-backend.herokuapp.com');
export default sockets;