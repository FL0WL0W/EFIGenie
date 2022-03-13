import UINumber from "./UI/UINumber.js"
import UICheckBox from "./UI/UICheckBox.js";
import UIText from "./UI/UIText.js";
import UISelection from "./UI/UISelection.js";
import UITemplate from "./UI/UITemplate.js";
import UITable from "./UI/UITable.js";

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

class UIMeasurement {
    GUID = generateGUID();
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
            $(`[id="${this.GUID}"]`).hide();
        } else {
            $(`[id="${this.GUID}"]`).css('display', 'inline-block');
            $(`[id="${this.GUID}"]`).show();
        }
    }

    _measurement = undefined;
    get Measurement() {
        return this._measurement;
    }
    set Measurement(measurement){
        if(!measurement || this._measurement === measurement)
            return;

        this._measurement = measurement;
        this.Default = GetDefaultUnitIndex(this.Measurement);
        this._value ??= this.Default;
        $(`[id="${this.GUID}"]`).html(GetUnitDisplay(this._measurement, this._value));
        this.onChange.forEach(function(onChange) { onChange(); });
    }

    _value = undefined;
    get Value() {
        return this._value;
    }
    set Value(value) {
        if(value === undefined)
            return;
        if(this._value === value)
            return;

        this._value = value;
        $(`[id="${this.GUID}"]`).html(GetUnitDisplay(this._measurement, this._value));
        this.onChange.forEach(function(onChange) { onChange(); });
    }

    constructor(prop) {
        if(prop?.Measurement && prop?.MeasurementUnitName !== undefined) {
            this.Measurement = prop.Measurement;
            this.MeasurementUnitName = prop.MeasurementUnitName;
            this.Default = this.MeasurementUnitName;
        }
        Object.assign(this, prop);
        if(!Array.isArray(this.onChange))
            this.onChange = [ this.onChange ];
    }

    get saveValue() {
        if(this.Value !== this.Default){
            return this.Value;
        }
    }
    set saveValue(saveValue){
        this.Value = saveValue;
    }

    Attach() {
        this.Detach();
        const thisClass = this;
        
        $(document).on(`click.${this.GUID}`, `#${this.GUID}`, function(e){
            $(`[id="${thisClass.GUID}-contextmenu"]`).show();
            $(document).on(`mouseup.${this.GUID}`, function(e){
                $(document).off(`mouseup.${thisClass.GUID}`)
                $(`[id="${thisClass.GUID}-contextmenu"]`).hide();
            });
            e.preventDefault();
        });

        $(document).on(`click.${this.GUID}`, `#${this.GUID}-contextmenu div`, function(e){
            thisClass.Value = $(this).data(`unitname`);
            $(`[id="${thisClass.GUID}-contextmenu"]`).hide();
        });
    }

    Detach() {
        $(document).off(`click.${this.GUID}`);
        $(document).off(`mouseup.${this.GUID}`);
    }

    GetHtml() {
        let html = `<div style="display: inline-block"><div style="display: ${this._hidden? `none` : `inline-block`};${Measurements[this._measurement]?.length > 1? ` cursor: pointer;` : ``}" id="${this.GUID}">${GetUnitDisplay(this._measurement, this._value)}</div>
<div id="${this.GUID}-contextmenu" style="display: none;" class="context-menu w3-bar-block">`;

        if(Measurements[this._measurement]?.length > 1) {
            for(let i=0; i<Measurements[this._measurement]?.length; i++) {
                const measurementName = Measurements[this._measurement][i].Name;
                html += `<div class="w3-bar-item w3-button" data-unitname="${measurementName}">${measurementName}</div>`;
            }
        }

        return `${html}</div></div>`
    }
}

class NumberWithMeasurement extends Template {
    static Template = `$DisplayValue$$DisplayMeasurement$`

    get MeasurementUnitName() {
        return this.DisplayMeasurement.Value;
    }
    set MeasurementUnitName(measurementUnitName) {
        if(this.DisplayMeasurement.Value = measurementUnitName)
            return;

        this.DisplayMeasurement.Value = measurementUnitName;
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
            MeasurementUnitName: prop?.MeasurementUnitName,
            onChange: function() {
                thisClass.UpdateDisplayValue()
            }
        });
        this.DisplayValue = new UI.Number({
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

class DisplayNumberWithMeasurement extends Template {
    static Template = `<span class="monospace $NumberClass$" id="$GUID$-DisplayValue">$DisplayValue$</span> <div style="display:inline-block; min-width:50px;">$DisplayMeasurement$</div>`

    get MeasurementUnitName() {
        return this.DisplayMeasurement.Value;
    }
    set MeasurementUnitName(measurementUnitName) {
        this.DisplayMeasurement.Value = measurementUnitName;
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
            MeasurementUnitName: prop?.MeasurementUnitName,
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

class DisplayGauge {
    GUID = generateGUID();

    _hidden = false;
    get hidden() {
        return this._hidden;
    }
    set hidden(hidden) {
        if(this._hidden === hidden)
            return;
            
        this._hidden = hidden;
        if(hidden) {
            $(`[id="${this.GUID}"]`).hide();
        } else {
            $(`[id="${this.GUID}"]`).show();
        }
    }

    _class = undefined;
    get Class() {
        return this._class
    }
    set Class(pclass) {
        if(this._class === pclass)
            return;

        this._class = pclass;
        $(`[id="${this.GUID}"]`).removeClass();
        $(`[id="${this.GUID}"]`).addClass(pclass);
    }

    _min = 0;
    get Min() {
        return this._min
    }
    set Min(min) {
        if(this._min === min)
            return;

        this._min = min;
        $(`[id="${this.GUID}"]`).html(this.GaugeHTML?.(this));
    }

    _label = ``;
    get Label() {
        return this._label
    }
    set Label(label) {
        if(this._label === label)
            return;

        this._label = label;
        $(`[id="${this.GUID}"]`).html(this.GaugeHTML?.(this));
    }

    _max = 100;
    get Max() {
        return this._max
    }
    set Max(max) {
        if(this._max === max)
            return;

        this._max = max;
        $(`[id="${this.GUID}"]`).html(this.GaugeHTML?.(this));
    }

    _step = 10;
    get Step() {
        return this._step
    }
    set Step(step) {
        if(this._step === step)
            return;
            
        this._step = step;
        $(`[id="${this.GUID}"]`).html(this.GaugeHTML?.(this));
    }

    _value = 0;
    get Value() {
        return this._value;
    }
    set Value(value) {
        if(value === undefined)
            return;

        var val = parseFloat(value);
        if(this._value === val) 
            return;

        this._value = val;
        $(`[id="${this.GUID}"]`).html(this.GaugeHTML?.(this));
    }

    _gaugeHTML;
    get GaugeHTML() {
        return this._gaugeHTML;
    }
    set GaugeHTML(gaugeHTML) {
        if(objectTester(gaugeHTML, this._gaugeHTML))
            return;

        this._gaugeHTML = gaugeHTML;
        $(`[id="${this.GUID}"]`).html(this.GaugeHTML?.(this));
    }

    constructor(prop) {
        Object.assign(this, prop);
    }

    GetHtml() {
        var html = `<div id="${this.GUID}"${this._hidden? ` style="display: none;"` : ``}`;

        if(this._class !== undefined)
            html += ` class="${this._class}"`;

        return `${html}>${this.GaugeHTML?.(this)}</div>`;
    }
}

var Gauges = {
    Dial: function({Label, Value, Step, Min, Max}) { 
        let gauge = `<div class="gauge">
<div class="tick-circle"><div class="tick-circle-inner"></div></div>`;
        let steps = (Max - Min) / Step;
        gauge += `<div class="tick min" style="--gauge-tick-deg:0deg;"></div>`
        gauge += `<div class="text" style="--gauge-text-deg:0deg;">${Min}</div>`
        for(let i = 1; (i+0.01) < steps; i++) {
            gauge += `<div class="tick" style="--gauge-tick-deg:${270 * i / steps}deg;"></div>`
            gauge += `<div class="text" style="--gauge-text-deg:${270 * i / steps}deg;">${Step * i + Min}</div>`
        }
        gauge += `<div class="tick max" style="--gauge-tick-deg:270deg;"></div>`
        gauge += `<div class="text" style="--gauge-text-deg:270deg;">${Max}</div>`
        gauge += `<div class="needle" style="--gauge-value-deg:${Value * 270 / (Max - Min)}deg;"></div>`
        gauge += `<div class="value">${Label}</div>`
        return `${gauge}</div>`;
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
    Dialog: UIDialog,
    DisplayNumberWithMeasurement
}}