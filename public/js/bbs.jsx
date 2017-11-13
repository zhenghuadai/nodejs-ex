(function(win){
    function formatDate(date){
        var Ti = new Date(date);
        var d = Ti.toLocaleString();
        return d;
    }
    /*
    function bbs_left(){
    }
   
    function onetopicItem( tid, title, name, _date)
    {
        var oneline  = ""
        +  "<tr class=topicitem>"
        +  "<td width=60%>           <a href=#  value='"+tid + "'>" + title + "</a>  </td>"
        +  "<td width=20% align=center>["+name+ "]</td>"
        +  "<td width=20% align=right>["+ _date + "]</td> "
        +  "</tr>";
        return oneline;
    }

    function showTopics( start){
        $.get("/uefibbs", function(data){

            var topicsTable  = "<table width=100%>";
            data.topics.forEach(function(obj){
                topicsTable += onetopicItem(obj.tid, obj.title, obj.name, obj.date);
            });

            topicsTable += " </table></div>";

            $("#html_body").append(topicsTable);

        });
    };
    */

    var LikeButton = React.createClass({
        getInitialState: function() {
        return {liked: false};
        },
        handleClick: function(event) {
        this.setState({liked: !this.state.liked});
        },
        render: function() {
        var text = this.state.liked ? 'like' : 'haven\'t liked';
        return (
            <p onClick={this.handleClick}>
                You {text} this. Click to toggle.
            </p>
        );
    }
    });

    var Verify = win.Uefi.Verify;
    var NewReply = React.createClass({
        handleReply:function(event){
            var body = React.findDOMNode(this.refs.replybody).value;
            var tid = this.props.tid;
            var that =  this;
            if(body == ""){
                this.refs.vmsg.getDOMNode().innerHTML = "内容不能为空";
                return;
            }

            var vcode = $(this.refs.verify.getDOMNode()).find(".vcode")[0].value;
            $.post("/uefibbs/reply", {'tid':tid, 'body':body, 'vcode':{'qid':that.props.vcode.qid, 'qa':vcode}}, function(result){
                if( result.error == null  || result.error == false){
                    that.props.refresh();
                    React.findDOMNode(that.refs.replybody).value= "";
                   // React.render(
                   //     <Topic tid={tid} name='' numreads='0'/>,
                   //     $('#html_body')[0]
                   //     );
                }else{
                    React.findDOMNode(this.refs.emsg).innerHTML = '服务器忙';
                }
            });

        },

        render: function(){
            return (
            <div className="newreplydiv">
                <table>
                    <tr> 
                        <td>
                            <textarea  ref="replybody" name="body" cols="80" rows="6"></textarea>
                        </td>
                    </tr> 
                    <tr>
                        <td>
                            <Verify ref="verify" myqaid={this.props.vcode.qid} Qstr={this.props.vcode.qa}/>
                        </td>
                    </tr>
                    <tr> 
                        <td align="left">
                            <input className="button fullwidth" type="button" value={bstr["reply"]} onClick={this.handleReply}/>
                        </td>
                        </tr> 
                    </table>
                    <div ref="vmsg"></div>
                </div>
            );
        }
    });

    var Topic = React.createClass({
        getInitialState: function() {
            return {
                start: '',
                data: undefined 
            };
        },

        refresh:function(){
            $.get("/uefibbs?cmd=at&tid=" + this.props.tid, function(result) {
                if (this.isMounted()) {
                    this.setState({
                        start: 0,
                        data: result 
                    });
                }
            }.bind(this));

        },

        componentDidMount: function() {
            this.refresh();
        },

        handleSolution:function(tid, rid){
            var that = this;
            $.post('/uefibbs/setsolution',{ tid:tid, rid:rid}, function(result){
                if(result != null && result.error == false){
                    that.refresh();
                }else{
                }
                });
        },

        render: function() {

            var rows = [];
            var theTopic = <div> </div>; 
            var that = this;
            var vcode = {qid:0, qa:"11 * 11 = ?"};
            if(this.state.data != undefined){
                var mytopic = this.state.data.topic;
                vcode = this.state.data.vcode;
                var solution_rid = this.state.data.rid;
                var titleClass = "title";
                if(solution_rid == null){
                    titleClass = "pendingtitle";
                }

                var topicDate = formatDate(mytopic.date);
                theTopic = <div>
                    <div className={titleClass}>
                        <strong>{mytopic.title}</strong> [阅读次数 {this.props.numreads}]
                    </div>
                    <div className="lou1">
                        <div className="userinfo"><font className="username">{this.props.name}</font> [{topicDate}] </div>
                        <xmp className='bbscode'>{mytopic.body}</xmp>
                    </div>
                </div>;

                this.state.data.replies.forEach(function(myReply){
                    var markas = "";
                    var replayClass = "reply";
                    if(user.uid == mytopic.userid){
                                markas = <a href="javascript:void(0)" onClick={that.handleSolution.bind(that, that.props.tid, myReply.rid)}> [Mark as Solution]</a>
                    }

                    if(myReply.rid == solution_rid){
                        replayClass = " reply solution"
                    }
                    var replyDate = formatDate(myReply.date);
                    rows.push(
                        <div className={replayClass}>
                            <div className="userinfo"> <span className="username">{myReply.name}</span> [{replyDate}] 
                                {markas}
                            </div>
                            <xmp className='bbscode'>{myReply.body}</xmp>
                        </div>
                    );
                });
            }

            var replyWidgit = "";
            if(win.user.uid > 0){
                replyWidgit = <NewReply tid={that.props.tid} refresh={this.refresh} vcode={vcode}/>;
            }
            return (
                <div>
                    {theTopic}
                    {rows}
                    {replyWidgit}
                </div>
            );
        }
    });

    var NewTopic = React.createClass({
        verifiedCode:{},

        commit:function(event){
            var that = this;
            var button = React.findDOMNode(this.refs.commit);
            $(button).prop( "disabled", true);;
            var title = React.findDOMNode(this.refs.title).value;
            var body =  React.findDOMNode(this.refs.body).value;
            var vcode = $(this.refs.verify.getDOMNode()).find(".vcode")[0].value;
            var vcodeCorrect = $(this.refs.verify.getDOMNode()).find(".correct");
            if(vcodeCorrect.length == 0)
            {
                $(button).removeAttr('disabled');
                return;
            }
            if(title == "" || body == ""){
                this.refs.emsg.getDOMNode().innerHTML="内容不能为空";
                $(button).removeAttr('disabled');
                return;
            }

            $.post("/uefibbs/newtopic", {'title':title, 'body':body, 'vcode':{'qid':this.props.vcode.qid, 'qa':vcode}}, function(result){
                if( result.tid > 0 ){
                    React.render(
                        <Topic tid={result.tid} name={win.user.name} numreads='0'/>,
                        $('#html_body')[0]
                        );
                }else{
                    React.findDOMNode(that.refs.emsg).innerHTML = '服务器忙';
                    $("#elementID").removeAttr('disabled');
                }
            });

        },
        render:function(){
            return (
                <div id="divuiadd">
                <input className="fullwidth" ref="title" type="text" name="title" placeholder="主题"/> 
                <textarea className="fullwidth" ID="body" ref="body" cols="87" rows="30"></textarea>
                <Verify ref='verify' myqaid={this.props.vcode.qid} Qstr={this.props.vcode.qa}/>
                <input className="button fullwidth" ref="commit" type="button" value="提交" onClick={this.commit}/>
                <div ref='emsg'></div>
                </div>
                );
        }
    });

    var TopicRow = React.createClass({
        handleClick: function(event) {
            React.render(
                <Topic tid={this.props.tid} name={this.props.name} numreads={this.props.numreads}/>,
                $('#html_body')[0]
            );

        },
        render:function(){
            var Ti = this.props._date.indexOf("T");
            var d = this.props._date.substring(0, Ti);
        return (
            <tr className="topicitem">
                <td width="60%">           
                    <a href='javascript:void(0)'  value={this.props.tid} onClick={this.handleClick}>  {this.props.title}  </a>  </td>
                <td width="45px" align='center'><div className='topicauthor'>{this.props.name}</div><div className='topicdate'>{d}</div></td>
                <td width="20%" align='right'></td> 
                <td width="10%" align='right'>{this.props.numreads}/{this.props.numreplies}</td> 
            </tr>);
    }
    });

    var TopicsTable = React.createClass({
        totalTopics:-1,
        page:0,
        getInitialState: function() {
            return {
                start: '',
                data: undefined 
            };
        },

        componentDidMount: function() {
            this.refresh();
        },

        refresh:function(){
            var that = this;
            $.get("/uefibbs", {'page':that.page, 'total':that.totalTopics}, function(result) {

                if(result.total != null){
                    this.totalTopics = result.total;
                    this.page = 1;
                }

                if (this.isMounted()) {
                    this.setState({
                        start: 0,
                        data: result 
                    });
                }
            }.bind(this));
        },

        onNewTopic:function(event){

            if(win.user.uid == null || win.user.uid<=0){
                $("#nav_login").click();
            }else{
                React.render(
                    <NewTopic vcode={this.state.data.vcode}/>, 
                    $("#html_body")[0]
                    );
            }
        },

        onPre:function(event){
            if(this.page > 1){
                this.page = this.page -1;
                this.refresh();
            }
        },
        onNext:function(event){
            if(this.page < this.totalTopics / 20){
                this.page = this.page + 1;
                this.refresh();
            }
        },

        render: function() {

            var rows = [];
            if(this.state.data != undefined){
                this.state.data.topics.forEach(function(obj){
                    rows.push(<TopicRow tid={obj.tid} title={obj.title} name={obj.name} _date={obj.date} numreads={obj.ref} numreplies={obj.replies}/>);
                        });
            }

            return (
                    <div>
                    <table width='100%'>
                    <tr><td width='40%'> <a href='javascript:void(0)' onClick={this.onNewTopic}><font class='newtopic'>+{bstr['newtopic']}</font></a></td>
                    <td width='60%' align='right'>Search<input type='text' /></td> </tr> </table>
                    <table width='100%'>
                    <tr className="topicheader">
                    <td width="60%"> 主题</td>
                    <td width="10%" align='center'>作者</td>
                    <td width="20%" align='right'></td> 
                    <td width="10%" align='right'>阅读/回复</td> 
                    </tr>
                    {rows}
                    </table>
                    <div> [<a href='javascript:void(0)' onClick={this.onPre}>{bstr["prev"]}</a>] [<a href='javascript:void(0)' onClick={this.onNext}>{bstr['next']}</a>]{bstr['total']} {this.totalTopics} {bstr['topics']}</div>
                    </div>
                   );
        }
    });

    var FAQ = React.createClass({
        getInitialState: function() {
            return {
                start: '',
        data: undefined 
            };
        },

        handleTopic:function(tid){

            React.render(
                <Topic tid={tid} name="" numreads="0"/>,
                $('#html_body')[0]
                );
        },

        componentDidMount: function() {
            $.get("/uefibbs/faq", function(result) {

                if (this.isMounted()) {
                    this.setState({
                        start: 0,
                        data: result 
                    });
                }
            }.bind(this));
        },

        render: function() {

            var that = this;
            var rows = [];
            if(this.state.data != undefined){
                this.state.data.solutions.forEach(function(obj){
                    rows.push(
                        <div className="faq">
                        <div className="title"><a href="javascript:void(0)" onClick={that.handleTopic.bind(that,obj.tid) }>查看原帖</a> {obj.title}</div>
                        <div className="question">            <xmp className='bbscode'>{obj.Q}</xmp>           </div>
                        <div className="solution">            <xmp className='bbscode'>{obj.S}</xmp>           </div>
                        </div>
                        );
                });
            }

            return (
                    <table width='100%'>
                    {rows}
                    </table>
                   );
        }
    });

    var UefiDownload = React.createClass({
        render:function(){
            return(
                <div>
                <a href="#"> is the book</a>
                </div>
                );
        }
    });
    /** @jsx React.DOM */

    var MenuBase = win.Uefi.MenuBase;
    var Review = win.Uefi.ReviewBase;

    var MenuUefi = React.createClass({
        clicked: function(index){

            // The click handler will update the state with
            // the index of the focused menu entry
            if(index == 0){
                React.render(
                    <TopicsTable />,
                    $("#html_body")[0]
                    );
                React.render(
                    <Review tid={win.Uefi.TID.bbs} />,
                    $('#html_right')[0]
                    );

            }else if(index == 1){
                React.render(
                    <FAQ />,
                    $("#html_body")[0]
                    );

                React.render(
                        <Review tid={win.Uefi.TID.faq} />,
                        $('#html_right')[0]
                        );
            }
        },


            render: function() {
                return (<MenuBase items={ this.props.items } handleClick={this.clicked}/>);
            }
    });
    // Render the menu component on the page, and pass an array with menu options

    $(function(){

        function route_uefi(){

            $("#body").css("overflow-y", "scroll");
                $("div.navigation .focusing").removeClass("focusing");
                $("#nav_uefi").addClass("focusing");

            React.render(
                <MenuUefi items={ ['BBS', 'FAQ'] } />,
                $("#html_left")[0] 
                );
        }

        window.Uefi.routes["/uefi"] = route_uefi;

        //$("#nav_uefi")[0].onclick  = route_uefi;
    });

})(window);
