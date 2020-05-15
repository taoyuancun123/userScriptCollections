<style>
    .wrapper{
        margin-left:30%;
    }
    .header_main_title{        
        font-size:20px;        
        margin-bottom: 8px;        
    }

    .header_main_subTitle{
        font-size: 14px;        
    }

    .close-btn{
        float:right;
    }

    .intro{
        border-bottom:5px solid #eee;       
        
    }

    .input-area{
        border-bottom:5px solid #eee;   
    }

    .list-area{
        border-bottom:5px solid #eee;   
    }

    textarea{
        width:300px;
        margin:10px 0px 5px 10px;
        height: 22px;
        vertical-align: middle;
        
    }

    .blocksite-url button{
        vertical-align: middle;
        margin:10px 0px 5px 10px;
    }

    .weekday-div{
        margin: 10px 10px 10px 20px;
        border-bottom: 2px solid #ddd;
        padding: 2px 10px;
        
    }

    .daytime-div{
        margin: 10px 10px 10px 20px;
        padding: 2px 10px;
        
    }

    .whitelist-div{
        float:right;
    }

    .list-area{
        margin:10px 0px;
    }

    tr{
        display: block;
    }



    .list-header{        
        padding-bottom: 10px;
        border-bottom: 2px solid #bbb;
    }

    .list-body{
        margin: 10px 10px 10px 20px;
        border-bottom: 2px solid #ddd;
        padding-bottom: 10px;
        
    }

    .list-item{
        display:flex;
        justify-content:space-between;        
    }


</style>


<div id="settingPanel" >
    <button class="close-btn">关闭页面</button>
    <div class="wrapper">
        <div class="intro">
            <h2 class="header_main_title">屏蔽网址</h2>
            <h3 class="header_main_subTitle">永久屏蔽或者按定时安排屏蔽,被屏蔽的网站，打开后，会跳转到重定向网站，如果没有设置重定向网站，则默认跳转到bing.com</h3>
        </div>
        <div class="input-area">
            <div class="blocksite-url">
                <span>输入屏蔽的网址 : </span><textarea rows="1" placeholder="输入网址（例如：baidu.com)"></textarea>
                <button>添加</button>
            </div>
    
            <div>
                <span>输入重定向的网址 : </span><textarea rows="1" placeholder="输入网址（例如：bing.com)"></textarea>
            </div>
    
            <div>
                <span>输入定时屏蔽设定 ： </span><input type="checkbox" name="turnon" value="off" id="plan"><label for="plan">启动定时屏蔽 (不勾选则默认永久屏蔽）</label>
                <div>
                    <div class="weekday-div">
                        <input type="checkbox" name="weekday" value="mon" id="mon" checked><label for="mon">星期一 </label>
                        <input type="checkbox" name="weekday" value="tue" id="tue" checked><label for="tue">星期二 </label>
                        <input type="checkbox" name="weekday" value="wen" id="wen" checked><label for="wen">星期三 </label> 
                        <input type="checkbox" name="weekday" value="thu" id="thu" checked><label for="thu">星期四 </label> 
                        <input type="checkbox" name="weekday" value="fri" id="fri" checked><label for="fri">星期五 </label> 
                        <input type="checkbox" name="weekday" value="sat" id="sat"><label for="sat">星期六 </label>
                        <input type="checkbox" name="weekday" value="sun" id="sun"><label for="sun">星期日 </label>                        
                    </div>
                    <div class="daytime-div">
                        请输入时间 ： <input type="number" name="time" min="0" max="23" placeholder="0">-<input type="number" name="time" min="0" max="23" placeholder="23">
                    </div>
                </div>
            </div>
        </div>
    
        <div class="list-area" >
            <span></span>
            <div>
                <div class="list-header">
                    <span>已屏蔽的站点</span>
                    <div class="whitelist-div">
                        <input type="checkbox" name="whitelist" value="off" id="whitelist"><label for="whitelist">白名单(即勾选后，除下面列表中网站，其他网站都不能访问)</label>
                    </div>                    
                </div>
                <div class="list-body">
<!--                     <div class="list-item">
                        
                        <span class="item-url">baidu.com</span>
                        <span><button class="item-delete-btn">删除</button></span>
                    </div> -->
                </div>

            </div>
        </div>
    </div>
</div>
