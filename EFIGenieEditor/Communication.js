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
                if(variableIds.indexOf(id) === -1)
                    variableIds.push(id);
            }
        } else {
            var id = parseInt(VariableRegister[property]);
            if(isNaN(id))
                continue;
            if(variableIds.indexOf(id) === -1)
                variableIds.push(id);
        }
    }
    return variableIds;
}

var LiveUpdateEvents = [];

var VariableValues = [];
function UpdateFloatVariableValues() {
    const variableIds = GetVariableIdList();
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

            Object.entries(LiveUpdateEvents).forEach(e => {
                var [elementname, element] = e;
                element?.();
            });
        }
      });
}