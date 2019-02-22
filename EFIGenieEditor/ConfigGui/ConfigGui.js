class ConfigGui extends Config {
    constructor(obj, configNameSpace, parent, mainCallBack){
        super(obj, configNameSpace, parent);
        this.GUID = getGUID();
        this.CallBack = mainCallBack;

        var thisClass = this;
        this.CallBack = function() {
            if(mainCallBack)
                mainCallBack();
            thisClass.UpdateReferences();
        }

        for(var variableRowIndex in this.Variables) {
            var variableRow = this.Variables[variableRowIndex];
            var variableRowKey = Object.keys(variableRow)[0];
            var variableRowObj = this[variableRowKey];

            if(variableRowObj instanceof ConfigNumber && variableRowObj.Selections) {
                this[variableRowKey] = new ConfigNumberSelectionGui(variableRowObj, this, this.CallBack);
            } else if(variableRowObj instanceof ConfigNumber) {
                this[variableRowKey] = new ConfigNumberGui(variableRowObj, this, this.CallBack);
            } else if(variableRowObj instanceof ConfigBoolean) {
                this[variableRowKey] = new ConfigBooleanGui(variableRowObj, this, this.CallBack);
            } else if(variableRowObj instanceof Config) {
                this[variableRowKey] = new ConfigGui(variableRowObj, this[variableRowKey].ConfigNameSpace, this, this.CallBack);
            } else if(variableRowObj instanceof ConfigArray) {
                this[variableRowKey] = new ConfigArrayGui(variableRowObj, this[variableRowKey].ConfigNameSpace, this, this.CallBack);
            } else if(variableRowObj instanceof ConfigSelection) {
                this[variableRowKey] = new ConfigSelectionGui(variableRowObj, this[variableRowKey].ConfigNameSpace, this, this.CallBack);
            } else if(variableRowObj instanceof ConfigNumberTable) {
                this[variableRowKey] = new ConfigNumberTableGui(variableRowObj, this, this.CallBack);
            } else if(variableRowObj instanceof ConfigFormula) {
                this[variableRowKey] = new ConfigFormulaGui(variableRowObj, this, this.CallBack);
            }
        }
    }

    GetConfig() {
        var returnVariables = []
        for(var variableRowIndex in this.Variables) {
            var variableRow = this.Variables[variableRowIndex];
            var variableRowKey = Object.keys(variableRow)[0];
            var variableRowObj = this[variableRowKey];

            if(!variableRowObj)
                throw "Config not initialized";

            var variableRowValue = variableRowObj.GetConfig();

            var returnVariableRow = {};
            returnVariableRow[variableRowKey] = variableRowValue;
            
            returnVariables.push(returnVariableRow);
        }
        this.Variables = returnVariables;
        
        return JSON.parse(JSON.stringify(this, function(key, value) { 
            if(key === "ConfigNameSpace" || key === "GUID" || key === "Parent")
                return undefined;
            for(var variableRowIndex in this.Variables) {
                var variableRow = this.Variables[variableRowIndex];

                if(key === Object.keys(variableRow)[0]) {
                    return undefined;
                }
            }
            if(key != "" && value.GetConfig) 
                return value.GetConfig();  
            
            return value;
        }));
    }
    
    UpdateReferences() {
        for(var variableRowIndex in this.Variables) {
            var variableRow = this.Variables[variableRowIndex];
            var variableRowKey = Object.keys(variableRow)[0];
            var variableRowObj = this[variableRowKey];
            
            if(!variableRowObj || !variableRowObj.UpdateReferences)
                continue; //throw "ConfigGui not initialized";
                
            variableRowObj.UpdateReferences();
        }
    }

    GetHtml(show) {
        if(this.Hidden)
            return "";

        var thisClass = this;

        var template = "";
        var tabs = "";
        var firstTab = this.Tabbed;

        $(document).off("click."+this.GUID);
        for(var variableRowIndex in this.Variables) {
            var variableRow = this.Variables[variableRowIndex];
            var variableRowKey = Object.keys(variableRow)[0];
            var variableRowObj = this[variableRowKey];
            
            if(!variableRowObj || !variableRowObj.GetHtml)
                continue; //throw "ConfigGui not initialized";

            if(GetReferenceCount(this, variableRowKey) !== 1) {
                template += variableRowObj.GetHtml(firstTab);
            }

            if(this.Tabbed && !variableRowObj.Hidden) {
                var tabClasses = "tabLink";
                if(firstTab)
                    tabClasses += " active";
                firstTab = false;
                tabs += "<button class=\"" + tabClasses + "\" id=\"tab" + variableRowObj.GUID + "\" data-guid=\"" + variableRowObj.GUID + "\">" + variableRowObj.Label + "</button>";

                $(document).on("click."+this.GUID, "#tab" + variableRowObj.GUID, function(){
                    var GUID = $(this).data("guid");
                    for(var tabRowIndex in thisClass.Variables) {
                        var tabRow = thisClass.Variables[tabRowIndex];
                        var tabRowKey = Object.keys(tabRow)[0];
                        var tabRowObj = thisClass[tabRowKey];
                        $("#tab" + tabRowObj.GUID).removeClass("active");
                        $("#span" + tabRowObj.GUID).hide();
                    }
                    $(this).addClass("active");
                    $("#span" + GUID).show()
                });
            }
        }

        if(this.Tabbed)
            template = "<div class=\"tab\">" + tabs + "</div>" + template;
        
        if(this.WrapInConfigContainer)
            template = wrapInConfigContainerGui(this.GUID, template);
        else
            template = wrapInConfigDivGui(this.GUID, template);

        if(!this.Parent || !this.Parent.Tabbed) {
            if(this.Label) {
                if(this.SameLine) 
                    template = "<label for=\"" + this.GUID + "\" class=\"subConfigSameLineLabel\">" + this.Label + ":</label>" + template;
                else
                    template = "<label for=\"" + this.GUID + "\" class=\"subConfigLabel\">" + this.Label + ":</label><span class=\"sameLineSpacer\"></span>" + template;
            }
            return "<span id=\"span"+this.GUID+"\">" + template + "</span>";
        } else if (this.Parent.Tabbed) {
            if(show)
                return "<span id=\"span"+this.GUID+"\" class=\"tabContent\">" + template + "</span>";
            else
                return "<span id=\"span"+this.GUID+"\" class=\"tabContent\" style=\"display: none;\">" + template + "</span>";
        }
    }
}

var selectionConfigGuiTemplate;
class ConfigSelectionGui extends ConfigSelection {
    constructor(obj, configNameSpace, parent, mainCallBack){
        super(obj, configNameSpace, parent);
        this.GUID = getGUID();
        this.CallBack = mainCallBack;

        var thisClass = this;
        this.CallBack = function() {
            if(mainCallBack)
                mainCallBack();
            thisClass.UpdateReferences();
        }

        this.Value = new ConfigGui(this.Value, this.ConfigNameSpace, this, this.CallBack);
    }

    SetArrayBuffer(arrayBuffer) {
        var size = super.SetArrayBuffer(arrayBuffer);
        this.Value = new ConfigGui(this.Value, this.ConfigNameSpace, this, this.CallBack);
        return size;
    }

    GetConfig() {
        return JSON.parse(JSON.stringify(this, function(key, value) {   
            if(key === "ConfigNameSpace" || key === "GUID" || key === "Parent")    
                return undefined;   
            if(key != "" && value.GetConfig) 
                return value.GetConfig();  
            return value;
        }));
    }
    
    UpdateReferences() {
        this.Value.UpdateReferences();
    }

    GetHtml() {
        if(this.Hidden)
            return "";

        var template = "<span id=\"span"+this.GUID+"\">";
        if(this.Selections.length > 1) {
            if(!selectionConfigGuiTemplate)
                selectionConfigGuiTemplate = getFileContents("ConfigGui/Selection.html");
            template += selectionConfigGuiTemplate;
            template = template.replace(/[$]id[$]/g, this.GUID);
            template = template.replace(/[$]label[$]/g, this.Label);
            var selectionHtml = "";
            var thisClass = this;
            $.each(this.Selections, function(selectionIndex, selectionValue) {
                if(selectionIndex === parseInt(thisClass.Index))
                    selectionHtml += "<option selected value=\"" + selectionIndex + "\">" + selectionValue.Name + "</option>";
                else
                    selectionHtml += "<option value=\"" + selectionIndex + "\">" + selectionValue.Name + "</option>";
            });
            template = template.replace(/[$]selections[$]/g, selectionHtml);
            
            $(document).off("change."+this.GUID);
            $(document).on("change."+this.GUID, "#" + this.GUID, function(){
                var selectionIndex = parseInt($(this).val());
                var selection = thisClass.Selections[selectionIndex];

                thisClass.Index = selectionIndex;
                thisClass.Value.ConfigName = selection.ConfigName;
                delete thisClass.Value.Variables; 
                if(selection.Variables)
                    thisClass.Value.Variables = selection.Variables;
                    
                thisClass.Value = new ConfigGui(thisClass.Value, thisClass.ConfigNameSpace, thisClass, thisClass.CallBack);
                $("#span" + thisClass.GUID).replaceWith(thisClass.GetHtml());
            
                thisClass.UpdateReferences();
    
                if(thisClass.CallBack)
                    thisClass.CallBack();
            });

            $(document).off("click."+this.GUID);
            $(document).on("click."+this.GUID, "#" + this.GUID + "clear", function(){
                var obj = { ConfigName: thisClass.Value.ConfigName };
                if(thisClass.Value.Variables)
                    obj.Variables = thisClass.Value.Variables;

                thisClass.Value = new ConfigGui(obj, thisClass.ConfigNameSpace, thisClass, thisClass.CallBack);
                $("#span" + thisClass.GUID).replaceWith(thisClass.GetHtml());
            
                thisClass.UpdateReferences();
    
                if(thisClass.CallBack)
                    thisClass.CallBack();
            });
        }

        template += this.Value.GetHtml();

        return template + "</span>";
    }
}

var numberConfigGuiTemplate;
var numberInputOnlyConfigGuiTemplate;
class ConfigNumberGui extends ConfigNumber {
    constructor(obj, parent, callBack){
        super(obj, parent);
        this.GUID = getGUID();
        this.CallBack = callBack;
        switch(this.Type) {
            case "uint8":
            case "uint16":
            case "uint32":
            case "uint64":
            case "int8":
            case "int16":
            case "int32":
            case "int64":
                if(!this.Step)
                    this.Step = Math.max(1, 0.01);
                break;
            case "float":
                if(!this.Step)
                    this.Step = 0.01;
                break;
        }
        if(this.Units && !this.UnitIndex)
            this.UnitIndex = 0;
    }

    GetConfig() {
        return JSON.parse(JSON.stringify(this, function(key, value) {
            if(key === "GUID" || key === "Parent")
                return undefined;
            return value;
        }));
    }

    UpdateReferences() {
        switch(this.Type) {
            case "uint8":
            case "uint16":
            case "uint32":
                if(this.Value < 0)
                this.Value = 0;
            case "int8":
            case "int16":
            case "int32":
                this.Value = Math.round(this.Value);
        }
        
        if(this.Value < this.Min)
            this.Value = this.Min;
        if(this.Value > this.Max)
            this.Value = this.Max;

        $("#" + this.GUID).val(this.Value)
    }

    GetHtml(inputOnly) {
        if(this.Hidden)
            return "";

        var template = "";
        if(inputOnly) {
            if(!numberInputOnlyConfigGuiTemplate) {
                numberInputOnlyConfigGuiTemplate = getFileContents("ConfigGui/NumberInputOnly.html");
            }
            template = numberInputOnlyConfigGuiTemplate;
        } else {
            if(!numberConfigGuiTemplate) {
                numberConfigGuiTemplate = getFileContents("ConfigGui/Number.html");
            }
            template = numberConfigGuiTemplate;
        }
        template = template.replace(/[$]id[$]/g, this.GUID);
        template = template.replace(/[$]label[$]/g, this.Label);
        template = template.replace(/[$]value[$]/g, this.Value);
        template = template.replace(/[$]min[$]/g, this.Min);
        template = template.replace(/[$]max[$]/g, this.Max);
        template = template.replace(/[$]step[$]/g, this.Step);
        if(this.Units)
            template = template.replace(/[$]units[$]/g, this.Units[this.UnitIndex].Name);
        else
            template = template.replace(/[$]units[$]/g, "");

        var thisClass = this;

        $(document).off("change."+this.GUID);
        $(document).on("change."+this.GUID, "#" + this.GUID, function(){
            thisClass.Value = parseFloat($(this).val());
            
            thisClass.UpdateReferences();

            if(thisClass.CallBack)
                thisClass.CallBack();
        });
        $(document).off("focus."+this.GUID);
        $(document).on("focus."+this.GUID, "#" + this.GUID, function(){
            $(this).select();
        });
        return template;
    }
}

var numberSelectionConfigGuiTemplate;
class ConfigNumberSelectionGui extends ConfigNumber {
    constructor(obj, parent, callBack){
        super(obj, parent);
        this.GUID = getGUID();
        this.CallBack = callBack;
    }

    GetConfig() {
        return JSON.parse(JSON.stringify(this, function(key, value) {
            if(key === "GUID" || key === "Parent")
                return undefined;
            return value;
        }));
    }

    UpdateReferences() {
        switch(this.Type) {
            case "uint8":
            case "uint16":
            case "uint32":
                if(this.Value < 0)
                this.Value = 0;
            case "int8":
            case "int16":
            case "int32":
                this.Value = Math.round(this.Value);
        }
        
        if(this.Value < this.Min)
            this.Value = this.Min;
        if(this.Value > this.Max)
            this.Value = this.Max;

        $("#" + this.GUID).val(this.Value)
    }

    GetHtml() {
        if(this.Hidden)
            return "";

        var template = "<span id=\"span"+this.GUID+"\">";
        if(this.Selections.length > 1) {
            if(!numberSelectionConfigGuiTemplate)
                numberSelectionConfigGuiTemplate = getFileContents("ConfigGui/NumberSelection.html");
            template += numberSelectionConfigGuiTemplate;
            template = template.replace(/[$]id[$]/g, this.GUID);
            template = template.replace(/[$]label[$]/g, this.Label);
            var selectionHtml = "";
            var thisClass = this;
            $.each(this.Selections, function(selectionIndex, selectionValue) {
                if(selectionIndex === parseInt(thisClass.Value))
                    selectionHtml += "<option selected value=\"" + selectionIndex + "\">" + selectionValue + "</option>";
                else {
                    if(selectionValue !== "INVALID") 
                        selectionHtml += "<option value=\"" + selectionIndex + "\">" + selectionValue + "</option>";
                }
            });
            template = template.replace(/[$]selections[$]/g, selectionHtml);
            
            $(document).off("change."+this.GUID);
            $(document).on("change."+this.GUID, "#" + this.GUID, function(){
                thisClass.Value = parseInt($(this).val());
            
                thisClass.UpdateReferences();
    
                if(thisClass.CallBack)
                    thisClass.CallBack();
            });
        }

        return template + "</span>";
    }
}

var checkBoxConfigGuiTemplate;
class ConfigBooleanGui extends ConfigBoolean {
    constructor(obj, parent, callBack){
        super(obj, parent);
        this.GUID = getGUID();
        this.CallBack = callBack;
    }

    GetConfig() {
        return JSON.parse(JSON.stringify(this, function(key, value) {
            if(key === "GUID" || key === "Parent")
                return undefined;
            return value;
        }));
    }

    UpdateReferences() {
        $("#" + this.GUID).val(this.Value);
        console.log("ConfigBooleanGui.UpdateReferences() make sure this works");
    }

    GetHtml() {
        if(this.Hidden)
            return "";

        if(!checkBoxConfigGuiTemplate)
            checkBoxConfigGuiTemplate = getFileContents("ConfigGui/CheckBox.html");
        var template = checkBoxConfigGuiTemplate;
        template = template.replace(/[$]id[$]/g, this.GUID);
        template = template.replace(/[$]label[$]/g, this.Label);
        if(this.Value)
            template = template.replace(/[$]checked[$]/g, "checked");
        else
            template = template.replace(/[$]checked[$]/g, "");
    
        var thisClass = this;

        $(document).off("change."+this.GUID);
        $(document).on("change."+this.GUID, "#" + this.GUID, function(){
            thisClass.Value = this.checked;

            thisClass.UpdateReferences();

            if(thisClass.CallBack)
                thisClass.CallBack();
        });
    
        return template;
    }
}

document.addEventListener("dragstart", function(e){
    if($(e.target).hasClass("selected"))
        e.preventDefault();
});//disable dragging of selected items
class ConfigNumberTableGui extends ConfigNumberTable {
    constructor(obj, parent, callBack){
        super(obj, parent);
        this.GUID = getGUID();
        this.CallBack = callBack;
        switch(this.Type) {
            case "uint8":
            case "uint16":
            case "uint32":
            case "uint64":
            case "int8":
            case "int16":
            case "int32":
            case "int64":
                if(!this.Step)
                    this.Step = Math.max(1, 0.01);
                break;
            case "float":
                if(!this.Step)
                    this.Step = 0.01;
                break;
        }
        var xResRef = GetReferenceByNumberOrReference(this.Parent, this.XResolution, 1);
        var yResRef = GetReferenceByNumberOrReference(this.Parent, this.YResolution, 1);
        var xMinRef = GetReferenceByNumberOrReference(this.Parent, this.XMin, 0);
        var xMaxRef = GetReferenceByNumberOrReference(this.Parent, this.XMax, 0);
        var yMinRef = GetReferenceByNumberOrReference(this.Parent, this.YMin, 0);
        var yMaxRef = GetReferenceByNumberOrReference(this.Parent, this.YMax, 0);
        this.CurrentXRes = xResRef.Value;
        this.CurrentYRes = yResRef.Value;
        this.CurrentXMin = xMinRef.Value;
        this.CurrentXMax = xMaxRef.Value;
        this.CurrentYMin = yMinRef.Value;
        this.CurrentYMax = yMaxRef.Value;
    }

    GetConfig() {
        return JSON.parse(JSON.stringify(this, function(key, value) {
            if(key === "GUID" || key === "Parent" || key === "CurrentXRes"  || key === "CurrentXMin" || key === "CurrentXMax"  || key === "CurrentYRes"  || key === "CurrentYMin" || key === "CurrentYMax")
                return undefined;
            return value;
        }));
    }
    InterpolateTable() {
        var xResRef = GetReferenceByNumberOrReference(this.Parent, this.XResolution, 1);
        var yResRef = GetReferenceByNumberOrReference(this.Parent, this.YResolution, 1);
        var xMinRef = GetReferenceByNumberOrReference(this.Parent, this.XMin, 0);
        var xMaxRef = GetReferenceByNumberOrReference(this.Parent, this.XMax, 0);
        var yMinRef = GetReferenceByNumberOrReference(this.Parent, this.YMin, 0);
        var yMaxRef = GetReferenceByNumberOrReference(this.Parent, this.YMax, 0);
        if(xResRef.Value !== this.CurrentXRes || xMinRef.Value !== this.CurrentXMin || xMaxRef.Value !== this.CurrentXMax ||
            yResRef.Value !== this.CurrentYRes || yMinRef.Value !== this.CurrentYMin || yMaxRef.Value !== this.CurrentYMax) {
            //TODO: Add interpolation logic. creating new table now.
            var val = 0
            if(this.Min > 0)
                val = this.Min;
            this.Value = new Array(this.GetTableArrayLength());
            var thisClass = this;
            $.each(this.Value, function(index, value) {
                thisClass.Value[index] = val;
            });
        }
        this.CurrentXRes = xResRef.Value;
        this.CurrentXMin = xMinRef.Value;
        this.CurrentXMax = xMaxRef.Value;
        this.CurrentYRes = yResRef.Value;
        this.CurrentYMin = yMinRef.Value;
        this.CurrentYMax = yMaxRef.Value;
    }

    UpdateReferences() {
        var xResRef = GetReferenceByNumberOrReference(this.Parent, this.XResolution, 1);
        var yResRef = GetReferenceByNumberOrReference(this.Parent, this.YResolution, 1);
        var xMinRef = GetReferenceByNumberOrReference(this.Parent, this.XMin, 0);
        var xMaxRef = GetReferenceByNumberOrReference(this.Parent, this.XMax, 0);
        var yMinRef = GetReferenceByNumberOrReference(this.Parent, this.YMin, 0);
        var yMaxRef = GetReferenceByNumberOrReference(this.Parent, this.YMax, 0);
        var xAxisRef = GetReferenceByNumberOrReference(this.Parent, this.XAxis, undefined);
        var yAxisRef = GetReferenceByNumberOrReference(this.Parent, this.YAxis, undefined);
        if(xResRef.Value !== this.CurrentXRes || yResRef.Value !== this.CurrentYRes) {
            this.InterpolateTable();
            $('#' + this.GUID + 'table').replaceWith(this.GetTableHtml());
        } else {
                
            this.InterpolateTable();
            if(xAxisRef.Value) {
                for(var x = 0; x < xResRef.Value; x++) {
                    $("#" + this.GUID + "x" + x).val(xAxisRef.Value[x]);
                }
            } else {
                for(var x = 0; x < xResRef.Value; x++) {
                    $("#" + this.GUID + "x" + x).val(parseFloat(parseFloat(((xMaxRef.Value - xMinRef.Value) * (x) / (xResRef.Value-1) + xMinRef.Value).toFixed(6)).toPrecision(7)));
                }
            }
            if(yAxisRef.Value) {
                for(var y = 0; y < yResRef.Value; y++) {
                    var yAxisIndex = y;
                    if(this.YAxisInvertOrder)
                        yAxisIndex = yResRef.Value - yAxisIndex;
                    $("#" + this.GUID + "y" + y).val(yAxisRef.Value[yAxisIndex]);
                }
            } else {
                for(var y = 0; y < yResRef.Value; y++) {
                    $("#" + this.GUID + "y" + y).val(parseFloat(parseFloat(((yMaxRef.Value - yMinRef.Value) * (y) / (yResRef.Value-1) + yMinRef.Value).toFixed(6)).toPrecision(7)));
                }
            }
            for(var x = 0; x < xResRef.Value; x++) {
                for(var y = 0; y < yResRef.Value; y++) {
                    var valuesIndex = x + xResRef.Value * y;
                    $("#" + this.GUID + "-" + valuesIndex).val(this.Value[valuesIndex]);
                }
            }
        }
    }
    GetTableHtml() {
        var xResRef = GetReferenceByNumberOrReference(this.Parent, this.XResolution, 1);
        var yResRef = GetReferenceByNumberOrReference(this.Parent, this.YResolution, 1);
        var xMinRef = GetReferenceByNumberOrReference(this.Parent, this.XMin, 0);
        var xMaxRef = GetReferenceByNumberOrReference(this.Parent, this.XMax, 0);
        var yMinRef = GetReferenceByNumberOrReference(this.Parent, this.YMin, 0);
        var yMaxRef = GetReferenceByNumberOrReference(this.Parent, this.YMax, 0);
        var xAxisRef = GetReferenceByNumberOrReference(this.Parent, this.XAxis, undefined);
        var yAxisRef = GetReferenceByNumberOrReference(this.Parent, this.YAxis, undefined);

        var thisClass = this;
        $(document).off("change."+this.GUID);
        $(document).off("focus."+this.GUID);
        var row = "";
        var table = "";

        var yAxisHtml = []
        if(yAxisRef.GetHtml) {
            yAxisHtml = yAxisRef.GetHtml(true);
            if(yAxisHtml.split("<tr").length == 3) {//2 rows means x axis values
                yAxisHtml = yAxisHtml.substring(yAxisHtml.indexOf("<tr") + 3);
                yAxisHtml = yAxisHtml.substring(yAxisHtml.indexOf("<tr") + 3);//get second row
                yAxisHtml = yAxisHtml.substring(yAxisHtml.indexOf(">") + 1);
                yAxisHtml = yAxisHtml.substring(0, yAxisHtml.indexOf("</tr"));
            } else {//more rows means y axis values
                var newYAxisHtml = "";
                $.each(yAxisHtml.split("<tr"), function(index, value) {
                    value = value.substring(Math.min(value.indexOf("<th") === -1? 0xFFFFFFFF : value.indexOf("<th"), value.indexOf("<td")));
                    value = value.substring(Math.min(value.indexOf("<th") === -1? 0xFFFFFFFF : value.indexOf("<th"), value.indexOf("<td"))); //get second column
                    value = value.substring(value.indexOf(">") + 1);
                    value = value.substring(0, value.indexOf("</td"));
                    newYAxisHtml += "<td>" + value + "</td>";
                });
                yAxisHtml = newYAxisHtml;
            }
            var newYAxisHtml = [];
            $.each(yAxisHtml.split("<td"), function(index, value) {
                value = value.substring(value.indexOf(">") + 1);
                value = value.substring(0, value.indexOf("</td"));
                newYAxisHtml.push(value);
            });
            yAxisHtml = newYAxisHtml;
        }

        var xAxisHtml = []
        if(xAxisRef.GetHtml) {
            xAxisHtml = xAxisRef.GetHtml(true);
            if(xAxisHtml.split("<tr").length == 3) {//2 rows means x axis values
                xAxisHtml = xAxisHtml.substring(xAxisHtml.indexOf("<tr") + 3);
                xAxisHtml = xAxisHtml.substring(xAxisHtml.indexOf("<tr") + 3);//get second row
                xAxisHtml = xAxisHtml.substring(xAxisHtml.indexOf(">") + 1);
                xAxisHtml = xAxisHtml.substring(0, xAxisHtml.indexOf("</tr"));
            } else {//more rows means x axis values
                var newXAxisHtml = "";
                $.each(xAxisHtml.split("<tr"), function(index, value) {
                    value = value.substring(Math.min(value.indexOf("<th") === -1? 0xFFFFFFFF : value.indexOf("<th"), value.indexOf("<td")));
                    value = value.substring(Math.min(value.indexOf("<th") === -1? 0xFFFFFFFF : value.indexOf("<th"), value.indexOf("<td"))); //get second column
                    value = value.substring(value.indexOf(">") + 1);
                    value = value.substring(0, value.indexOf("</td"));
                    newXAxisHtml += "<td>" + value + "</td>";
                });
                xAxisHtml = newXAxisHtml;
            }
            var newXAxisHtml = [];
            $.each(xAxisHtml.split("<td"), function(index, value) {
                value = value.substring(value.indexOf(">") + 1);
                value = value.substring(0, value.indexOf("</td"));
                newXAxisHtml.push(value);
            });
            xAxisHtml = newXAxisHtml;
        }

        for(var y = 0; y < (!yResRef.Value? 2 : yResRef.Value + 1); y++) {
            var row = "<tr>";
            for(var x = 0; x < xResRef.Value + 1; x++) {
                if(y === 0) {
                    if(x === 0) {
                        // X - - -
                        // - - - -
                        // - - - -
                        // - - - -
                        if(yResRef.Value === 1 && xResRef.Value !== 1) {
                            row += "<th style=\"border-right-style: sold; border-right-width:5px;\">" + this.XLabel + "</th>";
                        } else if(yResRef.Value !== 1 && xResRef.Value === 1) {
                            row += "<th style=\"border-bottom-style: sold; border-bottom-width:5px;\">" + this.YLabel + "</th>";
                        } else if((xAxisRef.GetHtml && yAxisRef.GetHtml) || (xAxisRef.GetHtml && yResRef.Value !== 1) || (yAxisRef.GetHtml && xResRef.Value !== 1) || (yResRef.Value !== 1 && xResRef.Value !== 1)) {
                            row += "<td style=\"border-right-style: sold; border-right-width:5px; border-bottom-style: sold; border-bottom-width:5px;\"></td>";
                        } else if (yAxisRef.GetHtml) {
                            row += yAxisHtml[0];
                        }
                    } else {
                        // - X X X
                        // - - - -
                        // - - - -
                        // - - - -
                        if(x === 1 && xMinRef.GetHtml && GetReferenceCount(this.Parent, this.XMin) === 1) {
                            // - X - -
                            // - - - -
                            // - - - -
                            // - - - -
                            row += "<td style=\"border-bottom-style: sold; border-bottom-width:5px;\">"+xMinRef.GetHtml(true)+"</td>";
                        } else if (x === xResRef.Value && xMaxRef.GetHtml && GetReferenceCount(this.Parent, this.XMax) === 1) {
                            // - - - X
                            // - - - -
                            // - - - -
                            // - - - -
                            row += "<td style=\"border-bottom-style: sold; border-bottom-width:5px;\">"+xMaxRef.GetHtml(true)+"</td>";
                        } else if(xAxisRef.GetHtml && GetReferenceCount(this.Parent, this.XAxis) === 1) {
                            // X X X X
                            // - - - -
                            // - - - -
                            // - - - -
                            var xAxisIndex = x;
                            if(this.XAxisInvertOrder && x > 0)
                                xAxisIndex = xResRef.Value - (xAxisIndex-1);
                            row += "<td style=\"border-right-style: sold; border-bottom-width:5px;\">" + xAxisHtml[xAxisIndex] + "</td>";
                        } else {
                            // - - X -
                            // - - - -
                            // - - - -
                            // - - - -
                            if(xResRef.Value === 1 && !xAxisRef.Value) {
                                row += "<th style=\"border-bottom-style: sold; border-bottom-width:5px;\">" + this.ZLabel + "</th>";
                            } else {
                                if(xAxisRef.Value) {
                                    row += "<td style=\"border-bottom-style: sold; border-bottom-width:5px;\"><input id=\"" + this.GUID + "x" + (x-1) + "\" type=\"number\" disabled value=\"" + xAxisRef.Value[x-1] + "\"/></td>";
                                } else {
                                    row += "<td style=\"border-bottom-style: sold; border-bottom-width:5px;\"><input id=\"" + this.GUID + "x" + (x-1) + "\" type=\"number\" disabled value=\"" + parseFloat(parseFloat(((xMaxRef.Value - xMinRef.Value) * (x-1) / (xResRef.Value-1) + xMinRef.Value).toFixed(6)).toPrecision(7)) + "\"/></td>";
                                }
                            }
                        }
                    }
                } else {
                    if(x === 0) {
                        // - - - -
                        // X - - -
                        // X - - -
                        // X - - -
                        if(y === 1 && yMinRef.GetHtml && GetReferenceCount(this.Parent, this.YMin) === 1) {
                            // - - - -
                            // X - - -
                            // - - - -
                            // - - - -
                            row += "<td style=\"border-bottom-style: sold; border-bottom-width:5px;\">"+yMinRef.GetHtml(true)+"</td>";
                        } else if (x === yResRef.Value && yMaxRef.GetHtml && GetReferenceCount(this.Parent, this.YMax) === 1) {
                            // - - - -
                            // - - - -
                            // - - - -
                            // X - - -
                            row += "<td style=\"border-bottom-style: sold; border-bottom-width:5px;\">"+yMaxRef.GetHtml(true)+"</td>";
                        } else {
                            // - - - -
                            // - - - -
                            // X - - -
                            // - - - -
                            if(yResRef.Value === 1 && !yAxisRef.Value) {
                                row += "<th style=\"border-right-style: sold; border-right-width:5px;\">" + this.ZLabel + "</th>";
                            } else if(yAxisRef.GetHtml && GetReferenceCount(this.Parent, this.YAxis) === 1) {
                                var yAxisIndex = y;
                                if(this.YAxisInvertOrder && y > 0)
                                    yAxisIndex = yResRef.Value - (yAxisIndex-1);
                                row += "<td style=\"border-right-style: sold; border-right-width:5px;\">" + yAxisHtml[yAxisIndex] + "</td>";
                            } else if(yAxisRef.Value) {
                                var yAxisIndex = y-1;
                                if(this.YAxisInvertOrder)
                                    yAxisIndex = yResRef.Value - yAxisIndex;
                                row += "<td style=\"border-right-style: sold; border-right-width:5px;\"><input id=\"" + this.GUID + "y" + (y-1) + "\" type=\"number\" disabled value=\"" + yAxisRef.Value[yAxisIndex] + "\"/></td>";
                            } else {
                                row += "<td style=\"border-right-style: sold; border-right-width:5px;\"><input id=\"" + this.GUID + "y" + (y-1) + "\" type=\"number\" disabled value=\"" + parseFloat(parseFloat(((yMaxRef.Value - yMinRef.Value) * (y-1) / (yResRef.Value-1) + yMinRef.Value).toFixed(6)).toPrecision(7)) + "\"/></td>";
                            }
                        }
                    } else {
                        // - - - -
                        // - X X X
                        // - X X X
                        // - X X X
                        var valuesIndex = (x-1) + xResRef.Value * (y-1);
                        var inputId =  this.GUID + "-" + valuesIndex;
                        var rowClass = $("#" + inputId).attr("class")
                        if(rowClass)
                            rowClass = " class =\"" + rowClass + "\"";
                        else
                            rowClass = "";
                        var value = this.Value[valuesIndex];
                        row += "<td><input id=\"" + inputId + "\" type=\"number\" min=\"" + (this.Min) + "\" max=\"" + (this.Max) + "\" step=\"" + this.Step + "\" value=\"" + value + "\""+rowClass+"/></td>";

                        var registerListener = function(valuesIndex) {
                            $(document).on("change."+thisClass.GUID, "#" + inputId, function(){
                                var val = parseFloat($(this).val());
                                thisClass.Value[valuesIndex] = val;
                                var selectedCount = 0;
                                $.each(thisClass.Value, function(selectedindex, value) { if ($("#" + thisClass.GUID + "-" + selectedindex).hasClass("selected")) selectedCount++; });
                                if(selectedCount > 1) {
                                    $.each(thisClass.Value, function(selectedindex, value) {
                                        var thisElement = $("#" + thisClass.GUID + "-" + selectedindex);
                                        if(thisElement.hasClass("selected"))  {
                                            thisClass.Value[selectedindex] = val;
                                        }
                                    });
                                }
                                if(thisClass.CallBack)
                                    thisClass.CallBack();
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
        $.each(this.Value, function(index, value) {
            $(document).on("mousedown."+thisClass.GUID, "#" + thisClass.GUID + "-" + index, function(){
                pointX =  $(this).offset().left - $(this).closest("table").offset().left;
                pointY =  $(this).offset().top - $(this).closest("table").offset().top;
                $.each(thisClass.Value, function(index, value) {
                    $("#" + thisClass.GUID + "-" + index).removeClass("selected");
                });
                $(this).addClass("selected");
                selecting = true;
            });
            $(document).on("copy."+thisClass.GUID, "#" + thisClass.GUID + "-" + index, function(e){
                var copyData = "";
                var prevRow;
                $.each(thisClass.Value, function(index, value) {
                    if($("#" + thisClass.GUID + "-" + index).hasClass("selected")) {
                        if(!prevRow)
                            prevRow = parseInt(index / xResRef.Value);
                        if(prevRow !== parseInt(index / xResRef.Value))
                            copyData += "\n";
                        else
                            copyData += "\t";
                        copyData += value;
                        prevRow = parseInt(index / xResRef.Value);
                    }
                });
                copyData = copyData.substring(1);
                e.originalEvent.clipboardData.setData('text/plain', copyData);
                e.preventDefault();
            });
            $(document).on("paste."+thisClass.GUID, "#" + thisClass.GUID + "-" + index, function(e){
                var val = e.originalEvent.clipboardData.getData('text/plain');
                var selectedIndex = index;
                $.each(val.split("\n"), function(valIndex, val) {
                    $.each(val.split("\t"), function(valIndex, val) {
                        if(selectedIndex + valIndex < thisClass.Value.length) {
                            $("#" + thisClass.GUID + "-" + (selectedIndex + valIndex)).addClass("selected");
                            thisClass.Value[selectedIndex + valIndex] = val;
                        }
                    });
                    selectedIndex += xResRef.Value;
                });
                if(thisClass.CallBack)
                    thisClass.CallBack();
                e.preventDefault();
            });
        });

        $(document).on("mousedown."+this.GUID, "#" + this.GUID + "table", function(e){
            if(selecting)
                return;
            $.each(thisClass.Value, function(index, value) {
                $("#" + thisClass.GUID + "-" + index).removeClass("selected");
            });
        });

        $(document).on("mouseup."+this.GUID, function(e){
            var selectedCount = 0;
            $.each(thisClass.Value, function(selectedindex, value) { if ($("#" + thisClass.GUID + "-" + selectedindex).hasClass("selected")) selectedCount++; });
            if(selectedCount > 1) {
                $.each(thisClass.Value, function(index, value) {
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
            $.each(thisClass.Value, function(index, value) {
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
        
        $.each(this.Value, function(index, value) {
            $(document).on("contextmenu."+thisClass.GUID, "#" + thisClass.GUID + "-" + index, function(){
                event.preventDefault();
            });
        });

        return "<table id=\"" + this.GUID + "table\" class=\"configtable\">" + table + "</table>";
    }
    GetHtml() {
        if(this.Hidden)
            return "";

        var xResRef = GetReferenceByNumberOrReference(this.Parent, this.XResolution, 1);
        var yResRef = GetReferenceByNumberOrReference(this.Parent, this.YResolution, 1);

        var template = "";
        if(xResRef.GetHtml && GetReferenceCount(this.Parent, this.XResolution) === 1 && this.XMax !== this.XResolution && this.XMin !== this.XResolution)
            template += xResRef.GetHtml();
        if(yResRef.GetHtml && GetReferenceCount(this.Parent, this.YResolution) === 1 && this.YMax !== this.YResolution && this.YMin !== this.YResolution)
            template += yResRef.GetHtml();

        template += this.GetTableHtml();
        
        var thisClass = this;
        if(this.Dialog) {
            var style = $("#" + this.GUID + "dialog").is(":visible")? "" : "style=\"display: none;\"";
            var buttonVal = $("#" + this.GUID + "edit").val();
            if(!buttonVal)
                buttonVal = "Show/Edit";

            template = "<label for=\"" + this.GUID + "edit\">" + this.Label + ":</label><input type=\"button\" id=\"" + this.GUID + "edit\" value=\""+buttonVal+"\"><div id=\"" + this.GUID + "dialog\" "+style+">" + template + "</div>";
            
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
}

class ConfigFormulaGui extends ConfigFormula {
    constructor(obj, parent, callBack){
        super(obj, parent);
        this.GUID = getGUID();
        this.CallBack = callBack;
        if(!this.Step)
            this.Step = 0.01;
        var degreeRef = GetReferenceByNumberOrReference(this.Parent, this.Degree, 1);
        this.CurrentDegree = degreeRef.Value;
    }

    GetConfig() {
        return JSON.parse(JSON.stringify(this, function(key, value) {
            if(key === "GUID" || key === "Parent")
                return undefined;
            return value;
        }));
    }

    UpdateReferences() {
        var degreeRef = GetReferenceByNumberOrReference(this.Parent, this.Degree, 1);
        if(degreeRef.Value !== this.CurrentDegree) {
            this.InterpolateTable();
            $("#span" + this.GUID).replaceWith(this.GetHtml());
        } else {
            $("#span" + this.GUID).replaceWith(this.GetHtml());
            for(var d = 0; d < degreeRef.Value + 1; d++) {
                $("#" + this.GUID + "-" + d).val(this.Value[d]);
            }
        }
        this.CurrentDegree = degreeRef.Value;
    }
    GetHtml() {
        var template = "<label>" + this.Label + ":</label>";
        for(var i = this.Value.length-1; i > 0; i--)
        {
            template += "<input id=\"" + this.GUID + "-" + i + "\" type=\"number\" min=\"" + this.Min + "\" max=\"" + this.Max + "\" step=\"" + this.Step + "\" value=\"" + this.Value[i] + "\"/>";
            if(i > 1)
                template += " x<sup>" + i + "</sup> + ";
            else
                template += " x + ";
        }
        template += "<input id=\"" + this.GUID + "-0\" type=\"number\" min=\"" + this.Min + "\" max=\"" + this.Max + "\" step=\"" + this.Step + "\" value=\"" + this.Value[0] + "\"/>";
        
        var thisClass = this;
        $(document).off("change."+this.GUID);
        $.each(this.Value, function(index, value) {
            $(document).on("change."+thisClass.GUID, "#" + thisClass.GUID + "-" + index, function(){
                thisClass.Value[index] = $(this).val();

                if(thisClass.CallBack)
                    thisClass.CallBack();
            });
        });
    
        return "<span id=\"span" + this.GUID + "\">" + template + "</span>";
    }
}

class ConfigArrayGui extends ConfigArray {
    constructor(obj, configNameSpace, parent, mainCallBack){
        super(obj, configNameSpace, parent);
        this.GUID = getGUID();
        this.CallBack = mainCallBack;

        var thisClass = this;
        this.CallBack = function() {
            if(mainCallBack)
                mainCallBack();
            thisClass.UpdateReferences();
        }

        this.CurrentTableArrayLength = this.GetTableArrayLength();

        var thisClass = this;
        $.each(this.Value, function(index, value) {
            thisClass.Value[index] = new ConfigGui(value, this.ConfigNameSpace, this.Parent, this.CallBack);
        });
    }

    SetArrayBuffer(arrayBuffer) {
        var size = super.SetArrayBuffer(arrayBuffer);
        var thisClass = this;
        $.each(this.Value, function(index, value) {
            thisClass.Value[index] = new ConfigGui(value, this.ConfigNameSpace, this.Parent, this.CallBack);
        });
        return size;
    }

    GetConfig() {
        return JSON.parse(JSON.stringify(this, function(key, value) {   
            if(key === "ConfigNameSpace" || key === "GUID" || key === "Parent" || key === "CurrentTableArrayLength")    
                return undefined;   
            if(key != "" && value.GetConfig) 
                 return value.GetConfig();  
            return value;
        }));
    }
    
    UpdateReferences() {
        var tableArrayLength = this.GetTableArrayLength();
        if(!this.Value || this.CurrentTableArrayLength !== tableArrayLength) {
            var prevValue = this.Value;
            var prevValueLength = 0;
            if(prevValue)
                prevValueLength = prevValue.length;
            this.Value = new Array(Math.max(prevValueLength, tableArrayLength));
    
            for(var i = 0; i < Math.max(prevValueLength, tableArrayLength); i++) {
                var subConfig = {};
                Object.assign(subConfig, this);
                delete subConfig.Array;
                delete subConfig.Value;
                delete subConfig.Labels;
                if(this.Labels && i < this.Labels.length) {
                    subConfig.Label = this.Labels[i];
                } else {
                    subConfig.Label = this.Label + "[" + i + "]";
                }

                if(i < prevValueLength) {
                    this.Value[i] = prevValue[i];
                    $("#span"+this.Value[i].GUID).show();
                    this.Value[i].UpdateReferences();
                } else {
                    this.Value[i] = new ConfigGui(subConfig, this.ConfigNameSpace, this.Parent, this.CallBack);
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
        if(this.Hidden)
            return "";

        var template = "<span id=\"span"+this.GUID+"\">";

        $.each(this.Value, function(index, value) {
            template += value.GetHtml();
        });

        return template + "</span>";
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