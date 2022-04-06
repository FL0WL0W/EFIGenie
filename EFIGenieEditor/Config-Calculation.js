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

class Calculation_LookupTable extends UI.Template {
    static Name = `Lookup Table`;
    static Output = `float`;
    static Inputs = [`float`];
    static Template = `<div data-element="Dialog"></div>`
    GUID = generateGUID();

    get label() {
        return this.Table.zLabel;
    }
    set label(label){
        this.Table.zLabel = label;
        this.Dialog.title = label;
    }

    _xLabel = `X`
    get xLabel() {
        return this._xLabel;
    }
    set xLabel(xLabel) {
        if(this._xLabel === xLabel)
            return;

        this._xLabel = xLabel;
        if(!this.ParameterSelection)
            this.Table.xLabel = xLabel;
    }

    get xOptions() {
        if(!this.ParameterSelection) 
            return;

        return this.ParameterSelection.options;
    }
    set xOptions(options) {
        if(!this.ParameterSelection || objectTester(this.ParameterSelection.options, options)) 
            return;

        this.ParameterSelection.options = options;
    }

    get noParameterSelection() {
        if(this.ParameterSelection)
            return false;
        return true;
    }
    set noParameterSelection(noParameterSelection) {
        if(noParameterSelection) {
            this.ParameterReference = undefined;
            this.ParameterSelection = undefined;
            this.Table.xLabel = this.xLabel;
            return;
        }

        const thisClass = this;
        if(!this.ParameterSelection) {
            this.ParameterSelection = new UI.Selection({
                options: GetSelections(),
                Class: `TableParameterSelect`
            });
            this.ParameterSelection.addEventListener(`change`, function() {
                thisClass.ParameterReference = `${thisClass.ParameterSelection.Value.reference}.${thisClass.ParameterSelection.Value.value}${thisClass.ParameterSelection.Value.measurement? `(${thisClass.ParameterSelection.Value.measurement})` : ``}`;
            })
            this.Table.xLabel = this.ParameterSelection;
        }
    }

    get saveValue() {
        return super.saveValue;
    }
    set saveValue(saveValue) {
        super.saveValue = saveValue;
        if(!saveValue.Table)
            this.Table.saveValue = saveValue;
    }

    constructor(prop) {
        super();
        const thisClass = this;
        this.Dialog = new UI.Dialog({
            buttonLabel: `Edit Table`,
        });
        this.TableGroup = `$Graph$</br>$Table$`;
        this.Table = new UI.Table({
            selectNotVisible: true,
            yResolution: 1,
            yResolutionModifiable: false,
            BaseObj: true
        });
        this.Graph = new UI.Graph2D({
            width: 800,
            height: 450
        });
        delete this.Graph.saveValue;
        this.Table.attachToTable(this.Graph);
        this.Graph.attachToTable(this.Table);
        this.Dialog.content.append(this.Graph);
        this.Dialog.content.append(document.createElement(`br`));
        this.Dialog.content.append(this.Table);
        this.noParameterSelection = false;
        this.label = `Value`;
        this.Setup(prop);
    }

    GetObjOperation(outputVariableId, inputVariableId) {
        const table = this.Table;
        const tableValue = table.Value;
        const type = TableGetType(tableValue);
        const typeId = GetTypeId(type);

        var obj = {
            value: [
                { type: `UINT32`, value: OperationArchitectureFactoryIDs.Offset + OperationArchitectureFactoryIDs.LookupTable }, //factory ID
                { type: `FLOAT`, value: table.xAxis[0] }, //MinXValue
                { type: `FLOAT`, value: table.xAxis[table.xResolution-1] }, //MaxXValue
                { type: `UINT8`, value: table.xResolution }, //xResolution
                { type: `UINT8`, value: typeId }, //Type
                { type: type, value: tableValue }, //Table
            ]
        };

        if (!this.noParameterSelection || outputVariableId || inputVariableId) {
            var inputVariables;
            if(inputVariableId) {
                inputVariables = [ inputVariableId ]; //inputVariable
            } else if (!this.noParameterSelection) {
                const parameterSelection = this.ParameterSelection.Value;
                inputVariables = [ `${parameterSelection.reference}.${parameterSelection.value}${parameterSelection.measurement? `(${parameterSelection.measurement})` : ``}` ]; //inputVariable
            }
            obj = Packagize(obj, { 
                outputVariables: [ outputVariableId ?? 0 ],
                inputVariables
            });
        }

        return obj;
    }

    RegisterVariables() {
        this.xOptions = GetSelections();
        if(VariablesToPoll.indexOf(this.ParameterReference) === -1)
            VariablesToPoll.push(this.ParameterReference);
        
        const thisClass = this;
        LiveUpdateEvents[this.GUID] = function() {
            if(thisClass.ParameterReference) { 
                const parameterVariableId = VariableMetadata.GetVariableId(thisClass.ParameterReference);
                if(CurrentVariableValues[parameterVariableId] !== undefined) {
                    thisClass.Table.trail(CurrentVariableValues[parameterVariableId])
                } 
            }
        };
    }
}
GenericConfigs.push(Calculation_LookupTable);
customElements.define(`calculation-lookuptable`, Calculation_LookupTable, { extends: `span` });

class Calculation_2AxisTable extends UI.Template {
    static Name = `2 Axis Table`;
    static Output = `float`;
    static Inputs = [`float`, `float`];
    static Template = `<div data-element="Dialog"></div>`
    GUID = generateGUID();

    get label() {
        return this.Table.zLabel;
    }
    set label(label){
        this.Table.zLabel = label;
        this.Dialog.title = label;
    }

    _xLabel = `X`
    get xLabel() {
        return this._xLabel;
    }
    set xLabel(xLabel) {
        if(this._xLabel === xLabel)
            return;

        this._xLabel = xLabel;
        if(!this.XSelection)
            this.Table.xLabel = xLabel;
    }

    _yLabel = `Y`
    get yLabel() {
        return this._yLabel;
    }
    set yLabel(yLabel) {
        if(this._yLabel === yLabel)
            return;

        this._yLabel = yLabel;
        if(!this.YSelection)
            this.Table.yLabel = yLabel;
    }

    get xOptions() {
        if(!this.XSelection) 
            return;

        return this.XSelection.options;
    }
    set xOptions(options) {
        if(!this.XSelection || objectTester(this.XSelection.options, options)) 
            return;

        this.XSelection.options = options;
    }

    get yOptions() {
        if(!this.YSelection) 
            return;

        return this.YSelection.options;
    }
    set yOptions(options) {
        if(!this.YSelection || objectTester(this.YSelection.options, options)) 
            return;

        this.YSelection.options = options;
    }

    get noParameterSelection() {
        if(this.XSelection || this.YSelection)
            return false;
        return true;
    }
    set noParameterSelection(noParameterSelection) {
        if(noParameterSelection) {
            this.XReference = undefined;
            this.YReference = undefined;
            this.XSelection = undefined;
            this.YSelection = undefined;
            this.Table.xLabel = this.xLabel;
            this.Table.yLabel = this.yLabel;
            return;
        }

        const thisClass = this;
        if(!this.XSelection) {
            this.XSelection = new UI.Selection({
                selectNotVisible: true,
                options: GetSelections(),
            });
            this.XSelection.addEventListener(`change`, function() {
                thisClass.XReference = `${thisClass.XSelection.Value.reference}.${thisClass.XSelection.Value.value}${thisClass.XSelection.Value.measurement? `(${thisClass.XSelection.Value.measurement})` : ``}`;
            })
            this.Table.xLabel = this.XSelection;
        }
        if(!this.YSelection) {
            this.YSelection = new UI.Selection({
                selectNotVisible: true,
                options: GetSelections(),
            });
            this.YSelection.addEventListener(`change`, function() {
                thisClass.YReference = `${thisClass.YSelection.Value.reference}.${thisClass.YSelection.Value.value}${thisClass.YSelection.Value.measurement? `(${thisClass.YSelection.Value.measurement})` : ``}`;
            })
            this.Table.yLabel = this.YSelection;
        }
    }

    get saveValue() {
        return super.saveValue;
    }
    set saveValue(saveValue) {
        super.saveValue = saveValue;
        if(!saveValue.Table)
            this.Table.saveValue = saveValue;
    }
    
    constructor(prop) {
        super();
        this.Dialog = new UI.Dialog({
            buttonLabel: `Edit Table`,
        });
        this.Table = new UI.Table();
        this.Graph = new UI.Graph3D({
            width: 800,
            height: 450
        });
        delete this.Graph.saveValue;
        this.Table.attachToTable(this.Graph);
        this.Graph.attachToTable(this.Table);
        this.Dialog.content.append(this.Graph);
        this.Dialog.content.append(document.createElement(`br`));
        this.Dialog.content.append(this.Table);
        this.noParameterSelection = false;
        this.label = `Value`;
        this.Setup(prop);
    }

    GetObjOperation(outputVariableId, xVariableId, yVariableId) {
        const table = this.Table;
        const tableValue = table.Value;
        const type = TableGetType(tableValue);
        const typeId = GetTypeId(type);

        var obj = {
            value: [
                { type: `UINT32`, value: OperationArchitectureFactoryIDs.Offset + OperationArchitectureFactoryIDs.Table }, //factory ID
                { type: `FLOAT`, value: table.xAxis[0] }, //MinXValue
                { type: `FLOAT`, value: table.xAxis[table.xResolution-1] }, //MaxXValue
                { type: `FLOAT`, value: table.yAxis[0] }, //MinYValue
                { type: `FLOAT`, value: table.yAxis[table.yResolution-1] }, //MaxYValue
                { type: `UINT8`, value: table.xResolution }, //xResolution
                { type: `UINT8`, value: table.yResolution }, //yResolution
                { type: `UINT8`, value: typeId }, //Type
                { type: type, value: tableValue }, //Table
            ]
        };

        if (!this.noParameterSelection || outputVariableId || xVariableId || yVariableId) {
            var inputVariables;
            if(xVariableId) {
                inputVariables = [ xVariableId ]; //inputVariable
            } else if (!this.noParameterSelection) {
                const parameterSelection = this.XSelection.Value;
                inputVariables = [ `${parameterSelection.reference}.${parameterSelection.value}${parameterSelection.measurement? `(${parameterSelection.measurement})` : ``}` ]; //xVariable
            }
            if(yVariableId) {
                inputVariables.push({ yVariableId }); //ytVariable
            } else if (!this.noParameterSelection) {
                const parameterSelection = this.YSelection.Value;
                inputVariables.push( `${parameterSelection.reference}.${parameterSelection.value}${parameterSelection.measurement? `(${parameterSelection.measurement})` : ``}` ); //yVariable
            }
            obj = Packagize(obj, { 
                outputVariables: [ outputVariableId ?? 0 ],
                inputVariables
            });
        }

        return obj;
    }

    RegisterVariables() {
        this.xOptions = GetSelections();
        this.yOptions = GetSelections();
        if(VariablesToPoll.indexOf(this.XReference) === -1)
            VariablesToPoll.push(this.XReference);
        if(VariablesToPoll.indexOf(this.YReference) === -1)
            VariablesToPoll.push(this.YReference);
        const thisClass = this;
        LiveUpdateEvents[this.GUID] = function() {
            if(thisClass.XReference && thisClass.YReference) { 
                const xVariableId = VariableMetadata.GetVariableId(thisClass.XReference);
                const yVariableId = VariableMetadata.GetVariableId(thisClass.YReference);
                if(CurrentVariableValues[xVariableId] !== undefined && CurrentVariableValues[yVariableId] !== undefined) {
                    thisClass.Table.trail(CurrentVariableValues[xVariableId], CurrentVariableValues[yVariableId])
                } 
            }
        };
    }
}
GenericConfigs.push(Calculation_2AxisTable);
customElements.define(`calculation-2axistable`, Calculation_2AxisTable, { extends: `span` });

function GetSelections(measurement, output, inputs, configs, configsOnly) {
    var selections = [];
    if (configs?.length > 0) {
        var configGroups = configs;
        if(!configs[0].Group && !configs[0].Configs)
            configGroups = [{ Group: `Calculations`, Configs: configs }];

        for(var c = 0; c < configGroups.length; c++) {
            var configOptions = { Group: configGroups[c].Group, Options: [] }
            configs = configGroups[c].Configs;
            for (var i = 0; i < configs.length; i++) {
                if (output !== undefined && configs[i].Output !== output) 
                    continue;

                if(measurement !== undefined && ((configs[i].Measurement !== undefined && measurement !== configs[i].Measurement) || (MeasurementType[measurement] !== undefined && MeasurementType[measurement] !== configs[i].Output)))
                    continue;
                
                if(inputs !== undefined) {
                    if(inputs.length !== configs[i].Inputs.length || configs[i].Inputs === undefined)
                        continue;
                    var inputsMatch = true;
                    for(var im = 0; im < inputs.length; im++){
                        if(inputs[im] !== configs[i].Inputs[im]){
                            inputsMatch = false;
                            break;
                        }
                    }
                    if(!inputsMatch)
                        continue;
                }
                configOptions.Options.push({
                    Name: configs[i].Name,
                    Value: { value: configs[i].name }
                });
            }
            if(configOptions.Options.length > 0)
                selections.push(configOptions);
        }
    }

    if(!(inputs || configsOnly)) {
        for (var property in VariableRegister) {
            if (!Array.isArray(VariableRegister[property]))
                continue;

            var arr = VariableRegister[property];

            var arrSelections = { Group: property, Options: [] };

            for (var i = 0; i < arr.length; i++) {
                if ((!measurement || arr[i].Measurement === measurement) && (output === undefined || arr[i].Type === output)) {
                    arrSelections.Options.push({
                        Name: arr[i].Name,
                        Info: (!measurement ? `[${arr[i].Measurement}]` : undefined),
                        Value: { reference: property, value: arr[i].Name, measurement: arr[i].Measurement }
                    });
                }
            }
            if(arrSelections.Options.length > 0)
                selections.push(arrSelections);
        }
    }

    if(selections.length === 1)
        return selections[0].Options;

    return selections;
}

class CalculationOrVariableSelection extends UI.Template {
    static Template = `<label><span data-element="labelElement"></span>:</label><div data-element="Selection"></div><div data-element="LiveUpdate"></div><span data-element="CalculationContent"></span>`
    CalculationContent = document.createElement(`span`);
    ConfigValues = [];

    labelElement = document.createElement(`span`);
    get label() {
        return this.labelElement.textContent;
    }
    set label(label) {
        if(this.label === label)
            return;

        this.labelElement.textContent = label;

        this.ConfigValues.forEach(function(configValue) { configValue.label = label; });
    }

    _xlabel = `X`;
    get xLabel() {
        return this._xlabel;
    }
    set xLabel(xlabel) {
        if(this._xlabel === xlabel)
            return;

        this._xlabel = xlabel;

        this.ConfigValues.forEach(function(configValue) { configValue.xLabel = xlabel; });
    }

    _ylabel = `Y`;
    get yLabel() {
        return this._xlabel;
    }
    set yLabel(ylabel) {
        if(this._ylabel === ylabel)
            return;

        this._ylabel = ylabel;

        this.ConfigValues.forEach(function(configValue) { configValue.yLabel = ylabel; });
    }

    _referenceName = undefined;
    get ReferenceName() {
        return this._referenceName;
    }
    set ReferenceName(referenceName) {
        if(this._referenceName === referenceName)
            return;

        this._referenceName = referenceName;

        this.ConfigValues.forEach(function(configValue) { configValue.ReferenceName = referenceName; });
    }

    _measurement = undefined;
    get Measurement() {
        if(this._measurement)
            return this._measurement;

        const selection = this.Selection.Value;
        if (!selection?.reference) {
            const subConfig = this.GetSubConfig();
            return GetClassProperty(subConfig, `Measurement`);
        }
        return selection?.measurement;
    }
    set Measurement(measurement) {
        this._measurement = measurement;
        if(!this._measurement)
            return;

        this.Selection.options = GetSelections(this._measurement, this.Output, this.Inputs, this.Configs, this.ConfigsOnly);
        let match = false;
        let stringValue = UI.Selection.ParseValue(`string`, this.Selection.value)
        this.Selection.options.forEach(option => {
            if(option.Group){
                option.Options.forEach(option => {
                    if(UI.Selection.ParseValue(`string`, option.Value) === stringValue)
                        match = true;
                });
            } else {
                if(UI.Selection.ParseValue(`string`, option.Value) === stringValue)
                    match = true;
            }
        });

        if(!match) 
            this.Selection.value = this.Selection.selectValue;
    }

    constructor(prop) {
        super();
        var thisClass = this;
        this.LiveUpdate = new DisplayLiveUpdate({
            Measurement: prop?.Measurement,
            MeasurementUnitName: prop?.MeasurementUnitName
        });
        this.LiveUpdate.style.float = `right`;
        this.Selection = new UI.Selection({
            options: GetSelections(prop?.Measurement, prop?.Output, prop?.Inputs, prop?.Configs, prop?.ConfigsOnly),
            selectDisabled: false,
            selectName: `None`
        });
        this.Selection.addEventListener(`change`, function() {
            const subConfig = thisClass.GetSubConfig();
            thisClass.CalculationContent.replaceChildren(subConfig ?? ``);
            thisClass.LiveUpdate.Measurement = thisClass.Measurement;
        });
        this.style.display = `block`;
        this.Setup(prop);
    }

    static SaveOnlyActive = false;
    get saveValue() {
        let saveValue = super.saveValue ?? {};

        if (this.ConfigValues) {
            if(CalculationOrVariableSelection.SaveOnlyActive) {
                var subConfig = this.GetSubConfig();
                if(subConfig?.saveValue !== undefined) {
                    var configValue = subConfig.saveValue;
                    if(typeof configValue !== `object`)
                        configValue = { Value: configValue };
                    configValue.ClassName = subConfig.constructor.name;
                    saveValue.Values = [ configValue ];
                }
            } else {
                saveValue.Values = [];
                for (var i = 0; i < this.ConfigValues.length; i++) {
                    var configValue = this.ConfigValues[i].saveValue;
                    if(typeof configValue !== `object`)
                        configValue = { Value: configValue };
                    configValue.ClassName = this.ConfigValues[i].constructor.name
                    saveValue.Values.push(configValue);
                }
            } 
        }

        return saveValue;
    }

    set saveValue(saveValue) {
        saveValue ??= {};

        if(saveValue.Values === undefined)
            saveValue.Values = [];
        
        for (var i = 0; i < saveValue.Values.length; i++) {
            var found = false;
            for (var t = 0; t < this.ConfigValues.length; t++) {
                if (saveValue.Values[i].ClassName === this.ConfigValues[i]?.constructor.name){
                    this.ConfigValues[t].saveValue = saveValue.Values[i];
                    found = true;
                    break;
                }
            }
            if (!found && this.Configs) {
                var configGroups = this.Configs;
                if(!this.Configs[0].Group && !this.Configs[0].Configs)
                    configGroups = [{ Group: `Calculations`, Configs: this.Configs }];
        
                for(var c = 0; c < configGroups.length; c++) {
                    const configs = configGroups[c].Configs;
                    for (var t = 0; t < configs.length; t++) {
                        if (saveValue.Values[i].ClassName !== configs[t].name)
                            continue;
                        this.ConfigValues.push(new configs[t]({
                            noParameterSelection: this.noParameterSelection,
                            label: this.label,
                            xLabel: this.xLabel,
                            yLabel: this.yLabel,
                            ReferenceName: this.ReferenceName,
                            saveValue: saveValue.Values[i],
                            Measurement: this._measurement,
                            MeasurementUnitName: this.MeasurementUnitName
                        }));
                    }
                }
            }
        }

        super.saveValue = saveValue;
    }

    get value() {
        let value = super.value ?? {};

        if (this.ConfigValues) {
            if(CalculationOrVariableSelection.SaveOnlyActive) {
                var subConfig = this.GetSubConfig();
                if(subConfig?.value !== undefined) {
                    var configValue = subConfig.value;
                    if(typeof configValue !== `object`)
                        configValue = { Value: configValue };
                    configValue.ClassName = subConfig.constructor.name;
                    value.Values = [ configValue ];
                }
            } else {
                value.Values = [];
                for (var i = 0; i < this.ConfigValues.length; i++) {
                    var configValue = this.ConfigValues[i].value;
                    if(typeof configValue !== `object`)
                        configValue = { Value: configValue };
                    configValue.ClassName = this.ConfigValues[i].constructor.name
                    value.Values.push(configValue);
                }
            } 
        }

        return value;
    }

    set value(value) {
        value ??= {};

        if(value.Values === undefined)
        value.Values = [];
        
        for (var i = 0; i < value.Values.length; i++) {
            var found = false;
            for (var t = 0; t < this.ConfigValues.length; t++) {
                if (value.Values[i].ClassName === this.ConfigValues[i]?.constructor.name){
                    this.ConfigValues[t].value = value.Values[i];
                    found = true;
                    break;
                }
            }
            if (!found && this.Configs) {
                var configGroups = this.Configs;
                if(!this.Configs[0].Group && !this.Configs[0].Configs)
                    configGroups = [{ Group: `Calculations`, Configs: this.Configs }];
        
                for(var c = 0; c < configGroups.length; c++) {
                    const configs = configGroups[c].Configs;
                    for (var t = 0; t < configs.length; t++) {
                        if (value.Values[i].ClassName !== configs[t].name)
                            continue;
                        this.ConfigValues.push(new configs[t]({
                            noParameterSelection: this.noParameterSelection,
                            label: this.label,
                            xLabel: this.xLabel,
                            yLabel: this.yLabel,
                            ReferenceName: this.ReferenceName,
                            value: value.Values[i],
                            Measurement: this._measurement,
                            MeasurementUnitName: this.MeasurementUnitName
                        }));
                    }
                }
            }
        }

        super.value = value;
    }

    RegisterVariables() {
        this.Selection.options = GetSelections(this._measurement, this.Output, this.Inputs, this.Configs, this.ConfigsOnly);
        const selection = this.Selection.Value;
        if (selection && this.ReferenceName) {
            const thisReference = this.GetVariableReference();
            if (!selection.reference) {
                const subConfig = this.GetSubConfig();
                if(subConfig !== undefined) {
                    const type = GetClassProperty(subConfig, `Output`)
                    if (type) {
                        VariableRegister.RegisterVariable(thisReference, type);
                    }
                    subConfig.RegisterVariables?.();
                }
            } else {
                VariableRegister.RegisterVariable(thisReference, undefined, `${selection.reference}.${selection.value}${this.Measurement? `(${this.Measurement})` : ``}`);
            }
            const variable = VariableRegister.GetVariableByReference(thisReference)
            if(variable?.Type === `float` || variable?.Type === `bool`){
                this.LiveUpdate.VariableReference = thisReference;
                this.LiveUpdate.Measurement = this.Measurement;
            }
            else 
                this.LiveUpdate.VariableReference = undefined;
            this.LiveUpdate.RegisterVariables();
        }
    }

    GetObjOperation(...args) {
        const selection = this.Selection.Value;         
        if(!selection?.reference) {
            const subConfig = this.GetSubConfig();
            if(!subConfig)
                return;
            if(this.ReferenceName)
                return subConfig.GetObjOperation(this.GetVariableReference(), ...args);
            return subConfig.GetObjOperation(...args);
        }
    }

    GetSubConfigIndex() {
        if (this.Selection.Value?.reference || !this.Configs)
            return -1;

        const selection = this.Selection.Value;
        if(selection == undefined)
            return -1;
        for (var i = 0; i < this.ConfigValues.length; i++) {
            if (this.ConfigValues[i].constructor.name === selection.value) {
                return i;
            }
        }
        var configGroups = this.Configs;
        if(!this.Configs[0].Group && !this.Configs[0].Configs)
            configGroups = [{ Group: `Calculations`, Configs: this.Configs }];
        for(var c = 0; c < configGroups.length; c++) {
            const configs = configGroups[c].Configs;
    
            for (var i = 0; i < configs.length; i++) {
                if (configs[i] === undefined || configs[i].name !== selection.value)
                    continue;
                this.ConfigValues.push(new configs[i]({
                    noParameterSelection: this.noParameterSelection,
                    label: this.label,
                    xLabel: this.xLabel,
                    yLabel: this.yLabel,
                    ReferenceName: this.ReferenceName,
                    Measurement: this._measurement,
                    MeasurementUnitName: this.MeasurementUnitName
                }));
                return this.ConfigValues.length-1;
            }
        }
    }

    GetSubConfig() {
        const subConfigIndex = this.GetSubConfigIndex();
        if (subConfigIndex < 0)
            return undefined;

        return this.ConfigValues[subConfigIndex];
    }
    
    IsVariable() {
        return this.Selection.Value?.reference;
    }

    GetVariableReference() {
        if (this.Selection.Value && this.ReferenceName)
            return `${this.ReferenceName}${this.Measurement? `(${this.Measurement})` : ``}`;
    }
}
customElements.define(`calculation-orvariableselection`, CalculationOrVariableSelection, { extends: `span` });

class Calculation_Formula extends UI.Template {
    static Name = `Formula`;
    static Output = `float`;
    static Inputs = [];
    static Template = `<div data-element="editFormula"></div><div data-element="parameterElements"></div>`;

    editFormula = new UI.Dialog({ buttonLabel: `Edit Formula` });
    formulaDialogTemplate = new UI.Template({ 
        Template: `<div style="display: flex; width: 100%"><div style="margin-right: 2em; width: fit-content">Formula:</div><div data-element="formula"></div></div><div data-element="parameterElements"></div>`, 
        parameterElements: document.createElement(`div`),
        formula: new UI.Text({ class: `formula` })
    });
    parameterElements = document.createElement(`div`);
    #operations = [];
    get operations() {
        return this.#operations;
    }
    set operations(operations) {
        this.#operations = operations;
        const thisClass = this;
        this.parameters = operations.flatMap(o => o.parameters).filter(p => p.indexOf(`temp`) !== 0 && isNaN(parseFloat(p))).sort(function(a,b) { return thisClass.formulaDialogTemplate.formula.value.indexOf(a) - thisClass.formulaDialogTemplate.formula.value.indexOf(b); });
    }

    parameterValues = {};
    get parameters() {
        return [...this.parameterElements.children].map(e => e.name);
    }
    set parameters(parameters) {
        const thisClass = this;
        for(let i in parameters){ 
            if(parameters[i] === ``) {
                parameters.splice(i, 1);
            }
        }
        while(parameters.length < this.parameterElements.children.length) { this.parameterElements.removeChild(this.parameterElements.lastChild); }
        while(parameters.length < this.formulaDialogTemplate.parameterElements.children.length) { this.formulaDialogTemplate.parameterElements.removeChild(this.formulaDialogTemplate.parameterElements.lastChild); }
        for(let i = 0; i < parameters.length; i++) { 
            let parameterValue = this.parameterValues[parameters[i]];
            if(!parameterValue) {
                parameterValue = this.parameterValues[parameters[i]] = new CalculationOrVariableSelection({
                    label: parameters[i],
                    Configs: GenericConfigs,
                    output: `float`,
                    ReferenceName: this.ReferenceName? `${this.ReferenceName}_${parameters[i]}` : undefined,
                    Measurement: this.Measurement
                });
            }
            let formulaParameter = this.formulaDialogTemplate.parameterElements.children[i];
            if(!formulaParameter) {
                formulaParameter = this.formulaDialogTemplate.parameterElements.appendChild(document.createElement(`div`)); 
            }
            formulaParameter.replaceChildren(parameterValue);
            let configParameter = this.parameterElements.children[i];
            if(!configParameter) {
                configParameter = this.parameterElements.appendChild(document.createElement(`span`));
                configParameter.style.display = "block"; 
                let label = configParameter.appendChild(document.createElement(`label`));
                label.append(document.createElement(`span`));
                Object.defineProperty(configParameter, `name`, {
                    get: function() {
                        return this.firstChild.firstChild.innerText;
                    },
                    set: function(name) {
                        this.firstChild.firstChild.innerText = name;
                    }
                });
                label.append(`:`);
                configParameter.append(document.createElement(`span`));
            }
            configParameter.name = parameters[i];
            configParameter.lastChild.replaceChildren(parameterValue.LiveUpdate, parameterValue.CalculationContent);
            if(parameterValue.CalculationContent.innerHTML === ``)
                configParameter.hidden = true;
            else
                configParameter.hidden = false;
            parameterValue.Selection.addEventListener(`change`, function() {
                if(parameterValue.CalculationContent.innerHTML === ``)
                    configParameter.hidden = true;
                else
                    configParameter.hidden = false;
                if([...thisClass.parameterElements.children].filter(e => !e.hidden).length === 0)
                    thisClass.parameterElements.hidden = true;
                else 
                    thisClass.parameterElements.hidden = false;
            });
        }
        if([...this.parameterElements.children].filter(e => !e.hidden).length === 0)
            this.parameterElements.hidden = true;
        else 
            this.parameterElements.hidden = false;
    }

    get label() {
        return this.editFormula.title.substring(0, this.editFormula.title.length - 8)
    }
    set label(label){
        this.editFormula.title = label + ` Formula`;
    }

    _measurement = undefined;
    get Measurement() {
        if(this._measurement)
            return this._measurement;
    }
    set Measurement(measurement) {
        if(this._measurement === measurement)
            return;

        this._measurement = measurement;
        for(let parameter in this.parameterValues) {
            let parameterValue = this.parameterValues[parameter];
            if(!parameterValue)
                continue;
            
            this.parameterValues.Measurement = measurement;
        }
    }
    
    _referenceName = undefined;
    get ReferenceName() {
        return this._referenceName;
    }
    set ReferenceName(referenceName) {
        if(this._referenceName === referenceName)
            return;

        this._referenceName = referenceName;
        for(let parameter in this.parameterValues) {
            let parameterValue = this.parameterValues[parameter];
            if(!parameterValue)
                continue;

            parameterValue.ReferenceName = this.ReferenceName? `${this.ReferenceName}_${parameters[i]}` : undefined;
        }
    }

    get saveValue() {
        let saveValue = super.saveValue ?? {};
        
        saveValue.parameterValues = {};
        for(let parameter in this.parameterValues) {
            saveValue.parameterValues[parameter] = this.parameterValues[parameter]?.saveValue;
        }

        return saveValue;
    }

    set saveValue(saveValue) {
        saveValue ??= {};
        super.saveValue = saveValue;
        
        const thisClass = this;
        Object.keys(this.parameterValues).filter(p => saveValue.parameterValues[p] === undefined).forEach(function(p) { delete thisClass.parameterValues[p]; })

        for(let parameter in saveValue.parameterValues) {
            let parameterValue = this.parameterValues[parameter] ??= new CalculationOrVariableSelection({
                label: parameter,
                Configs: GenericConfigs,
                output: `float`,
                ReferenceName: this.ReferenceName? `${this.ReferenceName}_${parameter}` : undefined,
                Measurement: this.Measurement
            });

            parameterValue.saveValue = saveValue.parameterValues[parameter];

            window[parameter] = parameterValue.ConfigValues[0];
        }
    }

    get value() {
        let value = super.value ?? {};
        
        value.parameterValues = {};
        for(parameter in this.parameterValues) {
            value.parameterValues[parameter] = this.parameterValues[parameter]?.value;
        }

        return value;
    }

    set value(value) {
        value ??= {};
        super.value = value;
        
        const thisClass = this;
        Object.keys(this.parameterValues).filter(p => value.parameterValues[p] === undefined).forEach(function(p) { delete thisClass.parameterValues[p]; })

        for(let parameter in value.parameterValues) {
            let parameterValue = this.parameterValues[parameter] ??= new CalculationOrVariableSelection({
                label: parameter,
                Configs: GenericConfigs,
                output: `float`,
                ReferenceName: this.ReferenceName? `${this.ReferenceName}_${parameter}` : undefined,
                Measurement: this.Measurement
            });

            parameterValue.value = value.parameterValues[parameter];
        }
    }

    constructor(prop) {
        super();
        const thisClass = this;
        this.editFormula.content.append(this.formulaDialogTemplate);
        this.editFormula.content.style.minHeight = `200px`;
        this.formulaDialogTemplate.parameterElements.class = `configContainer`;
        this.formulaDialogTemplate.formula.addEventListener(`change`, function() {
            const operations = Calculation_Formula.ParseFormula(thisClass.formulaDialogTemplate.formula.value); 
            if(!Array.isArray(operations)) {
                return; //show something to user
            }
            thisClass.operations = operations;
        });
        this.formulaDialogTemplate.parameterElements.style.display = `block`;
        this.parameterElements.class = `configContainer`;
        this.Setup(prop)
    }

    RegisterVariables() {
        const thisClass = this;
        this.parameters.forEach(function(parameter) { thisClass.parameterValues[parameter].RegisterVariables(); })
        if (this.ReferenceName) {
            const thisReference = this.GetVariableReference();
            const type = GetClassProperty(this, `Output`);
            VariableRegister.RegisterVariable(thisReference, GetClassProperty(this, `Output`));
        }
    }

    GetVariableReference() {
        return `${this.ReferenceName}${this.Measurement? `(${this.Measurement})` : ``}`;
    }

    GetObjOperation(outputVariableId) {
        var group  = { 
            type: `Group`, 
            value: []
        };
        outputVariableId ?? this.ReferenceName;
        
        const thisClass = this;
        this.parameters.forEach(function(parameter) { group.value.push(thisClass.parameterValues[parameter].GetObjOperation()); })
        const operations = this.operations;
        for(let operationIndex in operations) {
            let operation = operations[operationIndex];
            if(operation.resultInto === `return`)
                operation.resultInto = outputVariableId ?? this.GetVariableReference();
            let parameterValues = operation.parameters.map(p => thisClass.parameterValues[p]?.GetVariableReference() ?? p);
            switch(operation.operator) {
                case `*`: 
                group.value.push({ 
                    type: `Operation_Multiply`,
                    result: operation.resultInto, //Return
                    a: parameterValues[0],
                    b: parameterValues[1]
                });
                break;
                case `/`: 
                group.value.push({ 
                    type: `Operation_Divide`,
                    result: operation.resultInto, //Return
                    a: parameterValues[0],
                    b: parameterValues[1]
                });
                break;
                case `+`: 
                group.value.push({ 
                    type: `Operation_Add`,
                    result: operation.resultInto, //Return
                    a: parameterValues[0],
                    b: parameterValues[1]
                });
                break;
                case `-`: 
                group.value.push({ 
                    type: `Operation_Subtract`,
                    result: operation.resultInto, //Return
                    a: parameterValues[0],
                    b: parameterValues[1]
                });
                break;
            }
        }

        console.log(group);
        
        return group;
    }
    static ParseFormula(formula, operators = [`*`,`/`,`+`,`-`]) {
        formula = formula.replaceAll(` `, ``); 
        let operations = [];
        let tempIndex = 0;

        //do parenthesis
        let parenthesisFormulas = formula.split(`)`)
        if(parenthesisFormulas.length !== formula.split(`(`).length)
            return `Parenthesis start and end not matching`

        while((parenthesisFormulas = formula.split(`)`)).length > 1) {
            tempIndex++;
            let tempFormula = parenthesisFormulas[0].split(`(`).pop();
            operations.push({
                resultInto: `$temp${tempIndex}`,
                parameters: [tempFormula]
            })
            formula = formula.replace(`(${tempFormula})`, `$temp${tempIndex}`);
        }
        operations.push({
            resultInto: `return`,
            parameters: [formula]
        })

        //do operators
        function splitOnOperators(s) {
            for(let operatorIndex in operators) {
                let operator = operators[operatorIndex];
                s = s.split(operator).join(`,`);
            }
            return s.split(`,`);
        }

        for(let operatorIndex in operators) {
            let operator = operators[operatorIndex];
            let operationIndex;
            while((operationIndex = operations.findIndex(f => f.parameters.find(p => p.indexOf(operator) > -1))) > -1) {
                let formula = operations[operationIndex];
                let parameterIndex = formula.parameters.findIndex(p => p.indexOf(operator) > -1);
                let parameter = formula.parameters[parameterIndex];
                let firstParameter = splitOnOperators(parameter.split(operator)[0]).pop();
                let secondParameter = splitOnOperators(parameter.split(operator)[1])[0];
                if(formula.parameters.length > 1 || splitOnOperators(formula.parameters[0].replace(`${firstParameter}${operator}${secondParameter}`, `temp`)).length > 1) {
                    tempIndex++;
                    formula.parameters[parameterIndex] = parameter.replace(`${firstParameter}${operator}${secondParameter}`, `$temp${tempIndex}`);
                    operations.splice(operationIndex, 0, {
                        operator,
                        resultInto: `$temp${tempIndex}`,
                        parameters: [firstParameter, secondParameter]
                    });
                } else {
                    operations[operationIndex].operator = operator;
                    operations[operationIndex].parameters = [firstParameter, secondParameter];
                }
            }
        }

        //consolidate temp variables
        tempIndex = 0;
        for(let operationIndex in operations) {
            operationIndex = parseInt(operationIndex);
            let formula = operations[operationIndex];
            if(formula.resultInto.indexOf(`$temp`) !== 0)
                continue;
            let nextFormulaParameterIndex;
            if  (operations.filter(f => f.parameters.findIndex(p => p === formula.resultInto) > -1).length < 2 && 
                (nextFormulaParameterIndex = operations[operationIndex+1]?.parameters?.findIndex(p => p === formula.resultInto)) > -1) {
                    operations[operationIndex+1].parameters[nextFormulaParameterIndex] = formula.resultInto = `temp`;
            } else {
                tempIndex++;
                operations.filter(f => f.parameters.findIndex(p => p === formula.resultInto) > -1).forEach(function(f) { for(let parameterIndex in f.parameters) {
                    if(f.parameters[parameterIndex] === formula.resultInto) 
                        f.parameters[parameterIndex] = `temp${tempIndex}`;
                } })
                formula.resultInto = `temp${tempIndex}`;
            }
        }

        return operations;
    }
}
customElements.define(`calculation-formula`, Calculation_Formula, { extends: `span` })
GenericConfigs.push(Calculation_Formula);

class DisplayLiveUpdate extends UI.DisplayNumberWithMeasurement {
    GUID = generateGUID();
    get superHidden() {
        return super.hidden;
    }
    set superHidden(hidden) {
        super.hidden = hidden;
    }
    get hidden() {
        return this._stickyHidden;
    }
    set hidden(hidden) {
        if(hidden === false)
            debugger;
        this._stickyHidden = hidden
        if(hidden)
            super.hidden = hidden;
    }

    _variableReference = undefined;
    get VariableReference() {
        return this._variableReference;
    }
    set VariableReference(variableReference) {
        if(this._variableReference === variableReference)
            return;
        delete LiveUpdateEvents[this.GUID];

        this._variableReference = variableReference;

        if(variableReference) {
            let measurement = variableReference.substring(variableReference.lastIndexOf(`(`) + 1);
            measurement = measurement.substring(0, measurement.length - 1);
            this.Measurement = measurement;
        }
    }

    RegisterVariables() {
        const thisClass = this
        if(VariablesToPoll.indexOf(thisClass.VariableReference) === -1)
            VariablesToPoll.push(thisClass.VariableReference)
        LiveUpdateEvents[this.GUID] = function() {
            if(thisClass.VariableReference) { 
                if(VariablesToPoll.indexOf(thisClass.VariableReference) === -1)
                    VariablesToPoll.push(thisClass.VariableReference)
                const variableId = VariableMetadata.GetVariableId(thisClass.VariableReference);
                if(CurrentVariableValues[variableId] !== undefined) {
                    thisClass.superHidden = false;
                    thisClass.Value = CurrentVariableValues[variableId];
                    if(!thisClass.superHidden) {
                        if(thisClass.superHidden)
                            thisClass.superHidden = false;
                        if(thisClass.TimeoutHandle)
                            window.clearTimeout(thisClass.TimeoutHandle);
        
                        thisClass.TimeoutHandle = window.setTimeout(function() {
                            thisClass.superHidden = true;
                        },5000);
                    }
                } else {
                    thisClass.superHidden = true;
                }
            }
        };
    }

    constructor(prop) {
        prop ??= {};
        super(prop);
        this.superHidden = true;
        this.DisplayValue.class = `livevalue`;
    }
}
customElements.define(`ui-displayliveupdate`, DisplayLiveUpdate, { extends: `span` });