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

var CurrentVariableValues = [];
var LoggedVariableValues = [];
var LogFile = ``
function UpdateFloatCurrentVariableValues() {
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
            atob(responseVariables[0]);
            for(var i = 1; i < Math.min(responseVariables.length, variableIds.length + 1); i++) {
                var voidValue = responseVariables[i] === undefined || !responseVariables[i].replace(/\s/g, '').length || responseVariables[i] === `VOID`

                if(responseVariables[i] === `True`)
                    CurrentVariableValues[variableIds[i-1]] = true;
                else if(responseVariables[i-1] === `False`)
                    CurrentVariableValues[variableIds[i]] = false;
                else
                    CurrentVariableValues[variableIds[i-1]] = voidValue? undefined : parseFloat(responseVariables[i]);
            }

            LoggedVariableValues.push({ Tick: CurrentVariableValues[VariableRegister.CurrentTickId], VariableValue: CurrentVariableValues });

            Object.entries(LiveUpdateEvents).forEach(e => {
                var [elementname, element] = e;
                element?.();
            });
        }
      });
}