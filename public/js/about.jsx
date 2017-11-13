
(function(win){
    var About = React.createClass({

        render: function() {
            var self = this;
            return (
                <div className="center2d">
                <div><a href='mailto:djx.zhenghua@gmail.com'><img src='/image/gmail.png'/></a>: djx.zhenghua@gmail.com</div>
                <br/>
                <div><a href='https://ca.linkedin.com/in/zhenghuadai'><img src='/image/linkedin.gif'/></a>https://ca.linkedin.com/in/zhenghuadai</div>
                </div>
                );
        }
    });

    $(function(){
        Uefi.routes['/about'] = function(){
            React.render(
                <About />,
                $('#html_body')[0]
                );
        }
    });
})(window);
