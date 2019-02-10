class Config {
    constructor(iniNameSpace, ini) {
        if(ini)
            this.ini = ini;
        else {
            this.ini = "Main";
        }
        this.iniNameSpace = iniNameSpace;
    }

    GetArrayBuffer() {
        return getByteArray(this, this.iniNameSpace[this.ini]).buffer;
    }
    SetArrayBuffer(arrayBuffer) {
        return setArrayBuffer(this, this.iniNameSpace[this.ini], arrayBuffer);
    }
}

function iniReferencedByIniRow(ini, reference) {
    referencedBy = [];
    $.each(ini, function(index, iniRow) {
        if(iniRow.XMin === reference 
            || iniRow.XMax === reference 
            || iniRow.YMin === reference 
            || iniRow.YMax === reference 
            || (typeof iniRow.Type === "string" && 
                ((iniRow.Type.split("[").length > 1 && iniRow.Type.split("[")[1].split("]")[0] == reference) 
                || (iniRow.Type.split("[").length > 2 && iniRow.Type.split("[")[2].split("]")[0] == reference)))) {
            referencedBy.push(iniRow);
        }
    });

    return referencedBy;
}

function valueIsReferenceLocation(s) {
    var ret = parseFloat(s);
    if(isNaN(ret))
    {
        return true;
    }
    return false;
}

function parseValueString(obj, s) {
    if(valueIsReferenceLocation(s))
    {
        return parseFloat(obj[s]);
    }

    return parseFloat(s);
}

function iniGetValue(obj, iniRow, iniIndex) {
    var value;

    switch(iniGetLocation(obj, iniRow, iniIndex)) { 
        case "static":
            break;
        default:
            value = obj[iniRow.Location];
    }
    if(typeof iniRow.Type === "string")
    {
        var prevVal = value;

        if(iniRow.Type.split("[").length == 2) {
            var arrayLen = parseValueString(obj, iniRow.Type.split("[")[1].split("]")[0]);
            var xMin = parseValueString(obj, iniRow.XMin);
            var xMax = parseValueString(obj, iniRow.XMax);
            if(!prevVal || arrayLen !== prevVal.length || prevVal.XMin !== xMin || prevVal.XMax !== xMax)
            {
                switch(iniRow.Type.split("[")[0]) {
                    case "formula":
                        arrayLen++;
                        if(prevVal && arrayLen === prevVal.length)
                            break;
                    case "uint8":
                    case "uint16":
                    case "uint32":
                    case "int8":
                    case "int16":
                    case "int32":
                    case "float":
                        value = new Array(arrayLen);
                        value.XMin = xMin;
                        value.XMax = xMax;
                        //to default for now. change this to interpolate the table later.
                        $.each(value, function(index, valuevalue) {
                            value[index] = iniRow.DefaultValue;
                        });
                        break;
                }
            }
        }

        if(!prevVal)
        {
            if(iniRow.Type.split("[").length == 2) {
                $.each(value, function(index, valuevalue) {
                    value[index] = iniRow.DefaultValue;
                })
            } else {
                value = iniRow.DefaultValue;
            }
        }
    }

    return value;
}

function iniSetValue(obj, iniRow, iniIndex, value) {
    if(typeof iniRow.Type === "string") {
        switch(iniGetLocation(obj, iniRow, iniIndex)) { 
            case "static":
                break;
            default:
                obj[iniRow.Location] = value;
        }
    } else {
        if(!obj[iniRow.Location])
            obj[iniRow.Location] = new ConfigGui(obj.iniNameSpace, iniRow.Ini);
        else
            obj[iniRow.Location].ini = iniRow.Ini;
        return setArrayBuffer(obj[iniRow.Location], obj.iniNameSpace[iniRow.Ini], value);
    }
}

function iniGetMin(obj, iniRow) {
    var min = iniRow.Min;

    if(!min && typeof iniRow.Type === "string") {
         switch(iniRow.Type.split("[")[0]) {
             case "uint8":
             case "uint16":
             case "uint32":
                 min = 0;
                 break;
            case "int8":
                min = -128;
                break;
            case "int16":
                min = -32768;
                break;
            case "int32":
                min = -2147483648;
                break;
            case "float":
            case "formula":
                min = -3.402823e+38;
                break;
         }
    }

    return min;
}

function iniGetMax(obj, iniRow) {
    var max = iniRow.Max;

    if(!max && typeof iniRow.Type === "string") {
        switch(iniRow.Type.split("[")[0]) {
            case "uint8":
            case "uint16":
            case "uint32":
                max = 0;
                break;
            case "int8":
                max = 127;
                break;
            case "int16":
                max = 32767;
                break;
            case "int32":
                max = 2147483647;
                break;
            case "float":
            case "formula":
                max = 3.402823e+38;
                break;
        }
    }

    return max;
}

function iniGetStep(obj, iniRow) {
    var step = iniRow.Step;

    if(!step && typeof iniRow.Type === "string") {
        switch(iniRow.Type.split("[")[0]) {
            case "uint8":
            case "uint16":
            case "uint32":
            case "int8":
            case "int16":
            case "int32":
                step = 1;
                break;
            case "float":
            case "formula":
                step = 0.01;
                break;
        }
    }

    return step;
}

function iniGetLabel(obj, iniRow) {
    return iniRow.Label;
}

function iniGetLocation(obj, iniRow, iniIndex) {
    var location = iniRow.Location;

    if(!location) {
        location = "Location" + iniIndex;
    }

    return location;
}

function getByteArray(obj, ini) {
    var byteArray = new Uint8Array();
    $.each(ini, function(iniIndex, iniRow){
        var value = iniGetValue(obj, iniRow, iniIndex);
        
        if(typeof iniRow.Type === "string")
        {
            switch(iniRow.Type) {
                case "bool":
                case "uint8":
                    byteArray = byteArray.concatArray(new Uint8Array([value]));
                    break;
                case "uint16":
                    byteArray = byteArray.concatArray(new Uint8Array(new Uint16Array([value]).buffer));
                    break;
                case "uint32":
                    byteArray = byteArray.concatArray(new Uint8Array(new Uint32Array([value]).buffer));
                    break;
                case "int8":
                    byteArray = byteArray.concatArray(new Uint8Array(new Int8Array([value]).buffer));
                    break;
                case "int16":
                    byteArray = byteArray.concatArray(new Uint8Array(new Int16Array([value]).buffer));
                    break;
                case "int32":
                    byteArray = byteArray.concatArray(new Uint8Array(new Int32Array([value]).buffer));
                    break;
                case "float":
                    byteArray = byteArray.concatArray(new Uint8Array(new Float32Array([value]).buffer));
                    break;
                case "iniselection":
                    byteArray = byteArray.concatArray(new Uint8Array(value.Value.GetArrayBuffer()));
                    break;
                default:
                    if(iniRow.Type.indexOf("[") > -1) {
                        switch(iniRow.Type.split("[")[0]) {
                            case "uint8":
                                byteArray = byteArray.concatArray(new Uint8Array(value));
                                break;
                            case "uint16":
                            byteArray = byteArray.concatArray(new Uint8Array(new Uint16Array(value).buffer));
                                break;
                            case "uint32":
                            byteArray = byteArray.concatArray(new Uint8Array(new Uint32Array(value).buffer));
                                break;
                            case "int8":
                            byteArray = byteArray.concatArray(new Uint8Array(new Int8Array(value).buffer));
                                break;
                            case "int16":
                            byteArray = byteArray.concatArray(new Uint8Array(new Int16Array(value).buffer));
                                break;
                            case "int32":
                            byteArray = byteArray.concatArray(new Uint8Array(new Int32Array(value).buffer));
                                break;
                            case "formula":
                            case "float":
                                byteArray = byteArray.concatArray(new Uint8Array(new Float32Array(value).buffer));
                                break;
                        }
                    } else {
                        throw "getByteArray Value Invalid";
                    }
                    break;
            }
        } else {
            byteArray = byteArray.concatArray(new Uint8Array(value.GetArrayBuffer()));
        }
    });

    return byteArray;
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