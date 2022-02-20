function GetVariableIdList() {
    var variableIds = [];
    for (var property in VariableRegister) {
        if (VariableRegister[property] === undefined)
            continue;

        if(property === `VariableIncrement`)
            continue;

        if (Array.isArray(VariableRegister[property])) {
            var arr = VariableRegister[property];

            for (var i = 0; i < arr.length; i++) {
                var id = arr[i].Id;
                if(isNaN(id))
                    continue;
                if(arr[i].Type !== "float" && arr[i].Type !== "bool")
                    continue;
                if(variableIds.indexOf(id) === -1) {
                    variableIds.push(id);
                }
            }
        } else {
            var id = parseInt(VariableRegister[property]);
            if(isNaN(id))
                continue;
            if(variableIds.indexOf(id) === -1){
                variableIds.push(id);
            }
        }
    }
    return variableIds;
}

function compareVariableIds(a, b) {
    if(a.length !== b.length)
        return false;
    
    for(var i = 0; i < a.length; i++){
        if(a[i] !== b[i])
            return false;
    }
    
    return true;
}

var LiveUpdateEvents = [];

var VariableMetadata;
var CurrentVariableValues = [];
var LoggedVariableValues = [];
var LogFile
var previousVariableIds = []
function UpdateFloatCurrentVariableValues() {
    const variableIds = GetVariableIdList();
    if(!compareVariableIds(variableIds, previousVariableIds)){
        LogFile = lzjs.compress(JSON.stringify(VariableRegister.GetVariableReferenceList()));
        LogFile = `${new Uint32Array([LogFile.length]).buffer.toRawString()}${LogFile}`
        LogFile += new Uint32Array([variableIds.Length]).buffer.toRawString() + new Uint32Array(variableIds).buffer.toRawString();
        LoggedVariableValues = [];
        previousVariableIds = variableIds;
    }
    var offsets = []
    for(var i = 0; i < variableIds.length; i++) offsets[i] = 0;

    $.ajax({
        type: `POST`,
        url: `http://127.0.0.1:8080/GetVariable`,
        data: {
            Variables: variableIds,
            Offsets: offsets
        },
        success: function(data) {
            var responseVariables = data.split(`\n`);
            LogFile += atob(responseVariables[0]);
            for(var i = 1; i < Math.min(responseVariables.length, variableIds.length + 1); i++) {
                var voidValue = responseVariables[i] === undefined || !responseVariables[i].replace(/\s/g, '').length || responseVariables[i] === `VOID`

                if(responseVariables[i] === `True`)
                    CurrentVariableValues[variableIds[i-1]] = true;
                else if(responseVariables[i-1] === `False`)
                    CurrentVariableValues[variableIds[i]] = false;
                else
                    CurrentVariableValues[variableIds[i-1]] = voidValue? undefined : parseFloat(responseVariables[i]);
            }

            LoggedVariableValues.push(CurrentVariableValues);

            Object.entries(LiveUpdateEvents).forEach(e => {
                var [elementname, element] = e;
                element?.();
            });
        }
      });
}

var blob
$.ajax({
    type: `GET`,
    url: `http://127.0.0.1:8080/GetVariableMetaData`,
    success: function(data) {
        VariableMetadata = new VariableRegistry(JSON.parse(lzjs.decompressFromBase64(data)));
        VariableMetadata.CreateIfNotFound = false;
        setInterval(UpdateFloatCurrentVariableValues, 100);
    }
});