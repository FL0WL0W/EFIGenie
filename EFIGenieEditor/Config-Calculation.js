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


class Calculation_Static extends UINumberWithMeasurement {
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
GenericConfigs.push(Calculation_Static);

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

//this could be refactored to use UITemplate, but it works well and i forsee no changes needed so leaving as is
class Calculation_Polynomial {
    static Name = `Polynomial`;
    static Output = `float`;
    static Inputs = [`float`];
    static Template = getFileContents(`ConfigGui/Operation_Polynomial.html`);

    A = [0, 0, 0];
    get Value() {
        return this.A.slice(0, this.Degree);
    }
    set Value(value) {
        this.A = value;
        this.Degree = value.length;
    }

    constructor(){
        this.GUID = generateGUID();
    }
    
    MinValue = 0;
    MaxValue = 1;
    Degree = 3;

    get SaveValue() {
        return { 
            MinValue: this.MinValue,
            MaxValue: this.MaxValue,
            Degree: this.Degree,
            A: this.A.slice()
        };
    }

    set SaveValue(saveValue) {
        if(saveValue) {
            this.MinValue = saveValue.MinValue;
            this.MaxValue = saveValue.MaxValue;
            this.Degree = saveValue.Degree;
            this.A = saveValue.A.slice();
        }
        $(`#${this.GUID}`).replaceWith(this.GetHtml());
        this.Attach();
    }

    Detach() {
        $(document).off(`change.${this.GUID}`);
    }

    Attach() {
        this.Detach();
        var thisClass = this;

        $(document).on(`change.${this.GUID}`, `#${this.GUID}-min`, function(){
            thisClass.MinValue = parseFloat($(this).val());
        });

        $(document).on(`change.${this.GUID}`, `#${this.GUID}-max`, function(){
            thisClass.MaxValue = parseFloat($(this).val());
        });

        $(document).on(`change.${this.GUID}`, `#${this.GUID}-degree`, function(){
            thisClass.Degree = parseInt($(this).val());

            var oldA = thisClass.A;

            thisClass.A = new Array(thisClass.Degree);
            for(var i = 0; i < thisClass.A.length; i++){
                if(i < oldA.length)
                    thisClass.A[i] = oldA[i];
                else
                    thisClass.A[i] = 0;
            }
            $(`#${thisClass.GUID}-coefficients`).html(thisClass.GetCoefficientsHtml());
        });
        
        $(document).on(`change.${this.GUID}`, `#${this.GUID}-A`, function(){
            var index = $(this).data(`index`);
            var val = parseFloat($(this).val());

            thisClass.A[index] = val;
        });
    }

    GetCoefficientsHtml() {
        var coefficients = `<label>Coefficients:</label>`;
        for(var i = this.Degree-1; i > 0; i--)
        {
            coefficients += `<input id="${this.GUID}-A" data-index="${i}" type="number" step="0.1" value="${this.A[i]}"/>`;
            if(i > 1)
                coefficients += ` x<sup>${i}</sup> + `;
            else
                coefficients += ` x + `;
        }
        coefficients += `<input id="${this.GUID}-A" data-index="0" type="number" step="0.1" value="${this.A[0]}"/>`;

        return coefficients;
    }

    GetHtml() {
        var template = GetClassProperty(this, `Template`);

        template = template.replace(/[$]id[$]/g, this.GUID);
        template = template.replace(/[$]min[$]/g, this.MinValue);
        template = template.replace(/[$]max[$]/g, this.MaxValue);
        template = template.replace(/[$]degree[$]/g, this.Degree);

        template = template.replace(/[$]coefficients[$]/g, this.GetCoefficientsHtml());

        return template;
    }

    GetObjOperation(outputVariableId, inputVariableId) {
        var objOperation = { value: [
            { type: `UINT32`, value: OperationArchitectureFactoryIDs.Offset + OperationArchitectureFactoryIDs.Polynomial}, //factory ID
            { type: `FLOAT`, value: this.MinValue}, //MinValue
            { type: `FLOAT`, value: this.MaxValue}, //MaxValue
            { type: `UINT8`, value: this.Degree}, //Degree
            { type: `FLOAT`, value: this.Value}, //coefficients
        ]};

        if (outputVariableId || inputVariableId) 
            return Packagize(objOperation, { 
                outputVariables: [ outputVariableId ?? 0 ],
                inputVariables: [ inputVariableId ?? 0 ]
            });

        return objOperation;
    }
}
GenericConfigs.push(Calculation_Polynomial);

class Calculation_LookupTable extends UITemplate {
    static Name = `Lookup Table`;
    static Output = `float`;
    static Inputs = [`float`];
    static Label = `Value`;
    static XLabel = `X`
    static Template = `$Dialog$`

    constructor(prop) {
        super();
        this.Dialog = new UIDialog({
            Title: `$Label$`,
            ButtonText: `Edit Table`,
            TemplateIdentifier: `Table`
        });
        this.Table = new UITable({
            BaseObj: true,
            YResolution: 1,
            YResolutionModifiable: false,
            XLabel: prop.NoParameterSelection ? `$XLabel$` : `$ParameterSelection$`,
            ZLabel: `$Label$`
        });
        this.ParameterSelection = prop.NoParameterSelection ? undefined : new UISelection({
            Options: GetSelections()
        });
        this.Setup(prop);
    }

    GetObjOperation(outputVariableId, inputVariableId) {
        const table = this.Table;
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
            this.ParameterSelection.Options = GetSelections();
    }
}
GenericConfigs.push(Calculation_LookupTable);

class Calculation_2AxisTable extends UITemplate {
    static Name = `2 Axis Table`;
    static Output = `float`;
    static Inputs = [`float`, `float`];
    static Label = `Value`;
    static XLabel = `X`
    static YLabel = `Y`
    static Template = `$Dialog$`

    constructor(prop) {
        super();
        this.Dialog = new UIDialog({
            Title: `$Label$`,
            ButtonText: `Edit Table`,
            TemplateIdentifier: `Table`
        });
        this.Table = new UITable({
            BaseObj: true,
            XLabel: prop.NoParameterSelection ? `$XLabel$` : `$XSelection$`,
            YLabel: prop.NoParameterSelection ? `$YLabel$` : `$YSelection$`,
            ZLabel: `$Label$`
        });
        this.XSelection = prop.NoParameterSelection ? undefined : new UISelection({
            Options: GetSelections()
        });
        this.YSelection = prop.NoParameterSelection ? undefined : new UISelection({
            Options: GetSelections(),
        });
        this.Setup(prop);
    }

    GetObjOperation(outputVariableId, xVariableId, yVariableId) {
        const table = this.Table;
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
            this.XSelection.Options = GetSelections();
            this.YSelection.Options = GetSelections();
        }
    }
}
GenericConfigs.push(Calculation_2AxisTable);

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

                if(measurement !== undefined && configs[i].Measurement !== undefined && measurement !== configs[i].Measurement)
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
                        Name: arr[i].Name + (!measurement ? ` [${GetUnitDisplay(arr[i].Measurement)}]` : ``),
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

class CalculationOrVariableSelection extends UITemplate {
    static Label = `Value`;
    static Template = `<label for="$Selection.GUID$">$Label$:</label>$Selection$<span style="float: right;">$LiveUpdate$</span><span id="$GUID$-ConfigValue">$ConfigValue$</span>`;

    ConfigValues = [];

    constructor(prop) {
        super();
        var thisClass = this;
        this.LiveUpdate = new DisplayLiveUpdate({
            Measurement: prop?.Measurement,
            MeasurementIndex: prop?.MeasurementIndex
        });
        this.Selection = new UISelection({
            Options: GetSelections(prop?.Measurement, prop?.Output, prop?.Inputs, prop?.Configs, prop?.ConfigsOnly),
            SelectDisabled: true,
            OnChange: function () {
                const subConfigIndex = thisClass.GetSubConfigIndex();
                thisClass.ConfigValue = `$ConfigValues.${subConfigIndex}$`;
                $(`#${thisClass.GUID}-ConfigValue`).html(thisClass.ConfigValues[subConfigIndex]?.GetHtml?.());
                thisClass.ConfigValues.forEach(function(val) { val.Detach?.(); });
                var subConfig = thisClass.GetSubConfig();
                subConfig?.Attach?.();
                thisClass.LiveUpdate.Measurement = thisClass.Measurement;
            }
        });
        this.Setup(prop);
    }

    static SaveOnlyActive = false;
    get SaveValue() {
        var saveValue = super.SaveValue;

        if (this.ConfigValues) {
            if(CalculationOrVariableSelection.SaveOnlyActive) {
                var subConfig = this.GetSubConfig();
                if(subConfig?.SaveValue !== undefined) {
                    var configValue = subConfig.SaveValue;
                    if(typeof configValue !== `object`)
                        configValue = { Value: configValue };
                    configValue.ClassName = subConfig.constructor.name;
                    saveValue.Values = [ configValue ];
                }
            } else {
                saveValue.Values = [];
                for (var i = 0; i < this.ConfigValues.length; i++) {
                    var configValue = this.ConfigValues[i].SaveValue;
                    if(typeof configValue !== `object`)
                        configValue = { Value: configValue };
                    configValue.ClassName = this.ConfigValues[i].constructor.name
                    saveValue.Values.push(configValue);
                }
            } 
        }

        return saveValue;
    }

    set SaveValue(saveValue) {
        saveValue ??= {};

        if(saveValue.Values === undefined)
            saveValue.Values = [];
        
        for (var i = 0; i < saveValue.Values.length; i++) {
            var found = false;
            for (var t = 0; t < this.ConfigValues.length; t++) {
                if (saveValue.Values[i].ClassName === this.ConfigValues[i]?.constructor.name){
                    this.ConfigValues[t].SaveValue = saveValue.Values[i];
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
                            SaveValue: saveValue.Values[i],
                            NoParameterSelection: this.NoParameterSelection,
                            ReferenceName: this.ReferenceName,
                            Label: this.Label,
                            Measurement: this._measurement,
                            MeasurementIndex: this.MeasurementIndex
                        }));
                    }
                }
            }
        }

        super.SaveValue = saveValue;
    }

    RegisterVariables() {
        this.Selection.Options = GetSelections(this._measurement, this.Output, this.Inputs, this.Configs, this.ConfigsOnly);
        const selection = this.Selection.Value;
        if (selection && this.ReferenceName) {
            const thisReference = this.GetVariableReference();
            if (!selection.reference) {
                const subConfig = this.GetSubConfig();
                if(subConfig !== undefined) {
                    subConfig.ReferenceName = this.ReferenceName;
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
            if(variable?.Type === `float` || variable?.Type === `bool`)
                this.LiveUpdate.VariableReference = thisReference;
            else 
                this.LiveUpdate.VariableReference = undefined;
            this.LiveUpdate.Measurement = this.Measurement;
        }
    }

    GetObjOperation(...args) {
        const selection = this.Selection.Value;         
        if(!selection.reference) {
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
        for (var i = 0; i < this.Configs.length; i++) {
            var configGroups = this.Configs;
            if(!this.Configs[0].Group && !this.Configs[0].Configs)
                configGroups = [{ Group: `Calculations`, Configs: this.Configs }];
    
            for(var c = 0; c < configGroups.length; c++) {
                const configs = configGroups[c].Configs;
                if (configs[i] === undefined || configs[i].name !== selection.value)
                    continue;
                this.ConfigValues.push(new configs[i]({
                    NoParameterSelection: this.NoParameterSelection,
                    ReferenceName: this.ReferenceName,
                    Label: this.Label,
                    Measurement: this._measurement,
                    MeasurementIndex: this.MeasurementIndex
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

    _measurement = undefined;
    get Measurement() {
        if(this._measurement)
            return this._measurement;

        const selection = this.Selection.Value;
        if (!selection.reference) {
            const subConfig = this.GetSubConfig();
            return GetClassProperty(subConfig, `Measurement`);
        }
        return selection.measurement;
    }
    set Measurement(measurement) {
        this._measurement = measurement;
    }

    GetVariableReference() {
        if (this.Selection.Value && this.ReferenceName)
            return `${this.ReferenceName}${this.Measurement? `(${this.Measurement})` : ``}`;
    }
}

class Calculation_Operation extends UITemplate {
    static Name=`Operation`
    static Template=`</br><div class="configContainer"><div><span style="float: right;">$LiveUpdate$</span>$Base$</div>$SubOperation$<span class="controladd">+ Add Operation</span></div`;
    static Output = `float`;

    constructor(prop) {
        super();
        const thisClass = this
        this.Base = new CalculationOrVariableSelection({
            Configs:            GenericConfigs,
            Label:              `Base`,
            Measurement:        prop?.Measurement,
            MeasurementIndex:   prop?.MeasurementIndex
        });
        this.SubOperation = [new CalculationOrVariableSelection({
            Configs:            GenericConfigs,
            Measurement:        prop?.Measurement,
            MeasurementIndex:   prop?.MeasurementIndex,
            Template: `<div>${CalculationOrVariableSelection.Template.replace(`$Label$`, `\\$OperationName.0\\$  \\$OperationSelection.0\\$`)}</div>`
        })];
        this.OperationSelection = [new UISelection({
            Options: [
                { Name: `Adder`,        Value: 1 },
                { Name: `Subtracter`,   Value: 2 },
                { Name: `Multiplier`,   Value: 3 },
                { Name: `Divider`,      Value: 4 }
            ],
            Class: `subOperationSelection`,
            SelectDisabled: true
        })];
        this.OperationName = [new UIText({
            Class: `subOperationName`,
            OnChange: function() {
                thisClass.SubOperation[0].Label = prop.OperationName[0].Value;
            }
        })];
        this.LiveUpdate = new DisplayLiveUpdate({
            Measurement: prop?.Measurement,
            MeasurementIndex: prop?.MeasurementIndex
        });
        this.Setup(prop)
    }

    RegisterVariables() {
        this.LiveUpdate.VariableReference = `${this.ReferenceName}${this.Measurement? `(${this.Measurement})` : ``}`;
        this.LiveUpdate.MeasurementIndex.Measurement = this.Measurement;
    }
}

class DisplayLiveUpdate extends DisplayNumberWithMeasurement {
    get SuperHidden() {
        return super.Hidden;
    }
    set SuperHidden(hidden) {
        super.Hidden = hidden;
    }
    get Hidden() {
        return this._stickyHidden;
    }
    set Hidden(hidden) {
        if(hidden === false)
            debugger;
        this._stickyHidden = hidden
        if(hidden)
            super.Hidden = hidden;
    }

    constructor(prop) {
        prop ??= {};
        prop.NumberClass = "livevalue";
        super(prop);
        this.SuperHidden = true;
    }

    Attach() {
        super.Attach();
        var thisClass = this
        if(VariablesToPoll.indexOf(thisClass.VariableReference) === -1)
            VariablesToPoll.push(thisClass.VariableReference)
        LiveUpdateEvents[this.GUID] = function() {
            if(thisClass.VariableReference) { 
                if(VariablesToPoll.indexOf(thisClass.VariableReference) === -1)
                    VariablesToPoll.push(thisClass.VariableReference)
                const variableId = VariableMetadata.GetVariableId(thisClass.VariableReference);
                if(CurrentVariableValues[variableId] !== undefined) {
                    thisClass.SuperHidden = false;
                    thisClass.Value = CurrentVariableValues[variableId];
                    thisClass.UpdateDisplayValue();
                    if(!thisClass.SuperHidden) {
                        if(thisClass.SuperHidden)
                            thisClass.SuperHidden = false;
                        if(thisClass.TimeoutHandle)
                            window.clearTimeout(thisClass.TimeoutHandle);
        
                        thisClass.TimeoutHandle = window.setTimeout(function() {
                            thisClass.SuperHidden = true;
                        },5000);
                    }
                } else {
                    thisClass.SuperHidden = true;
                }
            }
        };
    }
    Detach() {
        super.Detach();
        delete LiveUpdateEvents[this.GUID];
    }
}