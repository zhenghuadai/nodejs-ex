
(function(win){
        
        var MenuBase = win.Uefi.MenuBase;
        var Review = win.Uefi.ReviewBase;
        var MenuIframes = win.Uefi.MenuIframes;
 
        $(function(){

            //$("#nav_book")[0].onclick  = 
            window.Uefi.routes["/chat"] = function(){
                $("#chat").css("overflow-y", "");
                $("#nav_chat").addClass("focusing");

                React.render(
                    <MenuIframes items={[bstr['chat']]} targets={[
                    {src:"/chat/index.html", tid:win.Uefi.TID.main}]} />,
                        $("#html_left")[0] 
                );
            }
            //$("#nav_book")[0].click();

        });

})(window);
