(function(win){
        
        var MenuBase = win.Uefi.MenuBase;

        var MenuWater = React.createClass({
            clicked: function(index){

                // The click handler will update the state with
                // the index of the focused menu entry
                if(index == 0){

                }else if(index == 1){

                }
            },


            render: function() {
                return (<MenuBase items={ this.props.items } handleClick={this.clicked}/>);
            }
        });
 
        $(function(){

            $("#nav_water")[0].onclick = function(){

                React.render(
                    <MenuWater items={ ['water'] } />,
                        $("#html_left")[0] 
                );
            }

        });

})(window);
