/*git clone https://github.com/plhwin/nodejs-socketio-chat.git*/
(function () {
    var d = document,
    w = window,
    p = parseInt,
    dd = d.documentElement,
    db = d.body,
    dc = d.compatMode == 'CSS1Compat',
    dx = dc ? dd: db,
    ec = encodeURIComponent;


    var CHAT = {
        msgObj:d.getElementById("pubmessage"),
        pubObj:d.getElementById("pubmessage"),
        screenheight:w.innerHeight ? w.innerHeight : dx.clientHeight,
        username:null,
        userid:null,
        socket:null,
        //让浏览器滚动条保持在最低部
        scrollToBottom:function(){
            w.scrollTo(0, this.msgObj.clientHeight);
        },
        //退出，本例只是一个简单的刷新
        logout:function(){
            //this.socket.disconnect();
            location.reload();
        },
        //提交聊天消息内容
        submit:function(){
            var content = d.getElementById("content").value;
            if(content != ''){
                var obj = {
                    userid: this.userid,
                    username: this.username,
                    content: content
                };
                if(this.to != null)
                {
                    obj.to = this.to;
                    this.socket.emit('msgto', obj);
                    {
                        var contentDiv = '<div>'+CHAT.myxss.process(obj.content)+'</div>';
                        var usernameDiv = '<span>'+obj.username+'</span>';

                        var section = d.createElement('section');
                        section.className = 'user';
                        section.innerHTML = contentDiv + usernameDiv;
                        CHAT.msgObj.appendChild(section);
                    }
                }
                else
                {
                    this.socket.emit('message', obj);
                }
                d.getElementById("content").value = '';
            }
            return false;
        },
        genUid:function(){
            return new Date().getTime()+""+Math.floor(Math.random()*899+100);
        },
        talkto:function(toid, toname){
            CHAT.to = toid;
            var chatdiv = $("#" + toid);
            if(chatdiv.length == 0)
            {
                $("#messages").append('<div id="' + toid + '"' + '  class="message" style="display:none"><div style="text-align:center;margin-left:10px;" class="title">' + toname + '</div> </div>');
            }
            $(".message").css("display", "none");
            $("#" + toid).css("display", "");
            CHAT.msgObj =  $("#" + toid)[0];
        },
        //更新系统消息，本例中在用户加入、退出的时候调用
        updateSysMsg:function(o, action){
            //当前在线用户列表
            var onlineUsers = o.onlineUsers;
            //当前在线人数
            var onlineCount = o.onlineCount;
            //新加入用户的信息
            var user = o.user;

            //更新在线人数
            var userhtml = '';
            var separator = '';
            separator = '、';
            var onlineList = $(d.getElementById("onlinecount"));
            onlineList.html("");
            onlineList.append('<a id="update_list" href="javasript:void(0)"> refresh</a>');
            onlineList.append('当前共有 '+onlineCount+' 人在线，在线列表：');
            onlineList.append($("<span><a id='pubchat' href='javasript:void(0)'> 公共聊天室 </a></span>"));
            onlineList.find("#pubchat").click(function(){
                CHAT.to = null;
                $(".message").css("display", "none");
                $("#pubmessage").css("display", "");
                CHAT.msgObj = CHAT.pubObj;
            });
            for(key in onlineUsers) {
                if(onlineUsers.hasOwnProperty(key)){
                    var oneuser = $( "<span> <a class='onlineuser' href='javasript:void(0)'> " + separator+onlineUsers[key].uname + "</a></span>");
                    let toid = onlineUsers[key].uid;
                    let toname = onlineUsers[key].uname;
                    oneuser.click(function(){
                        CHAT.talkto(toid, toname);
                    });

                    onlineList.append(oneuser);
                }
            }

            onlineList.find("#update_list").click(function(){
                    CHAT.socket.emit('update_list');
            });

            if(action == 'update_list'){
                console.log('update_list');
            }else{
                //添加系统消息
                var html = '';
                html += '<div class="msg-system">';
                html += user.username+ "<a href='javascript:void(0)'>priv</a>";
                html += (action == 'login') ? ' 加入了聊天室' : ' 退出了聊天室';
                html += '</div>';
                var section = d.createElement('section');
                section.className = 'system J-mjrlinkWrap J-cutMsg';
                section.innerHTML = html;
                $(section).find("a").click(function(){
                    CHAT.to = o.user.userid;
                });
                this.pubObj.appendChild(section);	
                this.scrollToBottom();
            }
        },
        //第一个界面用户提交用户名
        usernameSubmit:function(){
            var username = d.getElementById("username").value;
            if(username != ""){
                d.getElementById("username").value = '';
                d.getElementById("loginbox").style.display = 'none';
                d.getElementById("chatbox").style.display = 'block';
                this.init(username);
            }
            return false;
        },
        init:function(username){
            /*
               客户端根据时间和随机数生成uid,这样使得聊天室用户名称可以重复。
               实际项目中，如果是需要用户登录，那么直接采用用户的uid来做标识就可以
               */
            var that = this;
            this.userid = this.genUid();
            this.username = username;
            options = {};  // 自定义规则
            this.myxss = new filterXSS.FilterXSS(options);

            d.getElementById("showusername").innerHTML = this.username;
            //this.msgObj.style.minHeight = (this.screenheight - db.clientHeight + this.msgObj.clientHeight) + "px";
            this.scrollToBottom();

            //连接websocket后端服务器
            if(location.hostname == 'www.biosuefi.com'){
                this.socket = io.connect('ws://www.biosuefi.com:8000');
            }else{
                this.socket = io.connect('/');
            }

            //告诉服务器端有用户登录
            this.socket.emit('login', {userid:this.userid, username:this.username});

            //监听新用户登录
            this.socket.on('login', function(o){
                CHAT.updateSysMsg(o, 'login');	
            });

            this.socket.on('update_list', function(o){
                CHAT.updateSysMsg(o, 'update_list');	
            });
            this.socket.on('info', function(o){
                that.username = o.username;
                d.getElementById("showusername").innerHTML = that.username;
                d.getElementById("loginbox").style.display = 'none';
                d.getElementById("chatbox").style.display = 'block';
            });

            //监听用户退出
            this.socket.on('logout', function(o){
                CHAT.updateSysMsg(o, 'logout');
            });

            //监听消息发送
            this.socket.on('message', function(obj){
                var isme = (obj.userid == CHAT.userid) ? true : false;
                var contentDiv = '<div>'+that.myxss.process(obj.content)+'</div>';
                var usernameDiv = '<span>'+obj.username+'</span>';

                var section = d.createElement('section');
                if(isme){
                    section.className = 'user';
                    section.innerHTML = contentDiv + usernameDiv;
                } else {
                    section.className = 'service';
                    section.innerHTML = usernameDiv + contentDiv;
                }
                CHAT.pubObj.appendChild(section);
                CHAT.scrollToBottom();	
            });

            //监听消息发送
            this.socket.on('msgfrom', function(obj){
                var contentDiv = '<div>'+that.myxss.process(obj.content)+'</div>';
                var usernameDiv = '<span>'+obj.username+'</span>';

                var section = d.createElement('section');
                section.className = 'service';
                section.innerHTML = usernameDiv + contentDiv;

                CHAT.talkto(obj.from, obj.username);
                CHAT.msgObj.appendChild(section);
                CHAT.scrollToBottom();	
            });


        }
    };
    //通过“回车”提交用户名
    d.getElementById("username").onkeydown = function(e) {
        e = e || event;
        if (e.keyCode === 13) {
            CHAT.usernameSubmit();
        }
    };
    //通过“回车”提交信息
    d.getElementById("content").onkeydown = function(e) {
        e = e || event;
        if (e.keyCode === 13) {
            CHAT.submit();
        }
    };
    $(function(){
        CHAT.init("noname");
        $("#emit_btn").click(function(){
            CHAT.submit();
        });
        $("#username_btn").click(function(){
            CHAT.usernameSubmit();
        });
    });
})();
