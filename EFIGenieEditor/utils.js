Uint8Array.prototype.toHex = function() { // buffer is an ArrayBuffer
    var hexArray = Array.prototype.map.call(new Uint8Array(this), x => (`00` + x.toString(16)).slice(-2));
    var string = `${hexArray[0]}`
    for(var i = 1; i<hexArray.length; i++){
        if(i%16===0)
            string += `\n`;
        else if(i%8===0)
            string += `  `;
        else
            string += ` `
        string += hexArray[i];
    }
    return string;
}

ArrayBuffer.prototype.toRawString = function() { // a, b TypedArray of same type
    var binary = '';
    var bytes = new Uint8Array( this );
    var len = bytes.byteLength;
    for (var i = 0; i < len; i++) {
        binary += String.fromCharCode( bytes[ i ] );
    }
    return binary
}

let crc32table = [];
for (let i = 0; i < 256; ++i) {
    let b = i;
    for (let i = 0; i < 8; ++i) {
        b = b & 1 ? 0xEDB88320 ^ (b >>> 1) : b >>> 1;
    }
    crc32table[i] = b;
}
ArrayBuffer.prototype.crc32 = function() {

    var crc = -1

    let uint8Array = new Uint8Array(this);
    for (let i = 0; i < uint8Array.length; ++i) {
        crc = crc32table[(crc ^ uint8Array[i]) & 0xFF] ^ (crc >>> 8);
    }

    crc ^= -1;
    return crc;
};

ArrayBuffer.prototype.concatArray = function(b) { // a, b TypedArray of same type
    var tmp = new Uint8Array(this.byteLength + b.byteLength);
    if(this.byteLength > 0)
        tmp.set(new Uint8Array(this), 0);
    tmp.set(new Uint8Array(b), this.byteLength);
    return tmp.buffer;
}

ArrayBuffer.prototype.pad = function(bytes, padByte) {
    if(padByte === undefined){
        padByte = 0xFF;   
    }
    var array = [];
    for(var i = 0; i < bytes; i++){
        array[i] = padByte;
    }
    return this.concatArray(new Uint8Array(array).buffer);
}

ArrayBuffer.prototype.align = function(align, padByte) {
    if(this.byteLength % align > 0){
        return this.pad(align - (this.byteLength % align), padByte);
    }
    return this;
}

ArrayBuffer.prototype.build = function(obj) {
    return obj.types.find(x => x.type === obj.type).toArrayBuffer.call(obj);
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

function getFileContents(url)
{
    var contents

    var xhr = new XMLHttpRequest();
    xhr.open(`GET`, url, false);

    xhr.onload = function(e) {
        contents = e.target.response;
    };

    xhr.send()
    return contents;
}

var GUID = 0;
function generateGUID(){
    return `GUID${GUID++}`;
}

var downloadObject = function(obj, fileName) {
    downloadstring(stringifyObject(obj), fileName);
}

var downloadCompressedObject = function(obj, fileName) {
    downloadstring(stringifyCompressedObject(obj), fileName);   
}

var parseObject = function(s) {
    if(s.indexOf(`lzjson`) === 0)
        return JSON.parse(lzjs.decompress(s.substring(6)));
    return JSON.parse(s);
}

var stringifyObject = function(o) {
    return JSON.stringify(o);
}
var stringifyCompressedObject = function(o) {
    return `lzjson${lzjs.compress(JSON.stringify(o))}`
}

var downloadBin = function(data, fileName) {
    var blob, url;
    blob = new Blob([data], {
      type: `application/octet-stream`
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
        type: `text/plain` 
    });
    url = window.URL.createObjectURL(blob);
    downloadURL(url, fileName);
    setTimeout(function() {
      return window.URL.revokeObjectURL(url);
    }, 1000);
  }
  
var downloadURL = function(data, fileName) {
    var a;
    a = document.createElement(`a`);
    a.href = data;
    a.download = fileName;
    document.body.appendChild(a);
    a.style = `display: none`;
    a.click();
    a.remove();
  };

function IsBrowserSupported() {
    var obj = {
        c: `test`,
        a: 1
      };
      obj = JSON.parse(JSON.stringify(obj));
      var keys = [];
      for (var key in obj) {
        keys.push(key);
      }
      keys = JSON.parse(JSON.stringify(keys));
      if(keys[0] !== `c`) {
          alert(`Browser not supported. Try using a different browser.`);
          return false;
      }
      return true;
}

function GetClassProperty(cl, prop) {
    return cl?.[prop] ?? cl?.constructor?.[prop];
}

// Helper to return a value's internal object [[Class]]
// That this returns [object Type] even for primitives
function getClass(obj) {
    return Object.prototype.toString.call(obj);
}
  

  function base64ToArrayBuffer(base64) {
      var binary_string = window.atob(base64);
      var len = binary_string.length;
      var bytes = new Uint8Array(len);
      for (var i = 0; i < len; i++) {
          bytes[i] = binary_string.charCodeAt(i);
      }
      return bytes.buffer;
  }

  function isEmptyObject(obj) {
    for(var prop in obj) {
        if(obj[prop] === undefined)
            continue;
        if(Object.prototype.hasOwnProperty.call(obj, prop)) {
            return false;
        }
    }
  
    return true;
}

async function postJSONData(url = '', data = {}) {
    // Default options are marked with *
    const response = await fetch(url, {
      method: `POST`, // *GET, POST, PUT, DELETE, etc.
      headers: {
        'Content-Type': `text/plain`
      },
      body: JSON.stringify(data) // body data type must match "Content-Type" header
    });
    return response.text(); // parses JSON response into native JavaScript objects
}

async function postArrayBufferData(url = '', arrayBuffer = new ArrayBuffer()) {
    // Default options are marked with *
    const response = await fetch(url, {
      method: `POST`, // *GET, POST, PUT, DELETE, etc.
      headers: {
        'Content-Type': `application/octet-stream`
      },
      body: arrayBuffer // body data type must match "Content-Type" header
    });
    return response.text(); // parses JSON response into native JavaScript objects
}