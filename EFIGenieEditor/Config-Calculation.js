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

//this still needs some complicated unit work. this is ok for now
class Calculation_Polynomial extends HTMLDivElement {
    static Name = `Polynomial`;
    static Output = `float`;
    static Inputs = [`float`];

    get Measurement() {
        return this.#valueElement.firstChild.Measurement;
    }
    set Measurement(measurement) {
        this.#valueElement.firstChild.Measurement = measurement;
    }

    get MeasurementUnitName() {
        return this.#valueElement.firstChild.MeasurementUnitName;
    }
    set MeasurementUnitName(measurementUnitName) {
        this.#valueElement.firstChild.MeasurementUnitName = measurementUnitName;
    }

    #valueElement = document.createElement(`div`);
    get value() {
        const thisClass = this;
        return [...this.#valueElement.children].map(function(element, index) { return thisClass.#toBaseValue(element.value, index); });
    }
    set value(value) {
        this.degree = value.length;
        for(let i = 0; i < this.#valueElement.children.length; i++) {
            this.#valueElement.children[i].value = this.#toDisplayValue(value[i], i);
        }
    }
    
    #minValueElement = new UI.NumberWithMeasurement({
        value: 0
    });
    get minValue() {
        return this.#minValueElement.value;
    }
    set minValue(minValue) {
        this.#minValueElement.value = minValue;
    }
    
    #maxValueElement = new UI.NumberWithMeasurement({
        value: 1
    });
    get maxValue() {
        return this.#maxValueElement.value;
    }
    set maxValue(maxValue) {
        this.#maxValueElement.value = maxValue;
    }

    #degreeElement = new UI.Number({
        min: 2,
        max: 100,
        step: 1,
        value: 0
    });
    get degree() {
        return this.#degreeElement.value;
    }
    set degree(degree) {
        this.#degreeElement.value = degree;
    }

    constructor(prop) {
        super();
        const minValueLabel = document.createElement(`label`);
        minValueLabel.textContent = `Minimum Value:`
        this.append(minValueLabel);
        this.#minValueElement.DisplayMeasurement.hidden = true;
        this.append(this.#minValueElement);
        this.append(document.createElement(`br`));
        const maxValueLabel = document.createElement(`label`);
        this.append(maxValueLabel);
        this.#maxValueElement.DisplayMeasurement.hidden = true;
        maxValueLabel.textContent = `Maximum Value:`
        this.append(this.#maxValueElement);
        this.append(document.createElement(`br`));
        const degreeLabel = document.createElement(`label`);
        degreeLabel.textContent = `Degree:`
        this.append(degreeLabel);
        this.append(this.#degreeElement);
        this.append(document.createElement(`br`));
        const thisClass = this;
        this.#degreeElement.addEventListener(`change`, function() {
            while(thisClass.#valueElement.children.length > thisClass.degree) { thisClass.#valueElement.removeChild(thisClass.#valueElement.lastChild); }
            for(let i = thisClass.#valueElement.children.length; i < thisClass.degree; i++) {
                let valueElement = thisClass.#valueElement.appendChild(document.createElement(`div`));
                let number = valueElement.appendChild(i === 0? new UI.NumberWithMeasurement({ value: 0 }) : new UI.Number({ value: 0 }));
                if(i !== 0) {
                    let label = valueElement.appendChild(document.createElement(`span`));
                    label.innerHTML = `x<sup>${i}</sup> +`;
                } else {

                    number.addEventListener(`change`, function() { valueElement.dispatchEvent(new Event(`change`, {bubbles: true})); });
                }
                valueElement.style.display = `inline`;
                Object.defineProperty(valueElement, 'value', {
                    get: function() { return this.firstChild.value; },
                    set: function(value) { this.firstChild.value = value }
                });
                Object.defineProperty(valueElement, 'Measurement', {
                    get: function() { return this.firstChild.Measurement; },
                    set: function(value) { this.firstChild.Measurement = value }
                });
                Object.defineProperty(valueElement, 'MeasurementUnitName', {
                    get: function() { return this.firstChild.MeasurementUnitName; },
                    set: function(value) { this.firstChild.MeasurementUnitName = value }
                });
            }
        });
        this.degree = 2;
        this.append(this.#valueElement);
        this.#valueElement.style.display = `flex`;
        this.#valueElement.style.flexDirection = `row-reverse`;
        this.#valueElement.style.alignItems = `flex-start`;
        this.#valueElement.style.justifyContent = `flex-end`;
        this.#valueElement.firstChild.addEventListener(`change`, function() {
            //convert value
            thisClass.#minValueElement.Measurement = thisClass.Measurement;
            thisClass.#maxValueElement.Measurement = thisClass.Measurement;
            thisClass.#minValueElement.MeasurementUnitName = thisClass.MeasurementUnitName;
            thisClass.#maxValueElement.MeasurementUnitName = thisClass.MeasurementUnitName;
        });
        Object.assign(this, prop);
    }

    get saveValue() {
        return { 
            MinValue: this.minValue,
            MaxValue: this.maxValue,
            A: this.value
        };
    }

    set saveValue(saveValue) {
        if(saveValue) {
            this.minValue = saveValue.MinValue;
            this.maxValue = saveValue.MaxValue;
            this.value = saveValue.A;
        }
    }

    GetObjOperation(outputVariableId, inputVariableId) {
        var obj = { value: [
            { type: `UINT32`, value: OperationArchitectureFactoryIDs.Offset + OperationArchitectureFactoryIDs.Polynomial}, //factory ID
            { type: `FLOAT`, value: this.minValue}, //MinValue
            { type: `FLOAT`, value: this.maxValue}, //MaxValue
            { type: `UINT8`, value: this.degree}, //Degree
            { type: `FLOAT`, value: this.value}, //coefficients
        ]};

        if (outputVariableId || inputVariableId) 
            obj = Packagize(obj, { 
                outputVariables: [ outputVariableId ?? 0 ],
                inputVariables: [ inputVariableId ?? 0 ]
            });

        return obj;
    }

    #toDisplayValue(value, index) {
        //todo
        const unit = Measurements[this.Measurement]?.[this.MeasurementUnitName];
        return value;
    }
    #toBaseValue(value, index) {
        //todo
        const unit = Measurements[this.Measurement]?.[this.MeasurementUnitName];
        return value;
    }
}
GenericConfigs.push(Calculation_Polynomial);
customElements.define('ui-polynomial', Calculation_Polynomial, { extends: 'div' });

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
customElements.define(`calculation-lookuptable`, Calculation_LookupTable, { extends: `div` });

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
customElements.define(`calculation-2axistable`, Calculation_2AxisTable, { extends: `div` });

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
            if(!subConfig)
                thisClass.CalculationContent.innerHTML = ``;
            else
                thisClass.CalculationContent.replaceChildren(subConfig);
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
customElements.define(`calculation-orvariableselection`, CalculationOrVariableSelection, { extends: `div` });

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
customElements.define(`ui-displayliveupdate`, DisplayLiveUpdate, { extends: `div` });