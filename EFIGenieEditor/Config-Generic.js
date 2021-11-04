var GenericConfigs = [];

OperationArchitectureFactoryIDs = {
    Offset :            10000   ,
    Table :             1       ,
    LookupTable:        2       ,
    Polynomial:         3       ,
    Static:             5       ,
    FaultDetection:     6       ,
    Add:                10      ,
    Subtract:           11      ,
    Multiply:           12      ,
    Divide:             13      ,
    And:                14      ,
    Or:                 15      ,
    GreaterThan:        16      ,
    LessThan:           17      ,
    Equal:              18      ,
    GreaterThanOrEqual: 19      ,
    LessThanOrEqual:    20
}

class ConfigOperation_Static extends UITemplate {
    static Name = "Static";
    static Output = "float";
    static Inputs = [];
    static Measurement = "Selectable";
    static ValueLabel = "Value";
    static ValueMeasurement = "None";
    static Template = getFileContents("ConfigGui/Operation_Static.html");

    Default = true;
    UIValue = undefined;

    constructor(prop) {
        super(prop);
        var thisClass = this;

        this.UIValue = new UIInputNumberWithMeasurement({
            OnChange: function(value) { thisClass.Default = false; }
        });

        this.Elements = { Value: this.UIValue };
    }

    IsDefault() {
        return this.Default;
    }
    
    GetObjOperation() {
        return { value: [{ type: "Operation_StaticVariable", value: this.UIValue.GetValue() }]};
    }

    GetObjParameters() {
        return { value: []};
    }

    GetElementHtml() {
        return this.GetHtml();
    }
}
GenericConfigs.push(ConfigOperation_Static);

function TableGetType() {
    var min = 0;
    max 
    for(var i = 0; i < tableValue.length; i++) {
        if(tableValue[i] % 1 != 0){
            type = "FLOAT";
            typeId = 9;
            break;
        }
        if(min === undefined || tableValue[i] < min){
            min = tableValue[i];
        }
        if(max === undefined || tableValue[i] < max){
            max = tableValue[i];
        }
    }
    if(this.Type == "checkbox") {
        type = "BOOL"
        typeId = 11;
    }
    if(!type){
    }
}

class ConfigOperation_LookupTable extends UITemplate {
    static Name = "Lookup Table";
    static Output = "float";
    static Inputs = ["float"];
    static Measurement = "Selectable";
    static ValueLabel = "Value";
    static ValueMeasurement = "None";
    static Template = "$Value$"

    UITableDialog = undefined;
    UITable = undefined;
    UIParameterSelection = undefined;
    UIValueLabel = undefined;

    Default = true;
    XLabel = "";

    constructor(prop){
        super(prop);
        Object.assign(this, prop);
        var thisClass = this;

        this.UITable = new UITable({
            YResolution: 1,
            YResolutionModifiable: false,
            XLabel: this.NoParameterSelection? this.XLabel : "$ParameterSelection$",
            ZLabel: "$ValueLabel$",
            OnChange: function(value) { thisClass.Default = false; }
        });
        this.UITableDialog = new UIDialog({
            Title: GetClassProperty(this, "ValueLabel"),
            ButtonText: "Edit Table"
        }, this.UITable );
        this.UIParameterSelection = this.NoParameterSelection? undefined : new UISelection({
            Options: GetSelections()
        }),
        this.UIValueLabel = new UIText({
            Text: GetClassProperty(this, "ValueLabel") + GetUnitDisplay(Measurements[GetClassProperty(this, "ValueMeasurement")])
        })

        this.Elements = { 
            Value: new UILabel({
                Label: "$ValueLabel$"
            }, this.UITableDialog),
            ParameterSelection: this.UIParameterSelection,
            ValueLabel: this.UIValueLabel
        };
    }

    SetValueLabel(valueLabel){
        this.ValueLabel = valueLabel;
        this.UIValueLabel.SetText(GetClassProperty(this, "ValueLabel") + GetUnitDisplay(Measurements[GetClassProperty(this, "ValueMeasurement")]));
        this.UITableDialog.Title = GetClassProperty(this, "ValueLabel");
    }

    IsDefault() {
        return this.Default;
    }

    GetObjOperation() {
        var table = this.GetValue().Value;
        var tableValue = table.Value;
        var type;
        var typeId;
        var min;
        var max;

        

        return { value: [
            { type: "UINT32", value: OperationArchitectureFactoryIDs.Offset + OperationArchitectureFactoryIDs.LookupTable }, //factory ID
            { type: "FLOAT", value: table.MinX }, //MinXValue
            { type: "FLOAT", value: table.MaxX }, //MaxXValue
            { type: "UINT8", value: table.XResolution }, //XResolution
            { type: "UINT8", value: typeId }, //Type
            { type: type, value: tableValue }, //Table
        ]};
    }

    GetObjParameters() {
        if(!this.NoParameterSelection) {
            return { value: [
                { type: "UINT8", value: 0 }, //variable
                { type: "UINT32", value: Increments[this.ParameterSelection.reference].find(a => a.Name === this.ParameterSelection.value && a.Measurement === this.ParameterSelection.measurement).Id }
            ]};
        }

        return { value: []};
    }
}
GenericConfigs.push(ConfigOperation_LookupTable);

class ConfigOperation_2AxisTable extends UITemplate {
    static Name = "2 Axis Table";
    static Output = "float";
    static Inputs = ["float", "float"];
    static Measurement = "Selectable";
    static ValueLabel = "Value";
    static ValueMeasurement = "None";
    static Template = "$Value$"

    UITableDialog = undefined;
    UITable = undefined;
    UIXSelection = undefined;
    UIYSelection = undefined;
    UIValueLabel = undefined;

    Default = true;
    XLabel = "";
    YLabel = "";

    constructor(prop){
        super(prop);
        Object.assign(this, prop);
        var thisClass = this;

        this.UITable = new UITable({
            XLabel: this.NoParameterSelection? this.XLabel : "$XSelection$",
            YLabel: this.NoParameterSelection? this.YLabel : "$YSelection$",
            ZLabel: "$ValueLabel$",
            OnChange: function(value) { thisClass.Default = false; }
        });
        this.UITableDialog = new UIDialog({
            Title: GetClassProperty(this, "ValueLabel"),
            ButtonText: "Edit Table"
        }, this.UITable );
        this.UIXSelection = this.NoParameterSelection? undefined : new UISelection({
            Options: GetSelections()
        }),
        this.UIYSelection = this.NoParameterSelection? undefined : new UISelection({
            Options: GetSelections()
        }),
        this.UIValueLabel = new UIText({
            Text: GetClassProperty(this, "ValueLabel") + GetUnitDisplay(Measurements[GetClassProperty(this, "ValueMeasurement")])
        })

        this.Elements = { 
            Value: new UILabel({
                Label: "$ValueLabel$"
            }, this.UITableDialog),
            XSelection: this.UIXSelection,
            YSelection: this.UIYSelection,
            ValueLabel: this.UIValueLabel
        };
    }

    SetValueLabel(valueLabel){
        this.ValueLabel = valueLabel;
        this.UIValueLabel.SetText(GetClassProperty(this, "ValueLabel") + GetUnitDisplay(Measurements[GetClassProperty(this, "ValueMeasurement")]));
        this.UITableDialog.Title = GetClassProperty(this, "ValueLabel");
    }

    IsDefault() {
        return this.Default && this.Table.IsDefault();
    }

    GetObjOperation() {
        var table = this.GetValue().Value;
        var tableValue = table.Value;
        var type;
        var typeId;
        var min;
        var max;

        for(var i = 0; i < tableValue.length; i++) {
            if(tableValue[i] % 1 != 0){
                type = "FLOAT";
                typeId = 9;
                break;
            }
            if(min === undefined || tableValue[i] < min){
                min = tableValue[i];
            }
            if(max === undefined || tableValue[i] < max){
                max = tableValue[i];
            }
        }
        if(this.Type == "checkbox") {
            type = "BOOL"
            typeId = 11;
        }
        if(!type){
            if(min < 0) {
                if(max < 128 && min > -129) {
                    typeId = 5;
                    type = "INT8";
                } else if(max < 32768 && min > -32759) {
                    typeId = 6;
                    type = "INT16";
                } else if(max < 2147483648 && min > -2147483649) {
                    typeId = 7;
                    type = "INT32";
                } else if(val < 9223372036854775807 && val > -9223372036854775808){
                    typeId = 8;
                    type = "INT64";
                } else {
                    throw "number too big";
                }
            } else {
                if(max < 256) {
                    type = "UINT8";
                    typeId = 1;
                } else if(max < 65536) {
                    type = "UINT16";
                    typeId = 2;
                } else if(max < 4294967295) {
                    type = "UINT32";
                    typeId = 3;
                } else if(val < 18446744073709551615) {
                    type = "UINT64";
                    typeId = 4;
                } else {
                    throw "number too big";
                }
            }
        }

        return { value: [
            { type: "UINT32", value: OperationArchitectureFactoryIDs.Offset + OperationArchitectureFactoryIDs.Table }, //factory ID
            { type: "FLOAT", value: table.MinX }, //MinXValue
            { type: "FLOAT", value: table.MaxX }, //MaxXValue
            { type: "FLOAT", value: table.MinY }, //MinYValue
            { type: "FLOAT", value: table.MaxY }, //MaxYValue
            { type: "UINT8", value: table.XResolution }, //XResolution
            { type: "UINT8", value: table.YResolution }, //YResolution
            { type: "UINT8", value: typeId }, //Type
            { type: type, value: tableValue }, //Table
        ]};
    }

    GetObjParameters() {
        if(!this.NoParameterSelection) {
            return { value: [
                { type: "UINT8", value: 0 }, //variable
                { type: "UINT32", value: Increments[this.XSelection.reference].find(a => a.Name === this.XSelection.value && a.Measurement == this.XSelection.measurement).Id },
                { type: "UINT8", value: 0 }, //variable
                { type: "UINT32", value: Increments[this.YSelection.reference].find(a => a.Name === this.YSelection.value && a.Measurement == this.YSelection.measurement).Id }
            ]};
        }
        return { value: []};
    }
}
GenericConfigs.push(ConfigOperation_2AxisTable);

function GetSelections(measurement, configs) {
    var selections = [];
    if(configs) {
        var calculations = { Group: "Calculations", Options: [] }
        for(var i = 0; i < configs.length; i++) {
            calculations.Options.push({
                Name: configs[i].Name,
                Value: JSON.stringify({value: configs[i].Name})
            });
        }
        selections.push(calculations);
    }
    
    for(var property in Increments){
        if(!Array.isArray(Increments[property]))
            continue;
        if(property === "PostEvent")
            continue;
        if(property === "LiveUpdate")
            continue;

        var arr = Increments[property];
        
        var arrSelections = { Group: property, Options: []};

        for(var i = 0; i < arr.length; i++) {
            if(!measurement || arr[i].Measurement === measurement) {
                arrSelections.Options.push({
                    Name: arr[i].Name + (!measurement? " [" + GetUnitDisplay(arr[i].Measurement) + "]" : ""),
                    Value: JSON.stringify({reference: property, value: arr[i].Name, measurement: arr[i].measurement})
                });
            }
        }
    }

    return selections;
}

class ConfigOrVariableSelection extends UITemplate {
    static Template = "$Selection$";//getFileContents("ConfigGui/ConfigOrVariableSelection.html");

    constructor(prop){
        super(prop);
        Object.assign(this, prop);
        var thisClass = this;

        this.Elements = {
            Selection: new UISelection({
                Options: GetSelections()
            })
        }
    }

    Configs = undefined;
    ConfigValues = [];
    ValueLabel = undefined;
    ValueMeasurement = undefined;
    VariableListName = undefined;
    Selection = undefined;

    GetSubConfig() {
        var i;
        for(i = 0; i < this.ConfigValues.length; i++) {
            if(GetClassProperty(this.ConfigValues[i], "Name") === this.Selection.value) {
                return this.ConfigValues[i];
            }
        }
        for(var i = 0; i < this.Configs.length; i++)
        {
            if(GetClassProperty(this.Configs[i], "Name") !== this.Selection.value)
                continue;
            this.ConfigValues.push(new this.Configs[i]());
            this.ConfigValues[this.ConfigValues.length-1].ValueLabel = this.ValueLabel;
            this.ConfigValues[this.ConfigValues.length-1].ValueMeasurement = this.ValueMeasurement;
            if(this.ValueMeasurement === "Bool")
                this.ConfigValues[this.ConfigValues.length-1].Type = "checkbox";
            else
                this.ConfigValues[this.ConfigValues.length-1].Type = "number";
            return this.ConfigValues[this.ConfigValues.length-1];
        }
    }

    GetObj() {
        var obj = { 
            Selection: this.Selection
        };

        if(this.ConfigValues) { 
            obj.Values = [];
            for(var i = 0; i < this.ConfigValues.length; i++){
                if(!this.ConfigValues[i].IsDefault || !this.ConfigValues[i].IsDefault())
                    obj.Values.push(this.ConfigValues[i].GetObj());
            }
        }

        return obj;
    }

    SetObj(obj) {
        this.Detach();

        if(obj)
            this.Selection = obj.Selection;

        if(this.Selection && !this.Selection.reference) {
            for(var i = 0; i < obj.Values.length; i++) {
                var found = false;
                for(var t = 0; t < this.ConfigValues.length; t++) {
                    if(GetClassProperty(this.ConfigValues[t], "Name") === obj.Values[i].Name) {
                        this.ConfigValues[t].SetObj(obj.Values[i]);
                        found = true;
                        break;
                    }
                }
                if(!found){
                    for(var t = 0; t < this.Configs.length; t++)
                    {
                        if(GetClassProperty(this.Configs[t], "Name") !== obj.Values[i].Name)
                            continue;
                        this.ConfigValues.push(new this.Configs[t]());
                        this.ConfigValues[this.ConfigValues.length-1].ValueLabel = this.ValueLabel;
                        this.ConfigValues[this.ConfigValues.length-1].ValueMeasurement = this.ValueMeasurement;
                        if(this.ValueMeasurement === "Bool")
                            this.ConfigValues[this.ConfigValues.length-1].Type = "checkbox";
                        else
                            this.ConfigValues[this.ConfigValues.length-1].Type = "number";
                        this.ConfigValues[this.ConfigValues.length-1].SetObj(obj.Values[i]);
                    }
                }
            }
        }

        $("#" + this.GUID).replaceWith(this.GetHtml());
        this.Attach();
    }
    
    GetCellByName(array, name) {
        if(!array)
            return undefined;
        for(var i = 0; i < array.length; i++) {
            if(name && name === array[i].Name && this.ValueMeasurement === array[i].Measurement)
                return array[i];
        }
        return undefined;
    }

    Id = -1;
    SetIncrements() {
        // var thisClass = this;
        // if(!Increments.PostEvent)
        //     Increments.PostEvent = [];
        // Increments.PostEvent.push(function() { thisClass.UpdateSelections(); });

        // if(!Increments.LiveUpdate)
        //     Increments.LiveUpdate = [];
        // Increments.LiveUpdate.push(function(variables) { thisClass.LiveUpdate(variables); });

        // if(this.Selection && this.VariableListName) {
        //     if(Increments[this.VariableListName] === undefined)
        //         Increments[this.VariableListName] = [];

        //     if(!this.Selection.reference) {
        //         var subConfig = this.GetSubConfig();
        //         if(GetClassProperty(subConfig, "Output")) {
        //             this.Id = 1;
        //             if(Increments.VariableIncrement === undefined)
        //                 Increments.VariableIncrement = 1;
        //             else
        //                 this.Id = ++Increments.VariableIncrement;

        //             if(subConfig.SetIncrements)
        //                 subConfig.SetIncrements();
                        
        //             Increments[this.VariableListName].push({ 
        //                 Name: this.ValueLabel, 
        //                 Id: this.Id,
        //                 Type: GetClassProperty(subConfig, "Output"),
        //                 Measurement: this.ValueMeasurement
        //             });
        //         }
        //     } else {
        //         var cell = this.GetCellByName(Increments[this.Selection.reference], this.Selection.value);
        //         if(cell) {
        //             Increments[this.VariableListName].push({ 
        //                 Name: this.ValueLabel, 
        //                 Id: cell.Id,
        //                 Type: cell.Type,
        //                 Measurement: this.ValueMeasurement
        //             });
        //         }
        //     }
        // }
    }
    
    IsImmediateOperation() {
        var selection = JSON.parse(this.GetValue().Selection);
        return selection && selection.reference;
    }

    GetObjAsParameter(subOperationId) {
        //if immediate operation
        if(this.IsImmediateOperation()) {     
            return { value: [
                { type: "OperationParameter", value: subOperationId }, //use first suboperation
            ]};
        }

        var cell = this.GetCellByName(Increments[this.Selection.reference], this.Selection.value);
        return { value: [
            { type: "VariableParameter", value: cell.Id }, //ID
        ]};
    }
    
    GetObjOperation() {
        //if immediate operation
        if(this.IsImmediateOperation()) {
            return { value: [{ obj: this.GetSubConfig().GetObjOperation() }]};
        }

        return { value: []};
    }

    GetObjParameters() {
        //if immediate operation
        if(this.IsImmediateOperation()) {
            return { value: [{ obj: this.GetSubConfig().GetObjParameters() }]};
        }

        return { value: []};
    }

    GetObjPackage(subOperation){
        //if immediate operation
        if(this.IsImmediateOperation()) {      
            var subConfig = this.GetSubConfig();
            if(Increments.VariableIncrement === undefined && GetClassProperty(subConfig, "Output"))
                throw "Set Increments First";
            if(this.Id === -1 && GetClassProperty(subConfig, "Output"))
                throw "Set Increments First";

            var obj  = {value: [
                    { type: "PackageOptions", value: { Immediate: true, Store: true, Return: subOperation && GetClassProperty(subConfig, "Output") }}, //immediate and store variable, return if subOperation
                    { obj: subConfig.GetObjOperation() }
                ]};
            
            if(GetClassProperty(subConfig, "Output"))
                obj.value.push({ type: "UINT32", value: this.Id });

            obj.value.push({ obj: subConfig.GetObjParameters() });

            return obj;
        }  
                
        return { value: []};
    }
}