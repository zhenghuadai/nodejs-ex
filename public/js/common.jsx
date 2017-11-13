(function(win){
    function formatDate(date){
        var Ti = new Date(date);
        var d = Ti.toLocaleString();
        return d;
    }

    win.user = {
        "uid":-1
    };

    var MenuBase = React.createClass({

        getInitialState: function(){
            return { focused: 0 };
        },

        componentDidMount: function() {
            var defaultItem = this.props.defaultItem || 0;
            if(defaultItem != -1 && defaultItem < this.props.items.length){
                this.clicked(defaultItem);
            }
        },

        componentDidUpdate:function (prevProps, prevState){
            if(prevProps !== this.props){
                var that = this;
                setTimeout(function(){
                    that.clicked(0);
                },0);
            }
        },

        clicked: function(index){

            // The click handler will update the state with
            // the index of the focused menu entry

            this.props.handleClick(index);
            this.setState({focused: index});
        },

        toggle: function(e){
            var menus  = this.refs.menuitems.getDOMNode();
            var toggle = this.refs.toggleButton.getDOMNode();
            if(menus.style.display === 'none'){
                menus.style.display = 'block';
                toggle.innerHTML = '- ';
            }else{
                menus.style.display = 'none';
                toggle.innerHTML = '+ ';
            }
        },

        render: function() {

            // Here we will read the items property, which was passed
            // as an attribute when the component was created

            var self = this;

            // The map method will loop over the array of menu entries,
            // and will return a new array with <li> elements.

            if(this.props.title != null){
               var Title =  <dt className='menutitle '>
               <strong><div ref="toggleButton" className='toggleButton' onClick={this.toggle}>- </div></strong>
               {this.props.title}
               </dt>;
            }
            return (
                    <div>
                    {Title}
                    <dl ref='menuitems'>
                    { this.props.items.map(function(m, index){

                        var style = 'menu ';

                        if(self.state.focused == index){
                            style += 'focused';
                        }

                        // Notice the use of the bind() method. It makes the
                        // index available to the clicked function:

                        return <dd className={style} onClick={self.clicked.bind(self, index)}>{m}</dd>;

                    }) }

                    </dl>

                    </div>
                   );

        }
    });


    var ReviewBase = React.createClass({

        getInitialState: function(){
            return { data: null };
        },

        componentWillReceiveProps: function(nextProps) {
            this.refresh(nextProps);
        },

        refresh:function(myprops){
            $.post("/reveiw/list" , {'tid': myprops.tid}, function(result) {
                if (this.isMounted()) {
                    this.setState({
                        data: result 
                    });
                }
            }.bind(this));
        },

        componentDidMount: function() {
            this.refresh(this.props);
        },

        componentDidUpdate:function(prevProps, prevState){
        },

        clicked: function(e){
            var d = this.refs.replybody.getDOMNode().value;
            var vcode = $(this.refs.verify.getDOMNode()).find(".vcode")[0].value;
            var qid = $(this.refs.verify.getDOMNode()).find(".vid")[0].value;
            var that = this;
            $.post("/review/new" , {'tid': this.props.tid, 'body':d,  'vcode':{'qid':qid, 'qa':vcode}}, function(result) {
                if(result != null && result.error == false){
                    that.refs.replybody.getDOMNode().value = "";
                    that.refresh(that.props);
                }else{
                }
            });
        },

        render: function() {

            // Here we will read the items property, which was passed
            // as an attribute when the component was created

            var that = this;
            var rows = [];
            var reply = (""
                    );

            if(this.state.data != undefined){
                //var reply = JSON.stringify(this.state.data);
                if(this.state.data.comments != null){
                    this.state.data.comments.forEach(function(aComment){

                        var ldate = formatDate(aComment.date);
                        rows.push(
                            <div className='review'>
                            <xmp className='bbscode'>{aComment.body}</xmp>
                            <div className='userinfo'><font className='username'>{aComment.name}</font> [{ldate}] </div>
                            </div>
                            );
                    });
                }

                reply = (
                    <div className="newreplydiv fullwidth">
                    <textarea  className="fullwidth" ref="replybody" name="body" rows='6'></textarea>
                    <Verify ref='verify' myqaid={this.state.data.vcode.qid} Qstr={this.state.data.vcode.qa}/>
                    <input type="button" className="button fullwidth" value={bstr["comment"]} onClick={this.clicked}/> 
                    </div> 
                    );
            }

            // The map method will loop over the array of menu entries,
            // and will return a new array with <li> elements.

            return (
                    <div>
                    {rows}
                    {reply}
                    </div>
                   );

        }
    });

    var Verify = React.createClass({
        getInitialState: function() {
            // naming it initialX clearly indicates that the only purpose
            // of the passed down prop is to initialize something internally
            return {qid: this.props.myqaid, qstr:this.props.Qstr};
        },

        componentDidMount: function() {
            if(this.state.qid == null){
                $.post("verifyrequest" , function(result) {
                    if(result == null || result.vcode == null){
                        return;
                    }
                    this.setState({
                        qid: result.vcode.qid,
                        qstr:result.vcode.qa
                    });
                }.bind(this));

            }
        },

        componentWillReceiveProps: function(nextProps) {
            var qa = React.findDOMNode(this.refs.vcode);
            var obj = React.findDOMNode(this.refs.vprompt);
            var obj2 = React.findDOMNode(this.refs.vprompt2);
            qa.value = "";
            obj.innerHTML = "";
            obj2.innerHTML = "";
            if(nextProps.myqaid != null){
                var that = this;
                setTimeout( function(){
                    that.setState({
                    qid: nextProps.myqaid,
                    qstr:nextProps.Qstr
                    });
                } , 0 );

            }
        },

        handleBlur:function(){
            var qid = this.state.qid;
            var qa = React.findDOMNode(this.refs.vcode).value;
            var obj = React.findDOMNode(this.refs.vprompt);
            var obj2 = React.findDOMNode(this.refs.vprompt2);
            $.get("/verifycode", {"qid":qid, "qa":qa}, function(data){
                var vprompt=""; var vprompt2=""; 
                if(data!=null && data.pass == true){
                    VerifyCode=true; vprompt="&#10003"; 
                    obj.className="correct";
                    obj.style.color="#00ff00"; 
                } else {  
                    obj.className="wrong"; 
                    obj.style.color="#ff0000";
                    vprompt="X"; vprompt2="请重新输入验证码";
                } 
                obj.innerHTML = vprompt;
                obj2.innerHTML = vprompt2;
            });
        },
        handleFocus:function(){
            var vcode =  React.findDOMNode(this.refs.vcode);
            if(vcode.value=='请输入验证码'){vcode.value='';}
        },
        render: function(){
            return (
                <div className="verifydiv" >
                    <input type="hidden" ref="vid" className="vid" id="vid" name="vid" value={this.state.qid} />
                    <table width="100%">
                        <tr> <td align="left" className="vquestion">
                                <span ref="vquestion" id="vquestion" className="vquestion" > {this.state.qstr}</span>
                            </td>
                        </tr>
                        <tr className="emptyMargin"> 
                            <td className="emptyMargin">
                                <input type="text" ref="vcode" className="vcode" cols="15"  onBlur={this.handleBlur} onFocus={this.handleFocus} placeholder={bstr["inputverify"]}/>
                                <span ref="vprompt"></span>
                            </td>
                        </tr>
                        <tr> <td ><span ref="vprompt2"></span></td></tr>
                    </table>
                </div>
            );
        }
    });

    var Includes = React.createClass({
        render: function(){
            return (
                <iframe style={{"height":"100%", "width":"100%"}} src={this.props.src} />
                );
        }
    });

    var MenuIframes = React.createClass({
        clicked: function(index){
            // The click handler will update the state with
            // the index of the focused menu entry
            React.render(
                <Includes src={this.props.targets[index].src}/>, 
                $("#html_body")[0]
                );
            React.render(
                <ReviewBase tid={this.props.targets[index].tid} />,
                $('#html_right')[0]
                );
        },


        render: function() {
            return (<MenuBase items={ this.props.items } handleClick={this.clicked} title={this.props.title} defaultItem={this.props.defaultItem}/>);
        }
    });

    var Menu2Level = React.createClass({

        render: function() {
            var self = this;

            return (
                    <div>
                    { this.props.items.map(function(m, index){

                         var defaultItem = (index == 0? 0:-1);
                         return <MenuIframes items={m.items} targets={m.targets} defaultItem={defaultItem} title={m.title}/>;

                    }) }


                    </div>
                   );

        }

    });

    win.Uefi = { MenuBase:MenuBase, MenuIframes:MenuIframes, Menu2Level:Menu2Level, ReviewBase:ReviewBase, Verify:Verify,
    TID:{main:0, bbs:108,faq:107, bookintro:109, bookindex:110, booksource:111, bookcorrection:112, bookref:113}, routes:{}
    };


    function router(){

        $("div.navigation .focusing").removeClass("focusing");
        var route = window.location.hash.substr(1);
        if(route != undefined){
            var qidx = route.indexOf("?");
            if(qidx != -1){
                route = route.substr(0,qidx);
            }
            var pidx = route.indexOf("/", 1);
            if(pidx != -1){
                route = route.substr(0,pidx);
            }
        }
        if(route === ""){
            Uefi.routes['/book']();
        }else if(window.Uefi.routes.hasOwnProperty(route)){
            Uefi.routes[route]();
        }
    }

    window.onhashchange = router;
})(window);
