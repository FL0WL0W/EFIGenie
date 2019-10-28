var AutoIncrement = {};

class ConfigBase {
    GetIni() {
        return this.Ini;
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
            if(key.endsWith("EFJ") || key == "IniLocation" || key == "iterator")
                return undefined;
            
            if(isEmpty(value, ["EFJ", "IniLocation", "iterator"])) {
                return undefined;
            }

            return value;
        }));
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
    AttachObjUpdateEvent() {
        if(this.Obj)
            AttachFunctionFromObjToObj(this.Obj, "Update", this, "ObjUpdateEvent");
    }
    DeAttachObjUpdateEvent() {
        if(this.Obj)
            RemoveFunctionFromObjToObj(this.Obj, "Update", this, "ObjUpdateEvent");
    }
    Attach(){
        this.DeAttach();
        this.AttachObjUpdateEvent();
    }
    DeAttach(){
        this.DeAttachObjUpdateEvent();
    }
    ObjUpdateEvent() { }
    InitProperty() {
        if(!this.Obj || !this.Ini)
            return false;
        var objProperty = this.GetObjProperty();
        objProperty.IniLocation = this.IniLocation;
        return objProperty;
    }

    GetExcludeFromBin = GetValueByReferenceFunction("ExcludeFromBin", false)
    GetValue = GetValueByReferenceFunction("Value", undefined)
    SetValue(val) {
        this.GetObjProperty().Value = val;
    }
    GetType() {
        var val = GetValueByReference("Type", this.Obj, this.ObjLocation, this.Ini);
        if(isNaN(parseInt(val)))
            return val; 
        val = parseInt(val);
        switch(val){
            case 1:
                return "uint8";
            case 2:
                return "uint16";
            case 3:
                return "uint32";
            case 4:
                return "uint64";
            case 5:
                return "int8";
            case 6:
                return "int16";
            case 7:
                return "int32";
            case 8:
                return "int64";
            case 9:
                return "float";
            case 10:
                return "double";
            case 11:
                return "bool";
            case 11:
                return "uint32";
        }
    }
    GetStep(){
        var step = GetValueByReference("Step", this.Obj, this.ObjLocation, this.Ini);
        if(step === undefined) {
            switch(this.GetType()) {
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
                case "double":
                case "variable":
                case "formula":
                    step = 0.01;
                    break;
                default:
                    throw "Invalid Type " + this.GetType();
            }
        }
        return step;
    }
}

class Config extends ConfigBase {
    GetVariables = GetValueByReferenceFunction("Variables", [])
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
                        if(variableRowConfig.GetType() === "bool")
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
                        if(variableRowConfig.GetType() === "bool")
                            bitSize = 1;
                        else {
                            if(variableRowConfig.GetType()) {
                                switch(variableRowConfig.GetType()) {
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
                    case "bool":
                    default:
                        if(!this[variableRowKey] || !(this[variableRowKey] instanceof ConfigNumber)) {
                            this[variableRowKey] = new ConfigNumber();
                        }
                        break;
                    case "formula":
                        if(!this[variableRowKey] || !(this[variableRowKey] instanceof ConfigFormula)) {
                            this[variableRowKey] = new ConfigFormula();
                        }
                        break;
                }
            } else if (variableRow[variableRowKey].IniName || variableRow[variableRowKey].Variables) {
                if(variableRow[variableRowKey].Array) {
                    if(!this[variableRowKey] || !(this[variableRowKey] instanceof ConfigArray)) {
                        this[variableRowKey] = new ConfigArray();
                    }
                } else if(variableRow[variableRowKey].NamedList) {
                    if(!this[variableRowKey] || !(this[variableRowKey] instanceof ConfigNamedList)) {
                        this[variableRowKey] = new ConfigNamedList();
                    }
                } else {
                    if(!this[variableRowKey] || !(this[variableRowKey] instanceof Config)) {
                        this[variableRowKey] = new Config();
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
    Attach() {
        super.Attach();
        var iniProperty = this.GetIniProperty();
        for(var variableRowIndex in iniProperty.Variables) {
            var variableRow = iniProperty.Variables[variableRowIndex];
            var variableRowKey = Object.keys(variableRow)[0];

            if(this[variableRowKey]) {
                this[variableRowKey].Attach();
            } 
        }
    }
    DeAttach() {
        super.DeAttach();
        var iniProperty = this.GetIniProperty();
        for(var variableRowIndex in iniProperty.Variables) {
            var variableRow = iniProperty.Variables[variableRowIndex];
            var variableRowKey = Object.keys(variableRow)[0];

            if(this[variableRowKey]) {
                this[variableRowKey].DeAttach();
            } 
        }
    }
}

class ConfigSelection extends ConfigBase {
    GetSelections = GetValueByReferenceFunction("Selections", []);
    GetArrayBuffer() {
        return this.Value.GetArrayBuffer();
    }
    SetArrayBuffer(arrayBuffer) {
        var selectionsReference = GetReference("Selections", this.Obj, this.ObjLocation, this.Ini);
        var selectionsLength = GetPropertyByLocation(this.Ini, selectionsReference);
        var testArrayBufferPos = 0;
        var selectedIndex = 0;
        for(var index = 0; index < selectionsLength; index++) {
            var test = new Config();
            test.SetIni(this.Ini, selectionsReference + index)
            test.SetObj();
            var testIniProperty = test.GetIniProperty();
            var hasStatic = false;
            var matchesAllStatics = true;
            for(var variableRowIndex in testIniProperty.Variables) {
                var variableRow = testIniProperty.Variables[variableRowIndex];
                var variableRowKey = Object.keys(variableRow)[0];

                var isStatic = test[variableRowKey].GetStatic !== undefined && test[variableRowKey].GetStatic();
                var testArrayBufferLength = test[variableRowKey].SetArrayBuffer(arrayBuffer.slice(testArrayBufferPos));
                if(isStatic) {
                    if(!arrayBuffer.slice(testArrayBufferPos, testArrayBufferLength).equals(test[variableRowKey].GetArrayBuffer())) {
                        matchesAllStatics = false;
                    }
                    hasStatic = true;
                } else {
                    break;//only look at first part for statics. otherwise don't bother. too complicated to try and find statics further down after dynamic values
                }
                testArrayBufferPos += testArrayBufferLength;
            }

            if(hasStatic && matchesAllStatics) {
                selectedIndex = index;
                break;
            }
        }
        this.GetObjProperty().Index = selectedIndex;
        CallObjFunctionIfExists(this.Obj, "Update");
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
    Attach() {
        super.Attach();
        if(this.Value != undefined)
            this.Value.Attach();
    }
    DeAttach() {
        super.DeAttach();
        if(this.Value != undefined)
            this.Value.DeAttach();
    }
}

class ConfigNumber extends ConfigBase {
    GetValueMultiplier = GetValueByReferenceFunction("ValueMultiplier", 1);
    GetMin = GetMinFunction;
    GetMax = GetMaxFunction;
    GetStatic = GetValueByReferenceFunction("Static", false);
    GetSelections = GetValueByReferenceFunction("Selections", []);
    ObjUpdateEvent() {
        super.ObjUpdateEvent();
        if(!this.GetStatic()) {
            var thisValue = parseFloat(this.GetValue());
            var val = thisValue;
            if(!isNaN(val)) {
                switch(this.GetType()) {
                    case "uint8":
                    case "uint16":
                    case "uint32":
                        if(val < 0)
                        val = 0;
                    case "int8":
                    case "int16":
                    case "int32":
                        val = Math.round(val * this.GetValueMultiplier()) / this.GetValueMultiplier();
                }
                if(val < this.GetMin())
                    val = this.GetMin();
                if(val > this.GetMax())
                    val = this.GetMax();
                if(val !== thisValue)
                    this.SetValue(val);
            }
        }
    }
    GetArrayBuffer() {
        if(this.GetExcludeFromBin()) {
            return new ArrayBuffer(0);
        }
        var val = this.GetValue();
        if(isNaN(parseFloat(val))) {
            if(val !== undefined && val.iterator !== undefined) {
                val = val.iterator;
            }
        }
        var valMult = this.GetValueMultiplier();

        switch(this.GetType()) {
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
            case "bool":
                return new Uint8Array([val & 0x01]).buffer;
        }
    }
    SetArrayBuffer(arrayBuffer) {
        if(this.GetExcludeFromBin()) {
            return 0;
        }
        var size = 0;
        var val;
        var valMult = this.GetValueMultiplier();
        switch(this.GetType()) {
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
            case "bool":
                val = new Uint8Array(arrayBuffer)[0] & 0x01;
                size = 4;
                break;
        }

        if(!this.GetStatic()) {
            var selections = this.GetSelections();
            if(selections !== undefined && selections.length > 0 && typeof selections[0] !== "string") {
                this.SetValue(GetReference("Selections", this.Obj, this.ObjLocation, this.Ini) + "/" + selections[parseInt(val)].Name);
            } else {
                this.SetValue(val);
            }
        }
        return size;
    }
    InitProperty() {
        var objProperty = super.InitProperty();
        if(!objProperty)
            return false;

        var iniProperty = this.GetIniProperty();
        if(!this.GetStatic()) {
            if(objProperty.Value === undefined && iniProperty.Value !== undefined) {
                objProperty.Value = iniProperty.Value;
            }
            if(objProperty.Value === undefined) {
                var selections = this.GetSelections();
                if(selections !== undefined && selections.length > 0 && typeof selections[0] !== "string") {
                    objProperty.Value = GetReference("Selections", this.Obj, this.ObjLocation, this.Ini) + "/" + selections[0].Name;
                } else {
                    objProperty.Value = this.GetMin();
                    if(objProperty.Value < 0)
                        objProperty.Value = 0;
                    if(objProperty.Value > this.GetMax())
                        objProperty.Value = this.GetMax();
                }
            }
        } else {
            objProperty.Value = undefined;
        }

        return objProperty;
    }
}

class ConfigNumberTable extends ConfigBase {
    GetValueMultiplier = GetValueByReferenceFunction("ValueMultiplier", 1);
    GetMin = GetMinFunction;
    GetMax = GetMaxFunction;
    GetXResolution = GetValueByReferenceFunction("XResolution", 1);
    GetYResolution = GetValueByReferenceFunction("YResolution", 1);
    GetTableArrayLength() {
        return this.GetXResolution() * this.GetYResolution();
    }
    GetArrayBuffer() {
        var val = this.GetValue();
        var valMult = this.GetValueMultiplier();
        
        var value = Array.from(val);

        for(var i = 0; i < value.length; i++) {
            value[i] *= valMult;
        }

        switch(this.GetType()) {
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
        var objProperty = this.GetObjProperty();

        switch(this.GetType()) {
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
    GetValueMultiplier = GetValueByReferenceFunction("ValueMultiplier", 1);
    GetMin = GetMinFunction;
    GetMax = GetMaxFunction;
    GetDegree = GetValueByReferenceFunction("Degree", 0);
    GetTableArrayLength() {
        return this.GetDegree() + 1;
    }
    GetArrayBuffer() {
        var valMult = this.GetValueMultiplier();
        var value = Array.from(this.GetValue());

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
    GetTableArrayLength = GetValueByReferenceFunction("Array", 0);
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
        var arrayBuffer = new ArrayBuffer();
        var tableArrayLength = this.GetTableArrayLength()
        for(var index = 0; index < tableArrayLength; index++) {
            arrayBuffer = arrayBuffer.concatArray(this.Value[index].GetArrayBuffer());
        }
        return arrayBuffer;
    }
    SetArrayBuffer(arrayBuffer) {
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
    Attach() {
        super.Attach();
        if(this.Value != undefined) {
            for(var i = 0; i < this.Value.length; i++) {
                this.Value[i].Attach();
            }
        }
    }
    DeAttach() {
        super.DeAttach();
        if(this.Value != undefined) {
            for(var i = 0; i < this.Value.length; i++) {
                this.Value[i].DeAttach();
            }
        }
    }
}

class ConfigNamedList extends ConfigBase {
    GetTableArrayLength = GetValueByReferenceFunction("Length", 0);
    GetDefaultName = GetValueByReferenceFunction("Name", "I")
    ObjUpdateEvent() {
        super.ObjUpdateEvent();
        var tableArrayLength = this.GetTableArrayLength()

        for(var i = this.Value.length; i < tableArrayLength; i++) {
            this.Value.push(new Config());
            this.Value[i].SetObj(this.Obj, this.ObjLocation + "/Value/" + i);
            this.Value[i].SetIni(this.Ini, this.IniLocation);
            var valueObjProperty = this.Value[i].GetObjProperty();
            valueObjProperty.iterator = i;
            valueObjProperty.Name = this.GetDefaultName() + i;
        }

    }
    GetArrayBuffer() {
        var arrayBuffer = new ArrayBuffer();
        var tableArrayLength = this.GetTableArrayLength()
        for(var index = 0; index < tableArrayLength; index++) {
            arrayBuffer = arrayBuffer.concatArray(this.Value[index].GetArrayBuffer());
        }
        return arrayBuffer;
    }
    //SetArrayBuffer(arrayBuffer) //this will need something clever to make it work
    InitProperty() {
        var objProperty = super.InitProperty();
        if(!objProperty)
            return false;

        if(isNaN(objProperty.Length))
            objProperty.Length = 1;
        
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
            var valueObjProperty = this.Value[i].GetObjProperty();
            valueObjProperty.iterator = i;
            valueObjProperty.Name = this.GetDefaultName() + i;
        }
        
        return objProperty;
    }
    Attach() {
        super.Attach();
        if(this.Value != undefined) {
            for(var i = 0; i < this.Value.length; i++) {
                this.Value[i].Attach();
            }
        }
    }
    DeAttach() {
        super.DeAttach();
        if(this.Value != undefined) {
            for(var i = 0; i < this.Value.length; i++) {
                this.Value[i].DeAttach();
            }
        }
    }
}

function GetValueByValueOrReference(val, obj, objLocation, ini) {
    var num = parseFloat(val)
    if(!isNaN(num))
        return num;
    if(typeof(val) !== 'string')
        return val;

    var referenceValue = GetValueByReference(val, obj, objLocation, ini);
    if(referenceValue !== undefined) {
        return referenceValue;
    }

    return val;
}
function GetValueByReference(ref, obj, objLocation, ini) {
    var property;
    var reference = GetReference(ref, obj, objLocation, ini);
    if(reference !== undefined) {
        property = GetPropertyByLocation(obj, reference);
        if(property === undefined)
            property = GetPropertyByLocation(ini, reference);
    }
    if(typeof(property) === "string" && property.indexOf("!") === 0) {
        return !GetValueByReference(ref.substring(1), obj, objLocation, ini);
    }
    return property;
}

function GetReference(ref, obj, objLocation, ini) {
    var ret = undefined;
    if(ref.indexOf("/") === 0) {
        ref = ref.substring(1);
        return GetReference(ref, obj, "", ini);
    }
    if(ref.indexOf(".") === 0) {
        ref = ref.substring(1);
        //some weird ini voodoo going on down here
        if(ref.indexOf("/") == 0) { //search up obj until exists
            ref = ref.substring(1);
            var parentObjLocation = objLocation;
            do {
                ret = GetReference(ref, obj, parentObjLocation, ini)
                if(ret !== undefined) {
                    return ret;
                }
            }
            while((parentObjLocation = parentObjLocation.substring(0, parentObjLocation.lastIndexOf("/"))).lastIndexOf("/") > -1)
            return undefined;
        }
        
        var parentObjLocation = objLocation.substring(0, objLocation.lastIndexOf("/"));
        return GetReference(ref, obj, parentObjLocation, ini);        
    }
    if(ref.indexOf("/") !== -1)
    {
        var first = ref.substring(0, ref.indexOf("/"));
        var firstRef = GetReference(first, obj, objLocation, ini);
        var second = ref.substring(ref.indexOf("/") + 1);

        if(first.indexOf("Value") !=- 0 && second.indexOf("Value") === 0 && firstRef.indexOf("/Value") === firstRef.length - 6)
            return GetReference(second.substring(6), obj, firstRef, ini);
        return GetReference(second, obj, firstRef, ini);
    }

    var ret2 = undefined;
    ret = objLocation + "/" + ref;
    var property = GetPropertyByLocation(obj, ret);
    if(property !== undefined) {
        if(property.Value != undefined) {
            property = property.Value
            ret += "/Value";
        }
        if(property.IniLocation !== undefined) {
            ret2 = property.IniLocation;
            var property2 = GetPropertyByLocation(ini, ret2);
            if(property2 !== undefined && property2.Value !== undefined) {
                property = property2.Value
                ret = ret2 + "/Value";
            }
        }
        if(typeof property === "string") {
            if((ret2 = GetReference(property, obj, objLocation, ini)) !== undefined)
                return ret2;
        }
        return ret;
    }
    
    var objValue = GetPropertyByLocation(obj, objLocation)
    if(objValue !== undefined && objValue.IniLocation !== undefined) {
        ret = objValue.IniLocation + "/" + ref;
        property  = GetPropertyByLocation(ini, ret);
        if(property !== undefined) {
            if(property.Value !== undefined) {
                property = property.Value
                ret += "/Value";
            }
            if(typeof property === "string") {
                if((ret2 = GetReference(property, obj, objLocation, ini)) !== undefined)
                    return ret2;
            }
            return ret;
        }

        property = GetPropertyByLocation(ini, objValue.IniLocation);
        if(property && property.IniName) {
            ret = property.IniName + "/" + ref;
            property = GetPropertyByLocation(ini, ret);
            if(property !== undefined) {
                if(property.Value != undefined) {
                    property = property.Value
                    ret += "/Value";
                }
                if(typeof property === "string") {
                    if((ret2 = GetReference(property, obj, objLocation, ini)) !== undefined)
                        return ret2;
                }
                return ret;
            }
        }
    }
    var iniValue = GetPropertyByLocation(ini, objLocation)
    if(iniValue !== undefined) {
        ret = objLocation + "/" + ref;
        property  = GetPropertyByLocation(ini, ret);
        if(property !== undefined) {
            if(property.Value != undefined) {
                property = property.Value
                ret += "/Value";
            }
            if(typeof property === "string") {
                if((ret2 = GetReference(property, obj, objLocation, ini)) !== undefined)
                    return ret2;
            }
            return ret;
        }

        property = GetPropertyByLocation(ini, objLocation);
        if(property && property.IniName) {
            ret = property.IniName + "/" + ref;
            property = GetPropertyByLocation(ini, ret);
            if(property !== undefined) {
                if(property.Value != undefined) {
                    property = property.Value
                    ret += "/Value";
                }
                if(typeof property === "string") {
                    if((ret2 = GetReference(property, obj, objLocation, ini)) !== undefined)
                        return ret2;
                }
                return ret;
            }
        }
    }
    if(Array.isArray(objValue)) {
        for(var i = 0; i < objValue.length; i++) {
            if(objValue[i].Name === ref) {
                return GetReference("" + i, obj, objLocation, ini);
            }
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

function GetValueByReferenceFunction(reference, defaultValue) {
    var f = function() {
        var val = GetValueByReference(reference, this.Obj, this.ObjLocation, this.Ini);
        if(val !== undefined)
            return val; 

        return defaultValue;
    }

    return f;
}
function GetMinFunction() {
    var min = GetValueByReference("Min", this.Obj, this.ObjLocation, this.Ini);
    if(min === undefined) {
        switch(this.GetType()) {
            case "uint8":
            case "uint16":
            case "uint32":
            case "uint64":
            case "bool":
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
            case "double":
            case "formula":
            case "variable":
                min = -340282300000000000000000000000000000000 / this.GetValueMultiplier();
                break;
            default:
                throw "Invalid Type " + this.GetType();
        }
    }
    return min;
}
function GetMaxFunction() {
    var max = GetValueByReference("Max", this.Obj, this.ObjLocation, this.Ini);
    if(max === undefined) {
        switch(this.GetType()) {
            case "bool":
                max = 1;
            case "uint8":
                max = 255 / this.GetValueMultiplier();
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
            case "double":
            case "variable":
            case "formula":
            case "float":
                max = 340282300000000000000000000000000000000 / this.GetValueMultiplier();
                break;
            default:
                throw "Invalid Type " + this.GetType();
        }
    }
    return max;
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
function RemoveFunctionFromObjToObj(obj, functionName, handleObj, handleFunctionName) {
    if(!obj[functionName] || !obj[functionName + "HandlesEFJ"]){
        return;
    }

    var handlePosition = -1;
    $.each(obj[functionName + "HandlesEFJ"], function(index, handle) {
        if(handle.Obj === handleObj && handle.FunctionName === handleFunctionName) {
            handlePosition = index;
        }
    });

    if(handlePosition > -1) 
        obj[functionName + "HandlesEFJ"].splice(handlePosition, 1);
}
function CallObjFunctionIfExists(obj, functionName) {
    if(obj[functionName]) {
        obj[functionName]();
    }
}
