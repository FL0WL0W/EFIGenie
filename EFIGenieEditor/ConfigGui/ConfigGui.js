class ConfigGui extends Config {
    constructor(){
        super();
        this.GUID = getGUID();
    }
    GetParentTabbed() {
        var val = GetValueByNumberOrReference("...Tabbed", this.Obj, this.ObjLocation, this.Ini, this.IniLocation);
    
        if(val)
            return val; 
        
        return false;
    }
    GetHtml() {
        var objProperty = this.GetObjProperty();
        var iniProperty = this.GetIniProperty();

        if(iniProperty.Hidden)
            return "";

        var thisClass = this;

        var template = "";
        var tabs = "";
        var i = 0;

        $(document).off("click."+this.GUID);
        for(var variableRowIndex in iniProperty.Variables) {
            var variableRowKey = Object.keys(iniProperty.Variables[variableRowIndex])[0];
            var variableRowConfig = this[variableRowKey];
            
            if(!variableRowConfig || !variableRowConfig.GetHtml)
                continue; //throw "ConfigGui not initialized";

            var variableRowIniProperty = variableRowConfig.GetIniProperty();

            if(iniProperty.Tabbed && !variableRowIniProperty.Hidden) {
                var tabClasses = "tabLink";
                if(i === 0)
                    tabClasses += " active";
                var label = variableRowIniProperty.Label;
                tabs += "<button class=\"" + tabClasses + "\" id=\"tab" + this.GUID + "i" + i + "\" data-index=\"" + i + "\">" + label + "</button>";

                $(document).on("click."+this.GUID, "#tab" + thisClass.GUID + "i" + i, function(){
                    var index = $(this).data("index");
                    var iniProperty = thisClass.GetIniProperty();
                    for(var i = 0; i < iniProperty.Variables.length; i++) {
                        $("#tab" + thisClass.GUID + "i" + i).removeClass("active");
                        $("#span" + thisClass.GUID + "i" + i).hide();
                    }
                    $(this).addClass("active");
                    $("#span" + thisClass.GUID + "i" + index).show()
                });

                template += "<span id=\"span" + this.GUID + "i" + i + "\""  + ((i !== 0)? " style=\"display:none;\"" : "") + " class=\"tabContent\">" + variableRowConfig.GetHtml() + "</span>";
                i++;
            } else {
                template += variableRowConfig.GetHtml();
            }
        }

        if(iniProperty.Tabbed)
            template = "<div class=\"tab\">" + tabs + "</div>" + template;
        
        if(iniProperty.WrapInConfigContainer)
            template = wrapInConfigContainerGui(this.GUID, template);
        else
            template = wrapInConfigDivGui(this.GUID, template);

        if(!this.GetParentTabbed() && iniProperty.Label) {
            if(iniProperty.SameLine) 
                template = "<label for=\"" + this.GUID + "\" class=\"subConfigSameLineLabel\">" + iniProperty.Label + ":</label>" + template;
            else
                template = "<label for=\"" + this.GUID + "\" class=\"subConfigLabel\">" + iniProperty.Label + ":</label><span class=\"sameLineSpacer\"></span>" + template;
        }
        return "<span id=\"span"+this.GUID+"\">" + template + "</span>";
    }
    SetIni(ini, iniLocation) {
        super.SetIni(ini, iniLocation);
        var iniProperty = this.GetIniProperty();
                
        for(var variableRowIndex in iniProperty.Variables) {
            var variableRow = iniProperty.Variables[variableRowIndex];
            var variableRowKey = Object.keys(variableRow)[0];

            var prevConfig = this[variableRowKey];
            if(this[variableRowKey] && 
                (this[variableRowKey] instanceof ConfigNumberSelectionGui)
                || this[variableRowKey] instanceof ConfigNumberGui
                || this[variableRowKey] instanceof ConfigBooleanGui
                || this[variableRowKey] instanceof ConfigGui
                || this[variableRowKey] instanceof ConfigArrayGui
                || this[variableRowKey] instanceof ConfigSelectionGui
                || this[variableRowKey] instanceof ConfigNumberTableGui
                || this[variableRowKey] instanceof ConfigFormulaGui) {
            }
            else if(this[variableRowKey] instanceof ConfigNumber && this[variableRowKey].GetIniProperty().Selections) {
                this[variableRowKey] = new ConfigNumberSelectionGui();
            } else if(this[variableRowKey] instanceof ConfigNumber) {
                this[variableRowKey] = new ConfigNumberGui();
            } else if(this[variableRowKey] instanceof ConfigBoolean) {
                this[variableRowKey] = new ConfigBooleanGui();
            } else if(this[variableRowKey] instanceof Config) {
                this[variableRowKey] = new ConfigGui();
            } else if(this[variableRowKey] instanceof ConfigArray) {
                this[variableRowKey] = new ConfigArrayGui();
            } else if(this[variableRowKey] instanceof ConfigSelection) {
                this[variableRowKey] = new ConfigSelectionGui();
            } else if(this[variableRowKey] instanceof ConfigNumberTable) {
                this[variableRowKey] = new ConfigNumberTableGui();
            } else if(this[variableRowKey] instanceof ConfigFormula) {
                this[variableRowKey] = new ConfigFormulaGui();
            }

            if(prevConfig !== this[variableRowKey]) {
                //because we created a new object we have to do all of the initialization steps again
                this[variableRowKey].SetObj(prevConfig.Obj, prevConfig.ObjLocation);
                this[variableRowKey].SetIni(prevConfig.Ini, prevConfig.IniLocation);
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

    ObjUpdateEvent() {
        super.ObjUpdateEvent();
        var selectionIndex = this.GetObjProperty().Index;
        if(parseInt($("#" + this.GUID + " option:selected").val()) !== selectionIndex) {
            this.Value.SetIni(undefined, this.IniLocation + "/Selections/" + selectionIndex);
            $("#span" + this.GUID).replaceWith(this.GetHtml());
        }
    }

    GetHtml() {
        var objProperty = this.GetObjProperty();
        var iniProperty = this.GetIniProperty();

        if(iniProperty.Hidden)
            return "";

        var template = "<span id=\"span"+this.GUID+"\">";
        if(iniProperty.Selections.length > 1) {
            if(!selectionConfigGuiTemplate)
                selectionConfigGuiTemplate = getFileContents("ConfigGui/Selection.html");
            template += selectionConfigGuiTemplate;
            template = template.replace(/[$]id[$]/g, this.GUID);
            template = template.replace(/[$]label[$]/g, iniProperty.Label);
            var selectionHtml = "";
            $.each(iniProperty.Selections, function(selectionIndex, selectionValue) {
                if(selectionIndex === parseInt(objProperty.Index))
                    selectionHtml += "<option selected value=\"" + selectionIndex + "\">" + selectionValue.Name + "</option>";
                else
                    selectionHtml += "<option value=\"" + selectionIndex + "\">" + selectionValue.Name + "</option>";
            });
            template = template.replace(/[$]selections[$]/g, selectionHtml);
            
            var thisClass = this;
            $(document).off("change."+this.GUID);
            $(document).on("change."+this.GUID, "#" + this.GUID, function(){
                var selectionIndex = parseInt($(this).val());
                    
                thisClass.Value.SetIni(undefined, thisClass.IniLocation + "/Selections/" + selectionIndex);
                thisClass.GetObjProperty().Index = selectionIndex;
                $("#span" + thisClass.GUID).replaceWith(thisClass.GetHtml());
            
                CallObjFunctionIfExists(thisClass.Obj, "Update");
            });

            $(document).off("click."+this.GUID);
            $(document).on("click."+this.GUID, "#" + this.GUID + "clear", function(){
                thisClass.GetObjProperty().Value = {};
                thisClass.Value.initProperty();
                CallObjFunctionIfExists(thisClass.Obj, "Update");
            });
        }

        template += this.Value.GetHtml();

        return template + "</span>";
    }
    InitProperty() {
        var objProperty = super.InitProperty();
        if(!objProperty)
            return false;
            
        if(!(this.Value instanceof ConfigGui)) {
            var newVal = new ConfigGui();
            newVal.SetObj(this.Value.Obj, this.Value.ObjLocation);
            newVal.SetIni(this.Value.Ini, this.Value.IniLocation);
            this.Value = newVal;
        }
    }
}

var numberConfigGuiTemplate;
class ConfigNumberGui extends ConfigNumber {
    constructor(){
        super();
        this.GUID = getGUID();
    }

    GetUnits = GetUnitsFunction("Units", BlankUnits);

    ObjUpdateEvent() {
        super.ObjUpdateEvent();
        var objProperty = this.GetObjProperty();
        var iniProperty = this.GetIniProperty();

        var units = this.GetUnits();
        var unit = units[objProperty.UnitIndex];

        switch(iniProperty.Type) {
            case "uint8":
            case "uint16":
            case "uint32":
                if(objProperty.Value < 0)
                objProperty.Value = 0;
            case "int8":
            case "int16":
            case "int32":
            objProperty.Value = Math.round(objProperty.Value * this.GetValueMultiplier()) / this.GetValueMultiplier();
        }
        if(objProperty.Value < this.GetMin())
            objProperty.Value = this.GetMin();
        if(objProperty.Value > this.GetMax())
            objProperty.Value = this.GetMax();
        $("#" + this.GUID).val(objProperty.Value * unit.DisplayMultiplier + unit.DisplayOffset);
    }
    GetHtml() {
        var objProperty = this.GetObjProperty();
        var iniProperty = this.GetIniProperty();

        if(iniProperty.Hidden)
            return "";

        var template = "";
        if(!numberConfigGuiTemplate) {
            numberConfigGuiTemplate = getFileContents("ConfigGui/Number.html");
        }
        template = numberConfigGuiTemplate;

        template = template.replace(/[$]id[$]/g, this.GUID);
        template = template.replace(/[$]label[$]/g, iniProperty.Label);
        var units = this.GetUnits();
        var unit = units[objProperty.UnitIndex];
        var min = this.GetMin();
        var max = this.GetMax();
        var step = this.GetStep();
        template = template.replace(/[$]value[$]/g, objProperty.Value * unit.DisplayMultiplier + unit.DisplayOffset);
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

        var thisClass = this;

        $(document).off("change."+this.GUID);
        $(document).on("change."+this.GUID, "#" + this.GUID, function(){
            var val = parseFloat($(this).val());
            val /= unit.DisplayMultiplier - unit.DisplayOffset;

            thisClass.GetObjProperty().Value = val;
            CallObjFunctionIfExists(thisClass.Obj, "Update");
        });
        $(document).off("focus."+this.GUID);
        $(document).on("focus."+this.GUID, "#" + this.GUID, function(){
            $(this).select();
        });
        return template;
    }
    InitProperty() {
        var objProperty = super.InitProperty();
        if(!objProperty)
            return false;

        var iniProperty = this.GetIniProperty();
        if(objProperty.UnitIndex === undefined && iniProperty.UnitIndex !== undefined) {
            objProperty.UnitIndex = iniProperty.UnitIndex;
        }
        if(objProperty.UnitIndex === undefined) {
            objProperty.UnitIndex = 0;
        }

        return objProperty;
    }
}

var numberSelectionConfigGuiTemplate;
class ConfigNumberSelectionGui extends ConfigNumber {
    constructor(){
        super();
        this.GUID = getGUID();
    }

    ObjUpdateEvent() {
        super.ObjUpdateEvent();
        var objProperty = this.GetObjProperty();
        var iniProperty = this.GetIniProperty();

        switch(iniProperty.Type) {
            case "uint8":
            case "uint16":
            case "uint32":
                if(objProperty.Value < 0)
                objProperty.Value = 0;
            case "int8":
            case "int16":
            case "int32":
            objProperty.Value = Math.round(objProperty.Value);
        }
        if(objProperty.Value < this.GetMin())
            objProperty.Value = this.GetMin();
        if(objProperty.Value > this.GetMax())
            objProperty.Value = this.GetMax();
        $("#" + this.GUID).val(objProperty.Value);
    }

    GetHtml() {
        var objProperty = this.GetObjProperty();
        var iniProperty = this.GetIniProperty();

        if(iniProperty.Hidden)
            return "";

        var template = "<span id=\"span"+this.GUID+"\">";
        if(iniProperty.Selections.length > 1) {
            if(!numberSelectionConfigGuiTemplate)
                numberSelectionConfigGuiTemplate = getFileContents("ConfigGui/NumberSelection.html");
            template += numberSelectionConfigGuiTemplate;
            template = template.replace(/[$]id[$]/g, this.GUID);
            template = template.replace(/[$]label[$]/g, iniProperty.Label);
            var selectionHtml = "";
            var thisClass = this;
            $.each(iniProperty.Selections, function(selectionIndex, selectionValue) {
                var objProperty = thisClass.GetObjProperty();
                if(selectionIndex === parseInt(objProperty.Value))
                    selectionHtml += "<option selected value=\"" + selectionIndex + "\">" + selectionValue + "</option>";
                else {
                    if(selectionValue !== "INVALID") 
                        selectionHtml += "<option value=\"" + selectionIndex + "\">" + selectionValue + "</option>";
                }
            });
            template = template.replace(/[$]selections[$]/g, selectionHtml);
            
            $(document).off("change."+this.GUID);
            $(document).on("change."+this.GUID, "#" + this.GUID, function(){
                var objProperty = thisClass.GetObjProperty();
                objProperty.Value = parseInt($(this).val());
            
                CallObjFunctionIfExists(thisClass.Obj, "Update");
            });
        }

        return template + "</span>";
    }
}

var checkBoxConfigGuiTemplate;
class ConfigBooleanGui extends ConfigBoolean {
    constructor(){
        super();
        this.GUID = getGUID();
    }

    ObjUpdateEvent() {
        super.ObjUpdateEvent();
        $("#" + this.GUID).val(this.GetObjProperty().Value);
    }

    GetHtml() {
        var objProperty = this.GetObjProperty();
        var iniProperty = this.GetIniProperty();

        if(iniProperty.Hidden)
            return "";

        if(!checkBoxConfigGuiTemplate)
            checkBoxConfigGuiTemplate = getFileContents("ConfigGui/CheckBox.html");
        var template = checkBoxConfigGuiTemplate;
        template = template.replace(/[$]id[$]/g, this.GUID);
        template = template.replace(/[$]label[$]/g, iniProperty.Label);
        if(objProperty.Value)
            template = template.replace(/[$]checked[$]/g, "checked");
        else
            template = template.replace(/[$]checked[$]/g, "");
    
        var thisClass = this;

        $(document).off("change."+this.GUID);
        $(document).on("change."+this.GUID, "#" + this.GUID, function(){

            thisClass.GetObjProperty().Value = this.checked;
            CallObjFunctionIfExists(thisClass.Obj, "Update");
        });
    
        return template;
    }

    InitProperty() {
        var objProperty = super.InitProperty();
        if(!objProperty)
            return false;

        return objProperty;
    }
}

document.addEventListener("dragstart", function(e){
    if($(e.target).hasClass("selected"))
        e.preventDefault();
});//disable dragging of selected items
class ConfigNumberTableGui extends ConfigNumberTable {
    GetXMin = GetIniPropertyPropertyGetFunction("XMin", 0);
    GetXMax = GetIniPropertyPropertyGetFunction("XMax", 0);
    GetYMin = GetIniPropertyPropertyGetFunction("YMin", 0);
    GetYMax = GetIniPropertyPropertyGetFunction("YMax", 0);
    GetXUnits = GetUnitsFunction("XUnits", BlankUnits);
    GetYUnits = GetUnitsFunction("YUnits", BlankUnits);
    GetZUnits = GetUnitsFunction("ZUnits", BlankUnits);

    constructor(){
        super();
        this.GUID = getGUID();
    }

    InterpolateTable() {
        var objProperty = this.GetObjProperty();
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

            objProperty.Value = new Array(this.GetTableArrayLength());
            $.each(objProperty.Value, function(index, value) {
                objProperty.Value[index] = val;
            });
        }
        this.CurrentXRes = xRes;
        this.CurrentYRes = yRes;
        this.CurrentXMin = xMin;
        this.CurrentXMax = xMax;
        this.CurrentYMin = yMin;
        this.CurrentYMax = yMax;
    }

    ObjUpdateEvent() {
        super.ObjUpdateEvent();
        var iniProperty = this.GetIniProperty();
        var objProperty = this.GetObjProperty();
        var xunits = this.GetXUnits();
        var xunit = xunits[objProperty.XUnitIndex];
        var yunits = this.GetYUnits();
        var yunit = yunits[objProperty.YUnitIndex];
        var zunits = this.GetZUnits();
        var zunit = zunits[objProperty.ZUnitIndex];

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
            for(var x = 0; x < xRes; x++) {
                $("#" + this.GUID + "x" + x).val(parseFloat(parseFloat(((xMax - xMin) * (x) / (xRes-1) + xMin).toFixed(6)).toPrecision(7)) * xunit.DisplayMultiplier + xunit.DisplayOffset);
            }
            for(var y = 0; y < yRes; y++) {
                $("#" + this.GUID + "y" + y).val(parseFloat(parseFloat(((yMax - yMin) * (y) / (yRes-1) + yMin).toFixed(6)).toPrecision(7)) * yunit.DisplayMultiplier + yunit.DisplayOffset);
            }
            for(var x = 0; x < xRes; x++) {
                for(var y = 0; y < yRes; y++) {
                    var valuesIndex = x + xRes * y;
                    $("#" + this.GUID + "-" + valuesIndex).val(objProperty.Value[valuesIndex] * zunit.DisplayMultiplier + zunit.DisplayOffset);
                }
            }
        }
    }
    GetTableHtml() {
        var iniProperty = this.GetIniProperty();
        var objProperty = this.GetObjProperty();
        var xunits = this.GetXUnits();
        var xunit = xunits[objProperty.XUnitIndex];
        var yunits = this.GetYUnits();
        var yunit = yunits[objProperty.YUnitIndex];
        var zunits = this.GetZUnits();
        var zunit = zunits[objProperty.ZUnitIndex];
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
                            row += "<th style=\"border-right-style: sold; border-right-width:5px;\">" + iniProperty.XLabel + "</th>";
                        } else if(yRes !== 1 && xRes === 1) {
                            row += "<th style=\"border-bottom-style: sold; border-bottom-width:5px;\">" + iniProperty.YLabel + "</th>";
                        } else {
        //                } else if((yAxisRef.GetHtml && xResRef.Value !== 1) || (yResRef.Value !== 1 && xResRef.Value !== 1)) {
        //                     row += "<td style=\"border-right-style: sold; border-right-width:5px; border-bottom-style: sold; border-bottom-width:5px;\"></td>";
        //                 } else if (yAxisRef.GetHtml) {
        //                     row += yAxisHtml[0];
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
                                    row += "<th style=\"border-bottom-style: sold; border-bottom-width:5px;\">" + iniProperty.ZLabel + "</th>";
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
                                row += "<th style=\"border-right-style: sold; border-right-width:5px;\">" + iniProperty.ZLabel + "</th>";
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
                        var value = objProperty.Value[valuesIndex] * zunit.DisplayMultiplier + zunit.DisplayOffset;
                        row += "<td><input id=\"" + inputId + "\" type=\"number\" min=\"" + min + "\" max=\"" + max + "\" step=\"" + step + "\" value=\"" + value + "\""+rowClass+"/></td>";

                        var registerListener = function(valuesIndex) {
                            $(document).on("change."+thisClass.GUID, "#" + inputId, function(){
                                var iniProperty = thisClass.GetIniProperty();
                                var objProperty = thisClass.GetObjProperty();
                                var zunits = GetUnits(thisClass, GetIniPropertyZUnits(iniProperty));
                                var zunit = zunits[objProperty.ZUnitIndex];

                                var val = parseFloat($(this).val()) / zunit.DisplayMultiplier - zunit.DisplayOffset;
                                objProperty.Value[valuesIndex] = val;
                                var selectedCount = 0;
                                $.each(objProperty.Value, function(selectedindex, value) { if ($("#" + thisClass.GUID + "-" + selectedindex).hasClass("selected")) selectedCount++; });
                                if(selectedCount > 1) {
                                    $.each(objProperty.Value, function(selectedindex, value) {
                                        var thisElement = $("#" + thisClass.GUID + "-" + selectedindex);
                                        if(thisElement.hasClass("selected"))  {
                                            objProperty.Value[selectedindex] = val;
                                        }
                                    });
                                }
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
        $.each(objProperty.Value, function(index, value) {
            $(document).on("mousedown."+thisClass.GUID, "#" + thisClass.GUID + "-" + index, function(){
                var objProperty = thisClass.GetObjProperty();
                pointX =  $(this).offset().left - $(this).closest("table").offset().left;
                pointY =  $(this).offset().top - $(this).closest("table").offset().top;
                $.each(objProperty.Value, function(index, value) {
                    $("#" + thisClass.GUID + "-" + index).removeClass("selected");
                });
                $(this).addClass("selected");
                selecting = true;
            });
            $(document).on("copy."+thisClass.GUID, "#" + thisClass.GUID + "-" + index, function(e){
                var objProperty = thisClass.GetObjProperty();
                var copyData = "";
                var prevRow;
                $.each(objProperty.Value, function(index, value) {
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
                var objProperty = thisClass.GetObjProperty();
                var val = e.originalEvent.clipboardData.getData('text/plain');
                var selectedIndex = index;
                $.each(val.split("\n"), function(valIndex, val) {
                    $.each(val.split("\t"), function(valIndex, val) {
                        if(selectedIndex + valIndex < objProperty.Value.length) {
                            $("#" + thisClass.GUID + "-" + (selectedIndex + valIndex)).addClass("selected");
                            objProperty.Value[selectedIndex + valIndex] = parseFloat(val) / zunit.DisplayMultiplier - zunit.DisplayOffset;
                        }
                    });
                    selectedIndex += xRes;
                });
                CallObjFunctionIfExists(thisClass.Obj, "Update");
                e.preventDefault();
            });
        });

        $(document).on("mousedown."+this.GUID, "#" + this.GUID + "table", function(e){
            if(selecting)
                return;
            var objProperty = thisClass.GetObjProperty();
            $.each(objProperty.Value, function(index, value) {
                $("#" + thisClass.GUID + "-" + index).removeClass("selected");
            });
        });

        $(document).on("mouseup."+this.GUID, function(e){
            var objProperty = thisClass.GetObjProperty();
            var selectedCount = 0;
            $.each(objProperty.Value, function(selectedindex, value) { if ($("#" + thisClass.GUID + "-" + selectedindex).hasClass("selected")) selectedCount++; });
            if(selectedCount > 1) {
                $.each(objProperty.Value, function(index, value) {
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
            var objProperty = thisClass.GetObjProperty();
            $.each(objProperty.Value, function(index, value) {
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
        
        $.each(objProperty.Value, function(index, value) {
            $(document).on("contextmenu."+thisClass.GUID, "#" + thisClass.GUID + "-" + index, function(){
                event.preventDefault();
            });
        });

        return "<table id=\"" + this.GUID + "table\" class=\"configtable\">" + table + "</table>";
    }
    GetHtml() {
        var objProperty = this.GetObjProperty();
        var iniProperty = this.GetIniProperty();

        if(iniProperty.Hidden)
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
        if(iniProperty.Dialog) {
            var style = $("#" + this.GUID + "dialog").is(":visible")? "style=\"margin-left:40px;\"" : "style=\"margin-left:40px; display: none;\"";
            var buttonVal = $("#" + this.GUID + "edit").val();
            if(!buttonVal)
                buttonVal = "Show/Edit";

            template = "<label for=\"" + this.GUID + "edit\">" + iniProperty.Label + ":</label><input type=\"button\" id=\"" + this.GUID + "edit\" value=\""+buttonVal+"\"><div id=\"" + this.GUID + "dialog\" "+style+">" + template + "</div>";
            
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

        var iniProperty = this.GetIniProperty();
        if(objProperty.ZUnitIndex === undefined && iniProperty.ZUnitIndex !== undefined) {
            objProperty.ZUnitIndex = iniProperty.ZUnitIndex;
        }
        if(objProperty.ZUnitIndex === undefined) {
            objProperty.ZUnitIndex = 0;
        }
        if(objProperty.XUnitIndex === undefined && iniProperty.XUnitIndex !== undefined) {
            objProperty.XUnitIndex = iniProperty.XUnitIndex;
        }
        if(objProperty.XUnitIndex === undefined) {
            objProperty.XUnitIndex = 0;
        }
        if(objProperty.YUnitIndex === undefined && iniProperty.YUnitIndex !== undefined) {
            objProperty.YUnitIndex = iniProperty.YUnitIndex;
        }
        if(objProperty.YUnitIndex === undefined) {
            objProperty.YUnitIndex = 0;
        }

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
    GetUnits = GetUnitsFunction("Units", BlankUnits);
    ObjUpdateEvent() {
        super.ObjUpdateEvent();
        var objProperty = this.GetObjProperty();
        var iniProperty = this.GetIniProperty();

        var units = this.GetUnits();
        var unit = units[objProperty.UnitIndex];

        var degree = this.GetDegree();
        if(degree !== this.CurrentDegree) {
            this.InterpolateTable();
            $("#span" + this.GUID).replaceWith(this.GetHtml());
        } else {
            for(var d = 0; d < degree + 1; d++) {
                $("#" + this.GUID + "-" + d).val(objProperty.Value[d] * unit.DisplayMultiplier + unit.DisplayOffset);
            }
        }
        this.CurrentDegree = degree;
    }
    GetHtml() {
        var objProperty = this.GetObjProperty();
        var iniProperty = this.GetIniProperty();

        if(iniProperty.Hidden)
            return "";
        
        var min = this.GetMin();
        var max = this.GetMax();
        var step = this.GetStep();
        var units = this.GetUnits();
        var unit = units[objProperty.UnitIndex];

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

        var template = "<label>" + iniProperty.Label + ":</label>";
        for(var i = objProperty.Value.length-1; i > 0; i--)
        {
            template += "<input id=\"" + this.GUID + "-" + i + "\" type=\"number\" min=\"" + min + "\" max=\"" + max + "\" step=\"" + step + "\" value=\"" + (objProperty.Value[i]  * unit.DisplayMultiplier + unit.DisplayOffset) + "\"/>";
            if(i > 1)
                template += " x<sup>" + i + "</sup> + ";
            else
                template += " x + ";
        }
        template += "<input id=\"" + this.GUID + "-0\" type=\"number\" min=\"" + min + "\" max=\"" + max + "\" step=\"" + step + "\" value=\"" + (objProperty.Value[0] * unit.DisplayMultiplier + unit.DisplayOffset) + "\"/>";
        
        var thisClass = this;
        $(document).off("change."+this.GUID);
        $.each(this.Value, function(index, value) {
            $(document).on("change."+thisClass.GUID, "#" + thisClass.GUID + "-" + index, function(){
                var val = parseFloat($(this).val());
                val /= unit.DisplayMultiplier - unit.DisplayOffset;

                thisClass.GetObjProperty().Value[index] = val;
                CallObjFunctionIfExists(thisClass.Obj, "Update");
            });
        });
    
        return "<span id=\"span" + this.GUID + "\">" + template + "</span>";
    }
    InitProperty() {
        var objProperty = super.InitProperty();
        if(!objProperty)
            return false;
        var iniProperty = this.GetIniProperty();
        if(objProperty.UnitIndex === undefined && iniProperty.UnitIndex !== undefined) {
            objProperty.UnitIndex = iniProperty.UnitIndex;
        }
        if(objProperty.UnitIndex === undefined) {
            objProperty.UnitIndex = 0;
        }

        this.CurrentDegree = this.GetDegree();

        return objProperty;
    }
}

class ConfigArrayGui extends ConfigArray {
    constructor(){
        super();
        this.GUID = getGUID();
    }

    SetArrayBuffer(arrayBuffer) {
        var size = super.SetArrayBuffer(arrayBuffer);
        var thisClass = this;
        $.each(this.Value, function(index, value) {
            if(!(thisClass.Value[index] instanceof ConfigGui)) {
                var prev = thisClass.Value[index];
                thisClass.Value[index] = new ConfigGui();
                thisClass.Value[index].SetObj(prev.Obj, prev.ObjLocation);
                thisClass.Value[index].SetIni(prev.Ini, prev.IniLocation);
            }
        });
        return size;
    }
    
    ObjUpdateEvent() {
        super.ObjUpdateEvent();
        var tableArrayLength = this.GetTableArrayLength();
        if(!this.Value || this.CurrentTableArrayLength !== tableArrayLength) {    
            var prevValueLength = this.Value.length;
            for(var i = 0; i < Math.max(prevValueLength, tableArrayLength); i++) {
                if(i < prevValueLength) {
                    $("#span"+this.Value[i].GUID).show();
                } else {
                    $("#span"+this.GUID).append(this.Value[i].GetHtml());
                }
                if(i >= tableArrayLength) {
                    $("#span"+this.Value[i].GUID).hide();
                }
            }
        }
        this.CurrentTableArrayLength = tableArrayLength;
    }

    GetHtml() {
        var objProperty = this.GetObjProperty();
        var iniProperty = this.GetIniProperty();

        if(iniProperty.Hidden)
            return "";

        var template = "<span id=\"span"+this.GUID+"\">";
        $.each(this.Value, function(index, value) {
            template += value.GetHtml();
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
                thisClass.Value[index] = new ConfigGui();
                thisClass.Value[index].SetObj(prev.Obj, prev.ObjLocation);
                thisClass.Value[index].SetIni(prev.Ini, prev.IniLocation);
            }
        });
    }
}

var configContainerGuiTemplate;
function wrapInConfigContainerGui(id, content)
{
    if(!configContainerGuiTemplate)
        configContainerGuiTemplate = getFileContents("ConfigGui/ConfigContainer.html");
    var template = configContainerGuiTemplate;
    template = template.replace(/[$]id[$]/g, id);
    template = template.replace(/[$]content[$]/g, content);
    return template;
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
        var iniProperty = this.GetIniProperty();
        var val = defaultValue;
        if(iniProperty[propertyName] !== undefined) {
            var searchProp = iniProperty[propertyName];
            var perSecond = false;
            if(searchProp.indexOf("PerSecond(") === 0) {
                searchProp = searchProp.substring(10, searchProp.length - 1);
                perSecond = true;
            }
            val = GetValueByNumberOrReference(searchProp, this.Obj, this.ObjLocation, this.Ini, this.IniLocation);
            if(perSecond) {
                return PerSecond(val);
            }
        }
        if(val)
            return val; 

        return defaultValue;
    }

    return f;
}