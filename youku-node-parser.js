var req = require('request');
var base64_decode = require('base64').encode
var querystring = require("querystring");
var btoa = require("btoa");
var atob = require("atob");

function myEncoder(a, c, isToBase64){
    var result = "";
    var bytesR = [];
    var h = 0;
    var q = 0;
    var b = [];
    var f = 0;
    for (var i = 0; i < 256; i++){
        b.push(i);
    }
    
    while (h < 256){
        f = (f + b[h] + a[h % a.length].charCodeAt()) % 256;
        var temp = b[h];
        b[h] = b[f];
        b[f] = temp;
        h++;
    }
    f = 0; h = 0; q = 0;
    var result;
    while (q < c.length)
    {
        h = (h + 1) % 256;
        f = (f + b[h]) % 256;
        var temp = b[h];
        b[h] = b[f];
        b[f] = temp;
        var x = c[q] ^ b[(b[h] + b[f]) % 256];
        bytesR.push(x);
        result += String.fromCharCode(x);
        q++;
    }


    if(isToBase64){
        var u8 = new Uint8Array(bytesR);
        var b64encoded = btoa(String.fromCharCode.apply(null, u8));
        result =  b64encoded;
    }
    return result
}


function getVidByUrl(url){
	 var regex = /id_(\w+)/
	 var match = regex.exec(url)
	 return match[1]
}


function getVideoInfoByVideoUrl(videoUrl, format, callBack){
        var vid = getVidByUrl(videoUrl);
        var infoUrl = 'http://v.youku.com/player/getPlayList/VideoIDS/'+vid+'/Pf/4/ctype/12/ev/1';
        console.log(infoUrl);
        req.get(infoUrl, function(error, response, body){
            var obj = eval("(" + body + ')');
            var jsondata = eval(obj);
            var videoIp = jsondata.data[0].ip;
            var videoEp = jsondata.data[0].ep;
            var bytes = new Uint8Array(atob(videoEp).split("").map(function(c) {return c.charCodeAt(0); }));
            var template1 = "becaf9be";
            var template2 = "bf7e5f01";
            var temp = myEncoder(template1, bytes, false);
            var tempSplited = temp.split("_");
            var sid = tempSplited[0];
            var token = tempSplited[1];
            var whole = sid+"_"+vid+"_"+token;
            console.log(whole)
            var newBytes = whole.split('').map(function(c) { return c.charCodeAt(); });
            var epNew = myEncoder(template2, newBytes, true )
            epNew = querystring.escape(epNew);
            var finalUrl = "http://pl.youku.com/playlist/m3u8?ctype=12&ep="+epNew+"&ev=1&keyframe=1&oip="+videoIp+"&sid="+sid+"&token="+token+"&type="+format+"&vid="+vid;
            callBack(vid, finalUrl, jsondata.data[0].logo);
        })
}



getVideoInfoByVideoUrl('http://v.youku.com/v_show/id_XODMyNTI2ODI4.html', 'mp4', function(vid, finalUrl, logo){

})
// module.exports.getVideoInfoByVideoUrl = getVideoInfoByVideoUrl;
