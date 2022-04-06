import UITemplate from "../JavascriptUI/UITemplate.js";
import UISelection from "../JavascriptUI/UISelection.js";
import UIDisplayLiveUpdate from "../UI/UIDisplayLiveUpdate.js";
export default class CalculationOrVariableSelection extends UITemplate {
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
        let stringValue = UISelection.ParseValue(`string`, this.Selection.value)
        this.Selection.options.forEach(option => {
            if(option.Group){
                option.Options.forEach(option => {
                    if(UISelection.ParseValue(`string`, option.Value) === stringValue)
                        match = true;
                });
            } else {
                if(UISelection.ParseValue(`string`, option.Value) === stringValue)
                    match = true;
            }
        });

        if(!match) 
            this.Selection.value = this.Selection.selectValue;
    }

    constructor(prop) {
        super();
        var thisClass = this;
        this.LiveUpdate = new UIDisplayLiveUpdate({
            Measurement: prop?.Measurement,
            MeasurementUnitName: prop?.MeasurementUnitName
        });
        this.LiveUpdate.style.float = `right`;
        this.Selection = new UISelection({
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