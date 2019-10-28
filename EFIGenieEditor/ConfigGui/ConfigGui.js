class ConfigGui extends Config {
    constructor(){
        super();
        this.GUID = getGUID();
    }
    GetTabbed = GetValueByReferenceFunction("Tabbed", false);
    GetHidden = GetValueByReferenceFunction("Hidden", false);
    GetLabel = GetValueByReferenceFunction("Label", undefined);
    GetLabels = GetValueByReferenceFunction("Labels", undefined);
    GetArray = GetValueByReferenceFunction("Array", undefined);
    GetParentTabbed() {
        var val = GetValueByValueOrReference("...Tabbed", this.Obj, this.ObjLocation, this.Ini, this.IniLocation);
    
        if(val)
            return val; 
        
        return false;
    }
    Attach() {
        super.Attach();
        if(this.GetTabbed())
        {
            var thisClass = this;
            $(document).on("click."+this.GUID, ".tab" + this.GUID, function(){
                var index = $(this).data("index");
                var variables = thisClass.GetVariables();
                for(var i = 0; i < variables.length; i++) {
                    $("#span" + thisClass.GUID + "i" + i).hide();
                }
                $(".tab" + thisClass.GUID).removeClass("active");
                $(this).addClass("active");
                $("#span" + thisClass.GUID + "i" + index).show()
            });
        }
    }
    DeAttach() {
        super.DeAttach();
        $(document).off("click."+this.GUID);
    }
    GetHtml() {
        if(this.GetHidden())
            return "";

        var template = "";
        var tabs = "";
        var tabbed = this.GetTabbed();
        var variables = this.GetVariables();
        var i = 0;

        for(var variableRowIndex in variables) {
            var variableRowKey = Object.keys(variables[variableRowIndex])[0];
            var variableRowConfig = this[variableRowKey];
            
            if(!variableRowConfig || !variableRowConfig.GetHtml)
                continue;

            if(tabbed && (!variableRowConfig.GetHidden || !variableRowConfig.GetHidden()) && (!variableRowConfig.GetStatic || !variableRowConfig.GetStatic())) {
                var tabClasses = "tabLink";
                if(i === 0)
                    tabClasses += " active";
                tabClasses += " tab" + this.GUID;
                
                var label = GetValueByReference("Label", variableRowConfig.Obj, variableRowConfig.ObjLocation, variableRowConfig.Ini);
                if(label === undefined)
                    label = "Tab" + i;

                tabs += "<button class=\"" + tabClasses + "\" data-index=\"" + i + "\">" + label + "</button>";

                template += "<span id=\"span" + this.GUID + "i" + i + "\""  + ((i !== 0)? " style=\"display:none;\"" : "") + " class=\"tabContent\">" + variableRowConfig.GetHtml() + "</span>";
                i++;
            } else {
                template += variableRowConfig.GetHtml();
            }
        }

        if(tabbed)
            template = "<div class=\"tab\">" + tabs + "</div>" + template;
        
        template = wrapInConfigDivGui(this.GUID, template);
        var label = this.GetLabel();
        var labels = this.GetLabels();
        var array = this.GetArray();

        if(!this.GetParentTabbed() && (label || labels)) {
            if(array) {
                var index = parseInt(this.ObjLocation.substring(this.ObjLocation.lastIndexOf("/") + 1));
                if(!isNaN(index)) {
                    if(labels && labels[index])
                        label = labels[index];
                    else
                        label += "[" + index + "]";
                }
            }
            template = "<label for=\"" + this.GUID + "\" class=\"subConfigLabel\">" + label + ":</label><span class=\"sameLineSpacer\"></span>" + template;
        }
        return "<span id=\"span"+this.GUID+"\">" + template + "</span>";
    }
    SetIni(ini, iniLocation) {
        super.SetIni(ini, iniLocation);
        var variables = this.GetVariables();
                
        for(var variableRowIndex in variables) {
            var variableRow = variables[variableRowIndex];
            var variableRowKey = Object.keys(variableRow)[0];

            var prevConfig = this[variableRowKey];
            if(this[variableRowKey] && 
                (this[variableRowKey] instanceof ConfigNumberSelectionGui)
                || this[variableRowKey] instanceof ConfigNumberGui
                || this[variableRowKey] instanceof ConfigNamedListGui
                || this[variableRowKey] instanceof ConfigGui
                || this[variableRowKey] instanceof ConfigArrayGui
                || this[variableRowKey] instanceof ConfigNamedListGui
                || this[variableRowKey] instanceof ConfigSelectionGui
                || this[variableRowKey] instanceof ConfigNumberTableGui
                || this[variableRowKey] instanceof ConfigFormulaGui) {
            }
            else if(this[variableRowKey] instanceof ConfigNumber && this[variableRowKey].GetIniProperty().Selections) {
                this[variableRowKey].DeAttach();
                this[variableRowKey] = new ConfigNumberSelectionGui();
            } else if(this[variableRowKey] instanceof ConfigNumber) {
                this[variableRowKey].DeAttach();
                this[variableRowKey] = new ConfigNumberGui();
            } else if(this[variableRowKey] instanceof Config) {
                this[variableRowKey].DeAttach();
                this[variableRowKey] = new ConfigGui();
            } else if(this[variableRowKey] instanceof ConfigArray) {
                this[variableRowKey] = new ConfigArrayGui();
            } else if(this[variableRowKey] instanceof ConfigNamedList) {
                this[variableRowKey].DeAttach();
                this[variableRowKey] = new ConfigNamedListGui();
            } else if(this[variableRowKey] instanceof ConfigSelection) {
                this[variableRowKey].DeAttach();
                this[variableRowKey] = new ConfigSelectionGui();
            } else if(this[variableRowKey] instanceof ConfigNumberTable) {
                this[variableRowKey].DeAttach();
                this[variableRowKey] = new ConfigNumberTableGui();
            } else if(this[variableRowKey] instanceof ConfigFormula) {
                this[variableRowKey].DeAttach();
                this[variableRowKey] = new ConfigFormulaGui();
            }

            if(prevConfig !== this[variableRowKey]) {
                //because we created a new object we have to do all of the initialization steps again
                this[variableRowKey].SetObj(prevConfig.Obj, prevConfig.ObjLocation);
                this[variableRowKey].SetIni(prevConfig.Ini, prevConfig.IniLocation);
                this[variableRowKey].Attach();
            }
        }
    }
}

var selectionConfigGuiTemplate;
class ConfigSelectionGui extends ConfigSelection {
    constructor(){
        super();
        this.GUID = getGUID();
    }
    GetHidden = GetValueByReferenceFunction("Hidden", false);
    GetLabel = GetValueByReferenceFunction("Label", undefined);
    GetIndex = GetValueByReferenceFunction("Index", 0);
    SetIndex(index) { this.GetObjProperty().Index = index; }
    Attach() {
        super.Attach();
        if(this.GetSelections().length > 1) {
            var thisClass = this;
            $(document).on("change."+this.GUID, "#" + this.GUID, function(){
                var selectionIndex = parseInt($(this).val());
                    
                thisClass.Value.SetIni(undefined, thisClass.IniLocation + "/Selections/" + selectionIndex);
                thisClass.SetIndex(selectionIndex);
                $("#span" + thisClass.GUID).replaceWith(thisClass.GetHtml());
            
                CallObjFunctionIfExists(thisClass.Obj, "Update");
            });

            $(document).on("click."+this.GUID, "#" + this.GUID + "clear", function(){
                thisClass.SetValue({});
                thisClass.Value.InitProperty();
                CallObjFunctionIfExists(thisClass.Obj, "Update");
            });
        }
    }
    DeAttach() {
        super.DeAttach();
        $(document).off("click."+this.GUID);
        $(document).off("change."+this.GUID);
    }

    ObjUpdateEvent() {
        super.ObjUpdateEvent();
        var selectionIndex = this.GetIndex();
        if(parseInt($("#" + this.GUID + " option:selected").val()) !== selectionIndex) {
            this.Value.SetIni(undefined, this.IniLocation + "/Selections/" + selectionIndex);
            $("#span" + this.GUID).replaceWith(this.GetHtml());
        }
    }

    GetHtml() {
        var selections = this.GetSelections();

        if(this.GetHidden())
            return "";

        var template = "<span id=\"span"+this.GUID+"\">";
        if(selections.length > 1) {
            if(!selectionConfigGuiTemplate)
                selectionConfigGuiTemplate = getFileContents("ConfigGui/Selection.html");
            template += selectionConfigGuiTemplate;
            template = template.replace(/[$]id[$]/g, this.GUID);
            template = template.replace(/[$]label[$]/g, this.GetLabel());
            var selectionHtml = "";
            var thisClass = this;
            $.each(selections, function(selectionIndex, selectionValue) {
                if(selectionIndex === parseInt(thisClass.GetIndex()))
                    selectionHtml += "<option selected value=\"" + selectionIndex + "\">" + selectionValue.Name + "</option>";
                else
                    selectionHtml += "<option value=\"" + selectionIndex + "\">" + selectionValue.Name + "</option>";
            });
            template = template.replace(/[$]selections[$]/g, selectionHtml);
        }

        template += this.Value.GetHtml();

        return template + "</span>";
    }
    InitProperty() {
        var objProperty = super.InitProperty();
        if(!objProperty)
            return false;
            
        if(!(this.Value instanceof ConfigGui)) {
            this.Value.DeAttach();
            var newVal = new ConfigGui();
            newVal.SetObj(this.Value.Obj, this.Value.ObjLocation);
            newVal.SetIni(this.Value.Ini, this.Value.IniLocation);
            this.Value = newVal;
            this.Value.Attach();
        }

        return objProperty;
    }
}

var checkBoxConfigGuiTemplate;
var numberConfigGuiTemplate;
class ConfigNumberGui extends ConfigNumber {
    constructor(){
        super();
        this.GUID = getGUID();
    }

    GetHidden = GetValueByReferenceFunction("Hidden", false);
    GetLabel = GetValueByReferenceFunction("Label", undefined);
    GetUnits = GetUnitsFunction("Units", BlankUnits);
    GetUnitIndex = GetValueByReferenceFunction("UnitIndex", 0);
    GetUnit() { return this.GetUnits()[this.GetUnitIndex()]; }

    Attach() {
        super.Attach();
        var thisClass = this;
        $(document).on("change."+this.GUID, "#" + this.GUID, function(){
            var type = thisClass.GetType();
            if(type === "bool") {
                thisClass.SetValue(this.checked);
            } else {
                var val = parseFloat($(this).val());
                var unit = thisClass.GetUnit();
                
                val /= unit.DisplayMultiplier - unit.DisplayOffset;

                thisClass.SetValue(val);
            }
            CallObjFunctionIfExists(thisClass.Obj, "Update");
        });
        $(document).on("focus."+this.GUID, "#" + this.GUID, function(){
            $(this).select();
        });
    }
    DeAttach() {
        super.DeAttach();
        $(document).off("click."+this.GUID);
        $(document).off("change."+this.GUID);
        $(document).off("focus."+this.GUID);
    }
    ObjUpdateEvent() {
        super.ObjUpdateEvent();

        if(!this.GetStatic()) {
            var unit = this.GetUnit();
            var type = this.GetType();
            
            if(type !== this.CurrentType) {
                $("#span" + this.GUID).replaceWith(this.GetHtml());
            } else {
                $("#" + this.GUID).val(this.GetValue() * unit.DisplayMultiplier + unit.DisplayOffset);
            }

            this.CurrentType = type;
        }
    }
    GetHtml() {

        if(this.GetHidden() || this.GetStatic())
            return "";

        var template = "";
        var type = this.GetType();
        var thisValue = this.GetValue();
        if(type === "bool") {
            if(!checkBoxConfigGuiTemplate)
                checkBoxConfigGuiTemplate = getFileContents("ConfigGui/CheckBox.html");
            template = checkBoxConfigGuiTemplate;
            template = template.replace(/[$]id[$]/g, this.GUID);
            template = template.replace(/[$]label[$]/g, this.GetLabel());
            if(thisValue)
                template = template.replace(/[$]checked[$]/g, "checked");
            else
                template = template.replace(/[$]checked[$]/g, "");
        } else {
            if(!numberConfigGuiTemplate) {
                numberConfigGuiTemplate = getFileContents("ConfigGui/Number.html");
            }
            template = numberConfigGuiTemplate;

            template = template.replace(/[$]id[$]/g, this.GUID);
            template = template.replace(/[$]label[$]/g, this.GetLabel());
            var unit = this.GetUnit();
            var min = this.GetMin();
            var max = this.GetMax();
            var step = this.GetStep();
            template = template.replace(/[$]value[$]/g, thisValue * unit.DisplayMultiplier + unit.DisplayOffset);
            template = template.replace(/[$]units[$]/g, unit.Name);
            min = min * unit.DisplayMultiplier + unit.DisplayOffset;
            max = max * unit.DisplayMultiplier + unit.DisplayOffset;
            step = step * unit.DisplayMultiplier;
            
            if(min > 999999999999999)
                min = 999999999999999;
            if(min < -999999999999999)
                min = -999999999999999;
            if(max > 999999999999999)
                max = 999999999999999;
            if(max < -999999999999999)
                max = -999999999999999;
            if(step > 999999999999999)
                step = 999999999999999;
            if(step < -999999999999999)
                step = -999999999999999;

            template = template.replace(/[$]min[$]/g, min);
            template = template.replace(/[$]max[$]/g, max);
            template = template.replace(/[$]step[$]/g, step);
        }

        return template;
    }
    InitProperty() {
        var objProperty = super.InitProperty();
        if(!objProperty)
            return false;

        return objProperty;
    }
}

var numberSelectionConfigGuiTemplate;
class ConfigNumberSelectionGui extends ConfigNumber {
    constructor(){
        super();
        this.GUID = getGUID();
    }
    GetHidden = GetValueByReferenceFunction("Hidden", false);
    GetLabel = GetValueByReferenceFunction("Label", undefined);
    Attach() {
        super.Attach();
        var thisClass = this;

        $(document).on("change."+this.GUID, "#" + this.GUID, function(){
            thisClass.SetValue($(this).val());
        
            CallObjFunctionIfExists(thisClass.Obj, "Update");
        });
    }
    DeAttach() {
        super.DeAttach();
        $(document).off("change."+this.GUID);
    }
    ObjUpdateEvent() {
        super.ObjUpdateEvent();

        $("#span" + this.GUID).replaceWith(this.GetHtml());
    }
    GetHtml() {
        if(this.GetHidden())
            return "";

        var template = "<span id=\"span"+this.GUID+"\">";
        var selections = this.GetSelections();
        if(!numberSelectionConfigGuiTemplate)
            numberSelectionConfigGuiTemplate = getFileContents("ConfigGui/NumberSelection.html");
        template += numberSelectionConfigGuiTemplate;
        template = template.replace(/[$]id[$]/g, this.GUID);
        template = template.replace(/[$]label[$]/g, this.GetLabel());
        var selectionHtml = "";
        var thisClass = this;
        $.each(selections, function(selectionValue, selectionName) {
            if(typeof selectionName !== "string")
            {
                selectionName = selectionName.Name;
                selectionValue =  thisClass.GetIniProperty().Selections + "/" + selectionName;
            }
            if((selectionValue + "") === ("" + thisClass.GetObjProperty().Value))
                selectionHtml += "<option selected value=\"" + selectionValue + "\">" + selectionName + "</option>";
            else {
                if(selectionName !== "INVALID") 
                    selectionHtml += "<option value=\"" + selectionValue + "\">" + selectionName + "</option>";
            }
        });
        template = template.replace(/[$]selections[$]/g, selectionHtml);

        return template + "</span>";
    }
}


document.addEventListener("dragstart", function(e){
    if($(e.target).hasClass("selected"))
        e.preventDefault();
});//disable dragging of selected items
class ConfigNumberTableGui extends ConfigNumberTable {
    GetXMin = GetValueByReferenceFunction("XMin", 0);
    GetXMax = GetValueByReferenceFunction("XMax", 0);
    GetYMin = GetValueByReferenceFunction("YMin", 0);
    GetYMax = GetValueByReferenceFunction("YMax", 0);
    GetDialog = GetValueByReferenceFunction("Dialog", false);
    GetLabel = GetValueByReferenceFunction("Label", "Table");
    GetHidden = GetValueByReferenceFunction("Hidden", false);
    GetXUnits = GetUnitsFunction("XUnits", BlankUnits);
    GetYUnits = GetUnitsFunction("YUnits", BlankUnits);
    GetZUnits = GetUnitsFunction("ZUnits", BlankUnits);
    GetXUnitIndex = GetValueByReferenceFunction("XUnitIndex", 0);
    GetYUnitIndex = GetValueByReferenceFunction("YUnitIndex", 0);
    GetZUnitIndex = GetValueByReferenceFunction("ZUnitIndex", 0);
    GetXUnit() { return this.GetXUnits()[this.GetXUnitIndex()]; }
    GetYUnit() { return this.GetYUnits()[this.GetYUnitIndex()]; }
    GetZUnit() { return this.GetZUnits()[this.GetZUnitIndex()]; }
    GetXLabel = GetValueByReferenceFunction("XLabel", "X");
    GetYLabel = GetValueByReferenceFunction("YLabel", "Y");
    GetZLabel = GetValueByReferenceFunction("ZLabel", "Z");

    constructor(){
        super();
        this.GUID = getGUID();
    }

    InterpolateTable() {
        var xRes = this.GetXResolution();
        var yRes = this.GetYResolution();
        var xMin = this.GetXMin();
        var xMax = this.GetXMax();
        var yMin = this.GetYMin();
        var yMax = this.GetYMax();
        if(xRes !== this.CurrentXRes || yRes !== this.CurrentYRes || xMin !== this.CurrentXMin || xMax !== this.CurrentXMax || yMin !== this.CurrentYMin || yMax !== this.CurrentYMax) {
            //TODO: Add interpolation logic. creating new table now.
            var val = this.GetMin();
            if(val < 0)
                val = 0;
            if(val > this.GetMax())
                val = this.GetMax();

            var table = new Array(this.GetTableArrayLength());
            $.each(table, function(index, value) {
                table[index] = val;
            });
            this.SetValue(table);
        }
        this.CurrentXRes = xRes;
        this.CurrentYRes = yRes;
        this.CurrentXMin = xMin;
        this.CurrentXMax = xMax;
        this.CurrentYMin = yMin;
        this.CurrentYMax = yMax;
    }
    DeAttach() {
        super.DeAttach();
        $(document).off("click."+this.GUID);
        $(document).off("change."+this.GUID);
        $(document).off("mousedown."+this.GUID);
        $(document).off("mouseup."+this.GUID);
        $(document).off("mousemove."+this.GUID);
        $(document).off("contextmenu."+this.GUID);
        $(document).off("copy."+this.GUID);
    }

    ObjUpdateEvent() {
        super.ObjUpdateEvent();
        var xunit = this.GetXUnit();
        var yunit = this.GetYUnit();
        var zunit = this.GetZUnit();
        
        var xRes = this.GetXResolution();
        var yRes = this.GetYResolution();
        var entireTableRefresh = xRes !== this.CurrentXRes ||yRes !== this.CurrentYRes;
        this.InterpolateTable();
        if(entireTableRefresh) {
            $('#' + this.GUID + 'table').replaceWith(this.GetTableHtml());
        } else {
            var xMin = this.GetXMin();
            var xMax = this.GetXMax();
            var yMin = this.GetYMin();
            var yMax = this.GetYMax();
            var table = this.GetValue()
            for(var x = 0; x < xRes; x++) {
                $("#" + this.GUID + "x" + x).val(parseFloat(parseFloat(((xMax - xMin) * (x) / (xRes-1) + xMin).toFixed(6)).toPrecision(7)) * xunit.DisplayMultiplier + xunit.DisplayOffset);
            }
            for(var y = 0; y < yRes; y++) {
                $("#" + this.GUID + "y" + y).val(parseFloat(parseFloat(((yMax - yMin) * (y) / (yRes-1) + yMin).toFixed(6)).toPrecision(7)) * yunit.DisplayMultiplier + yunit.DisplayOffset);
            }
            for(var x = 0; x < xRes; x++) {
                for(var y = 0; y < yRes; y++) {
                    var valuesIndex = x + xRes * y;
                    $("#" + this.GUID + "-" + valuesIndex).val(table[valuesIndex] * zunit.DisplayMultiplier + zunit.DisplayOffset);
                }
            }
        }
    }
    GetTableHtml() {
        var tableValue = this.GetValue();
        var xunit = this.GetXUnit();
        var yunit = this.GetYUnit();
        var zunit = this.GetZUnit();
        var xRes = this.GetXResolution();
        var yRes = this.GetYResolution();
        var xMin = this.GetXMin();
        var xMax = this.GetXMax();
        var yMin = this.GetYMin();
        var yMax = this.GetYMax();

        var thisClass = this;
        $(document).off("change."+this.GUID);
        $(document).off("focus."+this.GUID);
        var row = "";
        var table = "";
        
        var min = this.GetMin();
        var max = this.GetMax();
        var step = this.GetStep();
        min = min * zunit.DisplayMultiplier + zunit.DisplayOffset;
        max = max * zunit.DisplayMultiplier + zunit.DisplayOffset;
        step *= zunit.DisplayMultiplier;
        
        if(min > 999999999999999)
            min = 999999999999999;
        if(min < -999999999999999)
            min = -999999999999999;
        if(max > 999999999999999)
            max = 999999999999999;
        if(max < -999999999999999)
            max = -999999999999999;
        if(step > 999999999999999)
            step = 999999999999999;
        if(step < -999999999999999)
            step = -999999999999999;

        for(var y = 0; y < (!yRes? 2 : yRes + 1); y++) {
            var row = "<tr>";
            for(var x = 0; x < xRes + 1; x++) {
                if(y === 0) {
                    if(x === 0) {
                        // X - - -
                        // - - - -
                        // - - - -
                        // - - - -
                        if(yRes === 1 && xRes !== 1) {
                            row += "<th style=\"border-right-style: sold; border-right-width:5px;\">" + this.GetXLabel() + "</th>";
                        } else if(yRes !== 1 && xRes === 1) {
                            row += "<th style=\"border-bottom-style: sold; border-bottom-width:5px;\">" + this.GetYLabel() + "</th>";
                        } else {
                            row += "<th style=\"border-bottom-style: sold; border-bottom-width:5px;\">" + this.GetZLabel() + "</th>";
                        }
                    } else {
                        // - X X X
                        // - - - -
                        // - - - -
                        // - - - -
        //                 if(x === 1 && xMinRef.GetHtml && GetReferenceCount(this.Parent, GetIniXMin(this.Ini)) === 1) {
        //                     // - X - -
        //                     // - - - -
        //                     // - - - -
        //                     // - - - -
        //                     row += "<td style=\"border-bottom-style: sold; border-bottom-width:5px;\">"+xMinRef.GetHtml(true)+"</td>";
        //                 } else if (x === xResRef.Value && xMaxRef.GetHtml && GetReferenceCount(this.Parent, GetIniXMax(this.Ini)) === 1) {
        //                     // - - - X
        //                     // - - - -
        //                     // - - - -
        //                     // - - - -
        //                     row += "<td style=\"border-bottom-style: sold; border-bottom-width:5px;\">"+xMaxRef.GetHtml(true)+"</td>";
        //                 } else {
                            // - - X -
                            // - - - -
                            // - - - -
                            // - - - -
                            if(xRes === 1) {
                                if(yRes !== 1)
                                    row += "<th style=\"border-bottom-style: sold; border-bottom-width:5px;\">" + this.GetZLabel() + "</th>";
                            } else {
                                row += "<td style=\"border-bottom-style: sold; border-bottom-width:5px;\"><input id=\"" + this.GUID + "x" + (x-1) + "\" type=\"number\" disabled value=\"" + (parseFloat(parseFloat(((xMax - xMin) * (x-1) / (xRes-1) + xMin).toFixed(6)).toPrecision(7)) * xunit.DisplayMultiplier + xunit.DisplayOffset) + "\"/></td>";
                            }
        //                 }
                    }
                } else {
                    if(x === 0) {
                        // - - - -
                        // X - - -
                        // X - - -
                        // X - - -
        //                 if(y === 1 && yMinRef.GetHtml && GetReferenceCount(this.Parent, GetIniYMin(this.Ini)) === 1) {
        //                     // - - - -
        //                     // X - - -
        //                     // - - - -
        //                     // - - - -
        //                     row += "<td style=\"border-right-style: sold; border-right-width:5px;\">"+yMinRef.GetHtml(true)+"</td>";
        //                 } else if (y === yResRef.Value && yMaxRef.GetHtml && GetReferenceCount(this.Parent, GetIniYMax(this.Ini)) === 1) {
        //                     // - - - -
        //                     // - - - -
        //                     // - - - -
        //                     // X - - -
        //                     row += "<td style=\"border-right-style: sold; border-right-width:5px;\">"+yMaxRef.GetHtml(true)+"</td>";
        //                 } else {
                            // - - - -
                            // - - - -
                            // X - - -
                            // - - - -
                            if(yRes === 1) {
                                row += "<th style=\"border-right-style: sold; border-right-width:5px;\">" + this.GetZLabel() + "</th>";
                            } else {
                                row += "<td style=\"border-right-style: sold; border-right-width:5px;\"><input id=\"" + this.GUID + "y" + (y-1) + "\" type=\"number\" disabled value=\"" + (parseFloat(parseFloat(((yMax - yMin) * (y-1) / (yRes-1) + yMin).toFixed(6)).toPrecision(7)) * yunit.DisplayMultiplier + yunit.DisplayOffset) + "\"/></td>";
                            }
        //                 }
                    } else {
                        // - - - -
                        // - X X X
                        // - X X X
                        // - X X X
                        var valuesIndex = (x-1) + xRes * (y-1);
                        var inputId =  this.GUID + "-" + valuesIndex;
                        var rowClass = $("#" + inputId).attr("class")
                        if(rowClass)
                            rowClass = " class =\"" + rowClass + "\"";
                        else
                            rowClass = "";
                        var value = tableValue[valuesIndex] * zunit.DisplayMultiplier + zunit.DisplayOffset;
                        row += "<td><input id=\"" + inputId + "\" type=\"number\" min=\"" + min + "\" max=\"" + max + "\" step=\"" + step + "\" value=\"" + value + "\""+rowClass+"/></td>";

                        var registerListener = function(valuesIndex) {
                            $(document).on("change."+thisClass.GUID, "#" + inputId, function(){
                                var zunit = thisClass.GetZUnit();

                                var val = parseFloat($(this).val()) / zunit.DisplayMultiplier - zunit.DisplayOffset;
                                table = thisClass.GetValue();
                                table[valuesIndex] = val;
                                var selectedCount = 0;
                                $.each(table, function(selectedindex, value) { if ($("#" + thisClass.GUID + "-" + selectedindex).hasClass("selected")) selectedCount++; });
                                if(selectedCount > 1) {
                                    $.each(table, function(selectedindex, value) {
                                        var thisElement = $("#" + thisClass.GUID + "-" + selectedindex);
                                        if(thisElement.hasClass("selected"))  {
                                            table[selectedindex] = val;
                                        }
                                    });
                                }
                                thisClass.SetValue(table);
                                CallObjFunctionIfExists(thisClass.Obj, "Update");
                            });
                            $(document).on("focus."+thisClass.GUID, "#" + inputId, function(){
                                $(this).select();
                            });
                        };

                        registerListener(valuesIndex);
                    }
                }
            }
            row += "</tr>";
            table += row;
        }

        $(document).off("mousedown."+this.GUID);
        $(document).off("mouseup."+this.GUID);
        $(document).off("mousemove."+this.GUID);
        $(document).off("contextmenu."+this.GUID);
        $(document).off("copy."+this.GUID);
        var selecting = false;
        var pointX;
        var pointY;
        $.each(tableValue, function(index, value) {
            $(document).on("mousedown."+thisClass.GUID, "#" + thisClass.GUID + "-" + index, function(){
                pointX =  $(this).offset().left - $(this).closest("table").offset().left;
                pointY =  $(this).offset().top - $(this).closest("table").offset().top;
                $.each(thisClass.GetValue(), function(index, value) {
                    $("#" + thisClass.GUID + "-" + index).removeClass("selected");
                });
                $(this).addClass("selected");
                selecting = true;
            });
            $(document).on("copy."+thisClass.GUID, "#" + thisClass.GUID + "-" + index, function(e){
                var copyData = "";
                var prevRow;
                $.each(thisClass.GetValue(), function(index, value) {
                    if($("#" + thisClass.GUID + "-" + index).hasClass("selected")) {
                        if(!prevRow)
                            prevRow = parseInt(index / xRes);
                        if(prevRow !== parseInt(index / xRes))
                            copyData += "\n";
                        else
                            copyData += "\t";
                        copyData += value * zunit.DisplayMultiplier + zunit.DisplayOffset;
                        prevRow = parseInt(index / xRes);
                    }
                });
                copyData = copyData.substring(1);
                e.originalEvent.clipboardData.setData('text/plain', copyData);
                e.preventDefault();
            });
            $(document).on("paste."+thisClass.GUID, "#" + thisClass.GUID + "-" + index, function(e){
                var table = thisClass.GetValue();
                var val = e.originalEvent.clipboardData.getData('text/plain');
                var selectedIndex = index;
                $.each(val.split("\n"), function(valIndex, val) {
                    $.each(val.split("\t"), function(valIndex, val) {
                        if(selectedIndex + valIndex < table.length) {
                            $("#" + thisClass.GUID + "-" + (selectedIndex + valIndex)).addClass("selected");
                            table[selectedIndex + valIndex] = parseFloat(val) / zunit.DisplayMultiplier - zunit.DisplayOffset;
                        }
                    });
                    selectedIndex += xRes;
                });
                thisClass.SetValue(table);
                CallObjFunctionIfExists(thisClass.Obj, "Update");
                e.preventDefault();
            });
        });

        $(document).on("mousedown."+this.GUID, "#" + this.GUID + "table", function(e){
            if(selecting)
                return;
            var table = thisClass.GetValue();
            $.each(table, function(index, value) {
                $("#" + thisClass.GUID + "-" + index).removeClass("selected");
            });
        });

        $(document).on("mouseup."+this.GUID, function(e){
            var table = thisClass.GetValue();
            var selectedCount = 0;
            $.each(table, function(selectedindex, value) { if ($("#" + thisClass.GUID + "-" + selectedindex).hasClass("selected")) selectedCount++; });
            if(selectedCount > 1) {
                $.each(table, function(index, value) {
                    var thisElement = $("#" + thisClass.GUID + "-" + index);
                    if(thisElement.is(":focus")) {
                        thisElement.select();
                    }
                });
            }

            selecting = false;
        });
        
        $(document).on("mousemove."+this.GUID, function(e){
            if(!selecting)
                return;
            var table = thisClass.GetValue();
            $.each(table, function(index, value) {
                var thisElement = $("#" + thisClass.GUID + "-" + index);
                var thisTable = thisElement.closest("table")
                var relX = e.pageX - thisTable.offset().left;
                var elX = thisElement.offset().left - thisTable.offset().left + (thisElement.width() / 2);
                var relY = e.pageY - thisTable.offset().top;
                var elY = thisElement.offset().top - thisTable.offset().top + (thisElement.height() / 2);
                if(((elX <= relX && elX >= pointX) || (elX >= relX && elX <= pointX) || (pointX == thisElement.offset().left - thisTable.offset().left)) &&
                    ((elY <= relY && elY >= pointY) || (elY >= relY && elY <= pointY) || (pointY == thisElement.offset().top - thisTable.offset().top))) {
                    thisElement.addClass("selected");
                } else {
                    thisElement.removeClass("selected");
                }
            });
        });
        
        $.each(tableValue, function(index, value) {
            $(document).on("contextmenu."+thisClass.GUID, "#" + thisClass.GUID + "-" + index, function(){
                event.preventDefault();
            });
        });

        return "<table id=\"" + this.GUID + "table\" class=\"configtable\">" + table + "</table>";
    }
    GetHtml() {
        if(this.GetHidden())
            return "";

        // var xResRef = GetReferenceByNumberOrReference(this.Parent, GetIniXResolution(this.Ini), 1);
        // var yResRef = GetReferenceByNumberOrReference(this.Parent, GetIniYResolution(this.Ini), 1);

        var template = "";
        // if(xResRef.GetHtml && GetReferenceCount(this.Parent, GetIniXResolution(this.Ini)) === 1 && GetIniXMax(this.Ini) !== GetIniXResolution(this.Ini) && GetIniXMin(this.Ini) !== GetIniXResolution(this.Ini))
        //     template += xResRef.GetHtml();
        // if(yResRef.GetHtml && GetReferenceCount(this.Parent, GetIniYResolution(this.Ini)) === 1 && GetIniYMax(this.Ini) !== GetIniYResolution(this.Ini) && GetIniYMin(this.Ini) !== GetIniYResolution(this.Ini))
        //     template += yResRef.GetHtml();

        template += this.GetTableHtml();
        
        var thisClass = this;
        if(this.GetDialog()) {
            var style = $("#" + this.GUID + "dialog").is(":visible")? "style=\"margin-left:40px;\"" : "style=\"margin-left:40px; display: none;\"";
            var buttonVal = $("#" + this.GUID + "edit").val();
            if(!buttonVal)
                buttonVal = "Show/Edit";

            template = "<label for=\"" + this.GUID + "edit\">" + this.GetLabel() + ":</label><input type=\"button\" id=\"" + this.GUID + "edit\" value=\""+buttonVal+"\"><div id=\"" + this.GUID + "dialog\" "+style+">" + template + "</div>";
            
            $(document).off("click."+this.GUID);
            $(document).on("click."+this.GUID, "#" + this.GUID + "edit", function(){
                if($("#" + thisClass.GUID + "dialog").is(":visible")) {
                    $("#" + thisClass.GUID + "dialog").hide();
                    $("#" + thisClass.GUID + "edit").val("Show/Edit");
                } else {
                    $("#" + thisClass.GUID + "dialog").show();
                    $("#" + thisClass.GUID + "edit").val("Hide");
                }
            });
        }

        return "<span id=\"span" + this.GUID + "\">" + template + "</span>";
    }
    InitProperty() {
        var objProperty = super.InitProperty();
        if(!objProperty)
            return false;

        this.CurrentXRes = this.GetXResolution();
        this.CurrentYRes = this.GetYResolution();
        this.CurrentXMin = this.GetXMin();
        this.CurrentXMax = this.GetXMax();
        this.CurrentYMin = this.GetYMin();
        this.CurrentYMax = this.GetYMax();

        return objProperty;
    }
}

class ConfigFormulaGui extends ConfigFormula {
    constructor(){
        super();
        this.GUID = getGUID();
    }
    GetHidden = GetValueByReferenceFunction("Hidden", false);
    GetLabel = GetValueByReferenceFunction("Label", undefined);
    GetUnits = GetUnitsFunction("Units", BlankUnits);
    GetUnitIndex = GetValueByReferenceFunction("UnitIndex", 0);
    GetUnit() { return this.GetUnits()[this.GetUnitIndex()]; }
    ObjUpdateEvent() {
        super.ObjUpdateEvent();

        var unit = this.GetUnit();

        var degree = this.GetDegree();
        if(degree !== this.CurrentDegree) {
            var oldValue =  this.GetValue();
            var newValue = new Array(degree+1);
            $.each(newValue, function(index, value) {
                if(index < oldValue.length)
                {
                    newValue[index] = oldValue[index];
                } else {
                    newValue[index] = 0;
                }
            });
            this.SetValue(newValue);

            $("#span" + this.GUID).replaceWith(this.GetHtml());
        } else {
            var value =  this.GetValue();
            for(var d = 0; d < degree + 1; d++) {
                $("#" + this.GUID + "-" + d).val(value[d] * unit.DisplayMultiplier + unit.DisplayOffset);
            }
        }
        this.CurrentDegree = degree;
    }
    DeAttach() {
        super.DeAttach();
        $(document).off("change."+this.GUID);
    }
    Attach() {
        super.Attach();
        var thisClass = this;
        $(document).on("change."+thisClass.GUID, "#" + thisClass.GUID, function(){
            var index = $(this).data("index");
            var unit = thisClass.GetUnit();
            var val = parseFloat($(this).val());
            val /= unit.DisplayMultiplier - unit.DisplayOffset;

            var thisValue = thisClass.GetValue();
            thisValue[index] = val;
            thisClass.SetValue(thisValue);
            CallObjFunctionIfExists(thisClass.Obj, "Update");
        });
    }
    GetHtml() {
        if(this.GetHidden())
            return "";
        
        var min = this.GetMin();
        var max = this.GetMax();
        var step = this.GetStep();
        var unit = this.GetUnit();

        min = min * unit.DisplayMultiplier + unit.DisplayOffset;
        max = max * unit.DisplayMultiplier + unit.DisplayOffset;
        step *= unit.DisplayMultiplier;
        
        if(min > 999999999999999)
            min = 999999999999999;
        if(min < -999999999999999)
            min = -999999999999999;
        if(max > 999999999999999)
            max = 999999999999999;
        if(max < -999999999999999)
            max = -999999999999999;
        if(step > 999999999999999)
            step = 999999999999999;
        if(step < -999999999999999)
            step = -999999999999999;

        var template = "<label>" + this.GetLabel() + ":</label>";
        var value = this.GetValue();
        for(var i = value.length-1; i > 0; i--)
        {
            template += "<input id=\"" + this.GUID + "\" data-index=\"" + i + "\" type=\"number\" min=\"" + min + "\" max=\"" + max + "\" step=\"" + step + "\" value=\"" + (value[i]  * unit.DisplayMultiplier + unit.DisplayOffset) + "\"/>";
            if(i > 1)
                template += " x<sup>" + i + "</sup> + ";
            else
                template += " x + ";
        }
        template += "<input id=\"" + this.GUID + "\" data-index=\"0\" type=\"number\" min=\"" + min + "\" max=\"" + max + "\" step=\"" + step + "\" value=\"" + (value[0] * unit.DisplayMultiplier + unit.DisplayOffset) + "\"/>";
            
        return "<span id=\"span" + this.GUID + "\">" + template + "</span>";
    }
    InitProperty() {
        var objProperty = super.InitProperty();
        if(!objProperty)
            return false;

        this.CurrentDegree = this.GetDegree();

        return objProperty;
    }
}

class ConfigArrayGui extends ConfigArray {
    constructor(){
        super();
        this.GUID = getGUID();
    }
    GetHidden = GetValueByReferenceFunction("Hidden", false);

    SetArrayBuffer(arrayBuffer) {
        var size = super.SetArrayBuffer(arrayBuffer);
        var thisClass = this;
        $.each(this.Value, function(index, value) {
            if(!(thisClass.Value[index] instanceof ConfigGui)) {
                var prev = thisClass.Value[index];
                thisClass.Value[index].DeAttach();
                thisClass.Value[index] = new ConfigGui();
                thisClass.Value[index].SetObj(prev.Obj, prev.ObjLocation);
                thisClass.Value[index].SetIni(prev.Ini, prev.IniLocation);
                thisClass.Value[index].Attach();
            }
        });
        return size;
    }
    
    ObjUpdateEvent() {
        super.ObjUpdateEvent();
        var tableArrayLength = this.GetTableArrayLength();
        for(var i = 0; i < this.Value.length; i++) {
            $("#span" + this.Value[i].GUID).hide();
        }
        for(var i = 0; i < tableArrayLength; i++) {
            if(!(this.Value[i] instanceof ConfigGui)) {
                var prev = this.Value[i];
                this.Value[i].DeAttach();
                this.Value[i] = new ConfigGui();
                this.Value[i].SetObj(prev.Obj, prev.ObjLocation);
                this.Value[i].SetIni(prev.Ini, prev.IniLocation);
                thisClass.Value[index].Attach();
            }
            if(!($("#span" + this.Value[i].GUID).length))
                $("#span" + this.GUID).append(this.Value[i].GetHtml());
            else
                $("#span" + this.Value[i].GUID).show();
        }
        this.CurrentTableArrayLength = tableArrayLength;
    }

    GetHtml() {
        if(this.GetHidden())
            return "";

        var template = "<span id=\"span"+this.GUID+"\">";
        for(var i = 0; i < this.CurrentTableArrayLength; i++) {
            template += this.Value[i].GetHtml();
        }

        return template + "</span>";
    }

    InitProperty() {
        var objProperty = super.InitProperty();
        if(!objProperty)
            return false;
            
        this.CurrentTableArrayLength = this.GetTableArrayLength();
        var thisClass = this;
        $.each(this.Value, function(index, value) {
            if(!(thisClass.Value[index] instanceof ConfigGui)) {
                var prev = thisClass.Value[index];
                thisClass.Value[index].DeAttach();
                thisClass.Value[index] = new ConfigGui();
                thisClass.Value[index].SetObj(prev.Obj, prev.ObjLocation);
                thisClass.Value[index].SetIni(prev.Ini, prev.IniLocation);
                thisClass.Value[index].Attach();
            }
        });

        return objProperty;
    }
}

class ConfigNamedListGui extends ConfigNamedList {
    constructor(){
        super();
        this.GUID = getGUID();
    }
    GetHidden = GetValueByReferenceFunction("Hidden", false);
    
    ObjUpdateEvent() {
        super.ObjUpdateEvent();
        var tableArrayLength = this.GetTableArrayLength();
        
        if(this.CurrentTableArrayLength !== tableArrayLength) {
            for(var i = 0; i < tableArrayLength; i++) {
                if(!(this.Value[i] instanceof ConfigGui)) {
                    var prev = this.Value[i];
                    this.Value[i].DeAttach();
                    this.Value[i] = new ConfigGui();
                    this.Value[i].SetObj(prev.Obj, prev.ObjLocation);
                    this.Value[i].SetIni(prev.Ini, prev.IniLocation);
                    this.Value[i].Attach();
                    var valueObjProperty = this.Value[i].GetObjProperty();
                    valueObjProperty.iterator = i;
                    if(valueObjProperty.Name === undefined)
                        valueObjProperty.Name = this.GetDefaultName() + i;
                }
            }
            
            $("#left"+this.GUID).html(this.GetLeft());
            var selected = parseInt($("#" + this.GUID + "-Selection").val());
            $("#right"+this.GUID).html(this.GetRight(selected));
        } else {
            for(var i = 0; i < this.GetTableArrayLength(); i++) {
                var valueObjProperty = this.Value[i].GetObjProperty();
                $("#"+this.GUID+"-Selection" + i).text(valueObjProperty.Name);
                $("#"+this.GUID+"-Work" + i + " #"+this.GUID+"-Name").val(valueObjProperty.Name);
            }
        }

        this.CurrentTableArrayLength = tableArrayLength;
    }

    GetLeft() {
        //action bar
        var template = "<span>";
        template += "<span id=\""+this.GUID+"-Add\" class=\"namedListOperation\" style=\"padding: 3px 7px;\">+</span>";
        template += "<span id=\""+this.GUID+"-Delete\" class=\"namedListOperation\" style=\"padding: 3px 8px;\">-</span>";
        template += "<span id=\""+this.GUID+"-Up\" class=\"namedListOperation\" style=\"padding: 3px 4px;\">⮝</span>";
        template += "<span id=\""+this.GUID+"-Down\" class=\"namedListOperation\" style=\"padding: 3px 4px;\">⮟</span>";
        template += "</span>";

        //select list
        template += "<select id=\""+this.GUID+"-Selection\" size = 20 style=\"width: 150px;\">";
        var selected = parseInt($("#" + this.GUID + "-Selection").val());
        for(var i = 0; i < this.GetTableArrayLength(); i++) {
            var valueObjProperty = this.Value[i].GetObjProperty();
            template += "<option id=\""+this.GUID+"-Selection" + i + "\" " + (selected === i? "selected" : "") + " value=" + i + ">" + valueObjProperty.Name + "</option>";
        }
        template += "</select>";

        return template;
    }

    GetRight(selected) {
        var template = "";
        for(var i = 0; i < this.Value.length; i++) {
            template += "<span id=\""+this.GUID+"-Work" + i + "\" " + (i===selected? "" : "style=\"display: none;\"") + ">";
            var valueObjProperty = this.Value[i].GetObjProperty();
            template += "<input id=\""+this.GUID+"-Name\" data-i=" + i + " type=\"textbox\" value=\"" + valueObjProperty.Name + "\">";
            template += "<span class=\"configContainer\">";
            template += this.Value[i].GetHtml();
            template += "</span>";
            template += "</span>";
        }

        return template;
    }
    DeAttach() {
        super.DeAttach();
        $(document).off("click."+this.GUID);
        $(document).off("change."+this.GUID);
    }
    GetHtml() {
        if(this.GetHidden())
            return "";

        var template = "<span id=\"span"+this.GUID+"\">";

        //left column
        template += "<span id=\"left"+this.GUID+"\" style=\"display: inline-block; vertical-align:top;\">";
            template += this.GetLeft();
        template += "</span>";
        //right column
        var selected = parseInt($("#" + this.GUID + "-Selection option:selected").val());
        template += "<span id=\"right"+this.GUID+"\" style=\"display: inline-block; vertical-align:top; padding: 10px; min-width: 500px;\">";
            template += this.GetRight(selected);
        template += "</span>";

        var thisClass = this;
        $(document).off("click."+this.GUID);
        $(document).on("click."+this.GUID, "#" + this.GUID + "-Add", function(){
            thisClass.GetObjProperty().Length++;
            CallObjFunctionIfExists(thisClass.Obj, "Update");
        });
        $(document).on("click."+this.GUID, "#" + this.GUID + "-Delete", function(){
            var selected = parseInt($("#" + thisClass.GUID + "-Selection option:selected").val());
            if(isNaN(selected))
                return;

            var objProperty = thisClass.GetObjProperty();
            objProperty.Value.splice(selected, 1);
            objProperty.Length--;
            thisClass.Value[objProperty.Length].DeAttach();
            thisClass.Value.splice(objProperty.Length, 1);
            CallObjFunctionIfExists(thisClass.Obj, "Update");
        });

        $(document).off("change."+this.GUID);
        $(document).on("change."+this.GUID, "#" + this.GUID + "-Selection", function(){
            $("#right"+thisClass.GUID).children().hide();
            $("#"+thisClass.GUID+"-Work" + $(this).children("option:selected").val()).show();
        });
        $(document).on("change."+this.GUID, "#" + this.GUID + "-Name", function(){
            var i = $(this).data("i");
            var name = $(this).val();
            thisClass.Value[i].GetObjProperty().Name = name;
            $("#" + thisClass.GUID + "-Selection option[value=" + i + "]").text(name);
            CallObjFunctionIfExists(thisClass.Obj, "Update");
        });
        $(document).on("click."+this.GUID, "#" + this.GUID + "-Up", function(){
            var selected = parseInt($("#" + thisClass.GUID + "-Selection option:selected").val());
            if(isNaN(selected))
                return;
            if(selected===0)
                return;

            var objProperty = thisClass.GetObjProperty();
            var temp = objProperty.Value[selected];
            objProperty.Value[selected] = objProperty.Value[selected - 1];
            objProperty.Value[selected - 1] = temp;
            $("#" + thisClass.GUID + "-Selection").val(selected - 1);
            $("#right"+thisClass.GUID).children().hide();
            $("#"+thisClass.GUID+"-Work" + (selected - 1)).show();
            CallObjFunctionIfExists(thisClass.Obj, "Update");
        });
        $(document).on("click."+this.GUID, "#" + this.GUID + "-Down", function(){
            var selected = parseInt($("#" + thisClass.GUID + "-Selection option:selected").val());
            if(isNaN(selected))
                return;
            if(selected===thisClass.Value.length-1)
                return;

            var objProperty = thisClass.GetObjProperty();
            var temp = objProperty.Value[selected];
            objProperty.Value[selected] = objProperty.Value[selected + 1];
            objProperty.Value[selected + 1] = temp;
            $("#" + thisClass.GUID + "-Selection").val(selected + 1);
            $("#right"+thisClass.GUID).children().hide();
            $("#"+thisClass.GUID+"-Work" + (selected + 1)).show();
            CallObjFunctionIfExists(thisClass.Obj, "Update");
        });

        return template + "</span>";
    }

    InitProperty() {
        var objProperty = super.InitProperty();
        if(!objProperty)
            return false;
            
        this.CurrentTableArrayLength = this.GetTableArrayLength();
        var thisClass = this;
        $.each(this.Value, function(index, value) {
            if(!(thisClass.Value[index] instanceof ConfigGui)) {
                var prev = thisClass.Value[index];
                thisClass.Value[index].DeAttach();
                thisClass.Value[index] = new ConfigGui();
                thisClass.Value[index].SetObj(prev.Obj, prev.ObjLocation);
                thisClass.Value[index].SetIni(prev.Ini, prev.IniLocation);
                thisClass.Value[index].Attach();
            }
        });

        return objProperty;
    }
}

var configDivGuiTemplate;
function wrapInConfigDivGui(id, content)
{
    if(!configDivGuiTemplate)
        configDivGuiTemplate = getFileContents("ConfigGui/ConfigDiv.html");
    var template = configDivGuiTemplate;
    template = template.replace(/[$]id[$]/g, id);
    template = template.replace(/[$]content[$]/g, content);
    return template;
}

function GetUnitsFunction(propertyName, defaultValue) {
    var f = function() {
        var val = GetValueByReference(propertyName, this.Obj, this.ObjLocation, this.Ini);

        var perSecondCount = 0;
        while(typeof(val) === "string" && val.indexOf("PerSecond(") === 0){
            val = GetValueByReference(val.substring(10, val.length - 1), this.Obj, this.ObjLocation, this.Ini);
            perSecond++;
        }

        while(perSecondCount-- > 0) {
            val = PerSecond(val);
        }

        if(val !== undefined)
            return val; 

        return defaultValue;
    }

    return f;
}