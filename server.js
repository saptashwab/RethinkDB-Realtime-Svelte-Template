const express = require('express');
// import morgan from 'morgan';
// import dotenv from 'dotenv';
// import neo4j from 'neo4j-driver';
// import { Server } from 'socket.io';
const http = require('http');
const cors = require('cors');
var thinky = require('thinky')();
var type   = thinky.type;
const app = express();
app.use(cors());
const server = http.createServer(app);
// const io = new Server(server);
const io = require('socket.io')(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
    allowedHeaders: ['x-auth-user'],
    credentials: true
  }
});
app.use(express.json());
const port =  3001;

// Add logging middleware using Morgan
// app.use(morgan('combined'));

// let storedSocket;


// io.listen(3001);
server.listen(port, () => {
    console.log(`listening on *:${port}`);
  });
 
// Create a model - the table is automatically created
var DataItem = thinky.createModel("DataItem", {
    id: String,
    temperature: Number,
    vibration: Number,
    moisture: Number,
    createdAt: String,
    updatedAt: String
}); 

 
io.on('connection', (socket) => { 
    console.log('Connected client');
    socket.emit("hello", "world");
    DataItem.run().then(function(items) {
      socket.emit('initialData', items);
    });
 });


DataItem.changes().then(function(feed) {
    feed.each(function(error, doc) {
      if (error) {
        console.log(error);
        process.exit(1);
      }
  
      if (doc.isSaved() === false) {
        console.log("The following document was deleted:");
        console.log(JSON.stringify(doc));
      }
      else if (doc.getOldValue() == null) {
        console.log("A new document was inserted:");
        console.log(JSON.stringify(doc));
        io.sockets.emit('newElement', doc);
      }
      else {
        console.log("A document was updated.");
        console.log("Old value:");
        console.log(JSON.stringify(doc.getOldValue()));
        console.log("New value:");
        console.log(JSON.stringify(doc));
        io.sockets.emit('updatedElement', doc);
      }
    });
  }).error(function(error) {
    console.log(error);
    process.exit(1);
  });