// ==UserScript==
// @name            图片下载器
// @name Image Downloader
// @namespace       http://tampermonkey.net/
// @description     可以在绝大多数网站提取并批量下载图片。尤其是类似于千库网这种，不能右键保存图片的网站，提取之后，可以右键保存，或者直接下载所有的图片。其他的淘宝、天猫电商图片批量下载，youtube、B站封面下载，等等都可以的。点击右键-tampermonkey-图片下载器，按这个顺序使用。
// @version         1.8
// @author          桃源隐叟
// @include         *
// @grant           GM_openInTab
// @grant GM_download
// @run-at            context-menu
// @match        *
// @match        https://www.bilibili.com/
// @match        https://588ku.com/
// @homepageURL       https://github.com/taoyuancun123/modifyText/blob/master/modifyText.js
// @supportURL        https://greasyfork.org/zh-CN/scripts/419894/feedback
//@updateURL https://github.com/taoyuancun123/userScriptCollections/edit/master/ImageDownloader.js
//@downloadURL https://github.com/taoyuancun123/userScriptCollections/edit/master/ImageDownloader.js
//@installURL https://github.com/taoyuancun123/userScriptCollections/edit/master/ImageDownloader.js
// ==/UserScript==

(function () {
    'use strict';

    try{
        document.querySelector(".tyc-image-container").remove();
    }catch{

}
        let imgUrls = [];
        let bodyStr = document.body.innerHTML;

        try {
        let imgEles = document.getElementsByTagName("img")

        for (let i = 0; i < imgEles.length; i++) {
            //console.log(imgEles[i].src);
            if (!imgUrls.includes(imgEles[i].src)) {
                imgUrls.push(imgEles[i].src);
            }


        }


} catch {
 //alert("error");
 }


 try {
 let imgRegs = bodyStr.match(/(?<=background-image:\s*url\()(\S+)(?=\))/g);

for (let i = 0; i < imgRegs.length; i++) {
    //console.log(imgRegs[i]);
    if (!imgUrls.includes(imgRegs[i].replace(/&quot;/g, ""))) {
        imgUrls.push(imgRegs[i].replace(/&quot;/g, ""));
    }

}
} catch {
    //alert("error");
}


    let imgContainer = `
    <div class="tyc-image-container" style="position:fixed;
    top:0px;right:0px;width:50vw;z-index:2147483646;
    background-color: #dedede;
    border: 1px solid #aaa;
    overflow:scroll;height:100%;
    ">
    <div class="control-section" style="width:46vw;
    position:fixed;right:30px;
    top:0px;display:block;
    height:40px;line-height:40px;
    background:#eee;border:1px solid #aaa;border-radius:10px;">
    <input class="select-all" type="checkbox" name="select-all" value="select-all">全选
    <button class="btn-download" style="border:1px solid #aaa;border-radius:5px;
    height:32px;line-height:32px;
    margin:0px;padding:0 5px;
    ">download</button>
    <button class="btn-close" style="font-size:20px;position:absolute;
    right:30px;top:4px;
    height:32px;line-height:32px;
    margin:0px;
    border-radius:10px;border:1px solid #aaa;
    width:30px;">X</button>
    </div>
<div class="tyc-image-wrapper" style="margin-top:42px;display:flex;justify-content:center;
align-items:center;flex-wrap:wrap;">
</div>
    </div>
    `

    let showBigImage=`
        <div class="show-big-image" style="position:fixed;left:30%;top:30%;z-index:2147483647;">
        </div>
    `

    document.body.insertAdjacentHTML("afterbegin", imgContainer);

document.querySelector(".btn-close").onclick=(e)=>{
    document.querySelector(".tyc-image-container").remove();
}

document.querySelector(".btn-download").onclick=(e)=>{
    if(document.querySelector(".select-all").checked){
        imgUrls.forEach((img,index) => {
            GM_download(img, `pic-${index}`);
        });
    }else{
        alert("请勾选全选，下载全部，或者手动在图片上右键另存为指定图片");
    }
}


imgUrls.forEach((img,index) => {
    let insertImg = `<div class="tyc-img-item-container-${index}" style="text-align:center;font-size:12px;margin:5px;">
<img class="tyc-image-preview" src="${img}"/ style="width:auto;height:200px;"></div>`
        document.querySelector(".tyc-image-wrapper").insertAdjacentHTML("beforeend", insertImg);
        let naturalW=document.querySelector(`.tyc-img-item-container-${index} .tyc-image-preview`).naturalWidth;
        let naturalH=document.querySelector(`.tyc-img-item-container-${index} .tyc-image-preview`).naturalHeight;

        let imgInfo=`<p style="line-height:14px;height:14px;font-size:12px;">${naturalW}X${naturalH}</p>`;
        document.querySelector(`.tyc-img-item-container-${index}`).insertAdjacentHTML("beforeend", imgInfo);
        //console.log(img);
    });

document.body.onclick=(e)=>{
    if(e.target.nodeName=="IMG" && e.target.className==="tyc-image-preview"){
        try{
            document.querySelector(".show-big-image").remove();
        }
        catch{

    }
            document.body.insertAdjacentHTML("beforeend",showBigImage);
        let showItem=`<img src="${e.target.src}"/>`

            document.querySelector(".show-big-image").insertAdjacentHTML("beforeend",showItem);

            let tempImg=document.querySelector(".show-big-image img");

            let dWidth=(window.innerWidth-tempImg.width)/2;
            let dHeight=(window.innerHeight-tempImg.height)/2;

            document.querySelector(".show-big-image").style.left=dWidth+"px";
            document.querySelector(".show-big-image").style.top=dHeight+"px";
        }else if(e.target.parentElement.className==="show-big-image"){
            document.querySelector(".show-big-image").remove();
        }
    }


})();
