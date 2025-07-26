import { io } from 'socket.io-client';

const SERVER_URL = process.env.REACT_APP_SOCKET_SERVER || 'http://localhost:5000';

const socket = io(SERVER_URL, {
  transports: ['websocket'],
  autoConnect: true,
});

export default socket;
