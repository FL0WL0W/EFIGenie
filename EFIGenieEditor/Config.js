class Config {
    constructor(ini, iniNamespace, parent) {
        this.Parent = parent;
        this.SetIni(ini, iniNamespace);
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
    GetIni() {
        var returnVariables = []
        for(var variableRowIndex in this.Variables) {
            var variableRow = this.Variables[variableRowIndex];
            var variableRowKey = Object.keys(variableRow)[0];
            var variableRowObj = this[variableRowKey];

            if(!variableRowObj)
                throw "Config not initialized";
                
            var variableRowValue = variableRowObj.GetIni();

            var returnVariableRow = {};
            returnVariableRow[variableRowKey] = variableRowValue;
            
            returnVariables.push(returnVariableRow);
        }
        this.Variables = returnVariables;
        
        return JSON.parse(JSON.stringify(this, function(key, value) {   
            if(key === "IniNamespace" || key === "Parent")
                return undefined;         
            for(var variableRowIndex in this.Variables) {
                var variableRow = this.Variables[variableRowIndex];

                if(key === Object.keys(variableRow)[0]) {
                    return undefined;
                }
            }
            if(key != "" && value.GetIni) 
                return value.GetIni();  
            
            return value;
        }));
    }
    SetIni(ini, iniNamespace) {
        if(iniNamespace !== undefined)
            this.IniNamespace = iniNamespace;
        else if (this.IniNamespace === undefined)
            throw "No IniNamespace defined for ConfigSelection";
            
        this.Ini = {};
        if(ini && ini.ConfigName) {
            Object.assign(this.Ini, this.IniNamespace[ini.ConfigName]);
        } else {
            Object.assign(this.Ini, this.IniNamespace["Main"]);
        }
        if(ini)
            Object.assign(this.Ini, ini);
            
        for(var variableRowIndex in this.Ini.Variables) {
            var variableRow = this.Ini.Variables[variableRowIndex];
            var variableRowKey = Object.keys(variableRow)[0];
            var variableRowObj = this[variableRowKey];

            if(!variableRowObj) {
                if(variableRow[variableRowKey].XResolution) {
                    this[variableRowKey] = new ConfigNumberTable(variableRow[variableRowKey], this);
                } else if(variableRow[variableRowKey].Type) {
                    if(variableRow[variableRowKey].Type)
                    {
                        switch(variableRow[variableRowKey].Type) {
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
                                this[variableRowKey] = new ConfigNumber(variableRow[variableRowKey], this);
                                break;
                            case "formula":
                                this[variableRowKey] = new ConfigFormula(variableRow[variableRowKey], this);
                                break;
                            case "bool":
                                this[variableRowKey] = new ConfigBoolean(variableRow[variableRowKey], this);
                                break;
                        }
                    }
                } else if (variableRow[variableRowKey].ConfigName || variableRow[variableRowKey].Variables) {
                    if(!variableRow[variableRowKey].Array) {
                        this[variableRowKey] = new Config(variableRow[variableRowKey], this.IniNamespace, this);
                    } else {
                        this[variableRowKey] = new ConfigArray(variableRow[variableRowKey], this.IniNamespace, this);
                    }
                } else if (variableRow[variableRowKey].Selections) {
                    this[variableRowKey] = new ConfigSelection(variableRow[variableRowKey], this.IniNamespace, this);
                }
            } else {
                variableRowObj.SetIni(variableRow[variableRowKey]);
            }
        }
    }
}

class ConfigSelection {
    constructor(ini, iniNamespace, parent) {
        this.Parent = parent;
        this.SetIni(ini, iniNamespace);
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
                var selectionValue = new Config(selectionValueObj, thisClass.IniNamespace, thisClass);
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
    SetIni(ini, iniNamespace) {
        if(iniNamespace !== undefined)
            this.IniNamespace = iniNamespace;
        else if (this.IniNamespace === undefined)
            throw "No IniNamespace defined for ConfigSelection";

        this.Ini = ini
        if(this.Index === undefined && this.Ini.Index !== undefined) {
            this.Index = this.Ini.Index;
        }
        if(this.Index === undefined) {
            this.Index = 0;
        }
        if(this.Value === undefined && this.Ini.Value !== undefined) {
            this.Value = this.Ini.Value;
        }
        if(this.Value !== undefined) {
            $.each(this.Ini.Selections, function(index, value) {
                if(this.Value.ConfigName, value.ConfigName) {
                    if(this.Value.Instance !== undefined) {
                        if(this.Value.Instance == value.Instance) {
                            this.Index = index;
                        }
                    } else {
                        this.Index = index;
                    }
                }
            });
        }
        if(this.Value === undefined) {
            this.Value = new Config(this.Ini.Selections[this.Index], this.IniNamespace, this);
        }
    }
}

class ConfigNumber {
    constructor(ini, parent) {
        this.Parent = parent;
        this.SetIni(ini);
    }
    GetArrayBuffer() {
        var val = this.Value;
        if(isNaN(parseFloat(val))){
            var ref = GetReference(this.Parent, this.Value, {});
            val = ref.Value;
        }

        valMult = GetIniValueMultiplier(this.Ini);

        switch(this.Ini.Type) {
            case "uint8":
                return new Uint8Array([val * valMult]).buffer;
            case "uint16":
                return new Uint16Array([val * valMult]).buffer;
            case "uint32":
                return new Uint32Array([val * valMult]).buffer;
            case "int8":
                return new Int8Array([val * valMult]).buffer;
            case "int16":
                return new Int16Array([val * valMult]).buffer;
            case "int32":
                return new Int32Array([val * valMult]).buffer;
            case "float":
                return new Float32Array([val * valMult]).buffer;
            case "variable":
                return new ArrayBuffer(0);
        }
    }
    SetArrayBuffer(arrayBuffer) {
        var size = 0;
        var val;
        valMult = GetIniValueMultiplier(this.Ini);
        switch(this.Ini.Type) {
            case "uint8":
                val = new Uint8Array(arrayBuffer.slice(0,1))[0] / valMult;
                size = 1;
                break;
            case "uint16":
                val = new Uint16Array(arrayBuffer.slice(0,2))[0] / valMult;
                size = 2;
                break;
            case "uint32":
                val = new Uint32Array(arrayBuffer.slice(0,4))[0] / valMult;
                size = 4;
                break;
            case "uint64":
                val = new Uint64Array(arrayBuffer.slice(0,8))[0] / valMult;
                size = 8;
                break;
            case "int8":
                val = new Int8Array(arrayBuffer.slice(0,1))[0] / valMult;
                size = 1;
                break;
            case "int16":
                val = new Int16Array(arrayBuffer.slice(0,2))[0] / valMult;
                size = 2;
                break;
            case "int32":
                val = new Int32Array(arrayBuffer.slice(0,4))[0] / valMult;
                size = 4;
                break;
            case "int64":
                val = new Int64Array(arrayBuffer.slice(0,8))[0] / valMult;
                size = 8;
                break;
            case "float":
                val = new Float32Array(arrayBuffer.slice(0,4))[0] / valMult;
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
    SetIni(ini) {
        this.Ini = ini
        if(this.Value === undefined && this.Ini.Value !== undefined) {
            this.Value = this.Ini.Value;
        }
        if(this.Value === undefined) {
            this.Value = GetIniMin(this.Ini);
            if(this.Value < 0)
                this.Value = 0;
            if(this.Value > GetIniMax(this.Ini))
                this.Value = GetIniMax(this.Ini);
        }
    }
}

class ConfigBoolean {
    constructor(ini, parent) {
        this.Parent = parent;
        this.SetIni(ini);
    }
    GetArrayBuffer() {
        return new Uint8Array([this.Value & 0x01]).buffer;
    }
    SetArrayBuffer(arrayBuffer) {
        this.Value = new Uint8Array(arrayBuffer)[0] & 0x01;
        return 1;
    }
    SetIni(ini) {
        this.Ini = ini
        if(this.Value === undefined && this.Ini.Value !== undefined) {
            this.Value = this.Ini.Value;
        }
        if(this.Value === undefined) {
            this.Value = false;
        }
    }
}

class ConfigNumberTable {
    constructor(ini, parent) {
        this.Parent = parent;
        this.SetIni(ini);
    }
    GetTableArrayLength() {
        return GetReferenceByNumberOrReference(this.Parent, GetIniXResolution(this.Ini), 1).Value * GetReferenceByNumberOrReference(this.Parent, GetIniYResolution(this.Ini), 1).Value;
    }
    GetArrayBuffer() {
        var value = Array.from(this.Value);

        valMult = GetIniValueMultiplier(this.Ini);
        for(var i = 0; i < value.length; i++) {
            value[i] *= valMult;
        }

        switch(this.Ini.Type) {
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

        switch(this.Ini.Type) {
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

        valMult = GetIniValueMultiplier(this.Ini);

        for(var i = 0; i < this.Value.length; i++) {
            this.Value[i] /= valMultl;
        }

        return arrayLen;
    }
    SetIni(ini) {
        this.Ini = ini
        if(this.Value === undefined && this.Ini.Value !== undefined) {
            this.Value = this.Ini.Value;
        }
        if(this.Value === undefined) {
            var val = GetIniMin(this.Ini);
            if(val < 0)
                val = 0;
            if(val > GetIniMax(this.Ini))
                val = GetIniMax(this.Ini);

            this.Value = new Array(this.GetTableArrayLength());
            var thisClass = this;
            $.each(this.Value, function(index, value) {
                thisClass.Value[index] = val;
            });
        }
    }
}

class ConfigFormula {
    constructor(ini, parent) {
        this.Parent = parent;
        this.SetIni(ini);
    }
    GetTableArrayLength() {
        return GetReferenceByNumberOrReference(this.Parent, GetIniDegree(this.Ini), 0).Value + 1;
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
    SetIni(ini) {
        this.Ini = ini;
        if(this.Value === undefined) {
            var val = GetIniMin(this.Ini);
            if(val < 0)
                val = 0;
            if(val > GetIniMax(this.Ini))
                val = GetIniMax(this.Ini);

            this.Value = new Array(this.GetTableArrayLength());
            var thisClass = this;
            $.each(this.Value, function(index, value) {
                thisClass.Value[index] = val;
            });
        }
    }
}

class ConfigArray {
    constructor(obj, iniNamespace, parent) {
        if(obj)
            Object.assign(this, obj);
        this.Parent = parent;
        
        this.IniNamespace = iniNamespace;

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
                    this.Value[i] = new Config(subConfig, this.IniNamespace, this.Parent);
            }
        }
    }
    GetTableArrayLength() {
        return GetReferenceByNumberOrReference(this.Parent, this.Array, 0).Value;
    }
    GetArrayBuffer() {
        var arrayBuffer = new ArrayBuffer();
        for(var ini in this.Value) {
            arrayBuffer = arrayBuffer.concatArray(this.Value[ini].GetArrayBuffer());
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

                this.Value[i] = new Config(subConfig, this.IniNamespace, this.Parent);
                size += this.Value[i].SetArrayBuffer(arrayBuffer.slice(size));
            } else {
                this.Value[i] = prevValue[i];
            }
        }

        return size;
    }
}

function GetReferenceByNumberOrReference(referenceObj, numberOrReference, defaultValue) {
    var value = parseFloat(numberOrReference);
    if(isNaN(value)) {
        var ref = GetReference(referenceObj, numberOrReference, { Value: defaultValue });
        if(isNaN(parseFloat(ref.Value)) && numberOrReference != undefined) {
            return GetReferenceByNumberOrReference(referenceObj, ref.Value, defaultValue);
        }
        return ref;
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
                    if(subObj === "IniNamespace" || subObj === "Parent" || subObj === "Variables")
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
        if(!isNaN(ref))
            return { Value: ref };
        return ref;
    }
}

function GetReferenceIfString(referenceObj, reference, defaultReference) {
    if(typeof reference === "string")
        return GetReference(referenceObj, reference, defaultReference);
    return reference;
}

function GetReferenceCount(referenceObj, reference) {
    if(reference.indexOf("/") > -1 || reference.indexOf(".") > -1)
        return 0;

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

function GetIniValueMultiplier(ini) {
    if(ini.ValueMultiplier)
        return ini.ValueMultiplier;
    return 1;
}
function GetIniMin(ini) {
    if(ini.Min !== undefined)
        return ini.Min;
    switch(ini.Type) {
        case "uint8":
        case "uint16":
        case "uint32":
        case "uint64":
            return 0;
        case "int8":
            return -128 / GetIniValueMultiplier(ini);
        case "int16":
            return -32768 / GetIniValueMultiplier(ini);
        case "int32":
            return -2147483648 / GetIniValueMultiplier(ini);
        case "int64":
            return -9223372036854775808 / GetIniValueMultiplier(ini);
        case "float":
        case "formula":
        case "variable":
            return -340282300000000000000000000000000000000 / GetIniValueMultiplier(ini);
        default:
            throw "Invalid Type " + ini.Type;
    }
}
function GetIniMax(ini) {
    if(ini.Max !== undefined)
        return ini.Max;
    switch(ini.Type) {
        case "uint8":
            return 255 / GetIniValueMultiplier(ini);
        case "uint16":
            return 65535 / GetIniValueMultiplier(ini);
        case "uint32":
            return 4294967295 / GetIniValueMultiplier(ini);
        case "uint64":
            return 18446744073709551615 / GetIniValueMultiplier(ini);
        case "int8":
            return 127 / GetIniValueMultiplier(ini);
        case "int16":
            return 32767 / GetIniValueMultiplier(ini);
        case "int32":
            return 2147483647 / GetIniValueMultiplier(ini);
        case "int64":
            return 9223372036854775807 / GetIniValueMultiplier(ini);
        case "variable":
        case "formula":
        case "float":
            return 340282300000000000000000000000000000000 / GetIniValueMultiplier(ini);
        default:
            throw "Invalid Type " + ini.Type;
    }
}
function GetIniXResolution(ini) {
    if(ini.XResolution !== undefined)
        return ini.XResolution;
    return 1;
}
function GetIniYResolution(ini) {
    if(ini.YResolution !== undefined)
        return ini.YResolution;
    return 1;
}
function GetIniDegree(ini) {
    if(ini.Degree !== undefined)
        return ini.Degree;
    return 1;
}