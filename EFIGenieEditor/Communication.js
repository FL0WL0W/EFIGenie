function GetVariableIdList() {
    var variableIds = [];
    const currentTickId = VariableMetadata.GetVariableId(`CurrentTickId`);
    if(currentTickId)
        variableIds.push(currentTickId);
    for (var variableReference in VariablesToPoll) {
        const variableId = VariableMetadata.GetVariableId(VariablesToPoll[variableReference]);
        if(variableId !== undefined && variableIds.indexOf(variableId) === -1)
            variableIds.push(variableId);
    }
    return variableIds;
}
var VariablesToPoll = [];

function compareVariableIds(a, b) {
    if(a.length !== b.length)
        return false;
    
    for(var i = 0; i < a.length; i++){
        if(a[i] !== b[i])
            return false;
    }
    
    return true;
}

function GetVariableLogArrayBuffer() {

    var objectArray = base64ToArrayBuffer(lzjs.compressToBase64(stringifyObject(VariableMetadata.GetVariableReferenceList())));
    return (new Uint32Array([objectArray.byteLength]).buffer).concatArray(objectArray).concatArray(LogBytes);
}

var LiveUpdateEvents = [];

var VariableMetadata;
var CurrentVariableValues = [];
var LoggedVariableValues = [];
var LogBytes = new ArrayBuffer();
var previousVariableIds = []
function UpdateFloatCurrentVariableValues() {
    const variableIds = GetVariableIdList();
    if(variableIds.length < 1)
        return;
    if(!compareVariableIds(variableIds, previousVariableIds)){
        LogBytes = new ArrayBuffer();
        LoggedVariableValues = [];
        previousVariableIds = variableIds;
    }
    var offsets = []
    for(var i = 0; i < variableIds.length; i++) offsets[i] = -1;

    postJSONData(`http://127.0.0.1:8080/GetVariable`, {
        Variables: variableIds,
        Offsets: offsets
    }).then(data => {
        var responseVariables = data.split(`\n`);
        LogBytes = LogBytes.concatArray(base64ToArrayBuffer(responseVariables[0]));
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
    });
}

fetch(`http://127.0.0.1:8080/GetVariableMetaData`).then(response => response.text()).then(data => {
    VariableMetadata = new VariableRegistry(JSON.parse(lzjs.decompressFromBase64(data)));
    VariableMetadata.CreateIfNotFound = false;
    setInterval(UpdateFloatCurrentVariableValues, 100);
});

function burnBin(arrayBuffer) {
    postArrayBufferData(`http://127.0.0.1:8080/BurnConfig`, arrayBuffer);
}