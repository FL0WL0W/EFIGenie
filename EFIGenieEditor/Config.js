class Config {
    constructor(obj, configNameSpace, parent) {
        if(obj && obj.ConfigName) {
            Object.assign(this, configNameSpace[obj.ConfigName]);
        } else {
            Object.assign(this, configNameSpace["Main"]);
        }
        if(obj)
            Object.assign(this, obj);

        this.Parent = parent;
        this.ConfigNameSpace = configNameSpace;

        for(var variableRowIndex in this.Variables) {
            var variableRow = this.Variables[variableRowIndex];
            var variableRowKey = Object.keys(variableRow)[0];
            var variableRowObj = this[variableRowKey];

            if(!variableRowObj)
                variableRowObj = variableRow[variableRowKey];

            if(variableRowObj.XResolution) {
                this[variableRowKey] = new ConfigNumberTable(variableRowObj, this);
            } else if(variableRowObj.Type) {
                if(variableRowObj.Type)
                {
                    switch(variableRowObj.Type) {
                        case "uint8":
                        case "uint16":
                        case "uint32":
                        case "uint64":
                        case "int8":
                        case "int16":
                        case "int32":
                        case "int64":
                        case "float":
                        case "variable":
                            this[variableRowKey] = new ConfigNumber(variableRowObj, this);
                            break;
                        case "formula":
                            this[variableRowKey] = new ConfigFormula(variableRowObj, this);
                            break;
                        case "bool":
                            this[variableRowKey] = new ConfigBoolean(variableRowObj, this);
                            break;
                    }
                }
            } else if (variableRowObj.ConfigName || variableRowObj.Variables) {
                if(!variableRowObj.Array) {
                    this[variableRowKey] = new Config(variableRowObj, this.ConfigNameSpace, this);
                } else {
                    this[variableRowKey] = new ConfigArray(variableRowObj, this.ConfigNameSpace, this);
                }
            } else if (variableRowObj.Selections) {
                this[variableRowKey] = new ConfigSelection(variableRowObj, this.ConfigNameSpace, this);
            }
        }
    }
    GetArrayBuffer() {
        var arrayBuffer;
        if(this.Size !== undefined)
            arrayBuffer = new ArrayBuffer(this.Size);
        else
            arrayBuffer = new ArrayBuffer();
        for(var variableRowIndex in this.Variables) {
            var variableRow = this.Variables[variableRowIndex];
            var variableRowKey = Object.keys(variableRow)[0];
            var variableRowObj = this[variableRowKey];

            if(this.Size !== undefined) {// we are in a statically mapped area
                if(this.Size === 0)
                    return arrayBuffer;
                var offset = variableRowObj.Offset;
                if(offset === undefined) {
                    throw "Config No offset specified";
                }

                var subArrayBuffer = variableRowObj.GetArrayBuffer();

                if(variableRowObj.BitOffset || variableRowObj.BitSize) {
                    var bitSize = variableRowObj.BitSize;
                    if(!bitSize) {
                        if(variableRowObj instanceof ConfigBoolean)
                            bitSize = 1;
                        else
                            bitSize = subArrayBuffer.byteLength * 8;
                    }
                    
                    var bitOffset = variableRowObj.BitOffset;
                    if(!bitOffset)
                        bitOffset = 0;

                    var bitMask = (0xFFFFFFFF >>> (64 - bitSize)) << bitOffset;

                    switch(subArrayBuffer.byteLength){
                        case 1:
                            subArrayBuffer = new Uint8Array( [ ( (new Uint8Array(subArrayBuffer)[0] << bitOffset) & bitMask ) | ( new Uint8Array(arrayBuffer.slice(offset, offset + 1))[0] & ~bitMask ) ] ).buffer;
                            break;
                        case 2:
                            subArrayBuffer = new Uint16Array( [ ( (new Uint16Array(subArrayBuffer)[0] << bitOffset) & bitMask ) | ( new Uint16Array(arrayBuffer.slice(offset, offset + 2))[0] & ~bitMask ) ] ).buffer;
                            break;
                        case 4:
                            subArrayBuffer = new Uint32Array( [ ( (new Uint32Array(subArrayBuffer)[0] << bitOffset) & bitMask ) | ( new Uint32Array(arrayBuffer.slice(offset, offset + 4))[0] & ~bitMask ) ] ).buffer;
                            break;
                        default:
                            throw "Config Object cannot be bit offset or sized"
                    }      
                }

                arrayBuffer = arrayBuffer.slice(0, offset).concatArray(subArrayBuffer).concatArray(arrayBuffer.slice(offset + subArrayBuffer.byteLength));
            } else {
                arrayBuffer = arrayBuffer.concatArray(variableRowObj.GetArrayBuffer());
            }
        }
        return arrayBuffer;
    }
    SetArrayBuffer(arrayBuffer) {
        var size = 0;

        if(this.Size) {// we are in a statically mapped area
            size = this.Size;
        }

        for(var variableRowIndex in this.Variables) {
            var variableRow = this.Variables[variableRowIndex];
            var variableRowKey = Object.keys(variableRow)[0];
            var variableRowObj = this[variableRowKey];

            if(this.Size) {// we are in a statically mapped area
                var offset = variableRowObj.Offset;
                if(offset === undefined) {
                    throw "Config No offset specified";
                }
                
                var subArrayBuffer = arrayBuffer.slice(offset);

                if(variableRowObj.BitOffset || variableRowObj.BitSize) {
                    var bitSize = variableRowObj.BitSize;
                    var byteSize = 1;
                    if(!bitSize) {
                        if(variableRowObj instanceof ConfigBoolean)
                            bitSize = 1;
                        else {
                            if(variableRowObj.Type) {
                                switch(variableRowObj.Type) {
                                    case "uint8":
                                    case "int8":
                                        bitSize = 8;
                                        break;
                                    case "uint16":
                                    case "int16":
                                        bitSize = 16;
                                        byteSize = 2;
                                        break;
                                    case "float":
                                    case "uint32":
                                    case "int32":
                                        bitSize = 32;
                                        byteSize = 4;
                                        break;
                                }
                            } else {
                                throw "Config Object cannot be bit offset or sized"
                            }
                        }
                    }
                    
                    var bitOffset = variableRowObj.BitOffset;
                    if(!bitOffset)
                        bitOffset = 0;

                        var bitMask = (0xFFFFFFFF >>> (64 - bitSize)) << bitOffset;

                    switch(byteSize){
                        case 1:
                            subArrayBuffer = new Uint8Array( [ ( new Uint8Array(subArrayBuffer.slice(0,1))[0] & bitMask ) >> bitOffset ] ).buffer;
                            break;
                        case 2:
                            subArrayBuffer = new Uint16Array( [ ( new Uint16Array(subArrayBuffer.slice(0,2))[0] & bitMask ) >> bitOffset ] ).buffer;
                            break;
                        case 4:
                            subArrayBuffer = new Uint32Array( [ ( new Uint32Array(subArrayBuffer.slice(0,4))[0] & bitMask ) >> bitOffset ] ).buffer;
                            break;
                        default:
                            throw "Config Object cannot be bit offset or sized"
                    }                
                }

                variableRowObj.SetArrayBuffer(subArrayBuffer);
            } else {
                size += variableRowObj.SetArrayBuffer(arrayBuffer.slice(size));
            }
        }

        return size;
    }
    GetConfig() {
        var returnVariables = []
        for(var variableRowIndex in this.Variables) {
            var variableRow = this.Variables[variableRowIndex];
            var variableRowKey = Object.keys(variableRow)[0];
            var variableRowObj = this[variableRowKey];

            if(!variableRowObj)
                throw "Config not initialized";
                
            var variableRowValue = variableRowObj.GetConfig();

            var returnVariableRow = {};
            returnVariableRow[variableRowKey] = variableRowValue;
            
            returnVariables.push(returnVariableRow);
        }
        this.Variables = returnVariables;
        
        return JSON.parse(JSON.stringify(this, function(key, value) {   
            if(key === "ConfigNameSpace" || key === "Parent")
                return undefined;         
            for(var variableRowIndex in this.Variables) {
                var variableRow = this.Variables[variableRowIndex];

                if(key === Object.keys(variableRow)[0]) {
                    return undefined;
                }
            }
            if(key != "" && value.GetConfig) 
                return value.GetConfig();  
            
            return value;
        }));
    }
}

class ConfigSelection {
    constructor(obj, configNameSpace, parent) {
        if(obj)
            Object.assign(this, obj);
        this.Parent = parent;

        this.ConfigNameSpace = configNameSpace;

        if(!this.Index) {
            this.Index = 0;
        }

        if(!this.Value) {
            this.Value = new Config(this.Selections[this.Index], this.ConfigNameSpace, this);
        }
    }
    GetArrayBuffer() {
        return this.Value.GetArrayBuffer();
    }
    SetArrayBuffer(arrayBuffer) {
        var thisClass = this;
        var selectedConfig =  this.Value.Variables[0][Object.keys(this.Value.Variables[0])[0]];

        if( !(selectedConfig.Type === "uint8" && new Uint8Array(arrayBuffer.slice(0, 1))[0] === selectedConfig.Value) &&
            !(selectedConfig.Type === "uint16" && new Uint16Array(arrayBuffer.slice(0, 16))[0] === selectedConfig.Value)) {
            $.each(this.Selections, function(selectionIndex, selectionValueObj) {
                var selectionValue = new Config(selectionValueObj, thisClass.ConfigNameSpace, thisClass);
                var selectionConfig =  selectionValue.Variables[0][Object.keys(selectionValue.Variables[0])[0]];

                if( (selectionConfig.Type === "uint8" && new Uint8Array(arrayBuffer.slice(0, 1))[0] === selectionConfig.Value) ||
                    (selectionConfig.Type === "uint16" && new Uint16Array(arrayBuffer.slice(0, 16))[0] === selectionConfig.Value)) {
                    thisClass.Index = selectionIndex;
                    thisClass.Value = selectionValue;
                }
            });
        }

        return this.Value.SetArrayBuffer(arrayBuffer);
    }
    GetConfig() {
        return JSON.parse(JSON.stringify(this, function(key, value) {   
            if(key === "ConfigNameSpace" || key === "Parent")    
                return undefined;     
            if(key != "" && value.GetConfig) 
                return value.GetConfig();      
            return value;
        }));
    }
}

class ConfigNumber {
    constructor(obj, parent) {
        if(obj)
            Object.assign(this, obj);
        this.Parent = parent;
        switch(this.Type) {
            case "uint8":
                if(!this.Min)
                    this.Min = 0;
                if(!this.Max)
                    this.Max = 255;
                break;
            case "uint16":
                if(!this.Min)
                    this.Min = 0;
                if(!this.Max)
                    this.Max = 65535;
                break;
            case "uint32":
                if(!this.Min)
                    this.Min = 0;
                if(!this.Max)
                    this.Max = 4294967295;
                break;
            case "uint64":
                if(!this.Min)
                    this.Min = 0;
                if(!this.Max)
                    this.Max = 18446744073709551615;
                break;
            case "int8":
                if(!this.Min)
                    this.Min = -128;
                if(!this.Max)
                    this.Max = 127;
                break;
            case "int16":
                if(!this.Min)
                    this.Min = -32768;
                if(!this.Max)
                    this.Max = 32767;
                break;
            case "int32":
                if(!this.Min)
                    this.Min = -2147483648;
                if(!this.Max)
                    this.Max = 2147483647;
                break;
            case "int64":
                if(!this.Min)
                    this.Min = -9223372036854775808;
                if(!this.Max)
                    this.Max = 9223372036854775807;
                break;
            case "float":
                if(!this.Min)
                    this.Min = -340282300000000000000000000000000000000;
                if(!this.Max)
                    this.Max = 340282300000000000000000000000000000000;
                break;
        }
        if(!this.Value)
            if(this.Min > 0)
                this.Value = this.Min / this.ValueMultiplier;
            else
                this.Value = 0;
        if(!this.ValueMultiplier)
            this.ValueMultiplier = 1;
    }
    GetArrayBuffer() {
        var val = this.Value;
        if(isNaN(parseFloat(val))){
            var ref = GetReference(this.Parent, this.Value, {});
            val = ref.Value;
        }

        switch(this.Type) {
            case "uint8":
                return new Uint8Array([val * this.ValueMultiplier]).buffer;
            case "uint16":
                return new Uint16Array([val * this.ValueMultiplier]).buffer;
            case "uint32":
                return new Uint32Array([val * this.ValueMultiplier]).buffer;
            case "int8":
                return new Int8Array([val * this.ValueMultiplier]).buffer;
            case "int16":
                return new Int16Array([val * this.ValueMultiplier]).buffer;
            case "int32":
                return new Int32Array([val * this.ValueMultiplier]).buffer;
            case "float":
                return new Float32Array([val * this.ValueMultiplier]).buffer;
            case "variable":
                return new ArrayBuffer(0);
        }
    }
    SetArrayBuffer(arrayBuffer) {
        var size = 0;
        var val;
        switch(this.Type) {
            case "uint8":
                val = new Uint8Array(arrayBuffer.slice(0,1))[0] / this.ValueMultiplier;
                size = 1;
                break;
            case "uint16":
                val = new Uint16Array(arrayBuffer.slice(0,2))[0] / this.ValueMultiplier;
                size = 2;
                break;
            case "uint32":
                val = new Uint32Array(arrayBuffer.slice(0,4))[0] / this.ValueMultiplier;
                size = 4;
                break;
            case "uint64":
                val = new Uint64Array(arrayBuffer.slice(0,8))[0] / this.ValueMultiplier;
                size = 8;
                break;
            case "int8":
                val = new Int8Array(arrayBuffer.slice(0,1))[0] / this.ValueMultiplier;
                size = 1;
                break;
            case "int16":
                val = new Int16Array(arrayBuffer.slice(0,2))[0] / this.ValueMultiplier;
                size = 2;
                break;
            case "int32":
                val = new Int32Array(arrayBuffer.slice(0,4))[0] / this.ValueMultiplier;
                size = 4;
                break;
            case "int64":
                val = new Int64Array(arrayBuffer.slice(0,8))[0] / this.ValueMultiplier;
                size = 8;
                break;
            case "float":
                val = new Float32Array(arrayBuffer.slice(0,4))[0] / this.ValueMultiplier;
                size = 4;
                break;
        }

        if(isNaN(parseFloat(this.Value))){
            var ref = GetReference(this.Parent, this.Value, {});
            ref.Value = val;
        } else
            this.Value = val;

        return size;
    }
    GetConfig() {
        return JSON.parse(JSON.stringify(this, function(key, value) {   
            if(key === "ConfigNameSpace" || key === "Parent")    
                return undefined; 
        }));
    }
}

class ConfigBoolean {
    constructor(obj, parent) {
        if(obj)
            Object.assign(this, obj);
        this.Parent = parent;
        if(!this.Value)
            this.Value = false;
    }
    GetArrayBuffer() {
        return new Uint8Array([this.Value & 0x01]).buffer;
    }
    SetArrayBuffer(arrayBuffer) {
        this.Value = new Uint8Array(arrayBuffer)[0] & 0x01;
        return 1;
    }
    GetConfig() {
        return JSON.parse(JSON.stringify(this, function(key, value) {   
            if(key === "ConfigNameSpace" || key === "Parent")    
                return undefined; 
        }));
    }
}

class ConfigNumberTable {
    constructor(obj, parent) {
        if(obj)
            Object.assign(this, obj);
        this.Parent = parent;
        if(!this.XResolution)
            this.XResolution = 1;
        if(!this.YResolution)
            this.YResolution = 1; 
        switch(this.Type) {
            case "uint8":
                if(!this.Min)
                    this.Min = 0;
                if(!this.Max)
                    this.Max = 255;
                break;
            case "uint16":
                if(!this.Min)
                    this.Min = 0;
                if(!this.Max)
                    this.Max = 65535;
                break;
            case "uint32":
                if(!this.Min)
                    this.Min = 0;
                if(!this.Max)
                    this.Max = 4294967295;
                break;
            case "uint64":
                if(!this.Min)
                    this.Min = 0;
                if(!this.Max)
                    this.Max = 18446744073709551615;
                break;
            case "int8":
                if(!this.Min)
                    this.Min = -128;
                if(!this.Max)
                    this.Max = 127;
                break;
            case "int16":
                if(!this.Min)
                    this.Min = -32768;
                if(!this.Max)
                    this.Max = 32767;
                break;
            case "int32":
                if(!this.Min)
                    this.Min = -2147483648;
                if(!this.Max)
                    this.Max = 2147483647;
                break;
            case "int64":
                if(!this.Min)
                    this.Min = -9223372036854775808;
                if(!this.Max)
                    this.Max = 9223372036854775807;
                break;
            case "float":
                if(!this.Min)
                    this.Min = -340282300000000000000000000000000000000;
                if(!this.Max)
                    this.Max = 340282300000000000000000000000000000000;
                break;
        }
        if(!this.Value) {
            var val = 0
            if(this.Min > 0)
                val = this.Min / this.ValueMultiplier;
            this.Value = new Array(this.GetTableArrayLength());
            var thisClass = this;
            $.each(this.Value, function(index, value) {
                thisClass.Value[index] = val;
            });
        }
        if(!this.ValueMultiplier)
            this.ValueMultiplier = 1;
    }
    GetTableArrayLength() {
        return GetReferenceByNumberOrReference(this.Parent, this.XResolution, 1).Value * GetReferenceByNumberOrReference(this.Parent, this.YResolution, 1).Value;
    }
    GetArrayBuffer() {
        var value = Array.from(this.Value);

        for(var i = 0; i < value.length; i++) {
            value[i] *= this.ValueMultiplier
        }

        switch(this.Type) {
            case "bool":
            case "uint8":
                return Uint8Array.from(value).buffer;
            case "uint16":
                return Uint16Array.from(value).buffer;
            case "uint32":
                return Uint32Array.from(value).buffer;
            case "uint64":
                return Uint64Array.from(value).buffer;
            case "int8":
                return Int8Array.from(value).buffer;
            case "int16":
                return Int16Array.from(value).buffer;
            case "int32":
                return Int32Array.from(value).buffer;
            case "int64":
                return Int64Array.from(value).buffer;
            case "float":
                return Float32Array.from(value).buffer;
        }

        throw "ConfigNumberTable Type Invalid";
    }
    SetArrayBuffer(arrayBuffer) {
        var arrayLen = this.GetTableArrayLength();

        switch(this.Type) {
            case "bool":
            case "uint8":
                this.Value = Array.from(new Uint8Array(arrayBuffer.slice(0, arrayLen)));
                break;
            case "uint16":
                this.Value = Array.from(new Uint16Array(arrayBuffer.slice(0, 2 * arrayLen)));
                arrayLen = 2 * arrayLen;
                break;
            case "uint32":
                this.Value = Array.from(new Uint32Array(arrayBuffer.slice(0, 4 * arrayLen)));
                arrayLen = 4 * arrayLen;
                break;
            case "uint64":
                this.Value = Array.from(new Uint64Array(arrayBuffer.slice(0, 4 * arrayLen)));
                arrayLen = 8 * arrayLen;
                break;
            case "int8":
                this.Value = Array.from(new Int8Array(arrayBuffer.slice(0, arrayLen)));
                arrayLen = arrayLen;
                break;
            case "int16":
                this.Value = Array.from(new Int16Array(arrayBuffer.slice(0, 2 * arrayLen)));
                arrayLen = 2 * arrayLen;
                break;
            case "int32":
                this.Value = Array.from(new Int32Array(arrayBuffer.slice(0, 4 * arrayLen)));
                arrayLen = 4 * arrayLen;
                break;
            case "int64":
                this.Value = Array.from(new Int64Array(arrayBuffer.slice(0, 4 * arrayLen)));
                arrayLen = 8 * arrayLen;
                break;
            case "float":
                this.Value = Array.from(new Float32Array(arrayBuffer.slice(0, 4 * arrayLen)));
                arrayLen = 4 * arrayLen;
                break;
            default: 
        throw "ConfigNumberTable Type Invalid";
        }

        for(var i = 0; i < this.Value.length; i++) {
            this.Value[i] /= this.ValueMultiplier
        }

        return arrayLen;
    }
    GetConfig() {
        return JSON.parse(JSON.stringify(this, function(key, value) {   
            if(key === "Parent")    
                return undefined; 
        }));
    }
}

class ConfigFormula {
    constructor(obj, parent) {
        if(obj)
            Object.assign(this, obj);
        this.Parent = parent;
        if(!this.Degree)
            this.Degree = 1;
        if(!this.Min)
            this.Min = -340282300000000000000000000000000000000;
        if(!this.Max)
            this.Max = 340282300000000000000000000000000000000;
        if(!this.Value) {
            var val = 0
            if(this.Min > 0)
                val = this.Min;
            this.Value = new Array(this.GetTableArrayLength());
            var thisClass = this;
            $.each(this.Value, function(index, value) {
                thisClass.Value[index] = val;
            });
        }
    }
    GetTableArrayLength() {
        return GetReferenceByNumberOrReference(this.Parent, this.Degree, 0).Value + 1;
    }
    GetArrayBuffer() {
        var value = Array.from(this.Value);

        for(var i = 0; i < value.length; i++) {
            value[i] *= this.ValueMultiplier
        }

        return Float32Array.from(value);
    }
    SetArrayBuffer(arrayBuffer) {
        var arrayLen = this.GetTableArrayLength();
        this.Value = Array.from(new Float32Array(arrayBuffer.slice(0, 4 * arrayLen)));
        
        for(var i = 0; i < this.Value.length; i++) {
            this.Value[i] /= this.ValueMultiplier
        }
        
        return 4 * arrayLen;
    }
    GetConfig() {
        return JSON.parse(JSON.stringify(this, function(key, value) {   
            if(key === "Parent")    
                return undefined; 
        }));
    }
}

class ConfigArray {
    constructor(obj, configNameSpace, parent) {
        if(obj)
            Object.assign(this, obj);
        this.Parent = parent;
        
        this.ConfigNameSpace = configNameSpace;

        var tableArrayLength = this.GetTableArrayLength()

        if(!this.Value || this.Value.length < tableArrayLength) {
            var prevValue = this.Value;
            var prevValueLength = 0;
            if(prevValue)
                prevValueLength = prevValue.length;
            this.Value = new Array(Math.max(prevValueLength, tableArrayLength));
    
            for(var i = 0; i < Math.max(prevValueLength, tableArrayLength); i++) {
                var subConfig = {};
                Object.assign(subConfig, this);
                delete subConfig.Array;
                delete subConfig.Value;
                delete subConfig.Labels;
                if(this.Labels && i < this.Labels.length) {
                    subConfig.Label = this.Labels[i];
                } else {
                    subConfig.Label = this.Label + "[" + i + "]";
                }

                if(i < prevValueLength)
                    this.Value[i] = prevValue[i];
                else
                    this.Value[i] = new Config(subConfig, this.ConfigNameSpace, this.Parent);
            }
        }
    }
    GetTableArrayLength() {
        return GetReferenceByNumberOrReference(this.Parent, this.Array, 0).Value;
    }
    GetArrayBuffer() {
        var arrayBuffer = new ArrayBuffer();
        for(var config in this.Value) {
            arrayBuffer = arrayBuffer.concatArray(this.Value[config].GetArrayBuffer());
        }
        return arrayBuffer;
    }
    SetArrayBuffer(arrayBuffer) {
        var size = 0;

        var tableArrayLength = this.GetTableArrayLength()

        var prevValue = this.Value;
        var prevValueLength = 0;
        if(prevValue)
            prevValueLength = prevValue.length;
        this.Value = new Array(Math.max(prevValueLength, tableArrayLength));

        for(var i = 0; i < Math.max(prevValueLength, tableArrayLength); i++) {
            if(i < tableArrayLength) {
                var subConfig = {};
                Object.assign(subConfig, this);
                delete subConfig.Array;
                delete subConfig.Value;
                delete subConfig.Labels;
                if(this.Labels && i < this.Labels.length) {
                    subConfig.Label = this.Labels[i];
                } else {
                    subConfig.Label = this.Label + "[" + i + "]";
                }

                this.Value[i] = new Config(subConfig, this.ConfigNameSpace, this.Parent);
                size += this.Value[i].SetArrayBuffer(arrayBuffer.slice(size));
            } else {
                this.Value[i] = prevValue[i];
            }
        }

        return size;
    }
    GetConfig() {
        return JSON.parse(JSON.stringify(this, function(key, value) {   
            if(key === "ConfigNameSpace" || key === "Parent")    
                return undefined; 
        }));
    }
}

function GetReferenceByNumberOrReference(referenceObj, numberOrReference, defaultValue) {
    var value = parseInt(numberOrReference);
    if(isNaN(value)) {
        return GetReference(referenceObj, numberOrReference, { Value: defaultValue });
    }

    return { Value: value};
}

function GetReference(referenceObj, reference, defaultReference) {
    if(!reference) 
        return defaultReference;

    if(reference.indexOf("/") === 0) {//go to top config
        var topObj = referenceObj;
        while(topObj.Parent !== undefined)
            topObj = topObj.Parent;

        if(reference.substring(1).indexOf("/") === 0) { //search all subconfigs for value
            var containingObj;
            var topReference = reference.substring(2);
            if(topReference.indexOf("/") > 0)
                topReference = topReference.substring(0, topReference.indexOf("/"));

            function objGetReferenceFromAll(obj) {
                for(subObj in obj){
                    if(subObj === "ConfigNameSpace" || subObj === "Parent" || subObj === "Variables")
                        continue;
                    if(subObj === topReference) {
                        containingObj = obj;
                        return;
                    }

                    if(typeof obj[subObj] === "object") {
                        objGetReferenceFromAll(obj[subObj]);
                        if(containingObj !== undefined)
                            return;
                    }
                }
            }

            objGetReferenceFromAll(topObj);

            return GetReference(containingObj, reference.substring(2), defaultReference);

        } else {
            return GetReference(topObj, reference.substring(1), defaultReference)
        }
    } else if(reference.indexOf(".") === 0) { //go up 1            
        if(reference.indexOf("/") === 1) { //go up until value exists
            var ref = GetReference(referenceObj, reference.substring(2), undefined);
            if(ref !== undefined)
                return ref;
            if(referenceObj.Parent === undefined)
                return defaultReference;
            return GetReference(referenceObj.Parent, reference, defaultReference);
        } else {
            if(referenceObj.Parent === undefined)
                return defaultReference;
            return GetReference(referenceObj.Parent, reference.substring(1), defaultReference);
        }
    } else if(reference.indexOf("/") > 0) {
        var ref = referenceObj[reference.substring(0,reference.indexOf("/"))];
        if(ref === undefined)
            return defaultReference;
        return GetReference(ref, reference.substring(reference.indexOf("/") + 1), defaultReference);
    } else {
        var ref = referenceObj[reference];
        if(ref === undefined)
            return defaultReference;
        return ref;
    }
}

function GetReferenceIfString(referenceObj, reference, defaultReference) {
    if(typeof reference === "string")
        return GetReference(referenceObj, reference, defaultReference);
    return reference;
}

function GetReferenceCount(referenceObj, reference) {
    var refernceCount = 0;
    for(key in referenceObj) {
        if(!referenceObj[key])
            continue;

        if(referenceObj[key].XResolution && referenceObj[key].XResolution === reference) {
            refernceCount++;
            continue;
        }

        if(referenceObj[key].XAxis && referenceObj[key].XAxis === reference) {
            refernceCount++;
            continue;
        }

        if(referenceObj[key].XMin && referenceObj[key].XMin === reference) {
            refernceCount++;
            continue;
        }

        if(referenceObj[key].XMax && referenceObj[key].XMax === reference) {
            refernceCount++;
            continue;
        }

        if(referenceObj[key].YResolution && referenceObj[key].YResolution === reference) {
            refernceCount++;
            continue;
        }

        if(referenceObj[key].YAxis && referenceObj[key].YAxis === reference) {
            refernceCount++;
            continue;
        }

        if(referenceObj[key].YMin && referenceObj[key].YMin === reference) {
            refernceCount++;
            continue;
        }

        if(referenceObj[key].YMax && referenceObj[key].YMax === reference) {
            refernceCount++;
            continue;
        }
    }

    return refernceCount;
}