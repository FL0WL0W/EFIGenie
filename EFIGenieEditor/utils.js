Uint8Array.prototype.toHex = function() { // buffer is an ArrayBuffer
    return "0x" + Array.prototype.map.call(new Uint8Array(this), x => ('00' + x.toString(16)).slice(-2)).join(' 0x');
}

ArrayBuffer.prototype.concatArray = function(b) { // a, b TypedArray of same type
    var tmp = new Uint8Array(this.byteLength + b.byteLength);
    tmp.set(new Uint8Array(this), 0);
    tmp.set(new Uint8Array(b), this.byteLength);
    return tmp.buffer;
}

ArrayBuffer.prototype.equals = function(buf)
{
    if (this.byteLength != this.byteLength) return false;
    var dv1 = new Int8Array(this);
    var dv2 = new Int8Array(buf);
    for (var i = 0 ; i != this.byteLength ; i++)
    {
        if (dv1[i] != dv2[i]) return false;
    }
    return true;
}

jQuery.expr[':'].parents = function(a,i,m){
    return jQuery(a).parents(m[3]).length < 1;
};

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

function isEmpty(obj, ignoreKeys) {

  // null and undefined are "empty"
  if (obj == null) return true;

  // Assume if it has a length property with a non-zero value
  // that that property is correct.
  if (obj.length > 0)    return false;
  if (obj.length === 0)  return true;

  // If it isn't an object at this point
  // it is empty, but it can't be anything *but* empty
  // Is it empty?  Depends on your application.
  if (typeof obj !== "object") return false;

  // Otherwise, does it have any properties of its own?
  // Note that this doesn't handle
  // toString and valueOf enumeration bugs in IE < 9
  for (var key in obj) {
      if(ignoreKeys && ignoreKeys.length > 0) {
          if(ignoreKeys.indexOf(key) > -1)
              continue;
      }
      if (hasOwnProperty.call(obj, key) && !isEmpty(obj[key], ignoreKeys)) return false;
  }

  return true;
}