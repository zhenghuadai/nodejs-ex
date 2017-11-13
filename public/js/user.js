
(function(win){

    var MenuBase = win.Uefi.MenuBase;

    var MenuAccount = React.createClass({
        clicked: function(index){

            // The click handler will update the state with
            // the index of the focused menu entry
            if(index == 0){
                React.render(
                    <Login/>,
                    $("#html_body")[0]
                    );

            }else if(index == 1){
                React.render(
                    <Signup />,
                    $("#html_body")[0]
                    );

            }else if(index == 2){
                var encrypt = new JSEncrypt();
                encrypt.setPublicKey(win.srvkey);
                var encrypted = encrypt.encrypt("Awesome password 您好");
                $.post('/account/ssl', {data:encrypted},  function(result){
                });

            }
        },


            render: function() {
                return (<MenuBase items={ this.props.items } handleClick={this.clicked}/>);
            }
    });


    var Verify = win.Uefi.Verify;

    var Signup = React.createClass({
        handleCheckUser:function(event){
            var that = this;
            var email = React.findDOMNode(this.refs.user_email).value;
            if(email == null || email.length < 3 || email.indexOf("@") <=0){
                return;
            }
            $.post("/account/exists", {'email':email}, function(result){
                if(result.hasOwnProperty('err') && result.err == false){
                    that.refs.umsg.getDOMNode().innerHTML = "";
                }else{
                    that.refs.umsg.getDOMNode().innerHTML = "邮箱已存在";
                }
            });


        },
        handleSignup:function(event){
            if(this.checkpwdI() == false) return;
            var pwd0 = React.findDOMNode(this.refs.passwd0).value;
            var mymd5 = win.md5(pwd0);
            var email = React.findDOMNode(this.refs.user_email).value;
            var name = React.findDOMNode(this.refs.user_name).value;

            var vcode = $(this.refs.verify.getDOMNode()).find(".vcode")[0].value;
            var qid = $(this.refs.verify.getDOMNode()).find(".vid")[0].value;

            var signupData = {'email':email, 'name':name, 'md5':mymd5, 'vcode':{'qid':qid, 'qa':vcode}};
            var encrypt = new JSEncrypt();
            encrypt.setPublicKey(win.srvkey);
            var encrypted = encrypt.encrypt( JSON.stringify(signupData));

            $.post("/account/signup", {'rsadata':encrypted}, function(result){
                    setLoggedin(result);
                    window.onhashchange();
            });
        },

        checkpwdI:function(){
            var pwd0 = React.findDOMNode(this.refs.passwd0).value;
            var pwd = React.findDOMNode(this.refs.passwd).value;
            if(pwd0 !== pwd){
                React.findDOMNode(this.refs.pmsg).innerHTML = "密码不匹配";
                return false;
            }else{
                React.findDOMNode(this.refs.pmsg).innerHTML = "";
                return true;
            }

        },

        checkpwd:function(event){
            this.checkpwdI();
        },

        render: function() {
            return (
                <div id="signupdiv">

                    <input className="fullwidth" type="text" name="user_email" ref="user_email" placeholder="email" onBlur={this.handleCheckUser}/>
                    <div ref="umsg"></div>
                    <input  className="fullwidth" type="text" ref="user_name" placeholder="用户名"/>
                    <br/>
                    <input  className="fullwidth" type="password" ref="passwd0" placeholder="密码"/> 
                    <br/>
                    <input  className="fullwidth" type="password" ref="passwd" placeholder="确认密码" onBlur={this.checkpwd}/> <span ref="pmsg"></span> 
                    <br/>
                    <input className="hidden fullwidth" type="text" ref="reportto" placeholder="boss"/>
                    <br/>
                    <Verify ref="verify" />
                    <br/>
                    <input className="button fullwidth" type="button" value="注册" onClick={this.handleSignup}/>
                    <br/>
                </div>
            );
        }
    });

    function setLoggedoff( result)
    {
            win.user.uid = null;
            win.user.name = null;
            win.user.email = null;
            $("#nav_image").addClass("hidden");
            $("#nav_name").addClass("hidden");
            $("#nav_logoff").addClass("hidden");
            $("#nav_login").removeClass("hidden");
            $("#nav_name").html();
    }

    function setLoggedin( result)
    {
        if(result.hasOwnProperty('uid') && (result.uid > 0)){
            win.user.uid = result.uid;
            win.user.name = result.name;
            win.user.email = result.email;
            win.user.imageurl = result.imageurl;
            if(result.imageurl != null){
                $("#nav_image").attr('src', result.imageurl);
            }
            $("#nav_login").addClass("hidden");
            $("#nav_image").removeClass("hidden");
            $("#nav_name").removeClass("hidden");
            $("#nav_name").html(win.user.name);
        }
    }

    var Login = React.createClass({
        clicked: function(){
            var pwd = React.findDOMNode(this.refs.passwd).value;
            var mymd5 = win.md5(pwd);
            var email = React.findDOMNode(this.refs.user_email).value;
            var that = this;

            var signupData = {'email':email, 'md5':mymd5};
            var encrypt = new JSEncrypt();
            encrypt.setPublicKey(win.srvkey);
            var encrypted = encrypt.encrypt( JSON.stringify(signupData));

            $.post("/account/login", {'rsadata':encrypted}, function(result){
                if(result.hasOwnProperty('uid') && (result.uid > 0)){
                    setLoggedin(result);
                    window.onhashchange();
                }else{
                    that.refs.vmsg.getDOMNode().innerHTML = "密码错误";
                }
            });

            // The click handler will update the state with
            // the index of the focused menu entry
        },

        gotoSignup:function(){
            React.render(
                <Signup />,
                $("#html_body")[0] 
            );
        },

        onKeydown:function(event){
            if(event.keyCode == 13){
                this.clicked();
            }
        },

        onGlogin:function(event){

            var signInCallback = function (authResult) {
                if (authResult['code']) {

                    // Hide the sign-in button now that the user is authorized, for example:
                    $('#gButton').attr('style', 'display: none');

                    // Send the code to the server
                    $.post('/account/google/token', {code:authResult['code']}, function(result){
                        setLoggedin(result);
                        window.onhashchange();
                    });
                } else {
                    // There was an error.
                }
            }


            // auth2.grantOfflineAccess({'redirect_uri': 'postmessage'}).then(signInCallback);
            auth2.grantOfflineAccess({'scope':'https://www.googleapis.com/auth/plus.login  https://www.googleapis.com/auth/plus.me https://www.googleapis.com/auth/userinfo.email', 
            'redirect_uri': 'postmessage'}).then(
                signInCallback
            );
        },

        componentDidMount: function() {
            /*
            var that = this;
            var ongSuccess = function(googleUser){
            }
            var ongFailure = function(error) {
            }
            gapi.signin2.render('gButton', {
                'scope': 'https://www.googleapis.com/auth/plus.login',
                'width': 160,
                'height': 25,
                'longtitle': true,
                'theme': 'dark',
                'onsuccess': that.ongSuccess,
                'onfailure': that.ongFailure
            });
            */
        },

        onDou:function(event){
            var dourequest = "https://www.douban.com/service/auth2/auth?"
              + "client_id=011868827fee6f5e034939877fcb4e1a&"
              + "redirect_uri=http://www.biosuefi.com/account/douban/token&"
              + "response_type=code&"
              + "state=" + escape(window.location.href) + "&"
              + "scope=douban_basic_common";
              window.open(dourequest, '_self');

        },

        render: function() {
            return (
                    <div id="logindiv" >
                    <form>
                    <input  className="fullwidth" type="text" ref="user_email" size="32" placeholder={bstr['email']}/>
                    <input  className="fullwidth" type="password" ref="passwd" size="32" placeholder={bstr['password']} onKeyDown={this.onKeydown}/>
                    <input  className="button fullwidth" type="button" value={bstr["login"]} onClick={this.clicked}/><br/>
                    </form>

                    <br/>
                    <div ref="vmsg" className="fullwidth error"></div>
                    <br/>
                    {bstr['login_through']} 
                    <br/>
                    <button id="gButton" className="vcenter oauthLoginBtn" onClick={this.onGlogin}><img width="50" src="https://developers.google.com/+/images/branding/sign-in-buttons/Red-signin_Short_base_44dp.png"/></button>
                    <button id="douButton" className="vcenter oauthLoginBtn" onClick={this.onDou}><img width="41" src="/image/dou.png"/></button>
                    </div>
               );
    }
});

$(function(){

    $("#nav_login")[0].onclick = function(){ 
    //Uefi.routes['/login']= function(){
        $("#nav_login").addClass("focusing");
        React.render(
            <MenuAccount items={ [bstr['login'], bstr['signup']] } />,
            $("#html_left")[0] 
            );
        //React.render(
        //    <Login />,
        //    $("#html_body")[0] 
        //);
    }

    $("#nav_name")[0].onclick = function(){  
        $("div.navigation .focusing").removeClass("focusing");
        $("#nav_name").addClass("focusing");
        if($("#nav_logoff").hasClass('hidden')){
            $("#nav_logoff").removeClass('hidden');
        }else{
            $("#nav_logoff").addClass('hidden');
        }
    }

    $("#nav_logoff")[0].onclick = function(){
        $.post("/account/logoff", function(result){
            setLoggedoff(result);
        });
    }

    $.post("/account/sessretrieve", function(result){
        setLoggedin(result);
    });

    $.post("/sslshake/pubkey", function(result){
        if(result != null && result.key != null){
            win.srvkey = result.key.toString();
        }
    });

    $("#leftCtrl").click(function(){
        var lefttd = $("#html_left_td");
        lefttd.toggle();
        $(this).html((lefttd.css('display') == 'none')?'&gt;':'&lt;');
    });
    $("#rightCtrl").click(function(){
        var righttd = $("#html_right_td");
        righttd.toggle();
        $(this).html((righttd.css('display') == 'none')?'&lt;':'&gt;');
    });

});

})(window);
