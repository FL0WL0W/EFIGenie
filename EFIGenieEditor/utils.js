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
    var buffer = this;
    for(var index in obj.value){
        var typeInfo = obj.types.find(x => x.type === obj.value[index].type);

        //align
        var align = obj.value[index].align;
        if(align === undefined && typeInfo !== undefined){
            align = typeInfo.align;
        }
        if(align) {
            buffer = buffer.align(align);
        }

        var toArrayBuffer = obj.value[index].toArrayBuffer;
        if(toArrayBuffer === undefined && typeInfo !== undefined){
            toArrayBuffer = typeInfo.toArrayBuffer;
        }
        if(toArrayBuffer !== undefined){
            buffer = buffer.concatArray(toArrayBuffer.call(obj.value[index]));
        } else {
            var objobj = obj.value[index].obj;
            if(objobj === undefined && typeInfo !== undefined){
                objobj = typeInfo.obj;
            }
            if(objobj === undefined){
                var toObj
                var toObj = obj.value[index].toObj;
                if(toObj === undefined && typeInfo !== undefined){
                    toObj = typeInfo.toObj;
                }
                if(toObj) {
                    objobj = toObj.call(obj.value[index]);
                }
            }
            if(obj.value[index].type === undefined && Array.isArray(obj.value[index].value)) {
                objobj = obj.value[index];
            }
            if(objobj !== undefined){
                if(objobj.types === undefined) {
                    objobj.types = [];
                }
                for(var typeIndex in obj.types){
                    var typetypeInfo = objobj.types.find(x => x.type === obj.types[typeIndex].type);
                    if(typetypeInfo === undefined){
                        objobj.types.push(obj.types[typeIndex]);
                    }
                }
                buffer = buffer.build(objobj);
            }
        }
    }
    return buffer;
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
  
  /*
  ** @param a, b        - values (Object, RegExp, Date, etc.)
  ** @returns {boolean} - true if a and b are the object or same primitive value or
  **                      have the same properties with the same values
  */
function objectTester(a, b) {
  
    // If a and b reference the same value, return true
    if (a === b) return true;
  
    // If a and b aren't the same type, return false
    if (typeof a != typeof b) return false;
  
    // Already know types are the same, so if type is number
    // and both NaN, return true
    if (typeof a == 'number' && isNaN(a) && isNaN(b)) return true;
  
    // Get internal [[Class]]
    var aClass = getClass(a);
    var bClass = getClass(b)
  
    // Return false if not same class
    if (aClass != bClass) return false;
  
    // If they're Boolean, String or Number objects, check values
    if (aClass == '[object Boolean]' || aClass == '[object String]' || aClass == '[object Number]') {
        return a.valueOf() == b.valueOf();
    }
  
    // If they're RegExps, Dates or Error objects, check stringified values
    if (aClass == '[object RegExp]' || aClass == '[object Date]' || aClass == '[object Error]') {
        return a.toString() == b.toString();
    }
  
    // Otherwise they're Objects, Functions or Arrays or some kind of host object
    if (typeof a == 'object' || typeof a == 'function') {
  
        // For functions, check stringigied values are the same
        // Almost certainly false if a and b aren't trivial
        // and are different functions
        if (aClass == '[object Function]' && a.toString() != b.toString()) return false;

        var aKeys = Object.keys(a);
        var bKeys = Object.keys(b);

        // If they don't have the same number of keys, return false
        if (aKeys.length != bKeys.length) return false;

        // Check they have the same keys
        if (!aKeys.every(function(key){return b.hasOwnProperty(key)})) return false;

        // Check key values - uses ES5 Object.keys
        return aKeys.every(function(key){
            return objectTester(a[key], b[key])
        });
    }
    return false;
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

Object.defineProperty(HTMLDivElement.prototype, 'hidder', {
    enumerable: true,
    get: function() {
        return this.style.display === `none`;
    },
    set: function(hidden) {
        if(hidden) {
            this.style.display = `none`;
        } else if(this.style.display === `none`) {
            this.style.display = this._previousDisplayValue ?? `default`;
            delete this._previousDisplayValue;
        }
    }
})