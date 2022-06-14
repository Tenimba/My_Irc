var app = require('express')();
var http = require('http').createServer(app);
const io = require("socket.io")(http);

var users = [];
var channels = ['#accueil'];

io.on('connection', (socket, messages) => {
    var me = '';

    socket.on('login', (user) => {
        users.push(user.username);
        me = user.username;
        io.emit('listUsers', {
            user: users
        })

        io.emit('listChannels', {
            channels: channels
        })

        socket.broadcast.emit('newuser', {
            username: user.username
        })

    });

    socket.on('disconnect', (user) => {
        if(me != '') {
            socket.broadcast.emit('disuser', {
                username: me
            })
            users = users.filter(user => user !== me);
            io.emit('listUsers', {
                user: users
            })
        }
    })


    socket.on('newmessage', function(message) {
        io.emit('newmsg', {
            messages: message
        })
        const start = Date.now();
if(message.messages.channel !== '#accueil') {
setTimeout(() => {
  const millis = Date.now() - start;
  console.log(millis);
  if(millis > 300000) {
        console.log(`seconds elapsed = ${Math.floor(millis / 1000)}`);
       chaine = channels.filter(channel => channel !== message.messages.channel);
        socket.emit('logoff', {channels : chaine});
    }
}, 300000);
}
    });

    socket.on('rename', function(username) {
        me = username.rename;
        users = users.filter(user => user !== username.username);
        users.push(username.rename);
        io.emit('listUsers', {
            user: users
        });
        io.emit('renameuser', {
            username: username.username,
            rename: username.rename
        })
    })

    socket.on('newChannel', function(channel) {
        channels.push('#' + channel.channel);
        io.emit('listChannels', {
            channels: channels
        })
    })
});

http.listen(3001, function(){
    console.log('listening on *:3001');
});
