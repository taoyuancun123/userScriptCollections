// ==UserScript==
// @name         fuck zhihu
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  try to take over the world!
// @author       You
// @match        https://www.zhihu.com/
// @grant        none
//@require https://code.jquery.com/jquery-2.1.4.min.js
// ==/UserScript==

(function() {
    'use strict';
    var moreLength=$("[aria-label='更多']").length;
    var i=0;
    var s=setInterval(()=>{
        $("[aria-label='更多']")[i].click();
        if($(".AnswerItem-selfMenuItem").length>1){
            $(".AnswerItem-selfMenuItem")[1].click();
            $(".ReportMenu-item")[0].click();
            $(".ReportMenu-button").click();
            $(".AnswerItem-selfMenuItem")[1].click();
        }

        i++;
        if(j>=clientNum){
            clearInterval(s);
        }
    },10000)
    // Your code here...
})();
