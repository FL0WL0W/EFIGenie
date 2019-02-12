Uint8Array.prototype.toHex = function() { // buffer is an ArrayBuffer
    return "0x" + Array.prototype.map.call(new Uint8Array(this), x => ('00' + x.toString(16)).slice(-2)).join(' 0x');
}

ArrayBuffer.prototype.concatArray = function(b) { // a, b TypedArray of same type
    var tmp = new Uint8Array(this.byteLength + b.byteLength);
    tmp.set(new Uint8Array(this), 0);
    tmp.set(new Uint8Array(b), this.byteLength);
    return tmp.buffer;
}

function getFileContents(url)
{
    var contents

    var xhr = new XMLHttpRequest();
    xhr.open('GET', url, false);

    xhr.onload = function(e) {
        contents = e.target.response;
    };

    xhr.send()
    return contents;
}

var GUID = 0;
function getGUID(){
    return "GUID" + (GUID++);
}

var downloadObject = function(obj, fileName) {
    downloadstring(JSON.stringify(obj), fileName);
}

var downloadBin = function(data, fileName) {
    var blob, url;
    blob = new Blob([data], {
      type: "application/octet-stream"
    });
    url = window.URL.createObjectURL(blob);
    downloadURL(url, fileName);
    setTimeout(function() {
      return window.URL.revokeObjectURL(url);
    }, 1000);
  };

var downloadstring = function(text, fileName) {
    var blob, url;
    blob = new Blob([text], { 
        type: "text/plain" 
    });
    url = window.URL.createObjectURL(blob);
    downloadURL(url, fileName);
    setTimeout(function() {
      return window.URL.revokeObjectURL(url);
    }, 1000);
  }
  
var downloadURL = function(data, fileName) {
    var a;
    a = document.createElement('a');
    a.href = data;
    a.download = fileName;
    document.body.appendChild(a);
    a.style = 'display: none';
    a.click();
    a.remove();
  };

var currentMousePos = { x: -1, y: -1 };
$(document).mousemove(function(event) {
    currentMousePos.x = event.pageX;
    currentMousePos.y = event.pageY;
});

$(document).blur(function(event) {
    console.log("focus " + event.target.id);
})

function IsBrowserSupported() {
    var obj = {
        c: "test",
        a: 1
      };
      obj = JSON.parse(JSON.stringify(obj));
      var keys = [];
      for (var key in obj) {
        keys.push(key);
      }
      keys = JSON.parse(JSON.stringify(keys));
      if(keys[0] !== "c") {
          alert("Browser not supported. Try using a different browser.");
          return false;
      }
      return true;
}