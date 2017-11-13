
(function(win){
        
        var MenuBase = win.Uefi.MenuBase;
        var Review = win.Uefi.ReviewBase;
        var MenuIframes = win.Uefi.MenuIframes;
 
        $(function(){

            //$("#nav_book")[0].onclick  = 
            window.Uefi.routes["/book"] = function(){
                $("#body").css("overflow-y", "");
                $("#nav_book").addClass("focusing");
                var bookindex  = "/book1.index.html";
                if(bstr.langcode === 'eng'){
                    bookindex = "/eng/book1_index.md";
                }

                React.render(
                    <MenuIframes items={[bstr['intro'], bstr['dir'], bstr['correction'], bstr['source'], bstr['ref']]} targets={[
                    {src:"/book1.intro.html", tid:win.Uefi.TID.bookintro},
                    {src:bookindex , tid:win.Uefi.TID.bookindex},
                    {src:"/book1.correction.html", tid:win.Uefi.TID.bookcorrection},
                    {src:"/book1.source.html", tid:win.Uefi.TID.booksource},
                    {src:"/blog/md/book1.ref.html", tid:win.Uefi.TID.bookref}]} />,
                        $("#html_left")[0] 
                );
            }
            //$("#nav_book")[0].click();

        });

})(window);
