class Config {
    constructor(obj, configNameSpace, configName) {
        if(obj)
            Object.assign(this, obj);

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

            if(configRowObj.Type) {
                if(configRowObj.Type.split("[").length == 1)
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
                            this[configRowKey] = new ConfigNumber(configRowObj);
                            break;
                        case "bool":
                            this[configRowKey] = new ConfigBoolean(configRowObj);
                            break;
                    }
                }
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
            for(var configRowIndex in this.Config) {
                var configRow = this.Config[configRowIndex];
                if(key === "ConfigNameSpace")
                    return undefined;

                if(key === Object.keys(configRow)[0]) {
                    return undefined;
                }
            }
            
            return value;
        }));
    }
}

class ConfigNumber {
    constructor(obj) {
        if(obj)
            Object.assign(this, obj);
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
                    this.Min = -3.402823e+38;
                if(!this.Max)
                    this.Max = 3.402823e+38;
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
        return JSON.parse(JSON.stringify(this));
    }
}

class ConfigBoolean {
    constructor(obj) {
        if(obj)
            Object.assign(this, obj);
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
        return JSON.parse(JSON.stringify(this));
    }
}

function setArrayBuffer(obj, ini, arrayBuffer) {
    var prevLength = arrayBuffer.byteLength;
    var setIniRow = function(iniIndex, iniRow){        
        if(typeof iniRow.Type === "string")
        {
            switch(iniRow.Type) {
                case "bool":
                case "uint8":
                    iniSetValue(obj, iniRow, iniIndex, new Uint8Array(arrayBuffer.slice(0, 1))[0]);
                    arrayBuffer = arrayBuffer.slice(1);
                    break;
                case "uint16":
                    iniSetValue(obj, iniRow, iniIndex, new Uint16Array(arrayBuffer.slice(0, 2))[0]);
                    arrayBuffer = arrayBuffer.slice(2);
                    break;
                case "uint32":
                    iniSetValue(obj, iniRow, iniIndex, new Uint32Array(arrayBuffer.slice(0, 4))[0]);
                    arrayBuffer = arrayBuffer.slice(4);
                    break;
                case "int8":
                    iniSetValue(obj, iniRow, iniIndex, new Int8Array(arrayBuffer.slice(0, 1))[0]);
                    arrayBuffer = arrayBuffer.slice(1);
                    break;
                case "int16":
                    iniSetValue(obj, iniRow, iniIndex, new Int16Array(arrayBuffer.slice(0, 2))[0]);
                    arrayBuffer = arrayBuffer.slice(2);
                    break;
                case "int32":
                    iniSetValue(obj, iniRow, iniIndex, new Int32Array(arrayBuffer.slice(0, 4))[0]);
                    arrayBuffer = arrayBuffer.slice(4);
                    break;
                case "float":
                    iniSetValue(obj, iniRow, iniIndex, new Float32Array(arrayBuffer.slice(0, 4))[0]);
                    arrayBuffer = arrayBuffer.slice(4);
                    break;
                case "iniselection":
                    var selectionVal;
                    $.each(iniRow.Selections, function(selectionIndex, selectionValue) {
                        var selectionId;
                        if(obj.iniNameSpace[selectionValue.Ini][0].Location === "static")
                        {
                            switch(obj.iniNameSpace[selectionValue.Ini][0].Type) {
                                case "uint8":
                                    selectionId = new Uint8Array(arrayBuffer.slice(0, 1))[0];
                                    break;
                                case "uint16":
                                    selectionId = new Uint16Array(arrayBuffer.slice(0, 2))[0];
                                    break;
                            }
                        }
                        if(selectionId === obj.iniNameSpace[selectionValue.Ini][0].DefaultValue)
                        {
                            selectionVal = {Index: selectionIndex, Value: new ConfigGui(obj.iniNameSpace, selectionValue.Ini)}
                        }
                    });

                    if(selectionVal)
                    {
                        arrayBuffer = arrayBuffer.slice(selectionVal.Value.SetArrayBuffer(arrayBuffer));
                        iniSetValue(obj, iniRow, iniIndex, selectionVal);
                    }
                    break;
                default:
                    if(iniRow.Type.indexOf("[") > -1) {
                        var arrayLen = parseValueString(obj, iniRow.Type.split("[")[1].split("]")[0]);;
                        if(iniRow.Type.split("[").length === 3)
                            arrayLen *= parseValueString(obj, iniRow.Type.split("[")[2].split("]")[0]);;
                        switch(iniRow.Type.split("[")[0]) {
                            case "bool":
                            case "uint8":
                                iniSetValue(obj, iniRow, iniIndex, Array.from(new Uint8Array(arrayBuffer.slice(0, arrayLen))));
                                arrayBuffer = arrayBuffer.slice(arrayLen);
                                break;
                            case "uint16":
                                iniSetValue(obj, iniRow, iniIndex, Array.from(new Uint16Array(arrayBuffer.slice(0, 2 * arrayLen))));
                                arrayBuffer = arrayBuffer.slice(2 * arrayLen);
                                break;
                            case "uint32":
                                iniSetValue(obj, iniRow, iniIndex, Array.from(new Uint32Array(arrayBuffer.slice(0, 4 * arrayLen))));
                                arrayBuffer = arrayBuffer.slice(4 * arrayLen);
                                break;
                            case "int8":
                                iniSetValue(obj, iniRow, iniIndex, Array.from(new Int8Array(arrayBuffer.slice(0, arrayLen))));
                                arrayBuffer = arrayBuffer.slice(arrayLen);
                                break;
                            case "int16":
                                iniSetValue(obj, iniRow, iniIndex, Array.from(new Int16Array(arrayBuffer.slice(0, 2 * arrayLen))));
                                arrayBuffer = arrayBuffer.slice(2 * arrayLen);
                                break;
                            case "int32":
                                iniSetValue(obj, iniRow, iniIndex, Array.from(new Int32Array(arrayBuffer.slice(0, 4 * arrayLen))));
                                arrayBuffer = arrayBuffer.slice(4 * arrayLen);
                                break;
                            case "formula":
                                arrayLen++;
                            case "float":
                                iniSetValue(obj, iniRow, iniIndex, Array.from(new Float32Array(arrayBuffer.slice(0, 4 * arrayLen))));
                                arrayBuffer = arrayBuffer.slice(4 * arrayLen);
                                break;
                        }
                        obj[iniRow.Location].XMin = parseValueString(obj, iniRow.XMin);
                        obj[iniRow.Location].XMax = parseValueString(obj, iniRow.XMax);
                    } else {
                        throw "setByteArray Type Invalid";
                    }
                    break;
            }
        } else {
            arrayBuffer = arrayBuffer.slice(iniSetValue(obj, iniRow, iniIndex, arrayBuffer));
        }
    }

    $.each(ini, setIniRow);

    return prevLength - arrayBuffer.byteLength;
}