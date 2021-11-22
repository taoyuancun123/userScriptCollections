// ==UserScript==
// @name         Image Downloader
// @name:zh-CN   图片下载器
// @name:zh-TW   图片下载器
// @namespace       http://tampermonkey.net/
// @description You can extract and download pictures in batches on most websites.Right Click-tampermonkey-Image Downloader(or alt+w),use in this order.(currently only suitable for tampermonkey and chrome,others have not tried it)
// @description:zh-CN    可以在绝大多数网站提取并批量下载图片。尤其是类似于千库网、包图网这种，不能右键保存图片或者保存的图片文件格式无法识别，均可以用脚本提取，然后用脚本提供的下载按钮，就可以下载到正确格式的图片文件。其他的淘宝、天猫电商图片批量下载，youtube、B站封面下载，等等都可以的。点击右键-tampermonkey-图片下载器-打开脚本(或alt+w)，按这个顺序使用。(目前只适合chrome+tampermonkey，其他组合多少有问题）
// @description:zh-TW   可以在绝大多数网站提取并批量下载图片。尤其是类似于千库网、包图网这种，不能右键保存图片或者保存的图片文件格式无法识别，均可以用脚本提取，然后用脚本提供的下载按钮，就可以下载到正确格式的图片文件。其他的淘宝、天猫电商图片批量下载，youtube、B站封面下载，等等都可以的。点击右键-tampermonkey-图片下载器-打开脚本(或alt+w)，按这个顺序使用。(目前只适合chrome+tampermonkey，其他组合多少有问题）
// @version         1.60
// @author          桃源隐叟
// @include         *
// @connect *
// @grant           GM_openInTab
// @grant        GM_registerMenuCommand
// @grant           GM_setValue
// @grant           GM_getValue
// @grant        GM_xmlhttpRequest
// @grant GM_download
// @require      https://cdn.jsdelivr.net/npm/hotkeys-js@3.7.2/dist/hotkeys.min.js
// @require      https://cdn.bootcss.com/jszip/3.7.1/jszip.min.js
// @require      https://cdn.bootcss.com/FileSaver.js/1.3.8/FileSaver.min.js
// @run-at         document-end
// @match        *
// @match        https://www.bilibili.com/
// @match        https://588ku.com/
// @homepageURL       https://github.com/taoyuancun123/modifyText/blob/master/modifyText.js
// @supportURL        https://greasyfork.org/zh-CN/scripts/419894/feedback
// @license GPLv3
// ==/UserScript==

(function () {
    'use strict';

    var lang = navigator.appName == "Netscape" ? navigator.language : navigator.userLanguage;
    var langSet;
    var localization = {
        zh: {
            selectAll: "全选",
            downloadBtn: "下载",
            downloadMenuText: "打开脚本(Alt+w)",
            zipDownloadBtn: "zip下载"
        },
        en: {
            selectAll: "selectAll",
            downloadBtn: "download",
            downloadMenuText: "Open(Alt+w)",
            zipDownloadBtn: "zip Download"
        }
    }

    if (lang.toLowerCase().includes("zh-")) {
        langSet = localization.zh;
    } else {
        langSet = localization.en;
    }

    /* ~function(global){
        console.log(global.eHook);
    }(window); */

    GM_registerMenuCommand(langSet.downloadMenuText, wrapper);
    hotkeys('alt+w', wrapper);

    function wrapper() {

        try {
            document.querySelector(".tyc-image-container").remove();
        } catch {

        }
        var imgUrls = [];
        var bodyStr = document.body.innerHTML;
        var imgSelected = [];
        var zipImgSelected = [];
        var imgWaitDownload = [];
        var zipImgWaitDownload = [];
        var widthFilter = { min: 0, max: 3000 };
        var heightFilter = { min: 0, max: 3000 };
        var tempImgUrls = [];
        var zipFolder = new JSZip();
        var zipSubFoler = zipFolder.folder('pics');


        try {
            let imgEles = document.getElementsByTagName("img")

            for (let i = 0; i < imgEles.length; i++) {
                ////console.log(imgEles[i].src);
                if (!imgUrls.includes(imgEles[i].src)) {
                    imgUrls.push(imgEles[i].src);
                } else if (!imgUrls.includes(imgEles[i].srcset)) {
                    imgUrls.push(imgEles[i].srcset);
                }
            }
        } catch {
            //alert("error");
        }

        try {
            let imgRegs = bodyStr.match(/(?<=background-image:\s*url\()(\S+)(?=\))/g);

            for (let i = 0; i < imgRegs.length; i++) {
                ////console.log(imgRegs[i]);
                if (!imgUrls.includes(imgRegs[i].replace(/&quot;/g, ""))) {
                    imgUrls.push(imgRegs[i].replace(/&quot;/g, ""));
                }
            }
        } catch {
            //alert("error");
        }


        let imgContainer = `
    <div class="tyc-image-container" style="position:fixed;
    top:0px;right:0px;width:50vw;z-index:2147483645;
    background-color: #dedede;
    border: 1px solid #aaa;
    overflow:scroll;height:100%;
    ">
    <div class="control-section" style="width:46vw;z-index:2147483646;
    position:fixed;right:30px;
    top:0px;display:block;
    height:80px;line-height:40px;
    background:#eee;border:1px solid #aaa;border-radius:2px;">

    <input class="select-all" type="checkbox" name="select-all" value="select-all">${langSet.selectAll}
    <button class="btn-download" style="border:1px solid #aaa;border-radius:5px;
    height:32px;line-height:32px;
    margin:0px;padding:0 5px;
    ">${langSet.downloadBtn}</button>

    <button class="btn-zipDownload" style="border:1px solid #aaa;border-radius:5px;
    height:32px;line-height:32px;
    margin:0px;padding:0 5px;
    ">${langSet.zipDownloadBtn}</button>

<span style="margin-left:10px;" class="num-tip">已选(0/${imgUrls.length})张图片</span>
    <button class="btn-close" style="font-size:20px;position:absolute;
    right:30px;top:4px;
    height:32px;line-height:32px;
    margin:0px;
    border-radius:10px;border:1px solid #aaa;
    width:30px;">X</button>

    <p style="line-height:12px;">
        <div style="float:left;">
        <input type="checkbox" class="width-check img-check" name="width-check" value="width-check">Width:
        <input type="text" class="width-value-min" size="1" style="height:15px;width:50px;"
            min="0" max="9999" value="0">-
            <input type="text" class="width-value-max" size="1" style="height:15px;width:50px;"
            min="0" max="9999" value="3000">
        </div>

        <div style="float:left;margin-left:30px;">
            <input type="checkbox" class="height-check img-check" name="height-check" value="height-check">Height:
            <input type="text" class="height-value-min" size="1" style="height:15px;width:50px;"
                min="0" max="9999" value="0">-
                <input type="text" class="height-value-max" size="1" style="height:15px;width:50px;"
                min="0" max="9999" value="3000">
        </div>


    </p>

    </div>
<div class="tyc-image-wrapper" style="margin-top:82px;display:flex;justify-content:center;
align-items:center;flex-wrap:wrap;">
</div>
    </div>
    `

        let showBigImage = `
        <div class="show-big-image" style="position:fixed;left:30%;top:30%;z-index:2147483647;">
        </div>
    `

        document.body.insertAdjacentHTML("afterbegin", imgContainer);



        if (window.location.href.includes("hathitrust.org")) {
            //imgUrls=[];

            let imgs = document.querySelectorAll(".image img");
            if (imgs.length > 0) {
                let canvas = document.createElement("canvas");
                imgUrls = [];
                for (let pi = 0; pi < imgs.length; pi++) {
                    canvas.width = imgs[pi].width;
                    canvas.height = imgs[pi].height;

                    canvas.getContext("2d").drawImage(imgs[pi], 0, 0);

                    imgUrls.push(canvas.toDataURL("image/png"));
                }

                document.querySelector(".select-all").style = "position:relative;width:15px;height:15px;"
            } else {

            }
        }



        document.body.onclick = (e) => {
            //console.log(e);
            if ((e.target.nodeName == "IMG" && e.target.className === "tyc-image-preview")) {
                let imgContainer = e.path.find(

                    (ele) => {
                        try {
                            //console.log(ele);
                            return ele.className.includes("tyc-img-item-container");
                        }
                        catch {

                        }

                    }
                )
                let path = imgContainer.getElementsByTagName("img")[0].src;

                try {
                    let container = document.querySelector(".show-big-image");
                    if (container.getElementsByTagName("img")[0].src === path) {
                        container.remove();
                        return;
                    } else {
                        container.remove();
                    }
                }
                catch {

                }
                document.body.insertAdjacentHTML("beforeend", showBigImage);

                let showItem = `<img src="${path}"/>`

                document.querySelector(".show-big-image").insertAdjacentHTML("beforeend", showItem);

                let tempImg = document.querySelector(".show-big-image img");

                let dWidth = (window.innerWidth - tempImg.width) / 2;
                let dHeight = (window.innerHeight - tempImg.height) / 2;

                document.querySelector(".show-big-image").style.left = dWidth + "px";
                document.querySelector(".show-big-image").style.top = dHeight + "px";
            } else if (e.target.parentElement.className === "show-big-image") {
                try {
                    document.querySelector(".show-big-image").remove();
                }
                catch
                {

                }

            } else if (e.target.classList[1] == "bi-download" || e.path.find(isDownload) != undefined) {
                let imgContainer = e.path.find(

                    (ele) => {
                        try {
                            //console.log(ele);
                            return ele.className.includes("tyc-img-item-container");
                        }
                        catch {

                        }

                    }
                )
                let path = imgContainer.getElementsByTagName("img")[0].src;
                let filename;
                if (path.indexOf("/") > 0)//如果包含有"/"号 从最后一个"/"号+1的位置开始截取字符串
                {
                    filename = path.substring(path.lastIndexOf("/") + 1, path.lastIndexOf("."));
                }
                else {
                    filename = path;
                }
                //console.log("download start" + path + " " + filename);
                GM_download(path, "pic");
            } else if (e.target.classList[1] == "bi-check" || e.path.find(isSelect) != undefined) {
                let checkSvg = e.path.find((ele) => ele.classList[1] === "bi-check");
                let currentImgIndex = parseInt(checkSvg.dataset.value);

                let container = e.path.find((ele) => ele.className === `tyc-img-item-container-${currentImgIndex}`);



                if (imgSelected.includes(currentImgIndex)) {
                    imgSelected.splice(imgSelected.indexOf(currentImgIndex), 1);
                    checkSvg.style.color = "black";
                    container.style.border = "1px solid #99d";
                } else {
                    imgSelected.push(currentImgIndex);
                    checkSvg.style.color = "white";
                    container.style.border = "1px solid white";
                }

                /*                 if(document.querySelector(".zip-check").checked){
                                    GM_xmlhttpRequest({
                                        method:"get",
                                        url:tempImgUrls[currentImgIndex],
                                        responseType:"blob",
                                        onload:function(r){
                                            var blob = r.response;
                                            let oFileReader = new FileReader();
                                            oFileReader.onloadend = function (e) {
                                              let base64 = e.target.result;
                                              //console.log("方式一》》》》》》》》》", base64)
                                              tempImgUrls[currentImgIndex]=base64;
                                            };
                                            oFileReader.readAsDataURL(blob);
                                            //imgZip.file(filename+".jpg",r.response);
                                            //console.log(r.response);

                                        }
                                    });
                                } */

                document.querySelector(".num-tip").innerText = `已选(${imgSelected.length}/${imgUrls.length})张图片`;
                transIndexToLink(tempImgUrls);
            }
        }


        document.querySelector(".btn-close").onclick = (e) => {
            document.querySelector(".tyc-image-container").remove();
        }

        document.querySelector(".btn-download").onclick = (e) => {
            /*         if (document.querySelector(".select-all").checked) {
                        imgUrls.forEach((img, index) => {
                            GM_download(img, `pic-${index}`);
                        });
                    } else {
                        alert("请勾选全选，下载全部，或者手动在图片上右键另存为指定图片");
                    } */


            if (imgWaitDownload.length >= 1) {
                console.log(imgWaitDownload);
                imgWaitDownload.forEach(async (img, index) => {
                    //let filename = `pic-${index}.jpg`;
                    //filename=filename.replace(/\\/g, '/').replace(/\/{2,}/g, '/');
                    await GM_download(img, `pic-${index}`);
                });
            } else {
                alert("请至少选中一张图片。");
            }
        }

        document.querySelector(".btn-zipDownload").onclick = (e) => {
            if (zipImgWaitDownload.length >= 1) {
                console.log(zipImgWaitDownload);
                zipImgWaitDownload.forEach(async (img, index) => {
                    let fileExt=img.substring(img.indexOf("image/")+6,img.indexOf(";"))
                    let filename=`pic${index}.${fileExt}`;
                    zipSubFoler.file(filename,img.split(",")[1],{base64:true});
                });

                zipFolder.generateAsync({type:"blob"})
                                    .then(function(content) {
                                        // see FileSaver.js
                                    saveAs(content, "pics.zip");
                });
            } else {
                alert("请至少选中一张图片。");
            }
        }

        document.body.onchange = (e) => {
            if (e.target.className.includes("width-check")) {
                GM_setValue('width-check', e.target.checked);
            }
            if (e.target.className.includes("height-check")) {
                GM_setValue('height-check', e.target.checked);
            }
            if (e.target.nodeName === "INPUT" && e.target.type === "text" && e.target.className.includes("value")) {
                GM_setValue(e.target.className, e.target.value);
            }



            (e.target.className.includes("width-check") || e.target.className.includes("height-check") ||

                (e.target.nodeName === "INPUT" && e.target.type === "text" && e.target.className.includes("value")))
                && (clean(), init());



        }

        document.querySelector(".select-all").onchange = (e) => {
            if (document.querySelector(".select-all").checked) {
                imgWaitDownload = tempImgUrls;

                fetchImgAndTrans();


            } else {
                transIndexToLink(tempImgUrls);
            }

            document.querySelector(".num-tip").innerText = `已选(${imgWaitDownload.length}/${imgUrls.length})张图片`;
        }

        init();
        function init() {
            tempImgUrls = imgUrls;
            getSavedValue();
            if (document.querySelector(".width-check").checked) {
                tempImgUrls = tempImgUrls.filter(filterByWidth);
            }

            if (document.querySelector(".height-check").checked) {
                tempImgUrls = tempImgUrls.filter(filterByHeight);
            }

            showImage(tempImgUrls);
        }

        function clean() {
            imgWaitDownload = [];
            imgSelected = [];
            document.querySelector(".num-tip").innerText = `已选(${imgSelected.length}/${imgUrls.length})张图片`;
            document.querySelector(".tyc-image-wrapper").innerHTML = "";
        }

        function isDownload(ele) {
            return ele.className == "download-direct";
        }

        function isSelect(ele) {
            return ele.className == "select-image";
        }

        function transIndexToLink(tempImgUrls) {
            imgWaitDownload = [];
            imgSelected.forEach((imgIndex, index) => {
                imgWaitDownload.push(tempImgUrls[imgIndex]);
            });
        }

        function showImage(filtedImgUrls) {
            filtedImgUrls.forEach((img, index) => {
                if (window.location.href.includes("huaban.com")) {
                    if (img.includes("/webp")) {
                        img = img.replace(/\/webp/g, "/png");
                    }

                }
                let insertImg = `<div class="tyc-img-item-container-${index}" style="text-align:center;font-size:0px;
    margin:5px;border:1px solid #99d;border-radius:3px;
    ">
    <img class="tyc-image-preview" src="${img}"/ style="width:auto;height:200px;"></div>`
                document.querySelector(".tyc-image-wrapper").insertAdjacentHTML("beforeend", insertImg);
                let naturalW = document.querySelector(`.tyc-img-item-container-${index} .tyc-image-preview`).naturalWidth;
                let naturalH = document.querySelector(`.tyc-img-item-container-${index} .tyc-image-preview`).naturalHeight;

                let imgInfoContainer = `
            <div style="font-size:0px;background-color:rgba(100,100,100,0.6);height:30px;position:relative;">


    </div>
            `;

                let thisImgContainer = document.querySelector(`.tyc-img-item-container-${index}`);
                let imgContainerWidth = thisImgContainer.getBoundingClientRect().width;
                let imgInfo = `
            <span style="font-size:16px;position:absolute;left:calc(50% - 80px);top:7px;">${naturalW}X${naturalH}</span>
            `;


                /*
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-arrows-fullscreen" viewBox="0 0 16 16" style="position:absolute;top:5px;right:5px;">
          <path fill-rule="evenodd" d="M5.828 10.172a.5.5 0 0 0-.707 0l-4.096 4.096V11.5a.5.5 0 0 0-1 0v3.975a.5.5 0 0 0 .5.5H4.5a.5.5 0 0 0 0-1H1.732l4.096-4.096a.5.5 0 0 0 0-.707zm4.344 0a.5.5 0 0 1 .707 0l4.096 4.096V11.5a.5.5 0 1 1 1 0v3.975a.5.5 0 0 1-.5.5H11.5a.5.5 0 0 1 0-1h2.768l-4.096-4.096a.5.5 0 0 1 0-.707zm0-4.344a.5.5 0 0 0 .707 0l4.096-4.096V4.5a.5.5 0 1 0 1 0V.525a.5.5 0 0 0-.5-.5H11.5a.5.5 0 0 0 0 1h2.768l-4.096 4.096a.5.5 0 0 0 0 .707zm-4.344 0a.5.5 0 0 1-.707 0L1.025 1.732V4.5a.5.5 0 0 1-1 0V.525a.5.5 0 0 1 .5-.5H4.5a.5.5 0 0 1 0 1H1.732l4.096 4.096a.5.5 0 0 1 0 .707z"/>
        </svg>*/

                let downAndFullBtn = `
    <span style="position:absolute;right:calc(50% - 30px);top:2px;border:1px solid #333;
    width:26px;height:26px;border-radius:20px;" class="select-image" data-value="${index}">
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-check" viewBox="0 0 16 16"  style="position:absolute;top:-1px;right:-2px;width:30px;height:30px;" data-value="${index}">
      <path d="M10.97 4.97a.75.75 0 0 1 1.07 1.05l-3.99 4.99a.75.75 0 0 1-1.08.02L4.324 8.384a.75.75 0 1 1 1.06-1.06l2.094 2.093 3.473-4.425a.267.267 0 0 1 .02-.022z"/>
    </svg>
    </span>
    <span style="position:absolute;right:calc(50% - 60px);top:2px;border:1px solid #333;
    width:26px;height:26px;border-radius:20px;
    " class="download-direct">
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-download" viewBox="0 0 16 16" style="position:absolute;top:5px;right:5px;">
      <path d="M.5 9.9a.5.5 0 0 1 .5.5v2.5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-2.5a.5.5 0 0 1 1 0v2.5a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2v-2.5a.5.5 0 0 1 .5-.5z"/>
      <path d="M7.646 11.854a.5.5 0 0 0 .708 0l3-3a.5.5 0 0 0-.708-.708L8.5 10.293V1.5a.5.5 0 0 0-1 0v8.793L5.354 8.146a.5.5 0 1 0-.708.708l3 3z"/>
    </svg>
    </span>

    `;

                let downloadBtn = `
            <span style="position:absolute;right:calc(50% - 15px);top:2px;border:1px solid #333;
    width:26px;height:26px;border-radius:20px;
    " class="download-direct">
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-download" viewBox="0 0 16 16" style="position:absolute;top:5px;right:5px;">
      <path d="M.5 9.9a.5.5 0 0 1 .5.5v2.5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-2.5a.5.5 0 0 1 1 0v2.5a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2v-2.5a.5.5 0 0 1 .5-.5z"/>
      <path d="M7.646 11.854a.5.5 0 0 0 .708 0l3-3a.5.5 0 0 0-.708-.708L8.5 10.293V1.5a.5.5 0 0 0-1 0v8.793L5.354 8.146a.5.5 0 1 0-.708.708l3 3z"/>
    </svg>
    </span>
            `


                thisImgContainer.insertAdjacentHTML("beforeend", imgInfoContainer);

                let thisImgInfoContainer = thisImgContainer.querySelector("div");

                let rectWidth = parseInt(thisImgContainer.getBoundingClientRect().width);

                if (rectWidth > 120) {
                    thisImgInfoContainer.insertAdjacentHTML("beforeend", imgInfo);
                    thisImgInfoContainer.insertAdjacentHTML("beforeend", downAndFullBtn);
                } else if (rectWidth <= 120 && rectWidth >= 50) {
                    thisImgInfoContainer.insertAdjacentHTML("beforeend", downAndFullBtn);
                    thisImgInfoContainer.getElementsByClassName("select-image")[0].style.right = "50%";
                    thisImgInfoContainer.getElementsByClassName("download-direct")[0].style.right = "calc(50% - 30px)";


                } else {
                    thisImgInfoContainer.insertAdjacentHTML("beforeend", downloadBtn);
                }


                ////console.log(img);
            });
        }

        function filterByWidth(src) {
            let tempImg = new Image();
            tempImg.src = src;
            if (tempImg.width >= parseInt(document.querySelector(".width-value-min").value)
                && tempImg.width <= parseInt(document.querySelector(".width-value-max").value)) {
                return src;
            }
        }

        function filterByHeight(src) {
            let tempImg = new Image();
            tempImg.src = src;
            if (tempImg.height >= parseInt(document.querySelector(".height-value-min").value)
                && tempImg.height <= parseInt(document.querySelector(".height-value-max").value)) {
                return src;
            }
        }

        function getSavedValue() {
            GM_getValue("width-check") && (document.querySelector(".width-check").checked = GM_getValue("width-check"));
            GM_getValue("height-check") && (document.querySelector(".height-check").checked = GM_getValue("height-check"));
            GM_getValue("width-value-min") && (document.querySelector(".width-value-min").value = GM_getValue("width-value-min"));
            GM_getValue("width-value-max") && (document.querySelector(".width-value-max").value = GM_getValue("width-value-max"));
            GM_getValue("height-value-min") && (document.querySelector(".height-value-min").value = GM_getValue("height-value-min"));
            GM_getValue("height-value-max") && (document.querySelector(".height-value-max").value = GM_getValue("height-value-max"));

        }

        function getImgAndChangeToBase64(currentImgIndex) {
            document.querySelector(".btn-zipDownload").disabled = true;
            document.querySelector(".btn-zipDownload").style.color = "grey";
            GM_xmlhttpRequest({
                method: "get",
                url: tempImgUrls[currentImgIndex],
                responseType: "blob",
                onload: function (r) {
                    var blob = r.response;
                    let oFileReader = new FileReader();
                    oFileReader.onloadend = function (e) {
                        let base64 = e.target.result;
                        //console.log("方式一》》》》》》》》》", base64)
                        //将原来的图片地址替换为base64编码的地址
                        tempImgUrls[currentImgIndex] = base64;

                        document.querySelector(".btn-zipDownload").disabled = false;
                        document.querySelector(".btn-zipDownload").style.color = "";
                    };
                    oFileReader.readAsDataURL(blob);
                    //imgZip.file(filename+".jpg",r.response);
                    //console.log(r.response);

                }
            });
        }

        function fetchImgAndTrans() {
            tempImgUrls.forEach((imgUrl, urlIndex) => {
                if(imgUrl.includes("data:image")){
                    return;
                }
                GM_xmlhttpRequest({
                    method: "get",
                    url: imgUrl,
                    responseType: "blob",
                    onload: function (r) {
                        var blob = r.response;
                        let oFileReader = new FileReader();
                        oFileReader.onloadend = function (e) {
                            let base64 = e.target.result;
                            //console.log("》》", base64)

                            if(base64.includes("data:image")){
                                tempImgUrls[urlIndex] = base64;
                                zipImgWaitDownload.push(base64);
                            }
                        };
                        oFileReader.readAsDataURL(blob);
                    }
                });
            })
        }

        //获取base64格式的图片后缀名
        function getFileExt(imgUrl){
            //data:image/png;base64,iVBORw0KGgoAAAANSUhE
            return imgUrl.substring(imgUrl.indexOf("image/")+6,imgUrl.indexOf(";"));
        }
    }

})();
