class ConfigBase {
    GetIni() {
        return this.Ini;
    }
    GetIniLocation() {
        return this.IniLocation;
    }
    GetIniProperty() {
        var property = {};
        Object.assign(property, GetPropertyByLocation(this.Ini, this.IniLocation));
        if(property.IniName) {
            Object.assign(property, GetPropertyByLocation(this.Ini, property.IniName));
        }
        return property;
    }
    SetIni(ini, iniLocation) {
        if(ini) {
            this.Ini = ini;
        }
        if(!this.Ini) {
            this.Ini = {};
        }
        if(iniLocation) {
            this.IniLocation = iniLocation;
        }
        if(!this.IniLocation) {
            this.IniLocation = "Main";
        }

        this.InitProperty();
    }
    GetObj() {
        return this.Obj;
    }
    GetJSONSafeOBJ() {
        return JSON.parse(JSON.stringify(this.Obj, function(key, value) {   
            if(key.endsWith("EFJ") || key == "IniLocation")
                return undefined;
            
            if(isEmpty(value, ["EFJ", "IniLocation"])) {
                return undefined;
            }

            return value;
        }));
    }
    GetObjLocation() {
        return this.Obj;
    }
    GetObjProperty() {
        var property = GetPropertyByLocation(this.Obj, this.ObjLocation);
        if(property === undefined)
        {
            var parentObj = GetPropertyByLocation(this.Obj, this.ObjLocation.substring(0, this.ObjLocation.lastIndexOf("/")));
            if(parentObj) {
                parentObj[this.ObjLocation.substring(this.ObjLocation.lastIndexOf("/") + 1)] = {};
            }

            property = GetPropertyByLocation(this.Obj, this.ObjLocation);
        }

        return property;
    }
    SetObj(obj, objLocation) {
        if(obj) {
            if(obj !== this.Obj) {
                AttachFunctionFromObjToObj(obj, "Update", this, "ObjUpdateEvent");
            }

            this.Obj = obj;
        }
        if(!this.Obj) {
            this.Obj = {};
        }
        if(objLocation) {
            this.ObjLocation = objLocation;
        }
        if(!this.ObjLocation) {
            this.ObjLocation = "";
        }

        this.InitProperty();
    }
    ObjUpdateEvent() { }
    InitProperty() {
        if(!this.Obj || !this.Ini)
            return false;
        var objProperty = this.GetObjProperty();
        objProperty.IniLocation = this.IniLocation;
        return objProperty;
    }

    GetExcludeFromBin = GetIniPropertyPropertyGetFunction("ExcludeFromBin", false)
    GetValue() {
        var iniProperty = this.GetIniProperty();
        var objProperty = this.GetObjProperty();
        var val = objProperty.Value;
        if(val === undefined && iniProperty.Value !== undefined) {
            val = GetValueByNumberOrReference(iniProperty.Value, this.Obj, this.ObjLocation, this.Ini, this.IniLocation);
        }
        
        return val; 
    }
    GetStep(){
        var iniProperty = this.GetIniProperty();
        var step;
        if(iniProperty.Step !== undefined) {
            step = GetValueByNumberOrReference(iniProperty.Step, this.Obj, this.ObjLocation, this.Ini, this.IniLocation);
        }
        if(step === undefined) {
            switch(iniProperty.Type) {
                case "uint8":
                case "uint16":
                case "uint32":
                case "uint64":
                case "int8":
                case "int16":
                case "int32":
                case "int64":
                    step = Math.max(1 / this.GetValueMultiplier(), 0.01);
                    break;
                case "float":
                case "variable":
                case "formula":
                    step = 0.01;
                    break;
                default:
                    throw "Invalid Type " + iniProperty.Type;
            }
        }
        return step;
    }
}

class Config extends ConfigBase {
    GetArrayBuffer() {
        var iniProperty =  this.GetIniProperty();
        var arrayBuffer;
        if(iniProperty.Size !== undefined)
            arrayBuffer = new ArrayBuffer(iniProperty.Size);
        else
            arrayBuffer = new ArrayBuffer();
        for(var variableRowIndex in iniProperty.Variables) {
            var variableRowKey = Object.keys(iniProperty.Variables[variableRowIndex])[0];
            var variableRowConfig = this[variableRowKey];
            var variableRowIniProperty = variableRowConfig.GetIniProperty();

            if(iniProperty.Size !== undefined) {// we are in a statically mapped area
                if(iniProperty.Size === 0)
                    return arrayBuffer;
                var offset = variableRowIniProperty.Offset;
                if(offset === undefined) {
                    throw "Config No offset specified";
                }

                var subArrayBuffer = variableRowConfig.GetArrayBuffer();

                if(variableRowIniProperty.BitOffset || variableRowIniProperty.BitSize) {
                    var bitSize = variableRowIniProperty.BitSize;
                    if(!bitSize) {
                        if(variableRowConfig instanceof ConfigBoolean)
                            bitSize = 1;
                        else
                            bitSize = subArrayBuffer.byteLength * 8;
                    }
                    
                    var bitOffset = variableRowIniProperty.BitOffset;
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
                arrayBuffer = arrayBuffer.concatArray(variableRowConfig.GetArrayBuffer());
            }
        }
        return arrayBuffer;
    }
    SetArrayBuffer(arrayBuffer) {
        var iniProperty =  this.GetIniProperty();
        var size = 0;

        if(iniProperty.Size) {// we are in a statically mapped area
            size = iniProperty.Size;
        }

        for(var variableRowIndex in iniProperty.Variables) {
            var variableRowKey = Object.keys(iniProperty.Variables[variableRowIndex])[0];
            var variableRowConfig = this[variableRowKey];
            var variableRowIniProperty = variableRowConfig.GetIniProperty();

            if(iniProperty.Size) {// we are in a statically mapped area
                var offset = variableRowIniProperty.Offset;
                if(offset === undefined) {
                    throw "Config No offset specified";
                }
                
                var subArrayBuffer = arrayBuffer.slice(offset);

                if(variableRowIniProperty.BitOffset || variableRowIniProperty.BitSize) {
                    var bitSize = variableRowIniProperty.BitSize;
                    var byteSize = 1;
                    if(!bitSize) {
                        if(variableRowConfig instanceof ConfigBoolean)
                            bitSize = 1;
                        else {
                            if(variableRowIniProperty.Type) {
                                switch(variableRowIniProperty.Type) {
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
                    
                    var bitOffset = variableRowIniProperty.BitOffset;
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

                variableRowConfig.SetArrayBuffer(subArrayBuffer);
            } else {
                size += variableRowConfig.SetArrayBuffer(arrayBuffer.slice(size));
            }
        }

        return size;
    }
    SetIni(ini, iniLocation) {
        super.SetIni(ini, iniLocation);
        var iniProperty =  this.GetIniProperty();
            
        for(var variableRowIndex in iniProperty.Variables) {
            var variableRow = iniProperty.Variables[variableRowIndex];
            var variableRowKey = Object.keys(variableRow)[0];

            if(variableRow[variableRowKey].XResolution) {
                if(!this[variableRowKey] || !(this[variableRowKey] instanceof ConfigNumberTable)) {
                    this[variableRowKey] = new ConfigNumberTable();
                }
            } else if(variableRow[variableRowKey].Type) {
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
                        if(!this[variableRowKey] || !(this[variableRowKey] instanceof ConfigNumber)) {
                            this[variableRowKey] = new ConfigNumber();
                        }
                        break;
                    case "formula":
                        if(!this[variableRowKey] || !(this[variableRowKey] instanceof ConfigFormula)) {
                            this[variableRowKey] = new ConfigFormula();
                        }
                        break;
                    case "bool":
                        if(!this[variableRowKey] || !(this[variableRowKey] instanceof ConfigBoolean)) {
                            this[variableRowKey] = new ConfigBoolean();
                        }
                        break;
                }
            } else if (variableRow[variableRowKey].IniName || variableRow[variableRowKey].Variables) {
                if(!variableRow[variableRowKey].Array) {
                    if(!this[variableRowKey] || !(this[variableRowKey] instanceof Config)) {
                        this[variableRowKey] = new Config();
                    }
                } else {
                    if(!this[variableRowKey] || !(this[variableRowKey] instanceof ConfigArray)) {
                        this[variableRowKey] = new ConfigArray();
                    }
                }
            } else if (variableRow[variableRowKey].Selections) {
                if(!this[variableRowKey] || !(this[variableRowKey] instanceof ConfigSelection)) {
                    this[variableRowKey] = new ConfigSelection();
                }
            }

            var variableIniLocation = this.IniLocation + "/Variables/" + variableRowIndex + "/" + variableRowKey;
            if(!GetPropertyByLocation(this.Ini, variableIniLocation)) {
                if(iniProperty.IniName)
                    variableIniLocation = iniProperty.IniName + "/Variables/" + variableRowIndex + "/" + variableRowKey;
                else
                    throw "Where did the variables come from?";
            }
            if(!GetPropertyByLocation(this.Ini, variableIniLocation))
                throw "Can't find the ini location";
            
            if(this[variableRowKey])
                this[variableRowKey].SetIni(this.Ini, variableIniLocation);
        }

        this.InitProperty();
    }
    InitProperty() {
        var objProperty = super.InitProperty();
        if(!objProperty)
            return false;
        
        var iniProperty = this.GetIniProperty();
        for(var variableRowIndex in iniProperty.Variables) {
            var variableRow = iniProperty.Variables[variableRowIndex];
            var variableRowKey = Object.keys(variableRow)[0];

            var variableLocation = this.ObjLocation;
            if(variableLocation)
                variableLocation += "/";

            variableLocation += variableRowKey;

            if(this[variableRowKey]) {
                this[variableRowKey].SetObj(this.Obj, variableLocation);
            } 
        }
        
        return objProperty;
    }
}

class ConfigSelection extends ConfigBase {
    GetArrayBuffer() {
        return this.Value.GetArrayBuffer();
    }
    SetArrayBuffer(arrayBuffer) {
        return this.Value.SetArrayBuffer(arrayBuffer);
    }
    SetIni(ini, iniLocation) {
        super.SetIni(ini, iniLocation);
        if(this.Value)
            this.Value.SetIni(ini);
    }
    InitProperty() {
        var objProperty = super.InitProperty();
        if(!objProperty)
            return false;

        var iniProperty = this.GetIniProperty();
        if(objProperty.Index === undefined && iniProperty.Index !== undefined) {
            objProperty.Index = iniProperty.Index;
        }
        if(objProperty.Index === undefined) {
            objProperty.Index = 0;
        }
        if(objProperty.Value === undefined && iniProperty.Value !== undefined) {
            objProperty.Value = iniProperty.Value;
        }
        if(this.Value === undefined) {
            this.Value = new Config();
        }
        this.Value.SetIni(this.Ini, this.IniLocation + "/Selections/" + objProperty.Index)
        this.Value.SetObj(this.Obj, this.ObjLocation + "/Value")
        
        return objProperty;
    }
}

class ConfigNumber extends ConfigBase {
    GetValueMultiplier = GetIniPropertyPropertyGetFunction("ValueMultiplier", 1);
    GetMin = GetIniPropertyMin;
    GetMax = GetIniPropertyMax;
    ObjUpdateEvent() {
        super.ObjUpdateEvent();
        var iniProperty = this.GetIniProperty();
        if(!iniProperty.Static) {
            var objProperty = this.GetObjProperty();

            switch(iniProperty.Type) {
                case "uint8":
                case "uint16":
                case "uint32":
                    if(objProperty.Value < 0)
                    objProperty.Value = 0;
                case "int8":
                case "int16":
                case "int32":
                objProperty.Value = Math.round(objProperty.Value * this.GetValueMultiplier()) / this.GetValueMultiplier();
            }
            if(objProperty.Value < this.GetMin())
                objProperty.Value = this.GetMin();
            if(objProperty.Value > this.GetMax())
                objProperty.Value = this.GetMax();
        }
    }
    GetArrayBuffer() {
        if(this.GetExcludeFromBin()) {
            return new ArrayBuffer(0);
        }
        var iniProperty = this.GetIniProperty();
        var val = this.GetValue();
        var valMult = this.GetValueMultiplier();

        switch(iniProperty.Type) {
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
        var iniProperty = this.GetIniProperty();
        var size = 0;
        var val;
        var valMult = this.GetValueMultiplier();
        switch(iniProperty.Type) {
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

        if(!iniProperty.Static) {
            this.GetObjProperty().Value = val;
        }
        return size;
    }
    InitProperty() {
        var objProperty = super.InitProperty();
        if(!objProperty)
            return false;

        var iniProperty = this.GetIniProperty();
        if(!iniProperty.Static) {
            if(objProperty.Value === undefined && iniProperty.Value !== undefined) {
                objProperty.Value = iniProperty.Value;
            }
            if(objProperty.Value === undefined) {
                objProperty.Value = this.GetMin();
                if(objProperty.Value < 0)
                    objProperty.Value = 0;
                if(objProperty.Value > this.GetMax())
                    objProperty.Value = this.GetMax();
            }
        } else {
            objProperty.Value = undefined;
        }

        return objProperty;
    }
}

class ConfigBoolean extends ConfigBase {
    GetArrayBuffer() {
        return new Uint8Array([this.GetObjProperty().Value & 0x01]).buffer;
    }
    SetArrayBuffer(arrayBuffer) {
        this.GetObjProperty().Value = new Uint8Array(arrayBuffer)[0] & 0x01;
        return 1;
    }
    InitProperty() {
        var objProperty = super.InitProperty();
        if(!objProperty)
            return false;

        var iniProperty = this.GetIniProperty();
        if(objProperty.Value === undefined && iniProperty.Value !== undefined) {
            objProperty.Value = iniProperty.Value;
        }
        if(objProperty.Value === undefined) {
            objProperty.Value = false;
        }

        return objProperty;
    }
}

class ConfigNumberTable extends ConfigBase {
    GetValueMultiplier = GetIniPropertyPropertyGetFunction("ValueMultiplier", 1);
    GetMin = GetIniPropertyMin;
    GetMax = GetIniPropertyMax;
    GetXResolution = GetIniPropertyPropertyGetFunction("XResolution", 1);
    GetYResolution = GetIniPropertyPropertyGetFunction("YResolution", 1);

    GetTableArrayLength() {
        return this.GetXResolution() * this.GetYResolution();
    }
    GetArrayBuffer() {
        var iniProperty = this.GetIniProperty();
        var val = this.GetObjProperty().Value
        var valMult = this.GetValueMultiplier();
        
        var value = Array.from(val);

        for(var i = 0; i < value.length; i++) {
            value[i] *= valMult;
        }

        switch(iniProperty.Type) {
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
        var iniProperty = this.GetIniProperty();
        var objProperty = this.GetObjProperty();

        switch(iniProperty.Type) {
            case "bool":
            case "uint8":
                objProperty.Value = Array.from(new Uint8Array(arrayBuffer.slice(0, arrayLen)));
                break;
            case "uint16":
                objProperty.Value = Array.from(new Uint16Array(arrayBuffer.slice(0, 2 * arrayLen)));
                arrayLen = 2 * arrayLen;
                break;
            case "uint32":
                objProperty.Value = Array.from(new Uint32Array(arrayBuffer.slice(0, 4 * arrayLen)));
                arrayLen = 4 * arrayLen;
                break;
            case "uint64":
                objProperty.Value = Array.from(new Uint64Array(arrayBuffer.slice(0, 4 * arrayLen)));
                arrayLen = 8 * arrayLen;
                break;
            case "int8":
                objProperty.Value = Array.from(new Int8Array(arrayBuffer.slice(0, arrayLen)));
                arrayLen = arrayLen;
                break;
            case "int16":
                objProperty.Value = Array.from(new Int16Array(arrayBuffer.slice(0, 2 * arrayLen)));
                arrayLen = 2 * arrayLen;
                break;
            case "int32":
                objProperty.Value = Array.from(new Int32Array(arrayBuffer.slice(0, 4 * arrayLen)));
                arrayLen = 4 * arrayLen;
                break;
            case "int64":
                objProperty.Value = Array.from(new Int64Array(arrayBuffer.slice(0, 4 * arrayLen)));
                arrayLen = 8 * arrayLen;
                break;
            case "float":
                objProperty.Value = Array.from(new Float32Array(arrayBuffer.slice(0, 4 * arrayLen)));
                arrayLen = 4 * arrayLen;
                break;
            default: 
                throw "ConfigNumberTable Type Invalid";
        }

        var valMult = this.GetValueMultiplier();

        for(var i = 0; i < objProperty.Value.length; i++) {
            objProperty.Value[i] /= valMult;
        }

        return arrayLen;
    }
    InitProperty() {
        var objProperty = super.InitProperty();
        if(!objProperty)
            return false;

        var iniProperty = this.GetIniProperty();
        if(objProperty.Value === undefined && iniProperty.Value !== undefined) {
            objProperty.Value = iniProperty.Value;
        }
        if(objProperty.Value === undefined) {
            var val = this.GetMin();
            if(val < 0)
                val = 0;
            if(val > this.GetMax())
                val = this.GetMax();
            objProperty.Value = new Array(this.GetTableArrayLength());
            $.each(objProperty.Value, function(index, value) {
                objProperty.Value[index] = val;
            });
        }

        return objProperty;
    }
}

class ConfigFormula extends ConfigBase {
    GetValueMultiplier = GetIniPropertyPropertyGetFunction("ValueMultiplier", 1);
    GetMin = GetIniPropertyMin;
    GetMax = GetIniPropertyMax;
    GetDegree = GetIniPropertyPropertyGetFunction("Degree", 0);
    GetTableArrayLength() {
        return this.GetDegree() + 1;
    }
    GetArrayBuffer() {
        var objProperty = this.GetObjProperty();
        var valMult = this.GetValueMultiplier();
        var value = Array.from(objProperty.Value);

        for(var i = 0; i < value.length; i++) {
            value[i] *= valMult;
        }

        return Float32Array.from(value);
    }
    SetArrayBuffer(arrayBuffer) {
        var objProperty = this.GetObjProperty();
        var valMult = this.GetValueMultiplier();
        var arrayLen = this.GetTableArrayLength();
        objProperty.Value = Array.from(new Float32Array(arrayBuffer.slice(0, 4 * arrayLen)));
        
        for(var i = 0; i < objProperty.length; i++) {
            objProperty.Value[i] /= valMult;
        }
        
        return 4 * arrayLen;
    }
    InitProperty() {
        var objProperty = super.InitProperty();
        if(!objProperty)
            return false;
            
        var iniProperty = this.GetIniProperty();
        if(objProperty.Value === undefined && iniProperty.Value !== undefined) {
            objProperty.Value = iniProperty.Value;
        }
        if(objProperty.Value === undefined) {
            var val = this.GetMin();
            if(val < 0)
                val = 0;
            if(val > this.GetMax())
                val = this.GetMax();

            objProperty.Value = new Array(this.GetTableArrayLength());
            $.each(objProperty.Value, function(index, value) {
                objProperty.Value[index] = val;
            });
        }

        return objProperty;
    }
}

class ConfigArray extends ConfigBase {
    GetTableArrayLength = GetIniPropertyPropertyGetFunction("Array", 1);
    ObjUpdateEvent() {
        super.ObjUpdateEvent();
        var tableArrayLength = this.GetTableArrayLength()

        for(var i = this.Value.length; i < tableArrayLength; i++) {
            this.Value.push(new Config());
            this.Value[i].SetObj(this.Obj, this.ObjLocation + "/Value/" + i);
            this.Value[i].SetIni(this.Ini, this.IniLocation);
        }

    }
    GetArrayBuffer() {
        var objProperty = this.GetObjProperty();
        var arrayBuffer = new ArrayBuffer();
        var tableArrayLength = this.GetTableArrayLength()
        for(var index = 0; index < tableArrayLength; index++) {
            arrayBuffer = arrayBuffer.concatArray(this.Value[index].GetArrayBuffer());
        }
        return arrayBuffer;
    }
    SetArrayBuffer(arrayBuffer) {
        var objProperty = this.GetObjProperty();
        var size = 0;

        var tableArrayLength = this.GetTableArrayLength()

        for(var i = this.Value.length; i < tableArrayLength; i++) {
            this.Value.push(new Config());
            this.Value[i].SetObj(this.Obj, this.ObjLocation + "/Value/" + i);
            this.Value[i].SetIni(this.Ini, this.IniLocation);
        }

        for(var i = 0; i < tableArrayLength; i++) {
            size += this.Value[i].SetArrayBuffer(arrayBuffer.slice(size));
        }

        return size;
    }
    InitProperty() {
        var objProperty = super.InitProperty();
        if(!objProperty)
            return false;
        
        var iniProperty = this.GetIniProperty();
        if(objProperty.Value === undefined) {
            objProperty.Value = new Array();
        }
        if(!this.Value)
            this.Value = new Array();
        
        var tableArrayLength = this.GetTableArrayLength()

        if(this.Value.length < tableArrayLength) {
            for(var i = this.Value.length; i < tableArrayLength; i++) {
                this.Value.push(new Config());
            }
        }
        for(var i = 0; i < tableArrayLength; i++) {
            this.Value[i].SetObj(this.Obj, this.ObjLocation + "/Value/" + i);
            this.Value[i].SetIni(this.Ini, this.IniLocation);
        }
        
        return objProperty;
    }
}

function GetValueByNumberOrReference(val, obj, objLocation, ini, iniLocation) {
    var num = parseFloat(val)
    if(!isNaN(num))
        return num;

    var reference = GetReference(val, obj, objLocation, ini, iniLocation);
    if(reference !== undefined) {
        if(reference.Value !== undefined)
            return reference.Value;
        return reference;
    }
}

function GetReference(ref, obj, objLocation, ini, iniLocation) {
    var objReference = GetPropertyByLocation(obj, objLocation + "/" + ref);
    if(objReference !== undefined) {
        return objReference;
    }
        
    var iniReference = GetPropertyByLocation(ini, iniLocation + "/" + ref);
    if(iniReference !== undefined) {
        return iniReference;
    }
    
    //some weird ini voodoo going on down here
    if((objLocation + "/" + ref).indexOf("./") > -1 && (objLocation + "/" + ref).indexOf(".") >= (objLocation + "/" + ref).indexOf("./")) { //search up obj until exists
        var ret = undefined;
        var parentObjLocation = (objLocation + "/" + ref).substring(0, (objLocation + "/" + ref).indexOf("./"));
        parentObjLocation = parentObjLocation.substring(0, parentObjLocation.lastIndexOf("/"));
        var parentObj = GetPropertyByLocation(obj, parentObjLocation);
        if(parentObj && parentObj.IniLocation) {
            var parentIniLocation = parentObj.IniLocation;
            while((ret = GetPropertyByLocation(ini, parentIniLocation + (objLocation + "/" + ref).substring((objLocation + "/" + ref).indexOf("./") + 1))) === undefined) {
                if(!parentObjLocation)
                    break;
                parentObjLocation = parentObjLocation.substring(0, parentObjLocation.lastIndexOf("/"));
                parentObj = GetPropertyByLocation(obj, parentObjLocation);
                parentIniLocation = parentObj.IniLocation;
            }
        }
        return ret;
    }

    if((objLocation + "/" + ref).indexOf(".") > -1) { //go up 1
        var parentObjLocation = (objLocation + "/" + ref).substring(0, (objLocation + "/" + ref).indexOf("."));
        parentObjLocation = parentObjLocation.substring(0, parentObjLocation.lastIndexOf("/"));
        var parentObj = GetPropertyByLocation(obj, parentObjLocation);
        if(parentObj && parentObj.IniLocation) {
            var parentIniLocation = parentObj.IniLocation;
            return GetPropertyByLocation(ini, parentIniLocation + "/" + (objLocation + "/" + ref).substring((objLocation + "/" + ref).indexOf(".") + 1));
        }
    }
}

function GetPropertyByLocation(obj, location) {
    if(!location) { //this is the top obj
        return obj;
    }

    if(location.indexOf("///") > -1 || location.indexOf("//") == 0) { // search all of obj
        location = location.substring(location.lastIndexOf("//") + 2);
        var val = GetPropertyByLocation(obj, location);
        if(val !== undefined)
            return val;
        for(key in obj) {
            if (obj[key] === undefined || typeof obj[key] !== "object" || key.endsWith("EFJ"))
                continue;

            val = GetPropertyByLocation(obj[key], "///" + location);
            if(val !== undefined) {
                return val;
            }
        }
        return undefined;
    }

    if(location.indexOf("//") > -1) { // top of obj
        return GetPropertyByLocation(obj, location.substring(location.indexOf("//") + 2));
    }
    if(location.indexOf("/") == 0) { // top of obj
        return GetPropertyByLocation(obj, location.substring(1));
    }

    if(location.indexOf("./") > -1 && location.indexOf("./") >= location.indexOf(".")) { //search up obj until exists
        var ret = undefined;
        var parentLocation = location.substring(0, location.indexOf("./"));
        parentLocation = parentLocation.substring(0, parentLocation.lastIndexOf("/"));
        while((ret = GetPropertyByLocation(obj, parentLocation + location.substring(location.indexOf("./") + 1))) === undefined) {
            if(!parentLocation)
                break;
            parentLocation = parentLocation.substring(0, parentLocation.lastIndexOf("/"));
        }
        return ret;
    }

    if(location.indexOf(".") > -1) { //go up 1
        var parentLocation = location.substring(0, location.indexOf("."));
        parentLocation = parentLocation.substring(0, parentLocation.lastIndexOf("/"));
        parentLocation = parentLocation.substring(0, parentLocation.lastIndexOf("/"));
        return GetPropertyByLocation(obj, parentLocation + "/" + location.substring(location.indexOf(".") + 1));
    }

    var locationSplit = location.split("/")
    var ret = obj;
    for(var i = 0; i < locationSplit.length; i++) {
        if(ret === undefined || ret == null)
            return undefined;

        ret = ret[locationSplit[i]];
    }
    
    return ret;
}

function GetIniPropertyDegree(iniProperty) {
    if(iniProperty.Degree !== undefined)
        return iniProperty.Degree;
    return 1;
}

function AttachFunctionFromObjToObj(obj, functionName, handleObj, handleFunctionName) {
    if(!obj[functionName] || !obj[functionName + "HandlesEFJ"]){
        obj[functionName + "HandlesEFJ"] = new Array();
        obj[functionName] = function() {
            $.each(obj[functionName + "HandlesEFJ"], function(index, handle) {
                handle.Obj[handle.FunctionName]();
            });
        }
    }

    var handleAlreadyExists = false;
    $.each(obj[functionName + "HandlesEFJ"], function(index, handle) {
        if(handle.Obj === handleObj && handle.FunctionName === handleFunctionName) {
            handleAlreadyExists = true;
        }
    });

    if(!handleAlreadyExists)
        obj[functionName + "HandlesEFJ"].push({ Obj: handleObj, FunctionName: handleFunctionName});
}
function CallObjFunctionIfExists(obj, functionName) {
    if(obj[functionName]) {
        obj[functionName]();
    }
}
function GetIniPropertyPropertyGetFunction(propertyName, defaultValue) {
    var f = function() {
        var iniProperty = this.GetIniProperty();
        var val = defaultValue;
        if(iniProperty[propertyName] !== undefined) {
            val = GetValueByNumberOrReference(iniProperty[propertyName], this.Obj, this.ObjLocation, this.Ini, this.IniLocation);
        }
        if(val)
            return val; 

        return defaultValue;
    }

    return f;
}

function GetIniPropertyMin() {
    var iniProperty = this.GetIniProperty();
    var min;
    if(iniProperty.Min !== undefined) {
        min = GetValueByNumberOrReference(iniProperty.Min, this.Obj, this.ObjLocation, this.Ini, this.IniLocation);
    }
    if(min === undefined) {
        switch(iniProperty.Type) {
            case "uint8":
            case "uint16":
            case "uint32":
            case "uint64":
                min = 0;
                break;
            case "int8":
                min = -128 / this.GetValueMultiplier();
                break;
            case "int16":
                min = -32768 / this.GetValueMultiplier();
                break;
            case "int32":
                min = -2147483648 / this.GetValueMultiplier();
                break;
            case "int64":
                min = -9223372036854775808 / this.GetValueMultiplier();
                break;
            case "float":
            case "formula":
            case "variable":
                min = -340282300000000000000000000000000000000 / this.GetValueMultiplier();
                break;
            default:
                throw "Invalid Type " + iniProperty.Type;
        }
    }
    return min;
}
function GetIniPropertyMax() {
    var iniProperty = this.GetIniProperty();
    var max;
    if(iniProperty.Max !== undefined) {
        max = GetValueByNumberOrReference(iniProperty.Max, this.Obj, this.ObjLocation, this.Ini, this.IniLocation);
    }
    if(max === undefined) {
        switch(iniProperty.Type) {
            case "uint8":
                max = 255 / this.GetValueMultiplier();
                break;
            break;
            case "uint16":
                max = 65535 / this.GetValueMultiplier();
                break;
            case "uint32":
                max = 4294967295 / this.GetValueMultiplier();
                break;
            case "uint64":
                max = 18446744073709551615 / this.GetValueMultiplier();
                break;
            case "int8":
                max = 127 / this.GetValueMultiplier();
                break;
            case "int16":
                max = 32767 / this.GetValueMultiplier();
                break;
            case "int32":
                max = 2147483647 / this.GetValueMultiplier();
                break;
            case "int64":
                max = 9223372036854775807 / this.GetValueMultiplier();
                break;
            case "variable":
            case "formula":
            case "float":
                max = 340282300000000000000000000000000000000 / this.GetValueMultiplier();
                break;
            default:
                throw "Invalid Type " + iniProperty.Type;
        }
    }
    return max;
}