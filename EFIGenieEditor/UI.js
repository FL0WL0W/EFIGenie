class UITemplate {
    GUID = getGUID();
    Attached = false;
    Hidden = false;

    constructor(prop) {
        Object.assign(this, prop);
    }

    GetValue() {
        var value;
        var baseObjName;
        var objectsInElements = 0;
        var name = GetClassProperty(this, "Name");

        //grab baseObjName and count number of objects in element values
        Object.entries(this).forEach(e => {
            var [elementname, element] = e;
            if(element !== undefined && element.GetValue && typeof element.GetValue() === "object" && element.BaseObj) {
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
                    if(element !== undefined && element.GetValue && elementname !== baseObjName && value[elementname] !== undefined) {
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
            if(element !== undefined && element.GetValue && elementname !== baseObjName) {
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
            if(element !== undefined && element.GetValue && typeof element.GetValue() === "object" && element.BaseObj) {
                if(!baseObjName)
                    baseObjName = elementname;
            }
        });

        if(baseObjName)
            this[baseObjName].SetValue(value);
        else
            baseObjName = undefined;

        Object.entries(this).forEach(e => {
            var [elementname, element] = e;
            if(element !== undefined && element.SetValue && elementname !== baseObjName && 
                (baseObjName === undefined || thisClass[baseObjName].GetValue()[elementname] === undefined)) {
                element.SetValue(value[elementname]);
            }
        });

        this.Attach();
    }

    Detach() {
        if(this.Attached) {
            Object.entries(this).forEach(e => {
                var [elementname, element] = e;
                if(element !== undefined && element.Detach) {
                    element.Detach();
                }
            });
            this.Attached = false;
        }
    }

    Attach() {
        this.Detach();
        Object.entries(this).forEach(e => {
            var [elementname, element] = e;
            if(element !== undefined && element.Attach) {
                element.Attach();
            }
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
    OnChange = undefined;
    Hidden = false;

    constructor(prop) {
        Object.assign(this, prop);
    }

    GetValue() {
        return this.Value;
    }

    SetValue(value) {
        var val = parseFloat(value);

        if(this.Value !== val) {
            this.Value = val;
            $("#" + this.GUID).val(this.Value);
            if(this.OnChange)
                this.OnChange(this.Value);
        }
    }

    Detach() {
        $(document).off("change."+this.GUID);
    }

    Attach() {
        this.Detach();
        var thisClass = this;
        
        $(document).on("change."+this.GUID, "#" + this.GUID, function(){
            thisClass.Value = parseFloat($(this).val());
            if(thisClass.OnChange) {
                thisClass.OnChange(thisClass.Value);
            }
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
    OnChange = undefined;
    Hidden = false;

    constructor(prop) {
        Object.assign(this, prop);
    }

    GetValue() {
        return this.Value;
    }

    SetValue(value) {
        if(this.Value !== value) {
            this.Value = value;
            $("#" + this.GUID).prop('checked', this.Value);
            if(this.OnChange)
                this.OnChange(this.Value);
        }
    }

    Detach() {
        $(document).off("change."+this.GUID);
    }

    Attach() {
        this.Detach();
        var thisClass = this;
        
        $(document).on("change."+this.GUID, "#" + this.GUID, function(){
            thisClass.Value = $(this).prop('checked');
            if(thisClass.OnChange) {
                thisClass.OnChange(thisClass.Value);
            }
        });
    }

    GetHtml() {
        var html = "<input id=\"" + this.GUID + "\"" + (this.Hidden? " style=\"display: none;\"" : "") + " type=\"checkbox\"";

        if(this.Value)
            html += "checked";

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
    OnChange = undefined;
    Hidden = false;

    constructor(prop) {
        Object.assign(this, prop);
    }

    GetValue() {
        return this.Value;
    }

    SetValue(value) {
        if(this.Value !== value) {
            this.Value = value;
            $("#" + this.GUID).val(this.Value);
            if(this.OnChange)
                this.OnChange(this.Value);
        }
    }

    Detach() {
        $(document).off("change."+this.GUID);
    }

    Attach() {
        this.Detach();
        var thisClass = this;
        
        $(document).on("change."+this.GUID, "#" + this.GUID, function(){
            thisClass.Value = $(this).val();
            if(thisClass.OnChange) {
                thisClass.OnChange(thisClass.Value);
            }
        });
    }

    GetHtml() {
        return "<input id=\"" + this.GUID + "\"" + (this.Hidden? " style=\"display: none;\"" : "") + " value=\"" + this.Value + "\"/>";
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
    OnChange = undefined;
    Hidden = false;

    constructor(prop) {
        Object.assign(this, prop);
    }

    GetValue() {
        return this.Value;
    }
    
    SetValue(value) {
        if(this.Value !== value) {
            this.Value = value;
            $("#" + this.GUID + " option").prop('selected', false);
            $("#" + this.GUID + " option[value='" + UISelection.ParseValue("string", value) + "']").prop('selected', true);

            if(this.OnChange) {
                this.OnChange(this.Value);
            }
        }
    }

    Detach() {
        $(document).off("change."+this.GUID);
    }

    Attach() {
        this.Detach();
        var thisClass = this;
        
        $(document).on("change."+this.GUID, "#" + this.GUID, function(){
            thisClass.Value = UISelection.ParseValue($(this).find(":selected").data("type"), $(this).val());
            
            if(thisClass.OnChange) {
                thisClass.OnChange(thisClass.Value);
            }
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
                    groupHtml += "<option data-type=\"" + (typeof option.Value) + "\" value=\'" + stringOptionValue + "\'" + (s? " selected" : "") + ">" + option.Name + "</option>";
                });

                if(groupHtml) 
                    optionsHtml += "<optgroup label=\"" + option.Group + "\">" + groupHtml + "</optgroup>";
            } else {
                var stringOptionValue = UISelection.ParseValue("string", option.Value)
                var s = stringOptionValue == stringValue;
                if(s)
                    selected = true;
                optionsHtml += "<option data-type=\"" + (typeof option.Value) + "\" value=\'" + stringOptionValue + "\'" + (s? " selected" : "") + ">" + option.Name + "</option>";
            }
        });
        optionsHtml = "<option" + (!selected? " selected" : "") + ">select</option>" + optionsHtml;
        return optionsHtml;
    }

    GetHtml() {
        return "<select id=\"" + this.GUID + "\"" + (this.Hidden? " style=\"display: none;\"" : "") + ">" + this.GetOptionsHtml() + "</select>";
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
        if(value) {
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
    GetHtml() {
        return super.GetHtml() + "<div style=\"display: inline-block;\"  id=\"" + this.GUID + "measurement\">" + GetUnitDisplay(GetClassProperty(this, "Measurement")) + "</div>";;
    }
}