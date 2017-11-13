$(function(){
    $(".hdiv").find(">:first-child").prepend("<span style='float:left;width:20;display:none'>+</span><span style='float:left;width:20'>-</span>");
 $(".hdiv").find(">:first-child").click(function(){
     var that = $(this);
     that.next().toggle();
     that.find("span").toggle();
 });
});
