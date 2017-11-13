function deleteCookie(name) 
{ 
    var expdate = new Date(); 
    expdate.setTime(expdate.getTime() - (86400 * 1000 * 1)); 
    setCookie(name, "", expdate); 
} 

function getCookie(Name) 
{ 
    var search = Name + "=" 
        if(document.cookie.length > 0) 
        { 
            offset = document.cookie.indexOf(search) 
                if(offset != -1) 
                { 
                    offset += search.length 
                        end = document.cookie.indexOf(";", offset) 
                        if(end == -1) end = document.cookie.length 
                            return unescape(document.cookie.substring(offset, end)) 
                } 
                else return "" 
        } 
} 
function setCookie(name, value) 
{ 
    var argv = setCookie.arguments; 
    var argc = setCookie.arguments.length; 
    var expires = (argc > 2) ? argv[2] : null; 
    if(expires!=null) 
    { 
        var LargeExpDate = new Date (); 
        LargeExpDate.setTime(LargeExpDate.getTime() + (expires*1000*3600*24));         
    } 
    document.cookie = name + "=" + escape (value)+((expires == null) ? "" : ("; expires=" +LargeExpDate.toGMTString())); 
}

var xmlhttp=false;   
function createHttpRequest(){
    /*@cc_on @*/  
    /*@if (@_jscript_version >= 5)  
    // JScript提供的条件编译让我们能够应付旧的ie版本，以及由于安全原因无法创建对象  
    try {  
    xmlhttp = new ActiveXObject("Msxml2.XMLHTTP");  
    } catch (e) {  
    try {  
    xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");  
    } catch (E) {  
    xmlhttp = false;  
    }  
    }  
    @end @*/  
    if (!xmlhttp && typeof XMLHttpRequest!='undefined') {   
        try {   
            xmlhttp = new XMLHttpRequest();   
        } catch (e) {   
            xmlhttp=false;   
        }   
    }   
    if (!xmlhttp && window.createRequest) {   
        try {   
            xmlhttp = window.createRequest();   
        } catch (e) {   
            xmlhttp=false;   
        }   
    }
}

function getquery(url, req, targetdiv)
{
    var reqfn = url + "?" + req; 
    //with( document.all){reqfn = reqfn +user_email.value;}
    if (!xmlhttp){
        createHttpRequest();
    }
    xmlhttp.open("GET", reqfn,true);
    xmlhttp.onreadystatechange=function() {
        if (xmlhttp.readyState==4 && xmlhttp.status==200) {
            document.getElementById(targetdiv).innerHTML=xmlhttp.responseText ;
        }
    }
    xmlhttp.send(null)
    //xmlhttp.send("test=a")
}


function checkUser()
{
    var server = "/cgi-bin/dmquery.rb"
    var reqfn = "qcmd=checkuser&user_email="+ document.getElementById("user_email").value;
    getquery(server ,reqfn, "myText");
}

function checkUser0()
{
    var reqfn = "/cgi-bin/dmquery.rb?qcmd=checkuser&user_email="+ document.getElementById("user_email").value;
    if (!xmlhttp){
        createHttpRequest();
    }
    xmlhttp.open("POST", reqfn,true);
    xmlhttp.onreadystatechange=function() {
        if (xmlhttp.readyState==4 && xmlhttp.status==200) {
            $("myText").innerHTML=xmlhttp.responseText ;
        }
    }
    xmlhttp.send(null)
}

function postquery(req, params, target)
{
    var reqfn =  req;
    if (!xmlhttp){
        createHttpRequest();
    }
    xmlhttp.open("POST", reqfn,true);
    xmlhttp.onreadystatechange=function() {
        if (xmlhttp.readyState==4 && xmlhttp.status==200) {
            document.getElementById(target).innerHTML=xmlhttp.responseText ;
        }
    }
    xmlhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    xmlhttp.setRequestHeader("Content-length", params.length);
    xmlhttp.send(params);
}

function postquery2(req, params, target)
{
    var reqfn =  req;
    if (!xmlhttp){
        createHttpRequest();
    }
    xmlhttp.open("POST", reqfn,true);
    xmlhttp.onreadystatechange=function() {
        if (xmlhttp.readyState==4 && xmlhttp.status==200) {
            document.getElementById(target).src=xmlhttp.responseText ;
        }
    }
    xmlhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    xmlhttp.setRequestHeader("Content-length", params.length);
    xmlhttp.send(params);
}

function postquery3(req, params, callbk)
{
    var reqfn =  req;
    if (!xmlhttp){
        createHttpRequest();
    }
    xmlhttp.open("POST", reqfn,true);
    xmlhttp.onreadystatechange=function() {
        if (xmlhttp.readyState==4 && xmlhttp.status==200) {
            callbk(xmlhttp.responseText) ;
        }
    }
    xmlhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    xmlhttp.setRequestHeader("Content-length", params.length);
    xmlhttp.send(params);
}

function syncpost3(req, params, callbk)
{
    var reqfn =  req;
    if (!xmlhttp){
        createHttpRequest();
    }
    xmlhttp.open("POST", reqfn,false);
    xmlhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    xmlhttp.setRequestHeader("Content-length", params.length);
    xmlhttp.send(params);
    if (xmlhttp.readyState==4 && xmlhttp.status==200) {
        callbk(xmlhttp.responseText) ;
    }
}



function test()
{
    alert("llll");
}

var lastjddiv;
var lastflagdiv;
function showjd( divn ,flagdiv)
{
    if( lastflagdiv == flagdiv){
        $(divn).toggle();
        lastflagdiv.style.backgroundColor = "#FFFFFF";
        lastjddiv = lastflagdiv = undefined;
        return;
    }
    if(lastflagdiv != undefined)
        lastflagdiv.style.backgroundColor = "#FFFFFF";
    lastflagdiv = flagdiv;
    lastflagdiv.style.backgroundColor = "#00FFFF"

    if(lastjddiv != undefined )
        lastjddiv.toggle();
    lastjddiv = $(divn);
    lastjddiv.toggle();
}

function checkValid(id, name)
{
    var v = document.getElementById(id).value;
    if( v == undefined || v == ""){
        if(name == undefined) name = id;
        alert(name + " can not be empty!");
        return false;
    }
    return true;
}

var VerifyCode = false;
function checkVerify( _async)
{
    VerifyCode = false;
    var async = true;
    if(arguments.size >= 1) async = arguments[0];
    var postfunc = ( async === true)? postquery3:syncpost3;
    var req = "qcmd=verifycode&vid=" + document.getElementById("vid").value + "&vcode=" + document.getElementById("vcode").value;
    postfunc('/cgi-bin/dmquery.rb', req, function(ret){ var obj = document.getElementById("vprompt"); var vprompt=""; var vprompt2=""; if(ret.indexOf("Vcode Right")>= 0){VerifyCode=true; vprompt="&#10003"; obj.className="right";obj.style.color="#00ff00"; } else {  obj.className="wrong"; obj.style.color="#ff0000";vprompt="X"; vprompt2="请重新输入验证码";} document.getElementById("vprompt").innerHTML = vprompt;$("#vprompt2").html(vprompt2);});   
}

function dbcheckVerify()
{
    if(VerifyCode === false)
    { 
        checkVerify(false);
        //if(VerifyCode === false)
        //     alert("验证码不正确， 请重新输入");
    }
    return VerifyCode;
}

function newReview()
{
    VerifyCode = false;
    var req = "qcmd=newreview&tid=" + document.getElementById("topicid").value + 
    "&body=" + document.getElementById("body").value +
    "&vid=" + document.getElementById("vid").value +
    "&vcode=" + document.getElementById("vcode").value 
    ;
    postquery3('/cgi-bin/dmquery.rb', req, function(ret){ document.getElementById("reviewDiv").innerHTML = ret;});   
}


