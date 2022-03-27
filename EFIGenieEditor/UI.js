import UINumber from "./JavascriptUI/UINumber.js"
import UICheckBox from "./JavascriptUI/UICheckBox.js";
import UIText from "./JavascriptUI/UIText.js";
import UISelection from "./JavascriptUI/UISelection.js";
import UITemplate from "./JavascriptUI/UITemplate.js";
import UITable from "./JavascriptUI/UITable.js";
import UIGraph3D from "./JavascriptUI/UIGraph3D.js"
import UIGraph2D from "./JavascriptUI/UIGraph2D.js"
import UIDialog from "./JavascriptUI/UIDialog.js"

//adapt new ui modules to old garbage GetHtml/Attach structure
Object.defineProperty(HTMLElement.prototype, 'Class', {
    enumerable: true,
    set: function(pclass) {
        this.class = pclass;
    }
});
Object.defineProperty(HTMLElement.prototype, 'Value', {
    enumerable: true,
    get: function() {
        return this.value;
    },
    set: function(value) {
        this.value = value;
    }
});
HTMLElement.prototype.GetHtml = function() {
    if(this.GUID === undefined)
        this.GUID = generateGUID();
    return `<span id="${this.GUID}"></span>`;
}
HTMLElement.prototype.Attach = function() {
    if(this.GUID === undefined)
        return;
    $(`[id="${this.GUID}"]`).append(this);
}
HTMLElement.prototype.Detach = function() {
    if(this.GUID === undefined)
        return;
    $(`[id="${this.GUID}"]`).html(``);
}

class Template {
    GUID = generateGUID();
    Attached = false;
    onChange = [];

    _hidden = false;
    get hidden() {
        return this._hidden;
    }
    set hidden(hidden) {
        if(this._hidden === hidden)
            return;

        this._hidden = hidden;
        if(hidden) {
            $(`[id="${this.GUID}-TemplateSpan"]`).hide();
        } else {
            $(`[id="${this.GUID}-TemplateSpan"]`).show();
        }
    }

    constructor(prop) {
        if(prop)
            this.Setup(prop);
    }

    Setup(prop) {
        Object.assign(this, prop);
        if(!Array.isArray(this.onChange))
            this.onChange = [ this.onChange ];
        var thisClass = this;
        Object.entries(this).forEach(e => {
            var [elementname, element] = e;
            if(element?.onChange !== undefined && !element?.ExcludeFromonChange) {
                element.onChange.push(function() {
                    thisClass.onChange.forEach(function(onChange) { onChange(); });
                });
            }
        });
    }

    get saveValue() {
        var saveValue;
        var baseObjName;
        var objectsInElements = 0;
        var name = GetClassProperty(this, `Name`);

        //grab baseObjName and count number of objects in element values
        Object.entries(this).forEach(e => {
            var [elementname, element] = e;
            if(typeof element === `object` && element?.BaseObj) {
                objectsInElements++;
                baseObjName = elementname;
            }
        });

        //make sure we have 1 element value that is an object
        if(baseObjName && objectsInElements === 1){
            saveValue = this[baseObjName].saveValue;
            //make sure the baseobj doesnt have a name
            if(name !== undefined && saveValue.Name !== undefined) {
                baseObjName = undefined;
            } else {
                //make sure none of the element values conflict with the baseobj values
                Object.entries(this).forEach(e => {
                    var [elementname, element] = e;
                    if(elementname !== baseObjName && saveValue[elementname] !== undefined) {
                        baseObjName = undefined;
                    }
                });
            }
        } else {
            baseObjName = undefined;
        }

        if(baseObjName) {
            saveValue = this[baseObjName].saveValue;
            saveValue.Name = GetClassProperty(this, `Name`);
        } else {
            saveValue = {};
        }

        Object.entries(this).forEach(e => {
            var [elementname, element] = e;
            if(element && elementname !== baseObjName) {
                saveValue[elementname] = element.saveValue;
            }
        });

        if(Object.keys(saveValue).length === 0)
            return undefined;

        return saveValue;
    }

    set saveValue(saveValue) {
        if(saveValue === undefined)
            return;

        this.Detach();

        const thisClass = this;
        var baseObjName;

        Object.entries(this).forEach(e => {
            var [elementname, element] = e;
            if(!baseObjName && typeof element === `object` && element?.BaseObj) {
                baseObjName = elementname;
            }
        });

        if(baseObjName)
            this[baseObjName].saveValue = saveValue;
        else
            baseObjName = undefined;

        Object.entries(this).forEach(e => {
            var [elementname, element] = e;
            if(saveValue[elementname] !== undefined && typeof element === `object` && elementname !== baseObjName && (baseObjName === undefined || thisClass[baseObjName].saveValue[elementname] === undefined)) {
                element.saveValue = saveValue[elementname];
            }
        });

        this.Attach();
    }

    Detach() {
        if(this.Attached) {
            Object.entries(this).forEach(e => {
                function DetachElement(element) {
                    if(element?.Detach)
                        element.Detach();
                }
                var [elementname, element] = e;
                if(Array.isArray(element))
                    element.forEach(DetachElement);
                else 
                    DetachElement(element);
            });
            this.Attached = false;
        }
    }

    Attach() {
        this.Detach();
        Object.entries(this).forEach(e => {
            function AttachElement(element) {
                if(element?.Attach)
                    element.Attach();
            }
            var [elementname, element] = e;
            if(Array.isArray(element))
                element.forEach(AttachElement);
            else 
                AttachElement(element);
        });
        this.Attached = true;
    }

    GetHtml(){
        var html = GetClassProperty(this, `Template`);
        if(html === undefined)
            return ``;

        const thisClass = this;
        var matches;
        while((matches = html.replaceAll(`\\$`, ``).match(/[$].*?[$]/g)) !== null) {
            matches.forEach(templateIdentifier => {
                function GetTemplateReplacement(obj, templateIdentifier) {
                    const subReplacer = templateIdentifier.indexOf(`.`) > -1;
                    const templateReplacer = GetClassProperty(obj, subReplacer? templateIdentifier.substring(0, templateIdentifier.indexOf(`.`)) : templateIdentifier);
    
                    if(templateReplacer !== undefined) {
                        if(typeof templateReplacer === `object`) {
                            if(subReplacer) {
                                return GetTemplateReplacement(templateReplacer, templateIdentifier.substring(templateIdentifier.indexOf(`.`) + 1));
                            }
                            if(templateReplacer.GetHtml) {
                                return templateReplacer.GetHtml();
                            }
                            //can display arrays but cannot get/set value of arrays
                            if(Array.isArray(templateReplacer)) {
                                var replacement = ``;
                                for(var i = 0; i < templateReplacer.length; i++) {
                                    replacement += GetTemplateReplacement(templateReplacer, `${i}`);
                                }
                                return replacement;
                            }
                            return JSON.stringify(templateReplacer);
                        }
                        return templateReplacer;
                    }
                    return ``;
                }
                templateIdentifier = templateIdentifier.substring(1, templateIdentifier.length -1);
                var templateReplacement = GetTemplateReplacement(thisClass, templateIdentifier);
                
                html = html.replaceAll(`$${templateIdentifier}$`, templateReplacement);
            });
        }
        if((matches = html.replaceAll(`\\\\$`, ``).match(/(\\[$]).*?(\\[$])/g)) !== null)
            matches.forEach(templateIdentifier => {
                templateIdentifier = templateIdentifier.substring(2, templateIdentifier.length -2);
                html = html.replaceAll(`\\$${templateIdentifier}\\$`, `$${templateIdentifier}$`);
            });
        
            html = html.replaceAll(`\\\\$`, `\\$`);

        return `<span id="${this.GUID}-TemplateSpan"${this._hidden? ` style="display: none;"` : ``}>${html}</span>`;
    }
};

class UIMeasurement extends UISelection {
    _measurement;
    get Measurement() {
        return this._measurement;
    }
    set Measurement(measurement){
        if(!measurement)
            return;

        this._measurement = measurement;
        this.Default = Measurements[measurement]?.[GetDefaultUnitIndex(measurement)]?.Name;
        this.options = Measurements[measurement]?.map(unit => { return { Name: unit.Name, Value: unit.Name }; })
        if(this.value === undefined || this.value === `` || this.value === null) 
            this.value = this.Default;
        if(this.options.length === 0)
            this.hidden = true;
        else
            this.hidden = false;
    }

    get saveValue() {
        if(this.value === this.Default)
            return;
        return super.saveValue;
    }
    set saveValue(saveValue) {
        if(saveValue === undefined || saveValue === ``)
            return;
        super.saveValue = saveValue;
    }

    constructor(prop) {
        super(prop);
        if(prop?.Measurement && prop?.value !== undefined) {
            this.Default = this.value;
        }
        this.class = `ui measurement`;
        this.selectNotVisible = true;
    }
}
customElements.define(`ui-measurement`, UIMeasurement, { extends: `div` });

class NumberWithMeasurement extends UITemplate {
    static Template = `<div data-element="DisplayValue"></div><div data-element="DisplayMeasurement"></div>`

    get MeasurementUnitName() {
        return this.DisplayMeasurement.value;
    }
    set MeasurementUnitName(measurementUnitName) {
        if(measurementUnitName === undefined || this.DisplayMeasurement.value === measurementUnitName)
            return;

        this.DisplayMeasurement.value = measurementUnitName;
        this.UpdateDisplayValue();
    }

    get Measurement() {
        return this.DisplayMeasurement.Measurement;
    }
    set Measurement(measurement) {
        if(this.DisplayMeasurement.Measurement == measurement)
            return;

        this.DisplayMeasurement.Measurement = measurement;
        this.UpdateDisplayValue();
    }

    set class(pclass) {
        this.DisplayValue.class = pclass;
    }

    #min = undefined;
    get min() {
        return this.#min;
    }
    set min(min) {
        if(this.#min === min)
            return;

        this.#min = min;
        this.UpdateDisplayValue();
    }

    #max = undefined;
    get max() {
        return this.#max;
    }
    set max(max) {
        if(this.#max === max)
            return;

        this.#max = max;
        this.UpdateDisplayValue();
    }

    #step = undefined;
    get step() {
        return this.#step;
    }
    set step(step) {
        if(this.#step === step)
            return;

        this.#step = step;
        this.UpdateDisplayValue();
    }

    #value;
    get value() {
        return this.#value;
    }
    set value(value) {
        if(this.#value === value)
            return;

        this.#value = value;
        this.UpdateDisplayValue();
    }

    get Unit() {
        return GetUnit(this.Measurement, this.MeasurementUnitName)
    }

    constructor(prop) {
        super();
        var thisClass = this;
        this.DisplayMeasurement = new UIMeasurement({
            Measurement : prop?.Measurement,
            value: prop?.MeasurementUnitName,
            onChange: function() {
                thisClass.UpdateDisplayValue()
            }
        });
        this.DisplayValue = new UINumber({
            ExcludeFromonChange: true,
            onChange: function() {
                if(thisClass.DisplayValue.Value !== undefined && thisClass.Unit)
                    thisClass.Value = (thisClass.DisplayValue.Value -  thisClass.Unit.DisplayOffset) / thisClass.Unit.DisplayMultiplier;
            }
        });
        this.DisplayValue.GUID = this.GUID;
        this.Setup(prop);
    }

    get saveValue() {
        if(this.DisplayMeasurement.saveValue === undefined)
            return this.value;

        return {
            MeasurementUnitName: this.DisplayMeasurement.saveValue,
            Value: this.value
        };
    }
    set saveValue(saveValue){
        if(typeof saveValue === `object`) {
            this.DisplayMeasurement.saveValue = saveValue?.MeasurementUnitName;
            this.value = saveValue?.Value;
        } else {
            this.value = saveValue;
        }
    }

    UpdateDisplayValue() {
        const displayValue = this.ValueToDisplayValue(this.value);
        if(displayValue !== undefined)
            this.DisplayValue.Value = displayValue;
        const displayMin = this.ValueToDisplayValue(this.min);
        if(displayMin !== undefined)
            this.DisplayValue.min = displayMin;
        const displayMax = this.ValueToDisplayValue(this.max);
        if(displayMax !== undefined)
            this.DisplayValue.max = displayMax;
        const displayStep = this.ValueToDisplayValue(this.step);
        if(displayStep !== undefined)
            this.DisplayValue.step = displayStep;
    }

    ValueToDisplayValue(value) {
        if(value !== undefined && this.Unit)
            return value * this.Unit.DisplayMultiplier + this.Unit.DisplayOffset;
    }
}
customElements.define(`ui-numberwithmeasurement`, NumberWithMeasurement, { extends: `div` });

class DisplayNumberWithMeasurement extends UITemplate {
    static Template = `<div data-element="DisplayValue"></div><div data-element="DisplayMeasurement"></div>`

    get MeasurementUnitName() {
        return this.DisplayMeasurement.value;
    }
    set MeasurementUnitName(measurementUnitName) {
        this.DisplayMeasurement.value = measurementUnitName;
        this.UpdateDisplayValue();
    }

    get Measurement() {
        return this.DisplayMeasurement.Measurement;
    }
    set Measurement(measurement) {
        this.DisplayMeasurement.Measurement = measurement;
        this.UpdateDisplayValue();
    }

    #value;
    get value() {
        return this.#value;
    }
    set value(value) {
        this.#value = value;
        this.UpdateDisplayValue();
    }

    constructor(prop) {
        super();
        const thisClass = this;
        this.DisplayMeasurement = new UIMeasurement({
            Measurement : prop?.Measurement,
            value: prop?.MeasurementUnitName,
            onChange: function() {
                thisClass.ZeroesToAdd = 10000000;
                thisClass.UpdateDisplayValue();
            }
        });
        this.DisplayValue = document.createElement(`div`);
        this.DisplayValue.style.display = this.DisplayMeasurement.style.display = `inline-block`;
        
        this.Setup(prop);
        this.ZeroesToAdd = 10000000;
    }

    get saveValue() {
        return this.DisplayMeasurement.saveValue;
    }
    set saveValue(saveValue) {
        this.DisplayMeasurement.saveValue = saveValue;
    }

    UpdateDisplayValue() {
        let unit = GetUnit(this.Measurement, this.MeasurementUnitName)
        if(!unit) 
            unit = { DisplayMultiplier: 1, DisplayOffset: 0};
            
        let displayValue = this.value * unit.DisplayMultiplier + unit.DisplayOffset;
        displayValue = `${parseFloat(parseFloat(parseFloat(displayValue).toFixed(5)).toPrecision(6))}`;
        const indexOfPoint = displayValue.indexOf(`.`);
        var zeroesToAdd = 6-(displayValue.length - indexOfPoint);
        if(indexOfPoint === -1)
            zeroesToAdd = 6;
        if(zeroesToAdd < this.ZeroesToAdd)
            this.ZeroesToAdd = zeroesToAdd;
        zeroesToAdd -= this.ZeroesToAdd;
        for(var i = 0; i < zeroesToAdd; i++)
            displayValue += `0`;

        this.DisplayValue.textContent = displayValue;
    }
}
customElements.define(`ui-displaynumberwithmeasurement`, DisplayNumberWithMeasurement, { extends: `div` });

export default { UI: {
    Template: UITemplate,
    OldTemplate: Template,
    Number: UINumber,
    CheckBox: UICheckBox,
    Text: UIText,
    Selection: UISelection,
    NumberWithMeasurement : NumberWithMeasurement,
    Table: UITable,
    Graph3D: UIGraph3D,
    Graph2D: UIGraph2D,
    Dialog: UIDialog,
    DisplayNumberWithMeasurement
}}