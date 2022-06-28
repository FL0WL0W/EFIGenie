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

    _measurementName = undefined;
    get measurementName() {
        if(this._measurementName)
            return this._measurementName;

        if (!this.selection.value?.reference) {6
            const subConfig = this.GetSubConfig();
            return GetClassProperty(subConfig, `measurementName`);
        }
        return this.selection.value?.measurement;
    }
    set measurementName(measurementName) {
        this._measurementName = measurementName;
        if(!this._measurementName)
            return;

        this.options = GetSelections(this.calculations, defaultFilter(this.limitSelectionsOnMeasurement? this._measurementName : undefined, this.output, this.inputs, this.calculationsOnly));
    }

    get options() {
        return this.selection.options;
    }    
    set options(options) {
        this.selection.options = options;
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

        if(options.length < 2) {
            if(!match && options.length === 1)
                this.selection.value = options[0].value;
            this.selection.hidden = true;
        } else {
            this.selection.hidden = false;
        }
    }

    constructor(prop) {
        super();
        var thisClass = this;
        prop ??= {};
        prop.limitSelectionsOnMeasurement ??= true;
        this.limitSelectionsOnMeasurement = prop.limitSelectionsOnMeasurement;
        this.liveUpdate = new UIDisplayLiveUpdate({
            measurementName: prop.measurementName,
            measurementUnitName: prop.measurementUnitName
        });
        this.liveUpdate.style.float = `right`;
        this.selection = new UISelection({
            selectDisabled: false,
            selectName: `None`
        });
        this.options = GetSelections(prop.calculations, defaultFilter(prop.limitSelectionsOnMeasurement? prop._measurementName : undefined, prop.output, prop.inputs, prop.calculationsOnly));
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
                            saveValue: saveValue.calculationValues[i],
                            measurementName: this._measurementName,
                            measurementUnitName: this.measurementUnitName,
                            calculations: this.calculations,
                            limitSelectionsOnMeasurement: this.limitSelectionsOnMeasurement
                        }));
                    }
                }
            }
        }

        super.saveValue = saveValue;
    }

    get value() {
        const subConfig = this.GetSubConfig();
        return {
            type: `CalculationOrVariableSelection`,
            selection: this.selection.value,
            calculation: subConfig?.value
        }
    }

    set value(value) {
        this.selection.value = value?.selection;
        const subConfig = this.GetSubConfig();
        if(subConfig)
            subConfig.value = value?.calculation;
    }

    RegisterVariables(referenceName) {
        this.options = GetSelections(this.calculations, defaultFilter(this.limitSelectionsOnMeasurement? this._measurementName : undefined, this.output, this.inputs, this.calculationsOnly));
        const selection = this.selection.value;
        if (selection && referenceName) {
            this.liveUpdate.VariableReference = undefined;
            const thisReference = `${referenceName}${this.measurementName? `(${this.measurementName})` : ``}`;
            if (!selection.reference) {
                const subConfig = this.GetSubConfig();
                if(subConfig !== undefined) {
                    const type = GetClassProperty(subConfig, `output`)
                    if (type) {
                        VariableRegister.RegisterVariable(thisReference, type);
                    }
                    subConfig.RegisterVariables?.(referenceName);
                }
            } else {
                const variableReference = `${selection.reference}${this.measurementName? `(${this.measurementName})` : ``}`;
                VariableRegister.RegisterVariable(thisReference, undefined, variableReference);
            }
            let variable = VariableRegister.GetVariableByReference(thisReference)
            if(variable?.Type === `float` || variable?.Type === `bool`){
                this.liveUpdate.VariableReference = thisReference;
                this.liveUpdate.measurementName = this.measurementName;
            }
            this.liveUpdate.RegisterVariables(thisReference);
        }
    }

    GetObjOperation(...args) {       
        if(this.selection.value) {
            if(!this.selection.value.reference) {
                const subConfig = this.GetSubConfig();
                if(!subConfig)
                    return;
                return subConfig.GetObjOperation(...args);
            } else if(args.length > 0 && args[0] !== undefined) {
                const variableReference = `${this.selection.value.reference}${this.measurementName? `(${this.measurementName})` : ``}`;
                VariableRegister.RegisterVariable(args[0], undefined, variableReference);
            }
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
                    measurementName: this._measurementName,
                    measurementUnitName: this.measurementUnitName,
                    calculations: this.calculations,
                    limitSelectionsOnMeasurement: this.limitSelectionsOnMeasurement
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
}
customElements.define(`calculation-orvariableselection`, CalculationOrVariableSelection, { extends: `span` });