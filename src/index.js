const axios = require('axios');
const moment = require('moment-timezone');

const getISTTime = () => {
    return moment().tz('Asia/Kolkata').format('hh:mm:ss A');
};
module.exports = {

  register(/*{ strapi }*/) {},

  bootstrap({ strapi }) {
    var suggestedMessagesArray=[]
    const io = require('socket.io')(strapi.server.httpServer, {
      cors: {
        origin: "*",
        methods: ["GET", "POST"],
      },
    })
  
    io.on('connection', (socket) => {
      console.log('a user connected');
      socket.emit('connection', JSON.stringify({ message: 'welcome' }));
      socket.on('suggestedMessages', ({suggestedMessages}) => {
        suggestedMessagesArray=suggestedMessages
      });
      socket.on("getsuggestions",({ message }) =>{
        const filteredSuggestions = suggestedMessagesArray.filter(suggestion => 
          suggestion.toLowerCase().includes(message.toLowerCase())
      );
      socket.emit("suggestions_received",JSON.stringify(filteredSuggestions))
      });
      // Handle incoming messages
      socket.on('message', ({ username,message,time }) => {
        
        const serverTime = getISTTime()
        const reply={username:"server",message,time:serverTime};
        io.emit('message', JSON.stringify(reply));
      });
  
      // Handle disconnection
      socket.on('disconnect', () => {
          console.log('a user disconnected');
      });
  });

    strapi.io = io
  },
};