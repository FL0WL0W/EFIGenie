class Config {
    constructor(obj, configNameSpace, configName, parent) {
        if(obj)
            Object.assign(this, obj);
        this.Parent = parent;

        this.ConfigNameSpace = configNameSpace;

        if(!this.ConfigName) {
            this.ConfigName = configName;
        }

        if(!this.ConfigName) {
            this.ConfigName = "Main";
        }

        if(!this.Config) {
            this.Config = this.ConfigNameSpace[this.ConfigName];
        }

        for(var configRowIndex in this.Config) {
            var configRow = this.Config[configRowIndex];
            var configRowKey = Object.keys(configRow)[0];
            var configRowObj = this[configRowKey];

            if(!configRowObj)
                configRowObj = configRow[configRowKey];

            if(configRowObj.XResolution) {
                this[configRowKey] = new ConfigNumberTable(configRowObj, this);
            } else if(configRowObj.Type) {
                if(configRowObj.Type)
                {
                    switch(configRowObj.Type) {
                        case "uint8":
                        case "uint16":
                        case "uint32":
                        case "uint64":
                        case "int8":
                        case "int16":
                        case "int32":
                        case "int64":
                        case "float":
                            this[configRowKey] = new ConfigNumber(configRowObj, this);
                            break;
                        case "formula":
                            this[configRowKey] = new ConfigFormula(configRowObj, this);
                            break;
                        case "bool":
                            this[configRowKey] = new ConfigBoolean(configRowObj, this);
                            break;
                    }
                }
            } else if (configRowObj.ConfigName) {
                this[configRowKey] = new Config(configRowObj, this.ConfigNameSpace, this);
            } else if (configRowObj.Selections) {
                this[configRowKey] = new ConfigSelection(configRowObj, this.ConfigNameSpace, this);
            }
        }
    }
    GetArrayBuffer() {
        var arrayBuffer = new ArrayBuffer();
        for(var configRowIndex in this.Config) {
            var configRow = this.Config[configRowIndex];
            var configRowKey = Object.keys(configRow)[0];
            var configRowObj = this[configRowKey];

            arrayBuffer = arrayBuffer.concatArray(configRowObj.GetArrayBuffer());
        }
        return arrayBuffer;
    }
    SetArrayBuffer(arrayBuffer) {
        var size = 0;

        for(var configRowIndex in this.Config) {
            var configRow = this.Config[configRowIndex];
            var configRowKey = Object.keys(configRow)[0];
            var configRowObj = this[configRowKey];

            arrayBuffer = arrayBuffer.slice(configRowObj.SetArrayBuffer(arrayBuffer));
        }

        return size;
    }
    GetConfig() {
        var returnConfig = []
        for(var configRowIndex in this.Config) {
            var configRow = this.Config[configRowIndex];
            var configRowKey = Object.keys(configRow)[0];
            var configRowObj = this[configRowKey];

            if(!configRowObj)
                throw "Config not initialized";
                
            var configRowValue = configRowObj.GetConfig();

            var returnConfigRow = {};
            returnConfigRow[configRowKey] = configRowValue;
            
            returnConfig.push(returnConfigRow);
        }
        this.Config = returnConfig;
        
        return JSON.parse(JSON.stringify(this, function(key, value) {   
            if(key === "ConfigNameSpace" || key === "Parent")
                return undefined;         
            for(var configRowIndex in this.Config) {
                var configRow = this.Config[configRowIndex];

                if(key === Object.keys(configRow)[0]) {
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
            this.Value = new Config(this.Selections[this.Index], this.ConfigNameSpace);
        }
    }
    GetArrayBuffer() {
        return this.Value.GetArrayBuffer();
    }
    SetArrayBuffer(arrayBuffer) {
        var thisClass = this;
        if( !(this.Value.Config[0].Type === "uint8" && new Uint8Array(arrayBuffer.slice(0, 1))[0] === this.Value.Config[0].Value) &&
            !(this.Value.Config[0].Type === "uint16" && new Uint16Array(arrayBuffer.slice(0, 16))[0] === this.Value.Config[0].Value)) {

            $.each(this.Selections, function(selectionIndex, selectionValueObj) {
                selectionValue = new Config(selectionValueObj, thisClass.ConfigNameSpace);

                if( (selectionValue.Config[0].Type === "uint8" && new Uint8Array(arrayBuffer.slice(0, 1))[0] === selectionValue.Config[0].Value) ||
                    (selectionValue.Config[0].Type === "uint16" && new Uint16Array(arrayBuffer.slice(0, 16))[0] === selectionValue.Config[0].Value)) {
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
                this.Value = this.Min;
            else
                this.Value = 0;
    }
    GetArrayBuffer() {
        switch(this.Type) {
            case "uint8":
                return new Uint8Array([this.Value]).buffer;
            case "uint16":
                return new Uint16Array([this.Value]).buffer;
            case "uint32":
                return new Uint32Array([this.Value]).buffer;
            case "int8":
                return new Int8Array([this.Value]).buffer;
            case "int16":
                return new Int16Array([this.Value]).buffer;
            case "int32":
                return new Int32Array([this.Value]).buffer;
            case "float":
                return new Float32Array([this.Value]).buffer;
        }
    }
    SetArrayBuffer(arrayBuffer) {
        switch(this.Type) {
            case "uint8":
                this.Value = new Uint8Array(arrayBuffer.slice(0,1))[0];
                return 1;
            case "uint16":
                this.Value = new Uint16Array(arrayBuffer.slice(0,2))[0];
                return 2;
            case "uint32":
                this.Value = new Uint32Array(arrayBuffer.slice(0,4))[0];
                return 4;
            case "uint64":
                this.Value = new Uint64Array(arrayBuffer.slice(0,8))[0];
                return 8;
            case "int8":
                this.Value = new Int8Array(arrayBuffer.slice(0,1))[0];
                return 1;
            case "int16":
                this.Value = new Int16Array(arrayBuffer.slice(0,2))[0];
                return 2;
            case "int32":
                this.Value = new Int32Array(arrayBuffer.slice(0,4))[0];
                return 4;
            case "int64":
                this.Value = new Int64Array(arrayBuffer.slice(0,8))[0];
                return 8;
            case "float":
                this.Value = new Float32Array(arrayBuffer.slice(0,4))[0];
                return 4;
        }
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
        return new Uint8Array([this.Value]).buffer;
    }
    SetArrayBuffer(arrayBuffer) {
        this.Value = (new Uint8Array(arrayBuffer.slice(0,1))[0] === 1);
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
                val = this.Min;
            this.Value = new Array(this.GetTableArrayLength());
            var thisClass = this;
            $.each(this.Value, function(index, value) {
                thisClass.Value[index] = val;
            });
        }
    }
    GetTableArrayLength() {
        return GetReferenceByNumberOrReference(this.Parent, this.XResolution, 1).Value * GetReferenceByNumberOrReference(this.Parent, this.YResolution, 1).Value;
    }
    GetArrayBuffer() {
        switch(this.Type) {
            case "bool":
            case "uint8":
                return Uint8Array.from(this.Value);
            case "uint16":
                return Uint16Array.from(this.Value);
            case "uint32":
                return Uint32Array.from(this.Value);
            case "uint64":
                return Uint64Array.from(this.Value);
            case "int8":
                return Int8Array.from(this.Value);
            case "int16":
                return Int16Array.from(this.Value);
            case "int32":
                return Int32Array.from(this.Value);
            case "int64":
                return Int64Array.from(this.Value);
            case "float":
                return Float32Array.from(this.Value);
        }

        throw "ConfigNumberTable Type Invalid";
    }
    SetArrayBuffer(arrayBuffer) {
        var arrayLen = this.GetTableArrayLength();

        switch(this.Type) {
            case "bool":
            case "uint8":
                this.Value = Array.from(new Uint8Array(arrayBuffer.slice(0, arrayLen)));
                return arrayLen;
            case "uint16":
                this.Value = Array.from(new Uint16Array(arrayBuffer.slice(0, 2 * arrayLen)));
                return 2 * arrayLen;
            case "uint32":
                this.Value = Array.from(new Uint32Array(arrayBuffer.slice(0, 4 * arrayLen)));
                return 4 * arrayLen;
            case "uint64":
                this.Value = Array.from(new Uint64Array(arrayBuffer.slice(0, 4 * arrayLen)));
                return 8 * arrayLen;
            case "int8":
                this.Value = Array.from(new Int8Array(arrayBuffer.slice(0, arrayLen)));
                return arrayLen;
            case "int16":
                this.Value = Array.from(new Int16Array(arrayBuffer.slice(0, 2 * arrayLen)));
                return 2 * arrayLen;
            case "int32":
                this.Value = Array.from(new Int32Array(arrayBuffer.slice(0, 4 * arrayLen)));
                return 4 * arrayLen;
            case "int64":
                this.Value = Array.from(new Int64Array(arrayBuffer.slice(0, 4 * arrayLen)));
                return 8 * arrayLen;
            case "float":
                this.Value = Array.from(new Float32Array(arrayBuffer.slice(0, 4 * arrayLen)));
                return 4 * arrayLen;
        }

        throw "ConfigNumberTable Type Invalid";
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
        return Float32Array.from(this.Value);
    }
    SetArrayBuffer(arrayBuffer) {
        var arrayLen = this.GetTableArrayLength();
        this.Value = Array.from(new Float32Array(arrayBuffer.slice(0, 4 * arrayLen)));
        return 4 * arrayLen;
    }
    GetConfig() {
        return JSON.parse(JSON.stringify(this, function(key, value) {   
            if(key === "Parent")    
                return undefined; 
        }));
    }
}

function GetReferenceByNumberOrReference(referenceObj, numberOrReference, defaultValue) {
    var value = parseInt(numberOrReference);
    if(isNaN(value)) {
        var ref = referenceObj[numberOrReference];
        if(!ref)
            return { Value: defaultValue };
        return ref;
    }

    return { Value: value};
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