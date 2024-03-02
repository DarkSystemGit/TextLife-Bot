

const s= require('ws')

const ws = new s.WebSocket('ws://localhost:6078');


ws.on('error', console.error);

ws.on('open', function open() {
 
});

ws.on('message', function message(data) {
  console.log('received: %s', data);
  if(data=='Ready!'){
    ws.send('hallo')
    console.log('sent: hallo')
  }
});