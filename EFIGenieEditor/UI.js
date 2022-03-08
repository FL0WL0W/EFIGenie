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

            $(`#${thisClass.GUID}`).append(`<div id="${thisClass.GUID}-options" class="context-menu w3-bar-block">${thisClass.GetOptionsHtml()}</div>`);
            $(document).on(`click.${thisClass.GUID}-context`, function(){
                $(`#${thisClass.GUID}-options`).remove();
                $(document).off(`click.${thisClass.GUID}-context`);
                visible = false;
            });
            visible = true;
        });
        
        $(document).on(`click.${this.GUID}`, `#${this.GUID}-options div`, function(e) {
            const t = $(this);
            const type = t.attr(`data-type`);
            if(type === undefined)
                return;
            const val = t.attr(`data-value`);
            thisClass.Value = UISelection.ParseValue(type, val);
            $(document).trigger(`change`);
        });
    }

    GetOptionsHtml() {
        var optionsHtml = ``;
        this._options.forEach(option => {
            if(option.Group){
                var groupHtml = ``;
                option.Options.forEach(option => {
                    var stringOptionValue = UISelection.ParseValue(`string`, option.Value)
                    groupHtml += `<div class="w3-bar-item w3-button" data-type="${typeof option.Value}" data-value='${stringOptionValue}'` + 
                        `${option.Disabled? ` disabled`: ``}${option.Class? ` class="${option.Class}"` : ``}` + 
                        `>${option.Name}${option.Info !== undefined? ` ${option.Info}` : ``}</div>`;
                });

                if(groupHtml) 
                    optionsHtml += `<div class="selectgroup">${option.Group}</div><div>${groupHtml}</div>`;
            } else {
                var stringOptionValue = UISelection.ParseValue(`string`, option.Value)
                optionsHtml += `<div class="w3-bar-item w3-button" data-type="${typeof option.Value}" data-value='${stringOptionValue}'` + 
                    `${option.Disabled? ` disabled`: ``}${option.Class? ` class="${option.Class}"` : ``}` + 
                    `>${option.Name}${option.Info !== undefined? ` ${option.Info}` : ``}</div>`;
            }
        });
        if(!this.SelectNotVisible) {
            optionsHtml = `<div class="w3-bar-item${this.SelectDisabled? `` : ` w3-button`}"${this.SelectValue !== undefined? ` data-type="${typeof this.SelectValue}" data-value="${this.SelectValue}"` : ``}` +
                `>select</div>${optionsHtml}`;
        }
        return optionsHtml;
    }

    GetHtml() {
        var html = `<div id="${this.GUID}" style="display: ${this._hidden? `none` : `inline-block`};" class="select`;

        if(this.Class !== undefined)
            html += ` ${this.Class}`;

        var stringValue = UISelection.ParseValue(`string`, this.Value);
        var selectedOption = this._options.find(x => UISelection.ParseValue(`string`, x.Value) === stringValue || x.Options?.findIndex(x => UISelection.ParseValue(`string`, x.Value) === stringValue) > -1)
        if(selectedOption?.Group)
            selectedOption = selectedOption.Options.find(x => UISelection.ParseValue(`string`, x.Value) === stringValue);

        return `${html}">${selectedOption?.Name ?? `select`}</div>`;
    }
}

class UITable extends Table {
    constructor(prop) {
        super(generateGUID(), prop);
    }

    get SaveValue() {
        return {
            Value: this.Value,
            XAxis: this.XAxisModifiable? this.XAxis : undefined,
            XResolution: this.XResolutionModifiable? this.XResolution : undefined,
            YAxis: this.YAxisModifiable? this.YAxis : undefined,
            YResolution: this.YResolutionModifiable? this.YResolution : undefined,
        };
    }

    set SaveValue(saveValue) {
        if(saveValue === undefined) 
            return;

        if(saveValue.XResolution !== undefined && this.XResolutionModifiable)
            this._xResolution = saveValue.XResolution;
        if(saveValue.YResolution !== undefined && this.YResolutionModifiable)
            this._yResolution = saveValue.YResolution;
        if(saveValue.Resolution !== undefined) {
            if(this.XResolutionModifiable && !this.YResolutionModifiable)
                this._xResolution = saveValue.Resolution;
            if(this.YResolutionModifiable && !this.XResolutionModifiable)
                this._yResolution = saveValue.Resolution;
        }

        if(saveValue.MaxX !== undefined && saveValue.MinX !== undefined && this.XAxisModifiable) {
            const xAxisAdd = (saveValue.MaxX - saveValue.MinX) / (this.XResolution - 1);
            for(let x=0; x<this.XResolution; x++){
                this.XAxis[x] = saveValue.MinX + xAxisAdd * x;
            }
        }
        if(saveValue.MaxY !== undefined && saveValue.MinY !== undefined && this.YAxisModifiable) {
            const yAxisAdd = (saveValue.MaxY - saveValue.MinY) / (this.YResolution - 1);
            for(let y=0; y<this.YResolution; y++){
                this.YAxis[y] = saveValue.MinY + yAxisAdd * y;
            }
        }

        if(saveValue.XAxis !== undefined && this.XAxisModifiable)
            this.XAxis = saveValue.XAxis;
        if(saveValue.YAxis !== undefined && this.YAxisModifiable)
            this.YAxis = saveValue.YAxis;

        if(saveValue.Value !== undefined && Array.isArray(saveValue.Value))
            this.Value = saveValue.Value;
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
        if(this._value === value)
            return;

        this._value = value;
        $(`[id="${this.GUID}"]`).html(GetUnitDisplay(this._measurement, this._value));
        this.OnChange.forEach(function(OnChange) { OnChange(); });
    }

    constructor(prop) {
        if(prop?.Measurement && prop?.MeasurementUnitName !== undefined) {
            this.Measurement = prop.Measurement;
            this.MeasurementUnitName = prop.MeasurementUnitName;
            this.Default = this.MeasurementUnitName;
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

class UINumberWithMeasurement extends UITemplate {
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
        return GetUnit(this.Measurement, this.MeasurementUnitName)
    }

    constructor(prop) {
        super();
        var thisClass = this;
        this.DisplayMeasurement = new UIMeasurement({
            Measurement : prop?.Measurement,
            MeasurementUnitName: prop?.MeasurementUnitName,
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

class DisplayNumberWithMeasurement extends UITemplate {
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
            OnChange: function() {
                thisClass.UpdateDisplayValue();
                thisClass.ZeroesToAdd = 10000000;
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