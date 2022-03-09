import UINumber from "./UI/UINumber.js"
import UICheckbox from "./UI/UICheckbox.js";
import UIText from "./UI/UIText.js";

class Template {
    GUID = generateGUID();
    Attached = false;
    onChange = [];

    _hidden = false;
    get Hidden() {
        return this._hidden;
    }
    set Hidden(hidden) {
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

    get SaveValue() {
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
            saveValue = this[baseObjName].SaveValue;
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
            saveValue = this[baseObjName].SaveValue;
            saveValue.Name = GetClassProperty(this, `Name`);
        } else {
            saveValue = {};
        }

        Object.entries(this).forEach(e => {
            var [elementname, element] = e;
            if(element && elementname !== baseObjName) {
                saveValue[elementname] = element.SaveValue;
            }
        });

        if(Object.keys(saveValue).length === 0)
            return undefined;

        return saveValue;
    }

    set SaveValue(saveValue) {
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
            this[baseObjName].SaveValue = saveValue;
        else
            baseObjName = undefined;

        Object.entries(this).forEach(e => {
            var [elementname, element] = e;
            if(saveValue[elementname] !== undefined && typeof element === `object` && elementname !== baseObjName && (baseObjName === undefined || thisClass[baseObjName].SaveValue[elementname] === undefined)) {
                element.SaveValue = saveValue[elementname];
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

class Number extends UINumber {
    GUID = generateGUID();

    get Hidden() {
        return this.hidden;
    }
    set Hidden(hidden) {
        this.hidden = hidden;
    }

    set Class(pclass) {
        this.class = pclass;
    }

    get Min() {
        return this.min
    }
    set Min(min) {
        this.min = min;
    }

    get Max() {
        return this.max
    }
    set Max(max) {
        this.max = max;
    }

    get Step() {
        return this.step
    }
    set Step(step) {
        this.step = step;
    }

    get Value() {
        return this.value;
    }
    set Value(value) {
        this.value = value;
    }

    constructor(prop) {
        super(prop);
    }

    get SaveValue() {
        return this.saveValue;
    }
    set SaveValue(saveValue){
        this.saveValue = saveValue;
    }

    Attach() {
        $(`#${this.GUID}`).append(this.element);
    }

    GetHtml() {
        return `<span id="${this.GUID}"></span>`
    }
};

class Checkbox extends UICheckbox {
    GUID = generateGUID();

    get Hidden() {
        return this.hidden;
    }
    set Hidden(hidden) {
        this.hidden = hidden;
    }

    set Class(pclass) {
        this.class = pclass;
    }

    get Value() {
        return this.value;
    }
    set Value(value) {
        this.value = value;
    }

    constructor(prop) {
        super(prop);
    }

    get SaveValue() {
        return this.saveValue;
    }
    set SaveValue(saveValue){
        this.saveValue = saveValue;
    }

    Attach() {
        $(`#${this.GUID}`).append(this.element);
    }

    GetHtml() {
        return `<span id="${this.GUID}"></span>`
    }
};

class Text extends UIText {
    GUID = generateGUID();

    get Hidden() {
        return this.hidden;
    }
    set Hidden(hidden) {
        this.hidden = hidden;
    }

    set Class(pclass) {
        this.class = pclass;
    }

    get Value() {
        return this.value;
    }
    set Value(value) {
        this.value = value;
    }

    constructor(prop) {
        super(prop);
    }

    get SaveValue() {
        return this.saveValue;
    }
    set SaveValue(saveValue){
        this.saveValue = saveValue;
    }

    Attach() {
        $(`#${this.GUID}`).append(this.element);
    }

    GetHtml() {
        return `<span id="${this.GUID}"></span>`
    }
};

class Selection {
    static ParseValue(type, value) {
        switch(type) {
            case `number`:
                return parseFloat(value);
            case `boolean`:
                if(typeof value === `number`)
                    return value !== 0;
                if(typeof value === `boolean`)
                    return value;
                if(typeof value === `string`)
                    return value === `true` || value === `True` || value === `1`;
                if(typeof value === `object`) {
                    if(value)
                        return true;
                    return false;
                }
            case `string`:
                if(typeof value === `number` || typeof value === `boolean`)
                    return `${value}`;
                if(typeof value === `string`)
                    return value;
                if(typeof value === `object`)
                    return JSON.stringify(value);
            case `object`:
                if(typeof value === `number` || typeof value === `boolean` || typeof value === `object`)
                    return value;
                if(typeof value === `string`)
                    return JSON.parse(value);
                break;
        }
    }

    GUID = generateGUID();
    onChange = [];
    SelectDisabled = false;
    SelectName = `select`;

    _hidden = false;
    get Hidden() {
        return this._hidden;
    }
    set Hidden(hidden) {
        if(this._hidden === hidden)
            return;
            
        this._hidden = hidden;
        if(hidden) {
            $(`[id="${this.GUID}"]`).hide();
        } else {
            $(`[id="${this.GUID}"]`).show();
            $(`[id="${this.GUID}"]`).attr(`style`, `display: inline-block;`)
        }
    }

    _options = [];
    get Options() {
        return this._options;
    }
    set Options(options) {
        if(objectTester(this._options, options)) 
            return;
        
        this._options = options;
    }

    _value = ``;
    get Value() {
        return this._value;
    }
    set Value(value) {
        if(this._value === value)
            return;

        this._value = value;
        $(`#${this.GUID}`).replaceWith(this.GetHtml());
        this.onChange.forEach(function(onChange) { onChange(); });
    }

    constructor(prop) {
        Object.assign(this, prop);
        if(!Array.isArray(this.onChange))
            this.onChange = [ this.onChange ];
    }

    get SaveValue() {
        return this.Value;
    }
    set SaveValue(saveValue){
        this.Value = saveValue;
    }

    Detach() {
        $(document).off(`click.${this.GUID}`);
        $(document).off(`click.${this.GUID}-context`);
    }

    Attach() {
        this.Detach();
        var thisClass = this;
        let visible = false;
        
        $(document).on(`click.${this.GUID}`, `#${this.GUID}`, function(e) {
            if(visible) 
                return;

            $(`#${thisClass.GUID}`).append(`<div id="${thisClass.GUID}-options" class="context-menu">${thisClass.GetOptionsHtml()}</div>`);
            $(document).on(`click.${thisClass.GUID}-context`, function(){
                $(`#${thisClass.GUID}-options`).remove();
                $(document).off(`click.${thisClass.GUID}-context`);
                visible = false;
            });
            visible = true;
        });
        
        $(document).on(`click.${this.GUID}`, `#${this.GUID}-options p`, function(e) {
            const t = $(this);
            const type = t.attr(`data-type`);
            if(type === undefined)
                return;
            const val = t.attr(`data-value`);
            thisClass.Value = UI.Selection.ParseValue(type, val);
            $(document).trigger(`change`);
        });
    }

    GetOptionsHtml() {
        var optionsHtml = ``;
        this._options.forEach(option => {
            if(option.Group){
                var groupHtml = ``;
                option.Options.forEach(option => {
                    var stringOptionValue = UI.Selection.ParseValue(`string`, option.Value)
                    groupHtml += `<p data-type="${typeof option.Value}" data-value='${stringOptionValue}'` + 
                        `${option.Class || option.Disabled? ` class="${option.Class ?? ``}${option.Disabled? ` disabled`: ``}"` : ``}` + 
                        `>${option.Name}${option.Info !== undefined? ` ${option.Info}` : ``}</p>`;
                });

                if(groupHtml) 
                    optionsHtml += `<div class="selectgroup">${option.Group}</div><div>${groupHtml}</div>`;
            } else {
                var stringOptionValue = UI.Selection.ParseValue(`string`, option.Value)
                optionsHtml += `<p data-type="${typeof option.Value}" data-value='${stringOptionValue}'` + 
                    `${option.Class || option.Disabled? ` class="${option.Class ?? ``}${option.Disabled? ` disabled`: ``}"` : ``}` + 
                    `>${option.Name}${option.Info !== undefined? ` ${option.Info}` : ``}</p>`;
            }
        });
        if(!this.SelectNotVisible) {
            optionsHtml = `<p ${this.SelectDisabled? ` class="disabled"` : ``}${this.SelectValue !== undefined? ` data-type="${typeof this.SelectValue}" data-value="${this.SelectValue}"` : ``}` +
                `>${this.SelectName}</p>${optionsHtml}`;
        }
        return optionsHtml;
    }

    GetHtml() {
        var html = `<div id="${this.GUID}" style="display: ${this._hidden? `none` : `inline-block`};" class="select`;

        if(this.Class !== undefined)
            html += ` ${this.Class}`;

        var stringValue = UI.Selection.ParseValue(`string`, this.Value);
        var selectedOption = this._options.find(x => UI.Selection.ParseValue(`string`, x.Value) === stringValue || x.Options?.findIndex(x => UI.Selection.ParseValue(`string`, x.Value) === stringValue) > -1)
        if(selectedOption?.Group)
            selectedOption = selectedOption.Options.find(x => UI.Selection.ParseValue(`string`, x.Value) === stringValue);

        return `${html}" data-value="${stringValue}">${selectedOption?.Name ?? this.SelectName}<div style="float: right;">▼</div></div>`;
    }
};

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
    get Min() {
        return this._min;
    }
    set Min(min) {
        if(this._min === min)
            return;

        this._min = min;
        this.UpdateDisplayValue();
    }

    _max = undefined;
    get Max() {
        return this._max;
    }
    set Max(max) {
        if(this._max === max)
            return;

        this._max = max;
        this.UpdateDisplayValue();
    }

    _step = undefined;
    get Step() {
        return this._step;
    }
    set Step(step) {
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

    get SaveValue() {
        if(this.DisplayMeasurement.SaveValue === undefined)
            return this.Value;

        return {
            MeasurementUnitName: this.DisplayMeasurement.SaveValue,
            Value: this.Value
        };
    }
    set SaveValue(saveValue){
        if(typeof saveValue === `object`) {
            this.DisplayMeasurement.SaveValue = saveValue?.MeasurementUnitName;
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
            this.DisplayValue.Min = displayMin;
        const displayMax = this.ValueToDisplayValue(this._max);
        if(displayMax !== undefined)
            this.DisplayValue.Max = displayMax;
        const displayStep = this.ValueToDisplayValue(this._step);
        if(displayStep !== undefined)
            this.DisplayValue.Step = displayStep;
    }

    ValueToDisplayValue(value) {
        if(value !== undefined && this.Unit)
            return value * this.Unit.DisplayMultiplier + this.Unit.DisplayOffset;
    }
}

export default { UI: {
    Template,
    Number,
    Checkbox,
    Text,
    Selection,
    NumberWithMeasurement,
}}