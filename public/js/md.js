// ref: http://yuanlanxiaup.iteye.com/blog/1325947
(function(window) {
    function addLineNum() {  
        var preElements = document.getElementsByTagName("code");  
        for (var i = 0; i < preElements.length; i++) {  
            var target = preElements.item(i);  
            var content = target.firstChild.nodeValue;  
            var linesArray = content.split(String.fromCharCode(13));  
            if (linesArray.length == 1) {  
                linesArray = content.split(String.fromCharCode(10));  
            }  

            var olContainer = document.createElement("ol");  
            olContainer.className = "code"
            var index = 1;  
            for (var j = 0; j < linesArray.length; j++) {  
                var liContainer = document.createElement("li");  
                liContainer.className = index++ % 2 ? "odd" : "even";  
                var spanContainer = document.createElement("span");  
                var aText = document.createTextNode(linesArray[j]);  
                spanContainer.appendChild(aText);  
                liContainer.appendChild(spanContainer);  
                olContainer.appendChild(liContainer);  
            }  
            while (target.firstChild) {  
                target.removeChild(target.firstChild);  
            }  

            target.appendChild(olContainer);  
        }  
    }
    window.onload =  addLineNum;
})(window); 

