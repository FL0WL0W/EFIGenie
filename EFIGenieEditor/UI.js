class UITemplate {
    GUID = generateGUID();
    Attached = false;
    OnChange = [];

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
        if(!Array.isArray(this.OnChange))
            this.OnChange = [ this.OnChange ];
        var thisClass = this;
        Object.entries(this).forEach(e => {
            var [elementname, element] = e;
            if(element?.OnChange !== undefined && !element?.ExcludeFromOnChange) {
                element.OnChange.push(function() {
                    thisClass.OnChange.forEach(function(OnChange) { OnChange(); });
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
}

class UINumber {
    GUID = generateGUID();
    OnChange = [];

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

    _min = undefined;
    get Min() {
        return this._min
    }
    set Min(min) {
        if(this._min === min)
            return;

        this._min = min;
        $(`[id="${this.GUID}"]`).prop(`min`, min);
    }

    _max = undefined;
    get Max() {
        return this._max
    }
    set Max(max) {
        if(this._max === max)
            return;

        this._max = max;
        $(`[id="${this.GUID}"]`).prop(`max`, max);
    }

    _step = undefined;
    get Step() {
        return this._step
    }
    set Step(step) {
        if(this._step === step)
            return;
            
        this._step = step;
        $(`[id="${this.GUID}"]`).prop(`step`, step);
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
        $(`[id="${this.GUID}"]`).val(this._value);
        this.OnChange.forEach(function(OnChange) { OnChange(); });
    }

    constructor(prop) {
        Object.assign(this, prop);
        if(!Array.isArray(this.OnChange))
            this.OnChange = [ this.OnChange ];
    }

    get SaveValue() {
        return this.Value;
    }
    set SaveValue(saveValue){
        this.Value = saveValue;
    }

    Detach() {
        $(document).off(`change.${this.GUID}`);
    }

    Attach() {
        this.Detach();
        var thisClass = this;
        
        $(document).on(`change.${this.GUID}`, `#${this.GUID}`, function(){
            thisClass.Value = $(this).val();
        });
    }

    GetHtml() {
        var html = `<input id="${this.GUID}"${this._hidden? ` style="display: none;"` : ``} type="number" value="${this._value}"`;

        if(this._min !== undefined)
            html += ` min="${this._min}"`;
            
        if(this._max !== undefined)
            html += ` max="${this._max}"`;
            
        if(this._step !== undefined)
            html += ` step="${this._step}"`;

        if(this._class !== undefined)
            html += ` class="${this._class}"`;

        return `${html}/>`;
    }
}

class UICheckbox {
    GUID = generateGUID();
    OnChange = [];

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
        }
    }

    _class = undefined;
    get Class() {
        return this._class
    }
    set Class(pclass) {
        this._class = pclass;
        $(`[id="${this.GUID}"]`).removeClass();
        $(`[id="${this.GUID}"]`).addClass(pclass);
    }

    _value = false;
    get Value() {
        return this._value;
    }
    set Value(value) {
        if(value === undefined || this._value === value)
            return;

        this._value = value;
        $(`[id="${this.GUID}"]`).prop(`checked`, this._value);
        this.OnChange.forEach(function(OnChange) { OnChange(); });
    }

    constructor(prop) {
        Object.assign(this, prop);
        if(!Array.isArray(this.OnChange))
            this.OnChange = [ this.OnChange ];
    }

    get SaveValue() {
        return this.Value;
    }
    set SaveValue(saveValue){
        this.Value = saveValue;
    }

    Detach() {
        $(document).off(`change.${this.GUID}`);
    }

    Attach() {
        this.Detach();
        var thisClass = this;
        
        $(document).on(`change.${this.GUID}`, `#${this.GUID}`, function(){
            thisClass.Value = $(this).prop(`checked`);
        });
    }

    GetHtml() {
        var html = `<input id="${this.GUID}"${this._hidden? ` style="display: none;"` : ``} type="checkbox"`;

        if(this._value)
            html += `checked`;

        if(this._class !== undefined)
            html += ` class="${this._class}"`;

        return `${html}/>`;
    }
}

class UIText {
    GUID = generateGUID();
    OnChange = [];

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
        }
    }

    _class = undefined;
    get Class() {
        return this._class
    }
    set Class(pclass) {
        this._class = pclass;
        $(`[id="${this.GUID}"]`).removeClass();
        $(`[id="${this.GUID}"]`).addClass(pclass);
    }
    
    _value = ``;
    get Value() {
        return this._value;
    }
    set Value(value) {
        if(value === undefined || this._value === value)
            return;

        this._value = value;
        $(`[id="${this.GUID}"]`).val(this._value);
        this.OnChange.forEach(function(OnChange) { OnChange(); });
    }

    constructor(prop) {
        Object.assign(this, prop);
        if(!Array.isArray(this.OnChange))
            this.OnChange = [ this.OnChange ];
    }

    get SaveValue() {
        return this.Value;
    }
    set SaveValue(saveValue){
        this.Value = saveValue;
    }

    Detach() {
        $(document).off(`change.${this.GUID}`);
    }

    Attach() {
        this.Detach();
        var thisClass = this;
        
        $(document).on(`change.${this.GUID}`, `#${this.GUID}`, function(){
            thisClass.Value = $(this).val();
        });
    }

    GetHtml() {
        var html = `<input id="${this.GUID}"${this._hidden? ` style="display: none;"` : ``} value="${this._value}"`;

        if(this._class !== undefined)
            html += ` class="${this._class}"`;

        return `${html}/>`;
    }
}

class UISelection {
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
    OnChange = [];
    SelectDisabled = false;

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
        $(`[id="${this.GUID}"]`).html(this.GetOptionsHtml());
    }

    _value = ``;
    get Value() {
        return this._value;
    }
    set Value(value) {
        if(this._value === value)
            return;

        this._value = value;
        $(`[id="${this.GUID}"] option`).prop(`selected`, false);
        $(`[id="${this.GUID}"] option[value='${UISelection.ParseValue(`string`, value)}']`).prop(`selected`, true);
        this.OnChange.forEach(function(OnChange) { OnChange(); });
    }

    constructor(prop) {
        Object.assign(this, prop);
        if(!Array.isArray(this.OnChange))
            this.OnChange = [ this.OnChange ];
    }

    get SaveValue() {
        return this.Value;
    }
    set SaveValue(saveValue){
        this.Value = saveValue;
    }

    Detach() {
        $(document).off(`change.${this.GUID}`);
    }

    Attach() {
        this.Detach();
        var thisClass = this;
        
        $(document).on(`change.${this.GUID}`, `#${this.GUID}`, function(){
            thisClass.Value = UISelection.ParseValue($(this).find(`:selected`).data(`type`), $(this).val());
        });
    }

    GetOptionsHtml() {
        var stringValue = UISelection.ParseValue(`string`, this.Value);
        var optionsHtml = ``;
        var selected = false;
        this._options.forEach(option => {
            if(option.Group){
                var groupHtml = ``;
                option.Options.forEach(option => {
                    var stringOptionValue = UISelection.ParseValue(`string`, option.Value)
                    var s = stringOptionValue == stringValue;
                    if(s)
                        selected = true;
                    groupHtml += `<option data-type="${typeof option.Value}" value='${stringOptionValue}'` + 
                        `${s? ` selected` : ``}${option.Disabled? ` disabled`: ``}${option.Class? ` class="${option.Class}"` : ``}` + 
                        `>${option.Name}</option>`;
                });

                if(groupHtml) 
                    optionsHtml += `<optgroup label="${option.Group}">${groupHtml}</optgroup>`;
            } else {
                var stringOptionValue = UISelection.ParseValue(`string`, option.Value)
                var s = stringOptionValue == stringValue;
                if(s)
                    selected = true;
                optionsHtml += `<option data-type="${typeof option.Value}" value='${stringOptionValue}'` + 
                    `${s? ` selected` : ``}${option.Disabled? ` disabled`: ``}${option.Class? ` class="${option.Class}"` : ``}` + 
                    `>${option.Name}</option>`;
            }
        });
        if(!this.SelectNotVisible) {
            optionsHtml = `<option${!selected? ` selected` : ``}${this.SelectDisabled? ` disabled` : ``}${this.SelectValue !== undefined? ` value="${this.SelectValue}"` : ``}` +
                `>select</option>${optionsHtml}`;
        }
        return optionsHtml;
    }

    GetHtml() {
        var html = `<select id="${this.GUID}"${this._hidden? ` style="display: none;"` : ``}`;

        if(this.Class !== undefined)
            html += ` class="${this.Class}"`;

        return `${html}>${this.GetOptionsHtml()}</select>`;
    }
}

class UITable extends Table {
    constructor(prop) {
        super(generateGUID(), prop);
    }

    get SaveValue() {
        return {
            Value: this.Value,
            MinX: this.MinXModifiable? this.MinX : undefined,
            MaxX: this.MaxXModifiable? this.MaxX : undefined,
            XResolution: this.XResolutionModifiable? this.XResolution : undefined,
            MinY: this.MinYModifiable? this.MinY : undefined,
            MaxY: this.MaxYModifiable? this.MaxY : undefined,
            YResolution: this.YResolutionModifiable? this.YResolution : undefined,
        };
    }

    set SaveValue(saveValue) {
        if(saveValue === undefined) 
            return;

        if(saveValue.XResolution !== undefined && this.XResolutionModifiable)
            this.XResolution = saveValue.XResolution;
        if(saveValue.YResolution !== undefined && this.YResolutionModifiable)
            this.YResolution = saveValue.YResolution;
        if(saveValue.Resolution !== undefined) {
            if(this.XResolutionModifiable && !this.YResolutionModifiable)
                this.XResolution = saveValue.Resolution;
            if(this.YResolutionModifiable && !this.XResolutionModifiable)
                this.YResolution = saveValue.Resolution;
        }
        if(saveValue.Value !== undefined && Array.isArray(saveValue.Value))
            this.Value = saveValue.Value;
        if(saveValue.MinX !== undefined && this.MinXModifiable)
            this.MinX = saveValue.MinX;
        if(saveValue.MaxX !== undefined && this.MaxXModifiable)
            this.MaxX = saveValue.MaxX;
        if(saveValue.MinY !== undefined && this.MinYModifiable)
            this.MinY = saveValue.MinY;
        if(saveValue.MaxY !== undefined && this.MaxYModifiable)
            this.MaxY = saveValue.MaxY;

        $(`#${this.GUID}-table`).replaceWith(this.GetTable());
        this.OnChange.forEach(function(OnChange) { OnChange(); });
    }
}

class UIDialog {
    GUID = generateGUID();
    TemplateIdentifier = undefined;
    Title = `Dialog`;
    ButtonText = `Open`;
    Opened = false

    _hidden = false;
    get Hidden() {
        return this._hidden;
    }
    set Hidden(hidden) {
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
    }

    Attach() {
        this.Detach();
        var thisClass = this;

        $(document).on(`click.${this.GUID}`, `#${this.GUID}-open`, function(){
            thisClass.Open();
        });
    }

    GetHtml() {
        return  `<input id="${this.GUID}-open"${this._hidden? ` style="display: none;"` : ``} type="button" class="button" value="${this.ButtonText}"></input>` +
                `<div data-title="${this.Title}" id="${this.GUID}-dialog" style="display: none;">$${this.TemplateIdentifier}$</div>`;
    }
    
    Close() {
        this.Opened = false;
        $(`[id="${this.GUID}-dialog"]`).dialog(`close`);
    }

    Open() {
        this.Opened = true;
        var dialogSelector = $(`[id="${this.GUID}-dialog"]`);
        dialogSelector.dialog({ width:`auto`, modal:true, title: dialogSelector.data(`title`)});
    }
}

class UIMeasurement {
    GUID = generateGUID();
    OnChange = [];
    
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
        this.OnChange.forEach(function(OnChange) { OnChange(); });
    }

    _value = undefined;
    get Value() {
        return this._value;
    }
    set Value(value) {
        if(value === undefined)
            return;
        var val = parseInt(value);
        if(isNaN(val))
            debugger;
        if(this._value === val)
            return;

        this._value = val;
        $(`[id="${this.GUID}"]`).html(GetUnitDisplay(this._measurement, this._value));
        this.OnChange.forEach(function(OnChange) { OnChange(); });
    }

    constructor(prop) {
        if(prop?.Measurement && prop?.MeasurementIndex !== undefined) {
            this.Measurement = prop.Measurement;
            this.MeasurementIndex = prop.MeasurementIndex;
            this.Default = this.MeasurementIndex;
        }
        Object.assign(this, prop);
        if(!Array.isArray(this.OnChange))
            this.OnChange = [ this.OnChange ];
    }

    get SaveValue() {
        if(this.Value !== this.Default){
            return this.Value;
        }
    }
    set SaveValue(saveValue){
        this.Value = saveValue;
    }

    Attach() {
        this.Detach();
        
        $(document).on(`click.${this.GUID}`, `#${this.GUID}`, function(){
            alert(`click`);
        });
    }

    Detach() {
        $(document).off(`click.${this.GUID}`);
    }

    GetHtml() {
        return `<div style="display: ${this._hidden? `none` : `inline-block`};" cursor: pointer;" id="${this.GUID}">${GetUnitDisplay(this._measurement, this._value)}</div>`;
    }
}

class UINumberWithMeasurement extends UITemplate {
    static Template = `$DisplayValue$$DisplayMeasurement$`

    get MeasurementIndex() {
        return this.DisplayMeasurement.Value;
    }
    set MeasurementIndex(measurementIndex) {
        if(this.DisplayMeasurement.Value = measurementIndex)
            return;

        this.DisplayMeasurement.Value = measurementIndex;
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

    get Class() {
        return this.DisplayValue.Class;
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
        if(this.Measurement) {
            const measurementIndex = this.MeasurementIndex ?? 0;
            const measurement = Measurements[this.Measurement];
            return measurement?.[measurementIndex];
        }
    }

    constructor(prop) {
        super();
        var thisClass = this;
        this.DisplayMeasurement = new UIMeasurement({
            Measurement : prop?.Measurement,
            MeasurementIndex: prop?.MeasurementIndex,
            OnChange: function() {
                thisClass.UpdateDisplayValue()
            }
        });
        this.DisplayValue = new UINumber({
            ExcludeFromOnChange: true,
            OnChange: function() {
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
            MeasurementIndex: this.DisplayMeasurement.SaveValue,
            Value: this.Value
        };
    }
    set SaveValue(saveValue){
        if(typeof saveValue === `object`) {
            this.DisplayMeasurement.SaveValue = saveValue?.MeasurementIndex;
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

class DisplayNumberWithMeasurement extends UITemplate {
    static Template = `<span class="monospace $NumberClass$" id="$GUID$-DisplayValue">$DisplayValue$</span> <div style="display:inline-block; min-width:50px;">$DisplayMeasurement$</div>`

    get MeasurementIndex() {
        return this.DisplayMeasurement.Value;
    }
    set MeasurementIndex(measurementIndex) {
        this.DisplayMeasurement.Value = measurementIndex;
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
            MeasurementIndex: prop?.MeasurementIndex,
            OnChange: function() {
                thisClass.UpdateDisplayValue();
            }
        });
        this.Setup(prop);
        this.UpdateDisplayValue();
        this.ZeroesToAdd = 10000000;
    }

    get SaveValue() {
        return this.DisplayMeasurement.SaveValue;
    }
    set SaveValue(saveValue) {
        this.DisplayMeasurement.SaveValue = saveValue;
    }

    UpdateDisplayValue() {
        var unit = Measurements[this.Measurement]?.[this.MeasurementIndex];
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

class DisplayGauge {
    GUID = generateGUID();

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

Gauges = {
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