(function(){
 function bbs_left(){
 }
 $(function(){
     $.get("/uefibbs", function(data){
        $("#html_body").append( JSON.stringify(data));

         });
     });
 })();
