import UITemplate from "../JavascriptUI/UITemplate.js";
import UISelection from "../JavascriptUI/UISelection.js";
import UIDisplayLiveUpdate from "../UI/UIDisplayLiveUpdate.js";
export default class CalculationOrVariableSelection extends UITemplate {
    static template = `<label><span data-element="labelElement"></span>:</label><div data-element="selection"></div><div data-element="liveUpdate"></div><span data-element="calculationContent"></span>`
    calculationContent = document.createElement(`span`);
    calculationValues = [];

    labelElement = document.createElement(`span`);
    get label() {
        return this.labelElement.textContent;
    }
    set label(label) {
        if(this.label === label)
            return;

        this.labelElement.textContent = label;

        this.calculationValues.forEach(function(configValue) { configValue.label = label; });
    }

    _xlabel = `X`;
    get xLabel() {
        return this._xlabel;
    }
    set xLabel(xlabel) {
        if(this._xlabel === xlabel)
            return;

        this._xlabel = xlabel;

        this.calculationValues.forEach(function(configValue) { configValue.xLabel = xlabel; });
    }

    _ylabel = `Y`;
    get yLabel() {
        return this._xlabel;
    }
    set yLabel(ylabel) {
        if(this._ylabel === ylabel)
            return;

        this._ylabel = ylabel;

        this.calculationValues.forEach(function(configValue) { configValue.yLabel = ylabel; });
    }

    _referenceName = undefined;
    get referenceName() {
        return this._referenceName;
    }
    set referenceName(referenceName) {
        if(this._referenceName === referenceName)
            return;

        this._referenceName = referenceName;

        this.calculationValues.forEach(function(configValue) { configValue.referenceName = referenceName; });
    }

    _measurementName = undefined;
    get measurementName() {
        if(this._measurementName)
            return this._measurementName;

        const selection = this.selection.value;
        if (!selection?.reference) {6
            const subConfig = this.GetSubConfig();
            return GetClassProperty(subConfig, `measurementName`);
        }
        return selection?.measurement;
    }
    set measurementName(measurementName) {
        this._measurementName = measurementName;
        if(!this._measurementName)
            return;

        this.selection.options = GetSelections(this._measurementName, this.output, this.inputs, this.calculations, this.calculationsOnly);
        let match = false;
        let stringValue = UISelection.ParseValue(`string`, this.selection.value)
        this.selection.options.forEach(option => {
            if(option.group){
                option.options.forEach(option => {
                    if(UISelection.ParseValue(`string`, option.value) === stringValue)
                        match = true;
                });
            } else {
                if(UISelection.ParseValue(`string`, option.value) === stringValue)
                    match = true;
            }
        });

        if(!match) 
            this.selection.value = this.selection.selectValue;
    }

    constructor(prop) {
        super();
        var thisClass = this;
        this.liveUpdate = new UIDisplayLiveUpdate({
            measurementName: prop?.measurementName,
            measurementUnitName: prop?.measurementUnitName
        });
        this.liveUpdate.style.float = `right`;
        this.selection = new UISelection({
            options: GetSelections(prop?.measurementName, prop?.output, prop?.inputs, prop?.calculations, prop?.calculationsOnly),
            selectDisabled: false,
            selectName: `None`
        });
        this.selection.addEventListener(`change`, function() {
            const subConfig = thisClass.GetSubConfig();
            thisClass.calculationContent.replaceChildren(subConfig ?? ``);
            thisClass.liveUpdate.measurementName = thisClass.measurementName;
        });
        this.style.display = `block`;
        this.Setup(prop);
    }

    static SaveOnlyActive = false;
    get saveValue() {
        let saveValue = super.saveValue ?? {};

        if (this.calculationValues && this.calculationValues.length > 0) {
            if(CalculationOrVariableSelection.SaveOnlyActive) {
                var subConfig = this.GetSubConfig();
                if(subConfig?.saveValue !== undefined) {
                    var configValue = subConfig.saveValue;
                    if(typeof configValue !== `object`)
                        configValue = { value: configValue };
                    configValue.className = subConfig.constructor.name;
                    saveValue.calculationValues = [ configValue ];
                }
            } else {
                saveValue.calculationValues = [];
                for (var i = 0; i < this.calculationValues.length; i++) {
                    var configValue = this.calculationValues[i].saveValue;
                    if(typeof configValue !== `object`)
                        configValue = { value: configValue };
                    configValue.className = this.calculationValues[i].constructor.name
                    saveValue.calculationValues.push(configValue);
                }
            } 
        }
        if(saveValue.calculationValues?.length < 1)
            delete saveValue.calculationValues;

        return saveValue;
    }

    set saveValue(saveValue) {
        saveValue ??= {};
        saveValue.selection ??= saveValue.Selection;
        saveValue.calculationValues ??= saveValue.Values ?? [];
        
        for (var i = 0; i < saveValue.calculationValues.length; i++) {
            var found = false;
            for (var t = 0; t < this.calculationValues.length; t++) {
                saveValue.calculationValues[i].className ??= saveValue.calculationValues[i].ClassName;
                if (saveValue.calculationValues[i].className === this.calculationValues[i]?.constructor.name){
                    this.calculationValues[t].saveValue = saveValue.calculationValues[i];
                    found = true;
                    break;
                }
            }
            if (!found && this.calculations) {
                var configGroups = this.calculations;
                if(!this.calculations[0].group && !this.calculations[0].calculations)
                    configGroups = [{ group: `Calculations`, calculations: this.calculations }];
        
                for(var c = 0; c < configGroups.length; c++) {
                    const calculations = configGroups[c].calculations;
                    for (var t = 0; t < calculations.length; t++) {
                        saveValue.calculationValues[i].className ??= saveValue.calculationValues[i].ClassName;
                        if (saveValue.calculationValues[i].className !== calculations[t].name)
                            continue;
                        this.calculationValues.push(new calculations[t]({
                            noParameterSelection: this.noParameterSelection,
                            label: this.label,
                            xLabel: this.xLabel,
                            yLabel: this.yLabel,
                            referenceName: this.referenceName,
                            saveValue: saveValue.calculationValues[i],
                            measurementName: this._measurementName,
                            measurementUnitName: this.measurementUnitName
                        }));
                    }
                }
            }
        }

        super.saveValue = saveValue;
    }

    get value() {
        let value = super.value ?? {};

        if (this.calculationValues && this.calculationValues.length > 0) {
            if(CalculationOrVariableSelection.SaveOnlyActive) {
                var subConfig = this.GetSubConfig();
                if(subConfig?.value !== undefined) {
                    var configValue = subConfig.value;
                    if(typeof configValue !== `object`)
                        configValue = { value: configValue };
                    configValue.className = subConfig.constructor.name;
                    value.calculationValues = [ configValue ];
                }
            } else {
                value.calculationValues = [];
                for (var i = 0; i < this.calculationValues.length; i++) {
                    var configValue = this.calculationValues[i].value;
                    if(typeof configValue !== `object`)
                        configValue = { value: configValue };
                    configValue.className = this.calculationValues[i].constructor.name
                    value.calculationValues.push(configValue);
                }
            } 
        }
        if(value.calculationValues?.length < 1)
            delete value.calculationValues;

        return value;
    }

    set value(value) {
        value ??= {};
        value.calculationValues ??= value.Values ?? [];
        
        for (var i = 0; i < value.calculationValues.length; i++) {
            var found = false;
            for (var t = 0; t < this.calculationValues.length; t++) {
                value.calculationValues[i].className ??= value.calculationValues[i].ClassName;
                if (value.calculationValues[i].className === this.calculationValues[i]?.constructor.name){
                    this.calculationValues[t].value = value.calculationValues[i];
                    found = true;
                    break;
                }
            }
            if (!found && this.calculations) {
                var configGroups = this.calculations;
                if(!this.calculations[0].group && !this.calculations[0].calculations)
                    configGroups = [{ group: `Calculations`, calculations: this.calculations }];
        
                for(var c = 0; c < configGroups.length; c++) {
                    const calculations = configGroups[c].calculations;
                    for (var t = 0; t < calculations.length; t++) {
                        value.calculationValues[i].className ??= value.calculationValues[i].ClassName;
                        if (value.calculationValues[i].className !== calculations[t].name)
                            continue;
                        this.calculationValues.push(new calculations[t]({
                            noParameterSelection: this.noParameterSelection,
                            label: this.label,
                            xLabel: this.xLabel,
                            yLabel: this.yLabel,
                            referenceName: this.referenceName,
                            value: value.calculationValues[i],
                            measurementName: this._measurementName,
                            measurementUnitName: this.measurementUnitName
                        }));
                    }
                }
            }
        }

        super.value = value;
    }

    RegisterVariables() {
        this.selection.options = GetSelections(this._measurementName, this.output, this.inputs, this.calculations, this.calculationsOnly);
        const selection = this.selection.value;
        if (selection && this.referenceName) {
            const thisReference = this.GetVariableReference();
            if (!selection.reference) {
                const subConfig = this.GetSubConfig();
                if(subConfig !== undefined) {
                    const type = GetClassProperty(subConfig, `output`)
                    if (type) {
                        VariableRegister.RegisterVariable(thisReference, type);
                    }
                    subConfig.RegisterVariables?.();
                }
            } else {
                VariableRegister.RegisterVariable(thisReference, undefined, `${selection.reference}.${selection.value}${this.measurementName? `(${this.measurementName})` : ``}`);
            }
            const variable = VariableRegister.GetVariableByReference(thisReference)
            if(variable?.Type === `float` || variable?.Type === `bool`){
                this.liveUpdate.VariableReference = thisReference;
                this.liveUpdate.measurementName = this.measurementName;
            }
            else 
                this.liveUpdate.VariableReference = undefined;
            this.liveUpdate.RegisterVariables();
        }
    }

    GetObjOperation(...args) {
        const selection = this.selection.value;         
        if(!selection?.reference) {
            const subConfig = this.GetSubConfig();
            if(!subConfig)
                return;
            if(this.referenceName)
                return subConfig.GetObjOperation(this.GetVariableReference(), ...args);
            return subConfig.GetObjOperation(...args);
        }
    }

    GetSubConfigIndex() {
        if (this.selection.value?.reference || !this.calculations)
            return -1;

        const selection = this.selection.value;
        if(selection == undefined)
            return -1;
        for (var i = 0; i < this.calculationValues.length; i++) {
            if (this.calculationValues[i].constructor.name === selection.value) {
                return i;
            }
        }
        var configGroups = this.calculations;
        if(!this.calculations[0].group && !this.calculations[0].calculations)
            configGroups = [{ group: `Calculations`, calculations: this.calculations }];
        for(var c = 0; c < configGroups.length; c++) {
            const calculations = configGroups[c].calculations;
    
            for (var i = 0; i < calculations.length; i++) {
                if (calculations[i] === undefined || calculations[i].name !== selection.value)
                    continue;
                this.calculationValues.push(new calculations[i]({
                    noParameterSelection: this.noParameterSelection,
                    label: this.label,
                    xLabel: this.xLabel,
                    yLabel: this.yLabel,
                    referenceName: this.referenceName,
                    measurementName: this._measurementName,
                    measurementUnitName: this.measurementUnitName
                }));
                return this.calculationValues.length-1;
            }
        }
    }

    GetSubConfig() {
        const subConfigIndex = this.GetSubConfigIndex();
        if (subConfigIndex < 0)
            return undefined;

        return this.calculationValues[subConfigIndex];
    }
    
    IsVariable() {
        return this.selection.value?.reference;
    }

    GetVariableReference() {
        if (this.selection.value && this.referenceName)
            return `${this.referenceName}${this.measurementName? `(${this.measurementName})` : ``}`;
    }
}
customElements.define(`calculation-orvariableselection`, CalculationOrVariableSelection, { extends: `span` });