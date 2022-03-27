import UINumber from "./JavascriptUI/UINumber.js"
import UICheckBox from "./JavascriptUI/UICheckBox.js";
import UIText from "./JavascriptUI/UIText.js";
import UISelection from "./JavascriptUI/UISelection.js";
import UITemplate from "./JavascriptUI/UITemplate.js";
import UITable from "./JavascriptUI/UITable.js";
import UIGraph3D from "./JavascriptUI/UIGraph3D.js"
import UIGraph2D from "./JavascriptUI/UIGraph2D.js"

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
    $(`#${this.GUID}`).append(this);
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
        if(!measurement || this._measurement === measurement)
            return;

        this._measurement = measurement;
        this.Default = Measurements[measurement]?.[GetDefaultUnitIndex(measurement)]?.Name;
        this.options = Measurements[measurement]?.map(unit => { return { Name: unit.Name, Value: unit.Name }; })
        if(this.value === undefined || this.value === ``) 
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

    set Class(pclass) {
        this.DisplayValue.Class = pclass;
    }

    _min = undefined;
    get min() {
        return this._min;
    }
    set min(min) {
        if(this._min === min)
            return;

        this._min = min;
        this.UpdateDisplayValue();
    }

    _max = undefined;
    get max() {
        return this._max;
    }
    set max(max) {
        if(this._max === max)
            return;

        this._max = max;
        this.UpdateDisplayValue();
    }

    _step = undefined;
    get step() {
        return this._step;
    }
    set step(step) {
        if(this._step === step)
            return;

        this._step = step;
        this.UpdateDisplayValue();
    }

    _value = 0;
    get Value() {
        return this._value;
    }
    set Value(value) {
        if(this._value === value)
            return;

        this._value = value;
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
            return this.Value;

        return {
            MeasurementUnitName: this.DisplayMeasurement.saveValue,
            Value: this.Value
        };
    }
    set saveValue(saveValue){
        if(typeof saveValue === `object`) {
            this.DisplayMeasurement.saveValue = saveValue?.MeasurementUnitName;
            this.Value = saveValue?.Value;
        } else {
            this.Value = saveValue;
        }
    }

    UpdateDisplayValue() {
        const displayValue = this.ValueToDisplayValue(this._value);
        if(displayValue !== undefined)
            this.DisplayValue.Value = displayValue;
        const displayMin = this.ValueToDisplayValue(this._min);
        if(displayMin !== undefined)
            this.DisplayValue.min = displayMin;
        const displayMax = this.ValueToDisplayValue(this._max);
        if(displayMax !== undefined)
            this.DisplayValue.max = displayMax;
        const displayStep = this.ValueToDisplayValue(this._step);
        if(displayStep !== undefined)
            this.DisplayValue.step = displayStep;
    }

    ValueToDisplayValue(value) {
        if(value !== undefined && this.Unit)
            return value * this.Unit.DisplayMultiplier + this.Unit.DisplayOffset;
    }
}
customElements.define(`ui-numberwithmeasurement`, NumberWithMeasurement, { extends: `div` });

class DisplayNumberWithMeasurement extends Template {
    static Template = `<span class="monospace $NumberClass$" id="$GUID$-DisplayValue">$DisplayValue$</span> <div style="display:inline-block; min-width:50px;">$DisplayMeasurement$</div>`

    get MeasurementUnitName() {
        return this.DisplayMeasurement.value;
    }
    set MeasurementUnitName(measurementUnitName) {
        this.DisplayMeasurement.value = measurementUnitName;
        if(this.Unit)
            this.DisplayValue.Value = (this._value * this.Unit.DisplayMultiplier + this.Unit.DisplayOffset);
    }

    get Measurement() {
        return this.DisplayMeasurement.Measurement;
    }
    set Measurement(measurement) {
        this.DisplayMeasurement.Measurement = measurement;
        if(this.Unit)
            this.DisplayValue.Value = (this._value * this.Unit.DisplayMultiplier + this.Unit.DisplayOffset);
    }

    get Value() { 
        return this._value;
    }
    set Value(value) {
        if(value === this._value)
            return;

        this._value = value;
        this.UpdateDisplayValue();
    }

    constructor(prop) {
        super();
        var thisClass = this;
        this.DisplayMeasurement = new UIMeasurement({
            Measurement : prop?.Measurement,
            value: prop?.MeasurementUnitName,
            onChange: function() {
                thisClass.UpdateDisplayValue();
                thisClass.ZeroesToAdd = 10000000;
            }
        });
        this.Setup(prop);
        this.UpdateDisplayValue();
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

        this.DisplayValue = this.Value * unit.DisplayMultiplier + unit.DisplayOffset;
        var displayValue = `${parseFloat(parseFloat(parseFloat(this.DisplayValue).toFixed(5)).toPrecision(6))}`;
        const indexOfPoint = displayValue.indexOf(`.`);
        var zeroesToAdd = 6-(displayValue.length - indexOfPoint);
        if(indexOfPoint === -1)
            zeroesToAdd = 6;
        if(zeroesToAdd < this.ZeroesToAdd)
            this.ZeroesToAdd = zeroesToAdd;
        zeroesToAdd -= this.ZeroesToAdd;
        for(var i = 0; i < zeroesToAdd; i++)
            displayValue += `0`
        $(`[id="${this.GUID}-DisplayValue"]`).html(displayValue);
    }
}

class UIDialog {
    GUID = generateGUID();
    TemplateIdentifier = undefined;
    Title = `Dialog`;
    ButtonText = `Open`;
    Opened = false

    _hidden = false;
    get hidden() {
        return this._hidden;
    }
    set hidden(hidden) {
        if(this._hidden === hidden)
            return;
            
        this._hidden = hidden;
        if(hidden) {
            $(`[id="${this.GUID}-open"]`).hide();
        } else {
            $(`[id="${this.GUID}-open"]`).show();
        }
    }

    constructor(prop) {
        Object.assign(this, prop);
    }

    Detach() {
        $(document).off(`click.${this.GUID}`);
        $(document).off(`dialogclose.${this.GUID}`);
    }

    Attach() {
        this.Detach();
        var thisClass = this;

        $(document).on(`click.${this.GUID}`, `#${this.GUID}-open`, function(){
            thisClass.Open();
        });
        $(document).on('dialogclose', `[id="${this.GUID}-dialog"]`, function(event) {
            thisClass.Close();
        });
    }

    GetHtml() {
        return  `<input id="${this.GUID}-open"${this._hidden? ` style="display: none;"` : ``} type="button" class="button" value="${this.ButtonText}"></input>` +
                `<div data-title="${this.Title}" id="${this.GUID}-dialog" style="display: none;">$${this.TemplateIdentifier}$</div>`;
    }
    
    Close() {
        if(!this.Opened)
            return;
        this.Opened = false;
        $(`[id="${this.GUID}-dialog"]`).dialog(`close`);
    }

    Open() {
        if(this.Opened)
            return;
        this.Opened = true;
        var dialogSelector = $(`[id="${this.GUID}-dialog"]`);
        dialogSelector.dialog({ 
            resizable: false, 
            width:`auto`, 
            modal:true, 
            title: dialogSelector.data(`title`)
        });
    }
}

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