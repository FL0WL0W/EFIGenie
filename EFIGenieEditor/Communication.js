function GetFloatVariableIdList() {
    var variableIds = [];
    for (var property in Increments) {
        if (!Array.isArray(Increments[property]))
            continue;

        var arr = Increments[property];

        for (var i = 0; i < arr.length; i++) {
            if(arr[i].Type === "float" && variableIds.indexOf(arr[i].Id) === -1){
                variableIds.push(arr[i].Id);
            }
        }
    }
    return variableIds;
}

VariableValues = [];
function UpdateFloatVariableValues() {
    const variableIds = GetFloatVariableIdList();

    var responseVariables = getFileContents("test.txt").split("\n");

    for(var i = 0; i < Math.min(responseVariables.length, variableIds.length); i++) {
        VariableValues[variableIds[i]] = parseFloat(responseVariables[i]);
    }
}