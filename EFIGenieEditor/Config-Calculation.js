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


class Calculation_Static extends UI.NumberWithMeasurement {
    static Name = `Static`;
    static Output = `float`;
    static Inputs = [];

    GetObjOperation(outputVariableId) {
        var obj = { value: [{ type: `Operation_StaticVariable`, value: this.Value }] };

        if (outputVariableId) {
            obj.value[0].result = outputVariableId;
        }

        return obj;
    }
}
GenericConfigs.push(Calculation_Static);
customElements.define(`calculation-static`, Calculation_Static, { extends: `div` });

//this could be refactored to use UI.OldTemplate, but it works well and i forsee no changes needed so leaving as is
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

    get saveValue() {
        return { 
            MinValue: this.MinValue,
            MaxValue: this.MaxValue,
            Degree: this.Degree,
            A: this.A.slice()
        };
    }

    set saveValue(saveValue) {
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
        var obj = { value: [
            { type: `UINT32`, value: OperationArchitectureFactoryIDs.Offset + OperationArchitectureFactoryIDs.Polynomial}, //factory ID
            { type: `FLOAT`, value: this.MinValue}, //MinValue
            { type: `FLOAT`, value: this.MaxValue}, //MaxValue
            { type: `UINT8`, value: this.Degree}, //Degree
            { type: `FLOAT`, value: this.Value}, //coefficients
        ]};

        if (outputVariableId || inputVariableId) 
            obj = Packagize(obj, { 
                outputVariables: [ outputVariableId ?? 0 ],
                inputVariables: [ inputVariableId ?? 0 ]
            });

        return obj;
    }
}
GenericConfigs.push(Calculation_Polynomial);

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

class Calculation_LookupTable extends UI.OldTemplate {
    static Name = `Lookup Table`;
    static Output = `float`;
    static Inputs = [`float`];
    static Template = `$Dialog$`

    get Label() {
        return this.Table.zLabel;
    }
    set Label(label){
        this.Table.zLabel = label;
        this.Dialog.Title = label;
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

    get NoParameterSelection() {
        if(this.ParameterSelection)
            return false;
        return true;
    }
    set NoParameterSelection(noParameterSelection) {
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
                onChange: function() {
                    thisClass.ParameterReference = `${thisClass.ParameterSelection.Value.reference}.${thisClass.ParameterSelection.Value.value}${thisClass.ParameterSelection.Value.measurement? `(${thisClass.ParameterSelection.Value.measurement})` : ``}`;
                },
                Class: `TableParameterSelect`
            });
            this.Table.xLabel = this.ParameterSelection;
        }
    }

    get Resolution() {
        return this.Table.XResolution;
    }
    set Resolution(res){
        this.Table.XResolution = res;
    }

    constructor(prop) {
        super();
        const thisClass = this;
        this.Dialog = new UI.Dialog({
            ButtonText: `Edit Table`,
            TemplateIdentifier: `TableGroup`
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
        this.NoParameterSelection = false;
        this.Label = `Value`;
        this.Setup(prop);
    }

    Attach() {
        super.Attach();
        const thisClass = this
        LiveUpdateEvents[this.GUID] = function() {
            if(thisClass.ParameterReference) { 
                const parameterVariableId = VariableMetadata.GetVariableId(thisClass.ParameterReference);
                if(CurrentVariableValues[parameterVariableId] !== undefined) {
                    thisClass.Table.trail(CurrentVariableValues[parameterVariableId])
                } 
            }
        };
    }
    Detach() {
        super.Detach();
        delete LiveUpdateEvents[this.GUID];
    }

    GetObjOperation(outputVariableId, inputVariableId) {
        const table = this.Table;
        const tableValue = table.Value;
        const type = TableGetType(tableValue);
        const typeId = GetTypeId(type);

        var obj = {
            value: [
                { type: `UINT32`, value: OperationArchitectureFactoryIDs.Offset + OperationArchitectureFactoryIDs.LookupTable }, //factory ID
                { type: `FLOAT`, value: table.XAxis[0] }, //MinXValue
                { type: `FLOAT`, value: table.XAxis[table.XResolution-1] }, //MaxXValue
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
    }
}
GenericConfigs.push(Calculation_LookupTable);

class Calculation_2AxisTable extends UI.OldTemplate {
    static Name = `2 Axis Table`;
    static Output = `float`;
    static Inputs = [`float`, `float`];
    static Template = `$Dialog$`

    get Label() {
        return this.Table.zLabel;
    }
    set Label(label){
        this.Table.zLabel = label;
        this.Dialog.Title = label;
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

    get NoParameterSelection() {
        if(this.XSelection || this.YSelection)
            return false;
        return true;
    }
    set NoParameterSelection(noParameterSelection) {
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
                onChange: function() {
                    thisClass.XReference = `${thisClass.XSelection.Value.reference}.${thisClass.XSelection.Value.value}${thisClass.XSelection.Value.measurement? `(${thisClass.XSelection.Value.measurement})` : ``}`;
                }
            });
            this.Table.xLabel = this.XSelection;
        }
        if(!this.YSelection) {
            this.YSelection = new UI.Selection({
                selectNotVisible: true,
                options: GetSelections(),
                onChange: function() {
                    thisClass.YReference = `${thisClass.YSelection.Value.reference}.${thisClass.YSelection.Value.value}${thisClass.YSelection.Value.measurement? `(${thisClass.YSelection.Value.measurement})` : ``}`;
                }
            });
            this.Table.yLabel = this.YSelection;
        }
    }

    get XResolution() {
        return this.Table.XResolution;
    }
    set XResolution(xRes){
        this.Table.XResolution = xRes;
    }

    get YResolution() {
        return this.Table.YResolution;
    }
    set YResolution(yRes){
        this.Table.YResolution = yRes;
    }

    constructor(prop) {
        super();
        const thisClass = this;
        this.Dialog = new UI.Dialog({
            ButtonText: `Edit Table`,
            TemplateIdentifier: `TableGroup`
        });
        this.TableGroup = `$Graph$</br>$Table$`;
        this.Table = new UI.Table({
            BaseObj: true,
        });
        this.Graph = new UI.Graph3D({
            width: 800,
            height: 450
        });
        delete this.Graph.saveValue;
        this.Table.attachToTable(this.Graph);
        this.Graph.attachToTable(this.Table);
        this.NoParameterSelection = false;
        this.Label = `Value`;
        this.Setup(prop);
    }

    Attach() {
        super.Attach();
        const thisClass = this
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
    Detach() {
        super.Detach();
        delete LiveUpdateEvents[this.GUID];
    }

    GetObjOperation(outputVariableId, xVariableId, yVariableId) {
        const table = this.Table;
        const tableValue = table.Value;
        const type = TableGetType(tableValue);
        const typeId = GetTypeId(type);

        var obj = {
            value: [
                { type: `UINT32`, value: OperationArchitectureFactoryIDs.Offset + OperationArchitectureFactoryIDs.Table }, //factory ID
                { type: `FLOAT`, value: table.XAxis[0] }, //MinXValue
                { type: `FLOAT`, value: table.XAxis[table.XResolution-1] }, //MaxXValue
                { type: `FLOAT`, value: table.YAxis[0] }, //MinYValue
                { type: `FLOAT`, value: table.YAxis[table.YResolution-1] }, //MaxYValue
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

class CalculationOrVariableSelection extends UI.OldTemplate {
    static Template = `<div><label>$Label$:</label>$Selection$<span style="float: right;">$LiveUpdate$</span><span id="$GUID$-ConfigValue">$ConfigValue$</span></div>`;
    ConfigValues = [];

    _label = `Value`;
    get Label() {
        return this._label;
    }
    set Label(label) {
        if(this._label === label)
            return;

        this._label = label;

        this.ConfigValues.forEach(function(configValue) { configValue.Label = label; });
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
        if (!selection.reference) {
            const subConfig = this.GetSubConfig();
            return GetClassProperty(subConfig, `Measurement`);
        }
        return selection.measurement;
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
        this.Selection = new UI.Selection({
            options: GetSelections(prop?.Measurement, prop?.Output, prop?.Inputs, prop?.Configs, prop?.ConfigsOnly),
            selectDisabled: false,
            selectName: `None`,
            onChange: function () {
                const subConfigIndex = thisClass.GetSubConfigIndex();
                thisClass.ConfigValue = `$ConfigValues.${subConfigIndex}$`;
                $(`#${thisClass.GUID}-ConfigValue`).html(subConfigIndex === -1? `` : thisClass.ConfigValues[subConfigIndex]?.GetHtml?.());
                thisClass.ConfigValues.forEach(function(val) { val.Detach?.(); });
                var subConfig = thisClass.GetSubConfig();
                subConfig?.Attach?.();
                thisClass.LiveUpdate.Measurement = thisClass.Measurement;
            }
        });
        this.Setup(prop);
    }

    static SaveOnlyActive = false;
    get saveValue() {
        var saveValue = super.saveValue;

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
                            NoParameterSelection: this.NoParameterSelection,
                            Label: this.Label,
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
            if(variable?.Type === `float` || variable?.Type === `bool`)
                this.LiveUpdate.VariableReference = thisReference;
            else 
                this.LiveUpdate.VariableReference = undefined;
            this.LiveUpdate.Measurement = this.Measurement;
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
                    Label: this.Label,
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

class Calculation_Operation extends UI.OldTemplate {
    static Name=`Operation`
    static Template=`</br><div class="configContainer"><div><span style="float: right;">$LiveUpdate$</span>$Base$</div>$SubOperation$<span class="controladd">+ Add Operation</span></div`;
    static Output = `float`;

    constructor(prop) {
        super();
        const thisClass = this
        this.Base = new CalculationOrVariableSelection({
            Configs:            prop.Configs,
            Label:              `Base`,
            Measurement:        prop?.Measurement,
            MeasurementUnitName:   prop?.MeasurementUnitName
        });
        this.SubOperation = [new CalculationOrVariableSelection({
            Configs:            prop.Configs,
            Measurement:        prop?.Measurement,
            MeasurementUnitName:   prop?.MeasurementUnitName,
            Template: CalculationOrVariableSelection.Template.replace(`$Label$`, `\\$OperationName.0\\$  \\$OperationSelection.0\\$`)
        })];
        this.OperationSelection = [new UI.Selection({
            options: [
                { Name: `Adder`,        Value: 1 },
                { Name: `Subtracter`,   Value: 2 },
                { Name: `Multiplier`,   Value: 3 },
                { Name: `Divider`,      Value: 4 }
            ],
            Class: `subOperationSelection`,
            selectDisabled: true
        })];
        this.OperationName = [new UI.Text({
            Class: `subOperationName`,
            onChange: function() {
                thisClass.SubOperation[0].Label = thisClass.OperationName[0].Value;
            }
        })];
        this.LiveUpdate = new DisplayLiveUpdate({
            Measurement: prop?.Measurement,
            MeasurementUnitName: prop?.MeasurementUnitName
        });
        this.Setup(prop)
    }

    RegisterVariables() {
        this.Base.RegisterVariables();
        this.SubOperation.forEach(function(subOperation) {subOperation.RegisterVariables(); });
        this.LiveUpdate.VariableReference = `${this.ReferenceName}${this.Measurement? `(${this.Measurement})` : ``}`;
        this.LiveUpdate.Measurement = this.Measurement;
    }
}

class DisplayLiveUpdate extends UI.DisplayNumberWithMeasurement {
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

        this._variableReference = variableReference;

        if(this._variableReference) {
            let measurement = variableReference.substring(variableReference.lastIndexOf(`(`) + 1);
            measurement = measurement.substring(0, measurement.length - 1);
            this.Measurement = measurement;
        }
    }

    constructor(prop) {
        prop ??= {};
        prop.NumberClass = "livevalue";
        super(prop);
        this.superHidden = true;
    }

    Attach() {
        super.Attach();
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
    Detach() {
        super.Detach();
        delete LiveUpdateEvents[this.GUID];
    }
}