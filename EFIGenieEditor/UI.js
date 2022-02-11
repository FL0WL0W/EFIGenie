class UITemplate {
    GUID = getGUID();
    Attached = false;
    Hidden = false;
    OnChange = [];

    constructor(prop) {
        Object.assign(this, prop);
        if(!Array.isArray(this.OnChange))
            this.OnChange = [ this.OnChange ];
        var thisClass = this;
        Object.entries(this).forEach(e => {
            var [elementname, element] = e;
            if(element?.GetValue && element?.OnChange !== undefined) {
                element.OnChange.push(function() {
                    thisClass.OnChange.forEach(function(OnChange) { OnChange(); });
                });
            }
        });
    }

    GetValue() {
        var value;
        var baseObjName;
        var objectsInElements = 0;
        var name = GetClassProperty(this, "Name");

        //grab baseObjName and count number of objects in element values
        Object.entries(this).forEach(e => {
            var [elementname, element] = e;
            if(element?.GetValue && typeof element?.GetValue() === "object" && element?.BaseObj) {
                objectsInElements++;
                baseObjName = elementname;
            }
        });

        //make sure we have 1 element value that is an object
        if(baseObjName && objectsInElements === 1){
            value = this[baseObjName].GetValue();
            //make sure the baseobj doesnt have a name
            if(name !== undefined && value.Name !== undefined) {
                baseObjName = undefined;
            } else {
                //make sure none of the element values conflict with the baseobj values
                Object.entries(this).forEach(e => {
                    var [elementname, element] = e;
                    if(element?.GetValue && elementname !== baseObjName && value[elementname] !== undefined) {
                        baseObjName = undefined;
                    }
                });
            }
        } else {
            baseObjName = undefined;
        }

        if(baseObjName) {
            value = this[baseObjName].GetValue();
            value.Name = GetClassProperty(this, "Name");
        } else {
            value = {};
        }

        Object.entries(this).forEach(e => {
            var [elementname, element] = e;
            if(element?.GetValue && elementname !== baseObjName) {
                value[elementname] = element.GetValue();
            }
        });

        return value;
    }

    SetValue(value) {
        this.Detach();

        const thisClass = this;
        var baseObjName;

        Object.entries(this).forEach(e => {
            var [elementname, element] = e;
            if(!baseObjName && element?.GetValue && typeof element?.GetValue() === "object" && element?.BaseObj) {
                baseObjName = elementname;
            }
        });

        if(baseObjName)
            this[baseObjName].SetValue(value);
        else
            baseObjName = undefined;

        Object.entries(this).forEach(e => {
            var [elementname, element] = e;
            if(element?.SetValue && elementname !== baseObjName && 
                (baseObjName === undefined || thisClass[baseObjName].GetValue()[elementname] === undefined)) {
                element.SetValue(value[elementname]);
            }
        });

        this.Attach();
    }

    Detach() {
        if(this.Attached) {
            Object.entries(this).forEach(e => {
                function DetachElement(element) {
                    if(element?.Detach)
                        element.Attach();
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
        var html = GetClassProperty(this, "Template");
        if(html === undefined)
            return "";

        const thisClass = this;
        var matches;
        while((matches = html.match(/[$].*?[$]/g)) !== null) {
            matches.forEach(templateIdentifier => {
                function GetTemplateReplacement(obj, templateIdentifier) {
                    const subReplacer = templateIdentifier.indexOf(".") > -1;
                    const templateReplacer = GetClassProperty(obj, subReplacer? templateIdentifier.substring(0, templateIdentifier.indexOf(".")) : templateIdentifier);
    
                    if(templateReplacer !== undefined) {
                        if(typeof templateReplacer === "object") {
                            if(subReplacer) {
                                return GetTemplateReplacement(templateReplacer, templateIdentifier.substring(templateIdentifier.indexOf(".") + 1));
                            }
                            if(templateReplacer.GetHtml) {
                                return templateReplacer.GetHtml();
                            }
                            //can display arrays but cannot get/set value of arrays
                            if(Array.isArray(templateReplacer)) {
                                var replacement = "";
                                for(var i = 0; i < templateReplacer.length; i++) {
                                    replacement += GetTemplateReplacement(templateReplacer, "" + i);
                                }
                                return replacement;
                            }
                            return JSON.stringify(templateReplacer);
                        }
                        return templateReplacer;
                    }
                    return "";
                }
                templateIdentifier = templateIdentifier.substring(1, templateIdentifier.length -1);
                var templateReplacement = GetTemplateReplacement(thisClass, templateIdentifier);
                
                html = html.replaceAll("$" + templateIdentifier + "$", templateReplacement);
            });
        }

        return "<span id=\"" + this.GUID + "\"" + (this.Hidden? " style=\"display: none;\"" : "") + ">" + html + "</span>";
    }

    Hide() {
        this.Hidden = true;
        $("#" + this.GUID).hide();
    }

    Show() {
        this.Hidden = false;
        $("#" + this.GUID).show();
    }
}

class UINumber {
    GUID = getGUID();
    Value = 0;
    Min = undefined;
    Max = undefined;
    Step = undefined;
    OnChange = [];
    Hidden = false;

    constructor(prop) {
        Object.assign(this, prop);
        if(!Array.isArray(this.OnChange))
            this.OnChange = [ this.OnChange ];
    }

    GetValue() {
        return this.Value;
    }

    SetValue(value) {
        var val = parseFloat(value);

        if(value !== undefined && this.Value !== val) {
            this.Value = val;
            $("#" + this.GUID).val(this.Value);
            this.OnChange.forEach(function(OnChange) { OnChange(); });
        }
    }

    Detach() {
        $(document).off("change."+this.GUID);
    }

    Attach() {
        this.Detach();
        var thisClass = this;
        
        $(document).on("change."+this.GUID, "#" + this.GUID, function(){
            thisClass.SetValue($(this).val());
        });
    }

    GetHtml() {
        var html = "<input id=\"" + this.GUID + "\"" + (this.Hidden? " style=\"display: none;\"" : "") + " type=\"number\" value=\"" + this.Value + "\"";

        if(this.Min !== undefined)
            html += " min=\"" + this.Min +"\"";
            
        if(this.Max !== undefined)
            html += " max=\"" + this.Max +"\"";
            
        if(this.Step !== undefined)
        html += " step=\"" + this.Step +"\"";

        if(this.Class !== undefined)
            html += " class=\"" + this.Class +"\"";

        return html + "/>";
    }

    Hide() {
        this.Hidden = true;
        $("#" + this.GUID).hide();
    }

    Show() {
        this.Hidden = false;
        $("#" + this.GUID).show();
    }
}

class UICheckbox {
    GUID = getGUID();
    Value = false;
    Min = undefined;
    Max = undefined;
    Step = undefined;
    OnChange = [];
    Hidden = false;

    constructor(prop) {
        Object.assign(this, prop);
        if(!Array.isArray(this.OnChange))
            this.OnChange = [ this.OnChange ];
    }

    GetValue() {
        return this.Value;
    }

    SetValue(value) {
        if(value !== undefined && this.Value !== value) {
            this.Value = value;
            $("#" + this.GUID).prop('checked', this.Value);
            this.OnChange.forEach(function(OnChange) { OnChange(); });
        }
    }

    Detach() {
        $(document).off("change."+this.GUID);
    }

    Attach() {
        this.Detach();
        var thisClass = this;
        
        $(document).on("change."+this.GUID, "#" + this.GUID, function(){
            thisClass.SetValue($(this).prop('checked'));
        });
    }

    GetHtml() {
        var html = "<input id=\"" + this.GUID + "\"" + (this.Hidden? " style=\"display: none;\"" : "") + " type=\"checkbox\"";

        if(this.Value)
            html += "checked";

        if(this.Class !== undefined)
            html += " class=\"" + this.Class +"\"";

        return html + "/>";
    }

    Hide() {
        this.Hidden = true;
        $("#" + this.GUID).hide();
    }

    Show() {
        this.Hidden = false;
        $("#" + this.GUID).show();
    }
}

class UIText {
    GUID = getGUID();
    Value = "";
    OnChange = [];
    Hidden = false;

    constructor(prop) {
        Object.assign(this, prop);
        if(!Array.isArray(this.OnChange))
            this.OnChange = [ this.OnChange ];
    }

    GetValue() {
        return this.Value;
    }

    SetValue(value) {
        if(value !== undefined && this.Value !== value) {
            this.Value = value;
            $("#" + this.GUID).val(this.Value);
            this.OnChange.forEach(function(OnChange) { OnChange(); });
        }
    }

    Detach() {
        $(document).off("change."+this.GUID);
    }

    Attach() {
        this.Detach();
        var thisClass = this;
        
        $(document).on("change."+this.GUID, "#" + this.GUID, function(){
            thisClass.SetValue($(this).val());
        });
    }

    GetHtml() {
        var html = "<input id=\"" + this.GUID + "\"" + (this.Hidden? " style=\"display: none;\"" : "") + " value=\"" + this.Value + "\"";

        if(this.Class !== undefined)
            html += " class=\"" + this.Class +"\"";

        return html + "/>";;
    }
    
    Hide() {
        this.Hidden = true;
        $("#" + this.GUID).hide();
    }

    Show() {
        this.Hidden = false;
        $("#" + this.GUID).show();
    }
}

class UISelection {
    static ParseValue(type, value) {
        switch(type) {
            case "number":
                return parseFloat(value);
            case "boolean":
                if(typeof value === "number")
                    return value !== 0;
                if(typeof value === "boolean")
                    return value;
                if(typeof value === "string")
                    return value === "true" || value === "True" || value === "1";
                if(typeof value === "object") {
                    if(value)
                        return true;
                    return false;
                }
            case "string":
                if(typeof value === "number" || typeof value === "boolean")
                    return "" + value;
                if(typeof value === "string")
                    return value;
                if(typeof value === "object")
                    return JSON.stringify(value);
            case "object":
                if(typeof value === "number" || typeof value === "boolean" || typeof value === "object")
                    return value;
                if(typeof value === "string")
                    return JSON.parse(value);
                break;
        }
    }

    GUID = getGUID();
    Value = "";
    Options = [];
    OnChange = [];
    Hidden = false;
    SelectDisabled = false;
    SelectValue = undefined;

    constructor(prop) {
        Object.assign(this, prop);
        if(!Array.isArray(this.OnChange))
            this.OnChange = [ this.OnChange ];
    }

    GetValue() {
        return this.Value;
    }
    
    SetValue(value) {
        if(value !== undefined && this.Value !== value) {
            this.Value = value;
            $("#" + this.GUID + " option").prop('selected', false);
            $("#" + this.GUID + " option[value='" + UISelection.ParseValue("string", value) + "']").prop('selected', true);
            this.OnChange.forEach(function(OnChange) { OnChange(); });
        }
    }

    Detach() {
        $(document).off("change."+this.GUID);
    }

    Attach() {
        this.Detach();
        var thisClass = this;
        
        $(document).on("change."+this.GUID, "#" + this.GUID, function(){
            thisClass.SetValue(UISelection.ParseValue($(this).find(":selected").data("type"), $(this).val()));
        });
    }

    SetOptions(options) {
        this.Options = options;
        $("#" + this.GUID).html(this.GetOptionsHtml());
    }

    GetOptions() {
        return this.Options;
    }

    GetOptionsHtml() {
        var stringValue = UISelection.ParseValue("string", this.Value);
        var optionsHtml = "";
        var selected = false;
        this.Options.forEach(option => {
            if(option.Group){
                var groupHtml = "";
                option.Options.forEach(option => {
                    var stringOptionValue = UISelection.ParseValue("string", option.Value)
                    var s = stringOptionValue == stringValue;
                    if(s)
                        selected = true;
                    groupHtml += "<option data-type=\"" + (typeof option.Value) + "\" value=\'" + stringOptionValue + "\'" + 
                        (s? " selected" : "") + (option.Disabled? " disabled": "") + (option.Class? " class=\"" + option.Class + "\"" : "") + 
                        ">" + option.Name + "</option>";
                });

                if(groupHtml) 
                    optionsHtml += "<optgroup label=\"" + option.Group + "\">" + groupHtml + "</optgroup>";
            } else {
                var stringOptionValue = UISelection.ParseValue("string", option.Value)
                var s = stringOptionValue == stringValue;
                if(s)
                    selected = true;
                optionsHtml += "<option data-type=\"" + (typeof option.Value) + "\" value=\'" + stringOptionValue + "\'" + 
                        (s? " selected" : "") + (option.Disabled? " disabled": "") + (option.Class? " class=\"" + option.Class + "\"" : "") + 
                        ">" + option.Name + "</option>";
            }
        });
        optionsHtml = "<option" + (!selected? " selected" : "") + (this.SelectDisabled? " disabled" : "") + (this.SelectValue !== undefined? " value=\"" + this.SelectValue + "\"" : "") +
            ">select</option>" + optionsHtml;
        return optionsHtml;
    }

    GetHtml() {
        var html = "<select id=\"" + this.GUID + "\"" + (this.Hidden? " style=\"display: none;\"" : "");

        if(this.Class !== undefined)
            html += " class=\"" + this.Class +"\"";

        return html + ">" + this.GetOptionsHtml() + "</select>";
    }

    Hide() {
        this.Hidden = true;
        $("#" + this.GUID).hide();
    }

    Show() {
        this.Hidden = false;
        $("#" + this.GUID).show();
    }
}

class UITable extends Table {
    constructor(prop) {
        super(getGUID(), prop);
    }

    GetValue() {
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

    SetValue(value) {
        if(value !== undefined) {
            if(value.XResolution !== undefined && this.XResolutionModifiable)
                this.SetXResolution(value.XResolution);
            if(value.YResolution !== undefined && this.YResolutionModifiable)
                this.SetYResolution(value.YResolution);
            if(value.Resolution !== undefined) {
                if(this.XResolutionModifiable && !this.YResolutionModifiable)
                    this.SetXResolution(value.Resolution);
                if(this.YResolutionModifiable && !this.XResolutionModifiable)
                    this.SetYResolution(value.Resolution);
            }
            if(value.Value !== undefined)
                this.Value = value.Value;
            if(value.MinX !== undefined && this.MinXModifiable)
                this.MinX = value.MinX;
            if(value.MaxX !== undefined && this.MaxXModifiable)
                this.MaxX = value.MaxX;
            if(value.MinY !== undefined && this.MinYModifiable)
                this.MinY = value.MinY;
            if(value.MaxY !== undefined && this.MaxYModifiable)
                this.MaxY = value.MaxY;

            this.OnChange.forEach(function(OnChange) { OnChange(); });
        }
        this.UpdateTable();
    }
}

class UIDialog {
    GUID = getGUID();
    TemplateIdentifier = undefined;
    Title = "Dialog";
    ButtonText = "Open";
    Hidden = false;
    Opened = false

    constructor(prop) {
        Object.assign(this, prop);
    }

    Detach() {
        $(document).off("click."+this.GUID);
    }

    Attach() {
        this.Detach();
        var thisClass = this;

        $(document).on("click."+this.GUID, "#" + this.GUID + "-open", function(){
            thisClass.Open();
        });
    }

    GetHtml() {
        return  "<input id=\"" + this.GUID + "-open\"" + (this.Hidden? " style=\"display: none;\"" : "") + " type=\"button\" class=\"button\" value=\"" + this.ButtonText + "\"></input>" +
                "<div data-title=\"" + this.Title + "\" id=\"" + this.GUID + "-dialog\" style=\"display: none;\">$" + this.TemplateIdentifier + "$</div>";
    }

    Hide() {
        this.Hidden = true;
        $("#" + this.GUID + "-open").hide();
    }

    Show() {
        this.Hidden = false;
        $("#" + this.GUID + "-open").show();
    }
    
    Close() {
        this.Opened = false;
        $("#" + this.GUID + "-dialog").dialog("close");
    }

    Open() {
        this.Opened = true;
        var dialogSelector = $("#" + this.GUID + "-dialog");
        dialogSelector.dialog({ width:'auto', modal:true, title: dialogSelector.data("title")});
    }
}

class UINumberWithMeasurement extends UINumber {
    constructor(prop) {
        super(prop);
        if(this.MeasurementIndex === undefined)
            this.MeasurementIndex = GetDefaultUnitIndex(GetClassProperty(this, "Measurement"));
    }

    GetHtml() {
        return super.GetHtml().replace("value=\"" + this.Value + "\"", "value=\"" + this.GetDisplayValue() + "\"") + "<div style=\"display: inline-block; cursor: pointer;\"  id=\"" + this.GUID + "-measurement\">" + GetUnitDisplay(GetClassProperty(this, "Measurement"), this.MeasurementIndex) + "</div>";;
    }

    SetValue(value) {
        var val = value;
        if(typeof value === "object")
            val = value.Value;
        super.SetValue(val);
        $("#" + this.GUID).val(this.GetDisplayValue());
    }

    GetValue() {
        return {
            Value: super.GetValue(),
            MeasurementIndex: this.MeasurementIndex
        }
    }

    GetDisplayValue() {
        var unit = Measurements[GetClassProperty(this, "Measurement")][this.MeasurementIndex];
        return this.Value * unit.DisplayMultiplier + unit.DisplayOffset;
    }

    SetDisplayValue(value) {
        var unit = Measurements[GetClassProperty(this, "Measurement")][this.MeasurementIndex];
        this.SetValue((value - unit.DisplayOffset) / unit.DisplayMultiplier);
    }

    Attach() {
        this.Detach();
        var thisClass = this;
        
        $(document).on("change."+this.GUID, "#" + this.GUID, function(){
            thisClass.SetDisplayValue($(this).val());
        });

        $(document).on("click."+this.GUID, "#" + this.GUID + "-measurement", function(){
            alert("click");
        });
    }

    Detach() {
        super.Detach();
        $(document).off("click."+this.GUID);
    }
}