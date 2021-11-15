var GenericConfigs = [];

var OperationArchitectureFactoryIDs = {
    Offset: 10000,
    Table: 1,
    LookupTable: 2,
    Polynomial: 3,
    Static: 5,
    FaultDetection: 6,
    Add: 10,
    Subtract: 11,
    Multiply: 12,
    Divide: 13,
    And: 14,
    Or: 15,
    GreaterThan: 16,
    LessThan: 17,
    Equal: 18,
    GreaterThanOrEqual: 19,
    LessThanOrEqual: 20
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

    constructor(prop) {
        super(prop);
        const thisClass = this;

        this.Value = new UINumberWithMeasurement({
            OnChange: function (value) {
                thisClass.Default = false;
            }
        });
    }

    GetObjOperation() {
        return { value: [{ type: "Operation_StaticVariable", value: this.GetValue().Value }] };
    }

    GetObjParameters() {
        return { value: [] };
    }

    GetElementHtml() {
        return this.GetHtml();
    }
}
GenericConfigs.push(ConfigOperation_Static);

function TableGetType(tableValue) {
    var min = 18446744073709551615;
    var max = -9223372036854775808;
    for (var i = 0; i < tableValue.length; i++) {
        if (tableValue[i] % 1 != 0) {
            return "FLOAT";
        }
        if (min === undefined || tableValue[i] < min) {
            min = tableValue[i];
        }
        if (max === undefined || tableValue[i] < max) {
            max = tableValue[i];
        }
    }
    if (typeof tableValue[0] === "boolean") {
        return "BOOL";
    }
    if (min < 0) {
        if (max < 0 || min < -max)
            return GetType(min);
        return GetType(-max);
    }
    return GetType(max);
}

class ConfigOperation_LookupTable extends UITemplate {
    static Name = "Lookup Table";
    static Output = "float";
    static Inputs = ["float"];
    static Measurement = "Selectable";
    static ValueLabel = "Value";
    static ValueMeasurement = "None";
    static XLabel = "X"
    static Template = "$Dialog$"

    Default = true;

    constructor(prop) {
        super(prop);
        const thisClass = this;

        this.Dialog = new UIDialog({
            Title: "$ValueLabel$",
            ButtonText: "Edit Table",
            TemplateIdentifier: "Value"
        });
        this.Value = new UITable({
            BaseObj: true,
            YResolution: 1,
            YResolutionModifiable: false,
            XLabel: this.NoParameterSelection ? "$XLabel$" : "$ParameterSelection$",
            ZLabel: "$ValueLabel$",
            OnChange: function (value) {
                thisClass.Default = false;
            }
        });
        this.ParameterSelection = this.NoParameterSelection ? undefined : new UISelection({
            Options: GetSelections(),
            OnChange: function (value) {
                thisClass.Default = false;
            }
        });
    }

    GetObjOperation() {
        const table = this.GetValue().Value;
        const tableValue = table.Value;
        const type = TableGetType(tableValue);
        const typeId = GetTypeId(type);

        return {
            value: [
                { type: "UINT32", value: OperationArchitectureFactoryIDs.Offset + OperationArchitectureFactoryIDs.LookupTable }, //factory ID
                { type: "FLOAT", value: table.MinX }, //MinXValue
                { type: "FLOAT", value: table.MaxX }, //MaxXValue
                { type: "UINT8", value: table.XResolution }, //XResolution
                { type: "UINT8", value: typeId }, //Type
                { type: type, value: tableValue }, //Table
            ]
        };
    }

    GetObjParameters() {
        if (!this.NoParameterSelection) {
            const parameterSelection = this.GetValue().ParameterSelection;
            return {
                value: [
                    { type: "UINT8", value: 0 }, //variable
                    { type: "UINT32", value: Increments[parameterSelection.reference].find(a => a.Name === parameterSelection.value && a.Measurement === parameterSelection.measurement).Id }
                ]
            };
        }

        return { value: [] };
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
    static XLabel = "X"
    static YLabel = "Y"
    static Template = "$Dialog$"

    Default = true;

    constructor(prop) {
        super(prop);
        const thisClass = this;

        this.Dialog = new UIDialog({
            Title: "$ValueLabel$",
            ButtonText: "Edit Table",
            TemplateIdentifier: "Value"
        });
        this.Value = new UITable({
            BaseObj: true,
            XLabel: this.NoParameterSelection ? "$XLabel$" : "$XSelection$",
            YLabel: this.NoParameterSelection ? "$YLabel$" : "$YSelection$",
            ZLabel: "$ValueLabel$",
            OnChange: function (value) {
                thisClass.Default = false;
            }
        });
        this.XSelection = this.NoParameterSelection ? undefined : new UISelection({
            Options: GetSelections(),
            OnChange: function (value) {
                thisClass.Default = false;
            }
        });
        this.YSelection = this.NoParameterSelection ? undefined : new UISelection({
            Options: GetSelections(),
            OnChange: function (value) {
                thisClass.Default = false;
            }
        });
    }

    GetObjOperation() {
        const table = this.GetValue().Value;
        const tableValue = table.Value;
        const type = TableGetType(tableValue);
        const typeId = GetTypeId(type);

        return {
            value: [
                { type: "UINT32", value: OperationArchitectureFactoryIDs.Offset + OperationArchitectureFactoryIDs.Table }, //factory ID
                { type: "FLOAT", value: table.MinX }, //MinXValue
                { type: "FLOAT", value: table.MaxX }, //MaxXValue
                { type: "FLOAT", value: table.MinY }, //MinYValue
                { type: "FLOAT", value: table.MaxY }, //MaxYValue
                { type: "UINT8", value: table.XResolution }, //XResolution
                { type: "UINT8", value: table.YResolution }, //YResolution
                { type: "UINT8", value: typeId }, //Type
                { type: type, value: tableValue }, //Table
            ]
        };
    }

    GetObjParameters() {
        if (!this.NoParameterSelection) {
            const xSelection = this.XSelection.GetValue();
            const ySelection = this.YSelection.GetValue();
            return {
                value: [
                    { type: "UINT8", value: 0 }, //variable
                    { type: "UINT32", value: Increments[xSelection.reference].find(a => a.Name === xSelection.value && a.Measurement == xSelection.measurement).Id },
                    { type: "UINT8", value: 0 }, //variable
                    { type: "UINT32", value: Increments[ySelection.reference].find(a => a.Name === ySelection.value && a.Measurement == ySelection.measurement).Id }
                ]
            };
        }
        return { value: [] };
    }
}
GenericConfigs.push(ConfigOperation_2AxisTable);

function GetSelections(measurement, configs) {
    var selections = [];
    if (configs) {
        var calculations = { Group: "Calculations", Options: [] }
        for (var i = 0; i < configs.length; i++) {
            calculations.Options.push({
                Name: configs[i].Name,
                Value: { value: configs[i].Name }
            });
        }
        selections.push(calculations);
    }

    for (var property in Increments) {
        if (!Array.isArray(Increments[property]))
            continue;

        var arr = Increments[property];

        var arrSelections = { Group: property, Options: [] };

        for (var i = 0; i < arr.length; i++) {
            if (!measurement || arr[i].Measurement === measurement) {
                arrSelections.Options.push({
                    Name: arr[i].Name + (!measurement ? " [" + GetUnitDisplay(arr[i].Measurement) + "]" : ""),
                    Value: { reference: property, value: arr[i].Name, measurement: arr[i].measurement }
                });
            }
        }
        selections.push(arrSelections);
    }

    return selections;
}

class ConfigOrVariableSelection extends UITemplate {
    static ValueLabel = "Value";
    static Template =
        "<div id=\"$GUID$\">" +
        "<label for=\"$Selection.GUID$\">$ValueLabel$:</label>$Selection$ $ConfigValue$" +
        "</div>";

    ConfigValues = [];

    constructor(prop) {
        super(prop);
        this.GUID = getGUID();
        const thisClass = this;

        this.Selection = new UISelection({
            Options: GetSelections(this.ValueMeasurement, this.Configs),
            OnChange: function (value) {
                //proud of myself on this clever bit of self modifying template ;)
                thisClass.ConfigValue = "$ConfigValues." + thisClass.GetSubConfigIndex() + "$";
                $("#" + thisClass.GUID).replaceWith(thisClass.GetHtml());
            }
        });
    }

    GetSubConfigIndex() {
        if (this.IsVariable() || !this.Configs)
            return -1;

        const selection = this.Selection.GetValue();
        if(selection == undefined)
            return -1;
        for (var i = 0; i < this.ConfigValues.length; i++) {
            if (GetClassProperty(this.ConfigValues[i], "Name") === selection.value) {
                return i;
            }
        }
        for (var i = 0; i < this.Configs.length; i++) {
            if (GetClassProperty(this.Configs[i], "Name") !== selection.value)
                continue;
            this.ConfigValues.push(new this.Configs[i]());
            this.ConfigValues[this.ConfigValues.length - 1].ValueLabel = this.ValueLabel;
            this.ConfigValues[this.ConfigValues.length - 1].ValueMeasurement = this.ValueMeasurement;
            if (this.ValueMeasurement === "Bool")
                this.ConfigValues[this.ConfigValues.length - 1].Type = "checkbox";
            else
                this.ConfigValues[this.ConfigValues.length - 1].Type = "number";
            return this.ConfigValues.length-1;
        }
    }

    GetSubConfig() {
        const subConfigIndex = this.GetSubConfigIndex();
        if (subConfigIndex < 0)
            return undefined;

        return this.ConfigValues[subConfigIndex];
    }

    GetValue() {
        var value = super.GetValue();

        if (this.ConfigValues) {
            value.Values = [];
            for (var i = 0; i < this.ConfigValues.length; i++) {
                if (!this.ConfigValues[i].Default)
                    value.Values.push(this.ConfigValues[i].GetValue());
            }
        }

        return value;
    }

    SetValue(value) {
        for (var i = 0; i < value.Values.length; i++) {
            var found = false;
            for (var t = 0; t < this.ConfigValues.length; t++) {
                if (GetClassProperty(this.ConfigValues[t], "Name") === value.Values[i].Name) {
                    this.ConfigValues[t].SetValue(value.Values[i]);
                    found = true;
                    break;
                }
            }
            if (!found && this.Configs) {
                for (var t = 0; t < this.Configs.length; t++) {
                    if (GetClassProperty(this.Configs[t], "Name") !== value.Values[i].Name)
                        continue;
                    this.ConfigValues.push(new this.Configs[t]());
                    this.ConfigValues[this.ConfigValues.length - 1].ValueLabel = this.ValueLabel;
                    this.ConfigValues[this.ConfigValues.length - 1].ValueMeasurement = this.ValueMeasurement;
                    if (this.ValueMeasurement === "Bool")
                        this.ConfigValues[this.ConfigValues.length - 1].Type = "checkbox";
                    else
                        this.ConfigValues[this.ConfigValues.length - 1].Type = "number";
                    this.ConfigValues[this.ConfigValues.length - 1].SetValue(value.Values[i]);
                }
            }
        }

        super.SetValue(value);
    }

    GetCellByName(array, name) {
        if (!array)
            return undefined;
        for (var i = 0; i < array.length; i++) {
            if (name && name === array[i].Name && this.ValueMeasurement === array[i].Measurement)
                return array[i];
        }
        return undefined;
    }

    Id = -1;
    SetIncrements() {
        const selection = this.Selection.GetValue();
        if (selection && this.VariableListName) {
            if (Increments[this.VariableListName] === undefined)
                Increments[this.VariableListName] = [];

            if (!selection.reference) {
                const subConfig = this.GetSubConfig();
                if (GetClassProperty(subConfig, "Output")) {
                    this.Id = 1;
                    if (Increments.VariableIncrement === undefined)
                        Increments.VariableIncrement = 1;
                    else
                        this.Id = ++Increments.VariableIncrement;

                    Increments[this.VariableListName].push({
                        Name: this.ValueLabel,
                        Id: this.Id,
                        Type: GetClassProperty(subConfig, "Output"),
                        Measurement: this.ValueMeasurement
                    });
                }
            } else {
                const cell = this.GetCellByName(Increments[selection.reference], selection.value);
                if (cell) {
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

    IsVariable() {
        const selection = this.Selection.GetValue();
        return selection && selection.reference;
    }

    GetObjAsParameter(subOperationId) {
        //if immediate operation
        if (!this.IsVariable()) {
            return {
                value: [
                    { type: "OperationParameter", value: subOperationId }, //use first suboperation
                ]
            };
        }

        const selection = this.Selection.GetValue();
        const cell = this.GetCellByName(Increments[selection.reference], selection.value);
        return {
            value: [
                { type: "VariableParameter", value: cell.Id }, //ID
            ]
        };
    }

    GetObjOperation() {
        //if immediate operation
        if (!this.IsVariable()) {
            return { value: [{ obj: this.GetSubConfig().GetObjOperation() }] };
        }

        return { value: [] };
    }

    GetObjParameters() {
        //if immediate operation
        if (!this.IsVariable()) {
            return { value: [{ obj: this.GetSubConfig().GetObjParameters() }] };
        }

        return { value: [] };
    }

    GetObjPackage(subOperation) {
        //if immediate operation
        if (!this.IsVariable()) {
            const subConfig = this.GetSubConfig();
            if (this.Id === -1 && GetClassProperty(subConfig, "Output"))
                throw "Set Increments First";

            var obj = {
                value: [
                    { type: "PackageOptions", value: { Immediate: true, Store: true, Return: subOperation && GetClassProperty(subConfig, "Output") } }, //immediate and store variable, return if subOperation
                    { obj: subConfig.GetObjOperation() }
                ]
            };

            if (GetClassProperty(subConfig, "Output"))
                obj.value.push({ type: "UINT32", value: this.Id });

            obj.value.push({ obj: subConfig.GetObjParameters() });

            return obj;
        }

        return { value: [] };
    }
}