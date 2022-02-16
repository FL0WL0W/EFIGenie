function GetFloatVariableIdList() {
    var variableIds = [];
    for (var property in VariableRegister) {
        if (!Array.isArray(VariableRegister[property]))
            continue;

        var arr = VariableRegister[property];

        for (var i = 0; i < arr.length; i++) {
            if(arr[i].Type === `float` && variableIds.indexOf(arr[i].Id) === -1){
                variableIds.push(arr[i].Id);
            }
        }
    }
    return variableIds;
}

VariableValues = [];
function UpdateFloatVariableValues() {
    const variableIds = GetFloatVariableIdList();
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
            for(var i = 0; i < Math.min(responseVariables.length, variableIds.length); i++) {
                var voidValue = responseVariables[i] === undefined || !responseVariables[i].replace(/\s/g, '').length || responseVariables[i] === `VOID`

                if(responseVariables[i] === `True`)
                    VariableValues[variableIds[i]] = true;
                else if(responseVariables[i] === `False`)
                    VariableValues[variableIds[i]] = false;
                else
                    VariableValues[variableIds[i]] = voidValue? undefined : parseFloat(responseVariables[i]);
            }
        }
      });

    // for(var i = 0; i < Math.min(responseVariables.length, variableIds.length); i++) {
    //     VariableValues[variableIds[i]] = parseFloat(responseVariables[i]);
    // }
}