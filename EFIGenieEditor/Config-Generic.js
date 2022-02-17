var GenericConfigs = [];

var OperationArchitectureFactoryIDs = {
    Offset: 10000,
    Package: 0,
    Group: 1,
    Table: 2,
    LookupTable: 3,
    Polynomial: 4,
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


class ConfigOperation_Static extends UINumberWithMeasurement {
    static Name = `Static`;
    static Output = `float`;
    static Inputs = [];

    GetObjOperation(outputVariableId) {
        var objOperation = { value: [{ type: `Operation_StaticVariable`, value: this.Value }] };

        if (outputVariableId) {
            objOperation.value[0].result = outputVariableId;
        }

        return objOperation;
    }
}
GenericConfigs.push(ConfigOperation_Static);

function TableGetType(tableValue) {
    var min = 18446744073709551615;
    var max = -9223372036854775808;
    for (var i = 0; i < tableValue.length; i++) {
        if (tableValue[i] % 1 != 0) {
            return `FLOAT`;
        }
        if (tableValue[i] < min) {
            min = tableValue[i];
        }
        if (tableValue[i] > max) {
            max = tableValue[i];
        }
    }
    if (typeof tableValue[0] === `boolean`) {
        return `BOOL`;
    }
    if (min < 0) {
        if (max < 0 || min < -max)
            return GetType(min);
        return GetType(-max);
    }
    return GetType(max);
}

class ConfigOperation_LookupTable extends UITemplate {
    static Name = `Lookup Table`;
    static Output = `float`;
    static Inputs = [`float`];
    static Measurement = `Selectable`;
    static Label = `Value`;
    static XLabel = `X`
    static Template = `$Dialog$`

    constructor(prop) {
        prop ??= {};
        prop.Dialog = new UIDialog({
            Title: `$Label$`,
            ButtonText: `Edit Table`,
            TemplateIdentifier: `Value`
        });
        prop.Value = new UITable({
            BaseObj: true,
            YResolution: 1,
            YResolutionModifiable: false,
            XLabel: prop.NoParameterSelection ? `$XLabel$` : `$ParameterSelection$`,
            ZLabel: `$Label$`
        });
        prop.ParameterSelection = prop.NoParameterSelection ? undefined : new UISelection({
            Options: GetSelections()
        });
        super(prop);
    }

    GetObjOperation(outputVariableId, inputVariableId) {
        const table = this.GetValue();
        const tableValue = table.Value;
        const type = TableGetType(tableValue);
        const typeId = GetTypeId(type);

        var objOperation = {
            value: [
                { type: `UINT32`, value: OperationArchitectureFactoryIDs.Offset + OperationArchitectureFactoryIDs.LookupTable }, //factory ID
                { type: `FLOAT`, value: table.MinX }, //MinXValue
                { type: `FLOAT`, value: table.MaxX }, //MaxXValue
                { type: `UINT8`, value: table.XResolution }, //XResolution
                { type: `UINT8`, value: typeId }, //Type
                { type: type, value: tableValue }, //Table
            ]
        };

        if (!this.NoParameterSelection || outputVariableId || inputVariableId) {
            var inputVariables;
            if(inputVariableId) {
                inputVariables = [ inputVariableId ]; //inputVariable
            } else if (!this.NoParameterSelection) {
                const parameterSelection = this.ParameterSelection.Value;
                inputVariables = [ `${parameterSelection.reference}.${parameterSelection.value}${parameterSelection.measurement? `(${parameterSelection.measurement})` : ``}` ]; //inputVariable
            }
            return Packagize(objOperation, { 
                outputVariables: [ outputVariableId ?? 0 ],
                inputVariables
            });
        }

        return objOperation;
    }

    RegisterVariables() {
        if(!this.NoParameterSelection)
            this.ParameterSelection.SetOptions(GetSelections());
    }
}
GenericConfigs.push(ConfigOperation_LookupTable);

class ConfigOperation_2AxisTable extends UITemplate {
    static Name = `2 Axis Table`;
    static Output = `float`;
    static Inputs = [`float`, `float`];
    static Measurement = `Selectable`;
    static Label = `Value`;
    static XLabel = `X`
    static YLabel = `Y`
    static Template = `$Dialog$`

    constructor(prop) {
        prop ??= {};
        prop.Dialog = new UIDialog({
            Title: `$Label$`,
            ButtonText: `Edit Table`,
            TemplateIdentifier: `Value`
        });
        prop.Value = new UITable({
            BaseObj: true,
            XLabel: prop.NoParameterSelection ? `$XLabel$` : `$XSelection$`,
            YLabel: prop.NoParameterSelection ? `$YLabel$` : `$YSelection$`,
            ZLabel: `$Label$`
        });
        prop.XSelection = prop.NoParameterSelection ? undefined : new UISelection({
            Options: GetSelections()
        });
        prop.YSelection = prop.NoParameterSelection ? undefined : new UISelection({
            Options: GetSelections(),
        });
        super(prop);
    }

    GetObjOperation(outputVariableId, xVariableId, yVariableId) {
        const table = this.GetValue();
        const tableValue = table.Value;
        const type = TableGetType(tableValue);
        const typeId = GetTypeId(type);

        var objOperation = {
            value: [
                { type: `UINT32`, value: OperationArchitectureFactoryIDs.Offset + OperationArchitectureFactoryIDs.Table }, //factory ID
                { type: `FLOAT`, value: table.MinX }, //MinXValue
                { type: `FLOAT`, value: table.MaxX }, //MaxXValue
                { type: `FLOAT`, value: table.MinY }, //MinYValue
                { type: `FLOAT`, value: table.MaxY }, //MaxYValue
                { type: `UINT8`, value: table.XResolution }, //XResolution
                { type: `UINT8`, value: table.YResolution }, //YResolution
                { type: `UINT8`, value: typeId }, //Type
                { type: type, value: tableValue }, //Table
            ]
        };

        if (!this.NoParameterSelection || outputVariableId || xVariableId || yVariableId) {
            var inputVariables;
            if(xVariableId) {
                inputVariables = [ xVariableId ]; //inputVariable
            } else if (!this.NoParameterSelection) {
                const parameterSelection = this.XSelection.Value;
                inputVariables = [ `${parameterSelection.reference}.${parameterSelection.value}${parameterSelection.measurement? `(${parameterSelection.measurement})` : ``}` ]; //xVariable
            }
            if(yVariableId) {
                inputVariables.push({ yVariableId }); //ytVariable
            } else if (!this.NoParameterSelection) {
                const parameterSelection = this.YSelection.Value;
                inputVariables.push( `${parameterSelection.reference}.${parameterSelection.value}${parameterSelection.measurement? `(${parameterSelection.measurement})` : ``}` ); //yVariable
            }
            return Packagize(objOperation, { 
                outputVariables: [ outputVariableId ?? 0 ],
                inputVariables
            });
        }

        return objOperation;
    }

    RegisterVariables() {
        if(!this.NoParameterSelection) {
            this.XSelection.SetOptions(GetSelections());
            this.YSelection.SetOptions(GetSelections());
        }
    }
}
GenericConfigs.push(ConfigOperation_2AxisTable);

function GetSelections(measurement, configs) {
    var selections = [];
    if (configs) {
        var calculations = { Group: `Calculations`, Options: [] }
        for (var i = 0; i < configs.length; i++) {
            calculations.Options.push({
                Name: configs[i].Name,
                Value: { value: configs[i].Name }
            });
        }
        selections.push(calculations);
    }

    for (var property in VariableRegister) {
        if (!Array.isArray(VariableRegister[property]))
            continue;

        var arr = VariableRegister[property];

        var arrSelections = { Group: property, Options: [] };

        for (var i = 0; i < arr.length; i++) {
            if (!measurement || arr[i].Measurement === measurement) {
                arrSelections.Options.push({
                    Name: arr[i].Name + (!measurement ? ` [${GetUnitDisplay(arr[i].Measurement)}]` : ``),
                    Value: { reference: property, value: arr[i].Name, measurement: arr[i].Measurement }
                });
            }
        }
        selections.push(arrSelections);
    }

    return selections;
}

class ConfigOrVariableSelection extends UITemplate {
    static Label = `Value`;
    static Template = `<div><label for="$Selection.GUID$">$Label$:</label>$Selection$ $ConfigValue$</div>`;

    ConfigValues = [];

    constructor(prop) {
        prop ??= {};
        prop.Selection = new UISelection({
            Options: GetSelections(prop.Measurement, prop.Configs),
            SelectDisabled: true
        });
        super(prop);

        var thisClass = this;
        this.Selection.OnChange.push(function () {
            //proud of myself on this clever bit of self modifying template ;)
            thisClass.ConfigValue = `$ConfigValues.${thisClass.GetSubConfigIndex()}$`;
            $(`#${thisClass.GUID}`).replaceWith(thisClass.GetHtml());
            thisClass.ConfigValues.forEach(function(val) { val.Detach(); });
            var subConfig = thisClass.GetSubConfig();
            if(subConfig?.Attach)
                subConfig.Attach();
        });
    }

    GetSubConfigIndex() {
        if (this.Selection.Value?.reference || !this.Configs)
            return -1;

        const selection = this.Selection.Value;
        if(selection == undefined)
            return -1;
        for (var i = 0; i < this.ConfigValues.length; i++) {
            if (GetClassProperty(this.ConfigValues[i], `Name`) === selection.value) {
                return i;
            }
        }
        for (var i = 0; i < this.Configs.length; i++) {
            if (GetClassProperty(this.Configs[i], `Name`) !== selection.value)
                continue;
            var configValue = new this.Configs[i]({
                Label: this.Label,
                Measurement: this.Measurement,
                MeasurementIndex: this.MeasurementIndex
            });
            if(configValue.OnChange)
                configValue.OnChange.push(function(){configValue.NotDefault = true;});
            else
                configValue.NotDefault = true;
            this.ConfigValues.push(configValue);
            return this.ConfigValues.length-1;
        }
    }

    GetSubConfig() {
        const subConfigIndex = this.GetSubConfigIndex();
        if (subConfigIndex < 0)
            return undefined;

        return this.ConfigValues[subConfigIndex];
    }

    static SaveAll = false;
    static SaveOnlyActive = false;
    GetValue() {
        var value = super.GetValue();

        if (this.ConfigValues) {
            if(ConfigOrVariableSelection.SaveOnlyActive) {
                var subConfig = this.GetSubConfig();
                if(subConfig?.GetValue) {
                    var configValue = subConfig.GetValue();
                    if(typeof configValue !== `object` )
                        configValue = { Value: configValue };
                    configValue.Name = GetClassProperty(subConfig, `Name`);
                    value.Values = [configValue];
                }
            } else {
                value.Values = [];
                for (var i = 0; i < this.ConfigValues.length; i++) {
                    if (ConfigOrVariableSelection.SaveAll || this.ConfigValues[i].NotDefault) {
                        var configValue = this.ConfigValues[i].GetValue();
                        if(typeof configValue !== `object` )
                            configValue = { Value: configValue };
                        configValue.Name = GetClassProperty(this.ConfigValues[i], `Name`);
                        value.Values.push(configValue);
                    }
                }
            } 
        }

        return value;
    }

    SetValue(value) {
        if(value.Values === undefined) {
            value.Values = [];

            if(value.Selection && value.Selection.value && !value.Selection.reference)
            {
                value.Values.push(value.Selection.value);
                value.Selection.value = value.Selection.value.Name;
            }
        }
        
        for (var i = 0; i < value.Values.length; i++) {
            var found = false;
            for (var t = 0; t < this.ConfigValues.length; t++) {
                if (GetClassProperty(this.ConfigValues[t], `Name`) === value.Values[i].Name) {
                    var setVal = value.Values[i];
                    if(typeof this.ConfigValues[t].GetValue() !== `object` )
                        setVal = setVal.Value;
                    this.ConfigValues[t].SetValue(setVal);
                    found = true;
                    break;
                }
            }
            if (!found && this.Configs) {
                for (var t = 0; t < this.Configs.length; t++) {
                    if (GetClassProperty(this.Configs[t], `Name`) !== value.Values[i].Name)
                        continue;
                    var configValue = new this.Configs[t]({
                        Label: this.Label,
                        Measurement: this.Measurement,
                        MeasurementIndex: this.MeasurementIndex
                    });
                    var setVal = value.Values[i];
                    if(typeof configValue.GetValue() !== `object` )
                        setVal = setVal.Value;
                    configValue.SetValue(setVal);
                    if(configValue.OnChange)
                        configValue.OnChange.push(function(){configValue.NotDefault = true;});
                    else
                        configValue.NotDefault = true;
                    this.ConfigValues.push(configValue);
                }
            }
        }

        super.SetValue(value);
    }

    GetCellByName(array, name) {
        if (!array)
            return undefined;
        for (var i = 0; i < array.length; i++) {
            if (name && name === array[i].Name && this.Measurement === array[i].Measurement)
                return array[i];
        }
        return undefined;
    }
    
    IsVariable() {
        return this.Selection.Value?.reference;
    }

    RegisterVariables() {
        this.Selection.SetOptions(GetSelections(this.Measurement, this.Configs));
        const selection = this.Selection.Value;
        if (selection && this.VariableListName) {
            if (!selection.reference) {
                const subConfig = this.GetSubConfig();
                if(subConfig.RegisterVariables)
                    subConfig.RegisterVariables();
                if (GetClassProperty(subConfig, `Output`)) {
                    VariableRegister.RegisterVariable(
                        this.VariableListName,
                        this.Label,
                        GetClassProperty(subConfig, `Output`),
                        this.Measurement
                    );
                }
            } else {
                VariableRegister.RegisterVariableReference(
                    this.VariableListName,
                    this.Label,
                    `${selection.reference}.${selection.value}${selection.measurement? `(${selection.measurement})` : ``}`
                );
            }
        }
    }

    GetObjOperation(...args) {
        const selection = this.Selection.Value;            
        if(!selection.reference) {
            const subConfig = this.GetSubConfig();
            if(!subConfig)
                return;
            if(this.VariableListName)
                return subConfig.GetObjOperation(`${this.VariableListName}.${this.Label}${this.Measurement? `(${this.Measurement})` : ``}`, ...args);
            return subConfig.GetObjOperation(...args);
        }

        return;
    }
}