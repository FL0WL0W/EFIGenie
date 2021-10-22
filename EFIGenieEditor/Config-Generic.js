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

var configOperation_StaticTemplate;
class ConfigOperation_Static {
    static Name = "Static";
    static Output = "float";
    static Inputs = [];
    static Measurement = "Selectable";
    static ValueLabel = "Value";
    static ValueMeasurement = "None";
    static Template = getFileContents("ConfigGui/Operation_Static.html");

    constructor(){
        this.GUID = getGUID();
    }

    Type = "number";
    Value = 0;
    Default = true;

    IsDefault() {
        return this.Default;
    }

    GetObj() {
        return {
            Name: this.constructor.Name,
            Type: this.Type,
            Value: this.Value
        };
    }

    SetObj(obj) {
        if(obj) {
            this.Default = false;
            this.Type = obj.Type;
            this.Value = obj.Value;
        }
        $("#" + this.GUID).replaceWith(this.GetElementHtml());
    }

    Detach() {
        $(document).off("change."+this.GUID);
    }

    Attach() {
        this.Detach();
        var thisClass = this;
        
        $(document).on("change."+this.GUID, "#" + this.GUID + "-type", function(){
            thisClass.Type =$(this).val();

            $("#" + thisClass.GUID + "-value").type = thisClass.Type;
            if(thisClass.Type == "checkbox")
                $("#" + this.GUID + "-value").prop('checked', thisClass.Value = thisClass.Value !== 0);
            else
                $("#" + this.GUID + "-value").val(thisClass.Value = thisClass.Value? 1 : 0);
            thisClass.Default = false;
        });

        $(document).on("change."+this.GUID, "#" + this.GUID + "-value", function(){
            if(thisClass.Type == "checkbox")
                thisClass.Value = $(this).prop('checked');
            else
                thisClass.Value = parseFloat($(this).val());
            thisClass.Default = false;
        });
    }
    
    GetHtml() {
        return "<label for=\"" + this.GUID + "-value\">" + GetClassProperty(this, "ValueLabel") + ":</label>" + this.GetElementHtml();
    }

    GetElementHtml() {
        var template = GetClassProperty(this, "Template");

        template = template.replace(/[$]id[$]/g, this.GUID);
        template = template.replace(/[$]type[$]/g, this.Type);
        template = template.replace(/[$]value[$]/g, this.Type==="checkbox" ? (this.Value? "checked" : "") : "value=\"" + this.Value + "\"");
        template = template.replace(/[$]valuemeasurement[$]/g, GetUnitDisplay(Measurements[GetClassProperty(this, "ValueMeasurement")]));
        template = template.replace(/[$]numberselected[$]/g, this.Type==="number" ? " selected" : "");
        template = template.replace(/[$]boolselected[$]/g, this.Type==="checkbox" ? " selected" : "");

        return template;
    }

    GetObjOperation() {
        return { value: [{ type: "Operation_StaticVariable", value: this.Value }]};
    }

    GetObjParameters() {
        return { value: []};
    }
}

GenericConfigs.push(ConfigOperation_Static);

class ConfigOperation_LookupTable {
    static Name = "Lookup Table";
    static Output = "float";
    static Inputs = ["float"];
    static Measurement = "Selectable";
    static ValueLabel = "Value";
    static ValueMeasurement = "None";
    static Template = getFileContents("ConfigGui/Operation_LookupTable.html");

    NoParamaterSelection = false;
    ParameterSelection = undefined;
    Type = "number";
    Table = undefined;
    XLabel = "";
    Default = true;

    constructor(noParamaterSelection){
        this.GUID = getGUID();
        this.Table = new Table(getGUID(), {
            YResolution: 1,
            YResolutionModifiable: false
        });
        if(noParamaterSelection)
            this.NoParamaterSelection = true;
    }

    IsDefault() {
        return this.Default && this.Table.IsDefault();
    }

    GetObj() {
        return {
            Name: this.constructor.Name,
            Type: this.Type,
            Value: this.Table.Value,
            MinX: this.Table.MinX,
            MaxX: this.Table.MaxX,
            Resolution: this.Table.XResolution,
            ParameterSelection: this.NoParamaterSelection? undefined : this.ParameterSelection
        };
    }

    SetObj(obj) {
        if(obj) {
            this.Type = obj.Type;
            this.Table.SetXResolution(obj.Resolution);
            this.Table.MinX = obj.MinX;
            this.Table.MaxX = obj.MaxX;
            this.Table.Value = obj.Value;
            if(!this.NoParamaterSelection)
                this.ParameterSelection = obj.ParameterSelection;
        }
        $("#" + this.GUID).replaceWith(this.GetElementHtml());
    }

    Attach() {
        this.Detach();
        var thisClass = this;

        $(document).on("click."+this.GUID, "#" + this.GUID + "-edit", function(){
            $("#" + thisClass.GUID + "-dialog").dialog({ width:'auto', modal:true, title: thisClass.ZLabel });
        });
        
        if(!this.NoParamaterSelection) {
            $(document).on("change."+this.GUID, "#" + this.GUID + "-parameterselection", function(){
                var val = $(this).val();
                thisClass.ParameterSelection = {reference: $('option:selected', this).attr('reference'), value: val, measurement: $('option:selected', this).attr('measurement')};
                thisClass.UpdateTable();
                thisClass.Default = false;
            });
        }
        
        this.Table.Attach();
    }

    Detach() {
        $(document).off("click."+this.GUID);
        $(document).off("change."+this.GUID);
        this.Table.Detach();
    }

    GetHtml() {
        return "<label for=\"" + this.GUID + "-edit\">" + GetClassProperty(this, "ValueLabel") + ":</label>" + this.GetElementHtml();
    }

    GetElementHtml() {
        var template = GetClassProperty(this, "Template");

        template = template.replace(/[$]id[$]/g, this.GUID);
        template = template.replace(/[$]type[$]/g, this.Type);
        this.UpdateTable();
        template = template.replace(/[$]table[$]/g, this.Table.GetHtml());
        template = template.replace(/[$]numberselected[$]/g, this.Type==="number" ? " selected" : "");
        template = template.replace(/[$]boolselected[$]/g, this.Type==="bool" ? " selected" : "");
        template = template.replace(/[$]tickselected[$]/g, this.Type==="tick" ? " selected" : "");

        return template;
    }

    UpdateTable() {
        this.Table.XLabel = this.NoParamaterSelection? this.XLabel : "<select id=\"" + this.GUID + "-parameterselection\" style=\"width: auto;\">" + GetSelections(this.ParameterSelection) + "</select>";
        this.Table.ZLabel = GetClassProperty(this, "ValueLabel") + " " + GetUnitDisplay(Measurements[GetClassProperty(this, "ValueMeasurement")]);

        if(!this.NoParamaterSelection)
            $("#" + this.GUID + "-parameterselection").html(GetSelections(this.ParameterSelection));
    }

    LiveUpdate(variables, variable) {
        this.Table.Trail(
            variables[Increments[this.ParameterSelection.reference].find(a => a.Name === this.ParameterSelection.value && a.Measurement === this.ParameterSelection.measurement).Id], 
            undefined, 
            variable);
    }

    SetIncrements() {
        if(!this.NoParamaterSelection) {
            var thisClass = this;
            if(!Increments.PostEvent)
                Increments.PostEvent = [];
            Increments.PostEvent.push(function() { thisClass.UpdateTable(); });

            if(!Increments.LiveUpdate)
                Increments.LiveUpdate = [];
            Increments.LiveUpdate.push(function(variables) { thisClass.LiveUpdate(variables); });
        }
    }

    GetObjOperation() {
        var table = this.Table;
        var tableValue = this.Table.Value;
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
            { type: "UINT32", value: OperationArchitectureFactoryIDs.Offset + OperationArchitectureFactoryIDs.LookupTable }, //factory ID
            { type: "FLOAT", value: table.MinX }, //MinXValue
            { type: "FLOAT", value: table.MaxX }, //MaxXValue
            { type: "UINT8", value: table.XResolution }, //XResolution
            { type: "UINT8", value: typeId }, //Type
            { type: type, value: tableValue }, //Table
        ]};
    }

    GetObjParameters() {
        if(!this.NoParamaterSelection) {
            return { value: [
                { type: "UINT8", value: 0 }, //variable
                { type: "UINT32", value: Increments[this.ParameterSelection.reference].find(a => a.Name === this.ParameterSelection.value && a.Measurement === this.ParameterSelection.measurement).Id }
            ]};
        }

        return { value: []};
    }
}
GenericConfigs.push(ConfigOperation_LookupTable);

class ConfigOperation_2AxisTable {
    static Name = "2 Axis Table";
    static Output = "float";
    static Inputs = ["float", "float"];
    static Measurement = "Selectable";
    static ValueLabel = "Value";
    static ValueMeasurement = "None";
    static Template = getFileContents("ConfigGui/Operation_2AxisTable.html");

    NoParamaterSelection = false;
    XSelection = undefined;
    YSelection = undefined;
    Type = "number";
    Table = undefined;
    XLabel = "";
    YLabel = "";
    Default = true;

    constructor(noParamaterSelection){
        this.GUID = getGUID();
        this.Table = new Table(getGUID());
        if(noParamaterSelection)
            this.NoParamaterSelection = true;
    }

    IsDefault() {
        return this.Default && this.Table.IsDefault();
    }

    GetObj() {
        return {
            Name: this.constructor.Name,
            Type: this.Type,
            Value: this.Table.Value,
            MinX: this.Table.MinX,
            MaxX: this.Table.MaxX,
            XResolution: this.Table.XResolution,
            MinY: this.Table.MinY,
            MaxY: this.Table.MaxY,
            YResolution: this.Table.YResolution,
            XSelection: this.NoParamaterSelection? undefined : this.XSelection,
            YSelection: this.NoParamaterSelection? undefined : this.YSelection
        };
    }

    SetObj(obj) {
        if(obj) {
            this.Type = obj.Type;
            this.Table.SetXResolution(obj.XResolution);
            this.Table.SetYResolution(obj.YResolution);
            this.Table.MinX = obj.MinX;
            this.Table.MaxX = obj.MaxX;
            this.Table.MinY = obj.MinY;
            this.Table.MaxY = obj.MaxY;
            this.Table.Value = obj.Value;
            if(!this.NoParamaterSelection)
                this.XSelection = obj.XSelection;
            if(!this.NoParamaterSelection)
                this.YSelection = obj.YSelection;
        }
        $("#" + this.GUID).replaceWith(this.GetElementHtml());
    }

    Attach() {
        this.Detach();
        var thisClass = this;

        $(document).on("click."+this.GUID, "#" + this.GUID + "-edit", function(){
            $("#" + thisClass.GUID + "-dialog").dialog({ width:'auto', modal:true, title: thisClass.ZLabel });
        });

        if(!this.NoParamaterSelection) {
            $(document).on("change."+this.GUID, "#" + this.GUID + "-xselection", function(){
                var val = $(this).val();
                thisClass.XSelection = {reference: $('option:selected', this).attr('reference'), value: val, measurement: $('option:selected', this).attr('measurement')};
                thisClass.UpdateTable();
                thisClass.Default = false;
            });

            $(document).on("change."+this.GUID, "#" + this.GUID + "-yselection", function(){
                var val = $(this).val();
                thisClass.YSelection = {reference: $('option:selected', this).attr('reference'), value: val, measurement: $('option:selected', this).attr('measurement')};
                thisClass.UpdateTable();
                thisClass.Default = false;
            });
        }
        
        this.Table.Attach();
    }

    Detach() {
        $(document).off("click."+this.GUID);
        $(document).off("change."+this.GUID);
        this.Table.Detach();
    }

    GetHtml() {
        return "<label for=\"" + this.GUID + "-edit\">" + GetClassProperty(this, "ValueLabel") + ":</label>" + this.GetElementHtml();
    }

    GetElementHtml() {
        var template = GetClassProperty(this, "Template");

        template = template.replace(/[$]id[$]/g, this.GUID);
        template = template.replace(/[$]type[$]/g, this.Type);
        this.UpdateTable();
        template = template.replace(/[$]table[$]/g, this.Table.GetHtml());
        template = template.replace(/[$]numberselected[$]/g, this.Type==="number" ? " selected" : "");
        template = template.replace(/[$]boolselected[$]/g, this.Type==="bool" ? " selected" : "");
        template = template.replace(/[$]tickselected[$]/g, this.Type==="tick" ? " selected" : "");

        return template;
    }

    UpdateTable() {
        this.Table.XLabel = this.NoParamaterSelection? this.XLabel : "<select id=\"" + this.GUID + "-xselection\" style=\"width: auto;\">" + GetSelections(this.XSelection) + "</select>";
        this.Table.YLabel = this.NoParamaterSelection? this.YLabel : "<select id=\"" + this.GUID + "-yselection\" style=\"width: auto;\">" + GetSelections(this.YSelection) + "</select>";
        this.Table.ZLabel = GetClassProperty(this, "ValueLabel") + " " + GetUnitDisplay(Measurements[GetClassProperty(this, "ValueMeasurement")]);
        
        $("#" + this.GUID + "-xselection").html(GetSelections(this.XSelection));
        $("#" + this.GUID + "-yselection").html(GetSelections(this.YSelection));
    }

    LiveUpdate(variables, variable) {
        this.Table.Trail(
            variables[Increments[this.XSelection.reference].find(a => a.Name === this.XSelection.value && a.Measurement == this.XSelection.measurement).Id], 
            variables[Increments[this.YSelection.reference].find(a => a.Name === this.YSelection.value && a.Measurement == this.YSelection.measurement).Id],
            variable);
    }

    SetIncrements() {
        if(!this.NoParamaterSelection) {
            var thisClass = this;
            if(!Increments.PostEvent)
                Increments.PostEvent = [];
            Increments.PostEvent.push(function() { thisClass.UpdateTable(); });

            if(!Increments.LiveUpdate)
                Increments.LiveUpdate = [];
            Increments.LiveUpdate.push(function(variables) { thisClass.LiveUpdate(variables); });
        }
    }

    GetObjOperation() {
        var table = this.Table;
        var tableValue = this.Table.Value;
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
        if(!this.NoParamaterSelection) {
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

function GetSelections(selection, measurement, configs) {
    var selections = "";
    var configSelected = false;
    if(configs) {
        for(var i = 0; i < configs.length; i++) {
            var selected = false;
            if(selection && !selection.reference && selection.value === configs[i].Name){
                selected = true;
                configSelected = true;
            }

            selections += "<option value=\"" + configs[i].Name + "\"" + (selected? " selected" : "") + ">" + configs[i].Name + "</option>"
        }
        if(selections) 
            selections = "<optgroup label=\"Calculations\">" + selections + "</optgroup>";
    }
    
    for(var property in Increments){
        if(!Array.isArray(Increments[property]))
            continue;
        if(property === "PostEvent")
            continue;
        if(property === "LiveUpdate")
            continue;

        var arr = Increments[property];
        
        var arrSelections = "";

        for(var i = 0; i < arr.length; i++) {
            if(!measurement || arr[i].Measurement === measurement) {
                var selected = false;
                if(selection && selection.reference === property && selection.value === arr[i].Name && selection.measurement === arr[i].Measurement){
                    selected = true;
                    configSelected = true;
                }
    
                arrSelections += "<option reference=\"" + property + "\" value=\"" + arr[i].Name + "\" measurement=\"" + arr[i].Measurement + "\"" + (selected? " selected" : "") + ">" + arr[i].Name + (!measurement? " [" + GetUnitDisplay(arr[i].Measurement) + "]" : "") + "</option>"
            }
        }
        if(arrSelections) 
            arrSelections = "<optgroup label=\"" + property + "\">" + arrSelections + "</optgroup>";

        selections += arrSelections;
    }

    selections = "<option value=\"-1\" disabled" + (configSelected? "" : " selected") + ">Select</option>" + selections;

    return selections;
}

class ConfigOrVariableSelection {
    static Template = getFileContents("ConfigGui/ConfigOrVariableSelection.html");

    constructor(configs, valueLabel, valueMeasurement, variableListName){
        this.GUID = getGUID();
        this.Configs = configs;
        this.ValueLabel = valueLabel;
        this.ValueMeasurement = valueMeasurement;
        this.VariableListName = variableListName;
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
    
    Detach() {
        $(document).off("change."+this.GUID);            
        if(this.Selection && !this.Selection.reference) 
            this.GetSubConfig().Detach();
    }
    
    Attach() {
        this.Detach();
        var thisClass = this;

        $(document).on("change."+this.GUID, "#" + this.GUID + "-selection", function(){
            thisClass.Detach();

            var val = $(this).val();
            if($('option:selected', this).attr('reference') === undefined) {
                if(val === "-1")
                    thisClass.Selection = undefined;
                else 
                    thisClass.Selection = { value: val };
            } else {
                thisClass.Selection = {reference: $('option:selected', this).attr('reference'), value: val, measurement: $('option:selected', this).attr('measurement')};
            }
            $("#" + thisClass.GUID).replaceWith(thisClass.GetHtml());

            thisClass.Attach();
        });

        if(this.Selection && !this.Selection.reference) 
            this.GetSubConfig().Attach();
    }

    GetHtml() {
        var template = GetClassProperty(this, "Template");

        template = template.replace(/[$]id[$]/g, this.GUID);
        
        $("#" + this.GUID + "-selection").html(GetSelections(this.Selection, this.ValueMeasurement, this.Configs));
        template = template.replace(/[$]selections[$]/g, GetSelections(this.Selection, this.ValueMeasurement, this.Configs));
        if(this.Selection && !this.Selection.reference) {
            if(this.GetSubConfig().GetElementHtml) {
                template = template.replace(/[$]singleelementconfig[$]/g, this.GetSubConfig().GetElementHtml());
                template = template.replace(/[$]config[$]/g, "");
            } else {
                if(this.GetSubConfig().GetHtml)
                    template = template.replace(/[$]config[$]/g, this.GetSubConfig().GetHtml());
                else
                    template = template.replace(/[$]config[$]/g, "");
                template = template.replace(/[$]singleelementconfig[$]/g, "");
            }
        } else {
            template = template.replace(/[$]config[$]/g, "");
            template = template.replace(/[$]singleelementconfig[$]/g, "");
        }
        template = template.replace(/[$]valuelabel[$]/g, this.ValueLabel);
        template = template.replace(/[$]value[$]/g, GetMeasurementDisplay(this.ValueMeasurement));
        template = template.replace(/[$]measurement[$]/g, GetUnitDisplay(this.ValueMeasurement));

        return template;
    }

    LiveUpdate(variables) {
        //static value doesn't need live updates
        if(this.Selection && this.Selection.value === "Static")
            return;

        //get value
        var variable;
        if(this.Selection && this.VariableListName) {
            if(!this.Selection.reference) {
                var subConfig = this.GetSubConfig();
                if(GetClassProperty(subConfig, "Output"))
                    variable = variables[this.Id];
            } else {
                var cell = this.GetCellByName(Increments[this.Selection.reference], this.Selection.value);
                if(cell) 
                    variable = variables[cell.Id];
            }
        }

        //update value
        if(variable !== undefined) {
            $("#" + this.GUID + "-value").addClass("liveValue");
            $("#" + this.GUID + "-value").html(variable);
        }
    }
    
    UpdateSelections() {
        $("#" + this.GUID + "-selection").html(GetSelections(this.Selection, this.ValueMeasurement, this.Configs));
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
        var thisClass = this;
        if(!Increments.PostEvent)
            Increments.PostEvent = [];
        Increments.PostEvent.push(function() { thisClass.UpdateSelections(); });

        if(!Increments.LiveUpdate)
            Increments.LiveUpdate = [];
        Increments.LiveUpdate.push(function(variables) { thisClass.LiveUpdate(variables); });

        if(this.Selection && this.VariableListName) {
            if(Increments[this.VariableListName] === undefined)
                Increments[this.VariableListName] = [];

            if(!this.Selection.reference) {
                var subConfig = this.GetSubConfig();
                if(GetClassProperty(subConfig, "Output")) {
                    this.Id = 1;
                    if(Increments.VariableIncrement === undefined)
                        Increments.VariableIncrement = 1;
                    else
                        this.Id = ++Increments.VariableIncrement;

                    if(subConfig.SetIncrements)
                        subConfig.SetIncrements();
                        
                    Increments[this.VariableListName].push({ 
                        Name: this.ValueLabel, 
                        Id: this.Id,
                        Type: GetClassProperty(subConfig, "Output"),
                        Measurement: this.ValueMeasurement
                    });
                }
            } else {
                var cell = this.GetCellByName(Increments[this.Selection.reference], this.Selection.value);
                if(cell) {
                    Increments[this.VariableListName].push({ 
                        Name: this.ValueLabel, 
                        Id: cell.Id,
                        Type: cell.Type,
                        Measurement: this.ValueMeasurement
                    });
                }
            }
        }
    }
    
    IsImmediateOperation() {
        return this.Selection && !this.Selection.reference;
    }

    GetObjAsParameter(subOperationId) {
        //if immediate operation
        if(this.IsImmediateOperation()) {     
            return { value: [
                { type: "UINT8", value: subOperationId }, //use subOperation
                { type: "UINT8", value: 0 }, //use first return from operation
            ]};
        }

        var cell = this.GetCellByName(Increments[this.Selection.reference], this.Selection.value);
        return { value: [
            { type: "UINT8", value: 0 }, //use variable
            { type: "UINT32", value: cell.Id }, //ID
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