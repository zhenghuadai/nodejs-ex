//var crypto = require('crypto'),
//    algorithm = 'aes-128-cbc',
//    password = '1&K)#6abcdef34560',
//    iv = '012abDA<>90123456';

//var logger = require('./logger.js');

var io;
var sharedsession = require("express-socket.io-session");

var sockets = {};
var tmpid = 0;
function init(server, session){
    io = require('socket.io')(server);
    //在线用户
    var onlineUsers = {};
    //当前在线人数
    var onlineCount = 0;

    // Use shared session middleware for socket.io
    // // setting autoSave:true
    io.use(sharedsession(session)); 

    io.on('connection', function(socket){

        var userid = socket.handshake.session.userid;
        var uname = socket.handshake.session.username;
        if(uname == undefined)
        {
            uname = "noname" + tmpid++;
        }

        if(userid == undefined)
        {
            socket.handshake.session.username = uname;
            userid = uname;
        }

        console.log(socket.handshake.session.username + " connection");

        socket.emit("info", {username:socket.handshake.session.username});

        //监听新用户加入
        socket.on('login', function(obj){
            //将新加入用户的唯一标识当作socket的名称，后面退出的时候会用到
            obj.username = uname;
            socket.name = obj.username;

            sockets[userid] = socket;

            //检查在线列表，如果不在里面就加入
            if(!onlineUsers.hasOwnProperty(userid)) {
                onlineUsers[userid] = {uid:userid, uname:uname};
                //在线人数+1
                onlineCount++;
            }

            //向所有客户端广播用户加入
            io.emit('login', {onlineUsers:onlineUsers, onlineCount:onlineCount, user:obj});
            //console.log(obj.username+'加入了聊天室');
        });

        //监听用户退出
        socket.on('disconnect', function(){
            console.log(socket.handshake.session.username + " disconnect");
            //将退出的用户从在线列表中删除
            if(onlineUsers.hasOwnProperty(userid)) {
                //退出用户的信息
                var obj = {userid:userid, username:onlineUsers[userid].uname};

                //删除
                delete onlineUsers[userid];
                //在线人数-1
                onlineCount--;

                //向所有客户端广播用户退出
                io.emit('logout', {onlineUsers:onlineUsers, onlineCount:onlineCount, user:obj});
                //console.log(obj.username+'退出了聊天室');

                delete sockets[userid];
            }
        });

        socket.on('update_list', function(){
            console.log('update_list');
            socket.emit("update_list", {onlineUsers:onlineUsers, onlineCount:onlineCount});
        });
        //监听用户发布聊天内容
        socket.on('message', function(obj){
            //向所有客户端广播发布的消息
            io.emit('message', obj);
            //console.log(obj.username+'说：'+obj.content);
        });
        socket.on('msgto', function(obj){
            to = obj.to;
            if(sockets.hasOwnProperty(to))
            {
                obj.from = userid;
                sockets[to].emit('msgfrom', obj);
            }
            //console.log(obj.username+'说：'+obj.content);
        });

    });


}

exports.init = init;
