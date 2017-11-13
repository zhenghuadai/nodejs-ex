

(function(win){
        
        var MenuBase = win.Uefi.MenuBase;
        var Review = win.Uefi.ReviewBase;
        var MenuBlogs = win.Uefi.MenuIframes;
        var Menu2Level= win.Uefi.Menu2Level;
 
        $(function(){

            //$("#nav_blog")[0].onclick  = 
            Uefi.routes['/blog'] = function(){
                $("#nav_blog").addClass("focusing");
                $("#body").css("overflow-y", "");
/*
                React.render(
                    <MenuBlogs items={['第一条指令']} targets={[
                    {src:"/blog/uefi_reset_vector.md", tid:10001}]} />,
                        $("#html_left")[0] 
                );
                */
                $.post("/blogs/list", function(result){
                    var m = JSON.parse(result);
                    if(result.err == null){
                        React.render(
                            <Menu2Level items={ m.menu} /> ,$("#html_left")[0]
                            );
                    }else{
                    }
                });
                }
                });

       $(function(){
           
       });
})(window);
