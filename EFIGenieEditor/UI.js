class UITemplate {
    Elements = {};
    Attached  = false;

    constructor(prop) {
        Object.assign(this, prop);
    }

    GetValue() {
        var value;
        var baseObjName;
        var objectsInElements = 0;
        var name = GetClassProperty(this, "Name");

        //grab baseObjName and count number of objects in element values
        Object.entries(this.Elements).forEach(e => {
            var [elementname, element] = e;
            if(element !== undefined && element.GetValue && typeof element.GetValue() === "object") {
                objectsInElements++;
                baseObjName = elementname;
            }
        });

        //make sure we have 1 element value that is an object
        if(baseObjName && objectsInElements === 1){
            value = this.Elements[baseObjName].GetValue();
            //make sure the baseobj doesnt have a name
            if(name !== undefined && value.Name !== undefined) {
                baseObjName = undefined;
            } else {
                //make sure none of the element values conflict with the baseobj values
                Object.entries(this.Elements).forEach(e => {
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
            value = this.Elements[baseObjName].GetValue();
            value.Name = GetClassProperty(this, "Name");
        } else {
            value = {};
        }

        Object.entries(this.Elements).forEach(e => {
            var [elementname, element] = e;
            if(element !== undefined && element.GetValue && elementname !== baseObjName) {
                value[elementname] = element.GetValue();
            }
        });

        return value;
    }

    SetValue(value) {
        this.Detach();

        var baseObjName;

        Object.entries(this.Elements).forEach(e => {
            var [elementname, element] = e;
            if(element !== undefined && element.GetValue && typeof element.GetValue() === "object") {
                if(!baseObjName)
                    baseObjName = elementname;
            }
        });

        if(!value[baseObjName])
            this.Elements[baseObjName].SetValue(value);
        else
            baseObjName = undefined;

        Object.entries(this.Elements).forEach(e => {
            var [elementname, element] = e;
            if(element !== undefined && element.SetValue && elementname !== baseObjName) {
                element.SetValue(value[elementname]);
            }
        });

        this.Attach();
    }

    Detach() {
        if(this.Attached) {
            Object.entries(this.Elements).forEach(e => {
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
        Object.entries(this.Elements).forEach(e => {
            var [elementname, element] = e;
            if(element !== undefined && element.Detach) {
                element.Attach();
            }
        });
        this.Attached = true;
    }

    GetHtml(){
        var html = GetClassProperty(this, "Template");
        if(html === undefined)
            html = "";

        Object.entries(this.Elements).forEach(e => {
            var [elementname, element] = e;
            if(element !== undefined && element.GetHtml) {
                if(elementname) {
                    html = html.replaceAll("$" + elementname + "$", element.GetHtml());
                }
            }
        });

        return html;
    }
}

class UIInputNumber {
    GUID = getGUID();
    Value = 0;
    Min = undefined;
    Max = undefined;
    Step = undefined;
    OnChange = undefined;

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
        var html = "<input id=\"" + this.GUID + "\" type=\"number\" value=\"" + this.Value + "\"";

        if(this.Min !== undefined)
            html += " min=\"" + this.Min +"\"";
            
        if(this.Max !== undefined)
            html += " max=\"" + this.Max +"\"";
            
        if(this.Step !== undefined)
            html += " step=\"" + this.Step +"\"";

        return html + "/>";
    }
}

class UICheckbox {
    GUID = getGUID();
    Value = false;
    Min = undefined;
    Max = undefined;
    Step = undefined;
    OnChange = undefined;

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
        var html = "<input id=\"" + this.GUID + "\" type=\"checkbox\"";

        if(this.Value)
            html += "checked";

        return html + "/>";
    }
}

class UIInputText {
    GUID = getGUID();
    Value = "";
    OnChange = undefined;

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
        return "<input id=\"" + this.GUID + "\" value=\"" + this.Value + "\"/>";
    }
}

class UISelection {
    GUID = getGUID();
    Value = "";
    Options = [];
    OptionsHtml = "";
    OnChange = undefined;

    constructor(prop) {
        Object.assign(this, prop);
        this.SetOptions(this.Options);
    }

    GetValue() {
        return this.Value;
    }
    
    SetValue(value) {
        if(this.Value !== value) {
            this.Value = value;
            $("#" + this.GUID + " option").prop('selected', false);
            $("#" + this.GUID + " option[value='" + value + "']").prop('selected', true);

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
            thisClass.Value = $(this).val();
            if(thisClass.OnChange) {
                thisClass.OnChange(thisClass.Value);
            }
        });
    }

    SetOptions(options) {
        this.Options = options;
        this.OptionsHtml = "";

        var thisClass = this;
        this.Options.forEach(option => {
            if(option.Group){
                var optionsHtml = "";
                option.Options.forEach(option => {
                    optionsHtml += "<option value=\"" + option.Value + "\"" + (option.Value == thisClass.Value? " selected" : "") + ">" + option.Name + "</option>";
                });

                if(optionsHtml) 
                    thisClass.OptionsHtml += "<optgroup label=\"" + option.Name + "\">" + optionsHtml + "</optgroup>";
            } else {
                optionsHtml += "<option value=\"" + option.Value + "\"" + (option.Value == thisClass.Value? " selected" : "") + ">" + option.Name + "</option>";
            }
        });

        $("#" + this.GUID).html(this.OptionsHtml);
    }

    GetHtml() {
        return "<select id=\"" + this.GUID + "\">" + this.OptionsHtml + "</select>";
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
            if(value.Value !== undefined)
                this.Value = value.Value;
            if(value.XResolution !== undefined && this.XResolutionModifiable)
                this.SetXResolution(value.XResolution);
            if(value.YResolution !== undefined && this.YResolutionModifiable)
                this.SetYResolution(value.YResolution);
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

class UIText {
    GUID = getGUID;

    constructor(prop) {
        Object.assign(this, prop);
    }

    SetText(text) {
        this.Text = text;
        $("#" + this.GUID).html(text);
    }

    GetHtml() {
        return "<span id=\"" + this.GUID + "\">" + this.Text + "<\span>";
    }
}

class UIDialog {
    GUID = getGUID();
    SubUI = undefined;
    Title = "";
    ButtonText = "Open";

    constructor(prop, subUI) {
        Object.assign(this, prop);
        this.SubUI = subUI;
    }

    GetValue() {
        return this.SubUI.GetValue();
    }

    SetValue(value) {
        this.SubUI.SetValue(value);
    }

    Detach() {
        this.SubUI.Detach();
        $(document).off("click."+this.GUID);
    }

    Attach() {
        this.Detach();
        this.SubUI.Attach();
        var thisClass = this;

        $(document).on("click."+this.GUID, "#" + this.GUID + "-open", function(){
            console.log("wroks")
            $("#" + thisClass.GUID + "-dialog").dialog({ width:'auto', modal:true, title: thisClass.Title });
        });
    }

    GetHtml() {
        return  "<input id=\"" + this.GUID + "-open\" type=\"button\" class=\"button\" value=\"" + this.ButtonText + "\"></input>" +
                "<div id=\"" + this.GUID + "-dialog\" style=\"display: none;\">" + this.SubUI.GetHtml() + "</div>";
    }
}

class UILabel {
    GUID = undefined;
    SubUI = undefined;
    Label = "";

    constructor(prop, subUI) {
        Object.assign(this, prop);
        this.SubUI = subUI;
        if(this.SubUI.GUID)
            GUID = this.SubUI.GUID;
        else 
            GUID = getGUID();
    }

    GetValue() {
        return this.SubUI.GetValue();
    }

    SetValue(value) {
        this.SubUI.SetValue(value);
    }

    Detach() {
        this.SubUI.Detach();
    }

    Attach() {
        this.SubUI.Attach();
    }

    GetHtml() {
        return  "<label for=\"" + this.GUID + "\">" + this.Label + "</label>" + this.SubUI.GetHtml();
    }
}


class UIInputNumberWithMeasurement extends UIInputNumber {
    GetHtml() {
        return super.GetHtml() + "<div style=\"display: inline-block;\"  id=\"" + this.GUID + "measurement\">" + GetUnitDisplay(GetClassProperty(this, "Measurement")) + "</div>";;
    }
}