var GenericConfigs = [];

OperationArchitectureFactoryIDs = {
    Offset :            10000   ,
    Table :             1       ,
    LookupTable:        2       ,
    Polynomial:         3       ,
    Static:             5       ,
    FaultDetection:     6       ,
    Add:                10      ,
    Subtract:           11      ,
    Multiply:           12      ,
    Divide:             13      ,
    And:                14      ,
    Or:                 15      ,
    GreaterThan:        16      ,
    LessThan:           17      ,
    Equal:              18      ,
    GreaterThanOrEqual: 19      ,
    LessThanOrEqual:    20
}

var configOperation_StaticTemplate;
class ConfigOperation_Static {
    static Name = "Static";
    static Output = "float";
    static Inputs = [];
    static Measurement = "Selectable";
    static ValueLabel = "Value";
    static ValueMeasurement = "None";
    static Template = getFileContents("ConfigGui/Operation_Static.html");

    constructor(){
        this.GUID = getGUID();
    }

    Type = "number";
    Value = 0;

    GetObj() {
        return {
            Name: this.constructor.Name,
            Type: this.Type,
            Value: this.Value
        };
    }

    SetObj(obj) {
        if(obj) {
            this.Type = obj.Type;
            this.Value = obj.Value;
        }
        $("#" + this.GUID).replaceWith(this.GetHtml());
    }

    Detach() {
        $(document).off("change."+this.GUID);
    }

    Attach() {
        var thisClass = this;
        
        $(document).on("change."+this.GUID, "#" + this.GUID + "-type", function(){
            thisClass.Detach();

            thisClass.Type =$(this).val();

            $("#" + thisClass.GUID + "-value").type = thisClass.Type;
            if(thisClass.Type == "checkbox")
                $("#" + this.GUID + "-value").prop('checked', thisClass.Value = thisClass.Value !== 0);
            else
                $("#" + this.GUID + "-value").val(thisClass.Value = thisClass.Value? 1 : 0);


            thisClass.Attach();
        });

        $(document).on("change."+this.GUID, "#" + this.GUID + "-value", function(){
            thisClass.Detach();

            if(thisClass.Type == "checkbox")
                thisClass.Value = $(this).prop('checked');
            else
                thisClass.Value = parseFloat($(this).val());

            thisClass.Attach();
        });
    }

    GetHtml() {
        var template = GetClassProperty(this, "Template");

        template = template.replace(/[$]id[$]/g, this.GUID);
        template = template.replace(/[$]type[$]/g, this.Type);
        template = template.replace(/[$]value[$]/g, this.Type==="checkbox" ? (this.Value? "checked" : "") : "value=\"" + this.Value + "\"");
        template = template.replace(/[$]valuelabel[$]/g, GetClassProperty(this, "ValueLabel"));
        template = template.replace(/[$]valuemeasurement[$]/g, GetMeasurementDisplay(Measurements[GetClassProperty(this, "ValueMeasurement")]));
        template = template.replace(/[$]numberselected[$]/g, this.Type==="number" ? " selected" : "");
        template = template.replace(/[$]boolselected[$]/g, this.Type==="checkbox" ? " selected" : "");

        return template;
    }

    GetObjOperation() {
        return { value: [{ type: "Operation_StaticVariable", value: this.Value }]};
    }

    GetObjParameters() {
        return { value: []};
    }
}

GenericConfigs.push(ConfigOperation_Static);

class ConfigOperation_LookupTable {
    static Name = "Lookup Table";
    static Output = "float";
    static Inputs = ["float"];
    static Measurement = "Selectable";
    static ValueLabel = "Value";
    static ValueMeasurement = "None";
    static Template = getFileContents("ConfigGui/Operation_LookupTable.html");

    NoParamaterSelection = false;
    ParameterSelection = undefined;
    Type = "number";
    Table = undefined;
    XLabel = "";

    constructor(noParamaterSelection){
        this.GUID = getGUID();
        this.Table = new Table();
        this.Table.YResolutionModifiable = false;
        this.Table.SetXResolution(10);
        this.Table.SetYResolution(1);
        if(noParamaterSelection)
            this.NoParamaterSelection = true;
    }

    GetObj() {
        return {
            Name: this.constructor.Name,
            Type: this.Type,
            Value: this.Table.Value,
            MinX: this.Table.MinX,
            MaxX: this.Table.MaxX,
            Resolution: this.Table.XResolution,
            ParameterSelection: this.NoParamaterSelection? undefined : this.ParameterSelection
        };
    }

    SetObj(obj) {
        if(obj) {
            this.Type = obj.Type;
            this.Table.SetXResolution(obj.Resolution);
            this.Table.MinX = obj.MinX;
            this.Table.MaxX = obj.MaxX;
            this.Table.Value = obj.Value;
            if(!this.NoParamaterSelection)
                this.ParameterSelection = obj.ParameterSelection;
        }
        $("#" + this.GUID).replaceWith(this.GetHtml());
    }

    Attach() {
        var thisClass = this;

        if(!this.NoParamaterSelection) {
            $(document).on("change."+this.GUID, "#" + this.GUID + "-parameterselection", function(){
                thisClass.Detach();

                var val = $(this).val();
                thisClass.ParameterSelection = {reference: $('option:selected', this).attr('reference'), value: val, measurement: $('option:selected', this).attr('measurement')};
                thisClass.UpdateTable();
                
                thisClass.Attach();
            });
        }
        
        this.Table.Attach();
    }

    Detach() {
        this.Table.Detach();
    }

    GetHtml() {
        var template = GetClassProperty(this, "Template");

        template = template.replace(/[$]id[$]/g, this.GUID);
        template = template.replace(/[$]type[$]/g, this.Type);
        this.UpdateTable();
        template = template.replace(/[$]table[$]/g, this.Table.GetHtml());
        template = template.replace(/[$]numberselected[$]/g, this.Type==="number" ? " selected" : "");
        template = template.replace(/[$]boolselected[$]/g, this.Type==="bool" ? " selected" : "");
        template = template.replace(/[$]tickselected[$]/g, this.Type==="tick" ? " selected" : "");

        return template;
    }

    UpdateTable() {
        this.Table.XLabel = this.NoParamaterSelection? this.XLabel : "<select id=\"" + this.GUID + "-parameterselection\">" + GetSelections(this.ParameterSelection) + "</select>";
        this.Table.ZLabel = GetClassProperty(this, "ValueLabel") + " " + GetMeasurementDisplay(Measurements[GetClassProperty(this, "ValueMeasurement")]);
        this.Table.Label = GetClassProperty(this, "ValueLabel");

        if(!this.NoParamaterSelection)
            $("#" + this.GUID + "-parameterselection").html(GetSelections(this.ParameterSelection));
    }

    SetIncrements() {
        if(!this.NoParamaterSelection) {
            var thisClass = this;
            if(!Increments.PostEvent)
                Increments.PostEvent = [];
            Increments.PostEvent.push(function() { thisClass.UpdateTable(); });
        }
    }

    GetObjOperation() {
        var table = this.Table;
        var tableValue = this.Table.Value;
        var type;
        var typeId;
        var min;
        var max;

        for(var i = 0; i < tableValue.length; i++) {
            if(tableValue[i] % 1 != 0){
                type = "FLOAT";
                typeId = 9;
                break;
            }
            if(min === undefined || tableValue[i] < min){
                min = tableValue[i];
            }
            if(max === undefined || tableValue[i] < max){
                max = tableValue[i];
            }
        }
        if(!type){
            if(min < 0) {
                if(max < 128 && min > -129) {
                    typeId = 5;
                    type = "INT8";
                } else if(max < 32768 && min > -32759) {
                    typeId = 6;
                    type = "INT16";
                } else if(max < 2147483648 && min > -2147483649) {
                    typeId = 7;
                    type = "INT32";
                } else if(val < 9223372036854775807 && val > -9223372036854775808){
                    typeId = 8;
                    type = "INT64";
                } else {
                    throw "number too big";
                }
            } else {
                if(max < 256) {
                    type = "UINT8";
                    typeId = 1;
                } else if(max < 65536) {
                    type = "UINT16";
                    typeId = 2;
                } else if(max < 4294967295) {
                    type = "UINT32";
                    typeId = 3;
                } else if(val < 18446744073709551615) {
                    type = "UINT64";
                    typeId = 4;
                } else {
                    throw "number too big";
                }
            }
        }

        return { value: [
            { type: "UINT32", value: OperationArchitectureFactoryIDs.Offset + OperationArchitectureFactoryIDs.LookupTable }, //factory ID
            { type: "FLOAT", value: table.MinX }, //MinXValue
            { type: "FLOAT", value: table.MaxX }, //MaxXValue
            { type: "UINT8", value: table.XResolution }, //XResolution
            { type: "UINT8", value: typeId }, //Type
            { type: type, value: tableValue }, //Table
        ]};
    }

    GetObjParameters() {
        if(!this.NoParamaterSelection) {
            return { value: [
                { type: "UINT8", value: 0 }, //variable
                { type: "UINT32", value: Increments[this.ParameterSelection.reference].find(a => a.Name === this.ParameterSelection.value && a.Measurement === this.ParameterSelection.measurement).Id }
            ]};
        }

        return { value: []};
    }
}
GenericConfigs.push(ConfigOperation_LookupTable);

class ConfigOperation_2AxisTable {
    static Name = "2 Axis Table";
    static Output = "float";
    static Inputs = ["float", "float"];
    static Measurement = "Selectable";
    static ValueLabel = "Value";
    static ValueMeasurement = "None";
    static Template = getFileContents("ConfigGui/Operation_2AxisTable.html");

    NoParamaterSelection = false;
    XSelection = undefined;
    YSelection = undefined;
    Type = "number";
    Table = undefined;
    XLabel = "";
    YLabel = "";

    constructor(noParamaterSelection){
        this.GUID = getGUID();
        this.Table = new Table();
        this.Table.SetXResolution(10);
        this.Table.SetYResolution(10);
        if(noParamaterSelection)
            this.NoParamaterSelection = true;
    }


    GetObj() {
        return {
            Name: this.constructor.Name,
            Type: this.Type,
            Value: this.Table.Value,
            MinX: this.Table.MinX,
            MaxX: this.Table.MaxX,
            XResolution: this.Table.XResolution,
            MinY: this.Table.MinY,
            MaxY: this.Table.MaxY,
            YResolution: this.Table.YResolution,
            XSelection: this.NoParamaterSelection? undefined : this.XSelection,
            YSelection: this.NoParamaterSelection? undefined : this.YSelection
        };
    }

    SetObj(obj) {
        if(obj) {
            this.Type = obj.Type;
            this.Table.SetXResolution(obj.XResolution);
            this.Table.SetYResolution(obj.YResolution);
            this.Table.MinX = obj.MinX;
            this.Table.MaxX = obj.MaxX;
            this.Table.MinY = obj.MinY;
            this.Table.MaxY = obj.MaxY;
            this.Table.Value = obj.Value;
            if(!this.NoParamaterSelection)
                this.XSelection = obj.XSelection;
            if(!this.NoParamaterSelection)
                this.YSelection = obj.YSelection;
        }
        $("#" + this.GUID).replaceWith(this.GetHtml());
    }

    Attach() {
        var thisClass = this;

        if(!this.NoParamaterSelection) {
            $(document).on("change."+this.GUID, "#" + this.GUID + "-xselection", function(){
                thisClass.Detach();

                var val = $(this).val();
                thisClass.XSelection = {reference: $('option:selected', this).attr('reference'), value: val, measurement: $('option:selected', this).attr('measurement')};
                thisClass.UpdateTable();
                
                thisClass.Attach();
            });

            $(document).on("change."+this.GUID, "#" + this.GUID + "-yselection", function(){
                thisClass.Detach();

                var val = $(this).val();
                thisClass.YSelection = {reference: $('option:selected', this).attr('reference'), value: val, measurement: $('option:selected', this).attr('measurement')};
                thisClass.UpdateTable();
                
                thisClass.Attach();
            });
        }
        
        this.Table.Attach();
    }

    Detach() {
        this.Table.Detach();
    }

    GetHtml() {
        var template = GetClassProperty(this, "Template");

        template = template.replace(/[$]id[$]/g, this.GUID);
        template = template.replace(/[$]type[$]/g, this.Type);
        this.UpdateTable();
        template = template.replace(/[$]table[$]/g, this.Table.GetHtml());
        template = template.replace(/[$]numberselected[$]/g, this.Type==="number" ? " selected" : "");
        template = template.replace(/[$]boolselected[$]/g, this.Type==="bool" ? " selected" : "");
        template = template.replace(/[$]tickselected[$]/g, this.Type==="tick" ? " selected" : "");

        return template;
    }

    UpdateTable() {
        this.Table.XLabel = this.NoParamaterSelection? this.XLabel : "<select id=\"" + this.GUID + "-xselection\">" + GetSelections(this.XSelection) + "</select>";
        this.Table.YLabel = this.NoParamaterSelection? this.YLabel : "<select id=\"" + this.GUID + "-yselection\">" + GetSelections(this.YSelection) + "</select>";
        this.Table.ZLabel = GetClassProperty(this, "ValueLabel") + " " + GetMeasurementDisplay(Measurements[GetClassProperty(this, "ValueMeasurement")]);
        this.Table.Label = GetClassProperty(this, "ValueLabel");
        
        $("#" + this.GUID + "-xselection").html(GetSelections(this.XSelection));
        $("#" + this.GUID + "-yselection").html(GetSelections(this.YSelection));
    }

    SetIncrements() {
        if(!this.NoParamaterSelection) {
            var thisClass = this;
            if(!Increments.PostEvent)
                Increments.PostEvent = [];
            Increments.PostEvent.push(function() { thisClass.UpdateTable(); });
        }
    }

    GetObjOperation() {
        var table = this.Table;
        var tableValue = this.Table.Value;
        var type;
        var typeId;
        var min;
        var max;

        for(var i = 0; i < tableValue.length; i++) {
            if(tableValue[i] % 1 != 0){
                type = "FLOAT";
                typeId = 9;
                break;
            }
            if(min === undefined || tableValue[i] < min){
                min = tableValue[i];
            }
            if(max === undefined || tableValue[i] < max){
                max = tableValue[i];
            }
        }
        if(!type){
            if(min < 0) {
                if(max < 128 && min > -129) {
                    typeId = 5;
                    type = "INT8";
                } else if(max < 32768 && min > -32759) {
                    typeId = 6;
                    type = "INT16";
                } else if(max < 2147483648 && min > -2147483649) {
                    typeId = 7;
                    type = "INT32";
                } else if(val < 9223372036854775807 && val > -9223372036854775808){
                    typeId = 8;
                    type = "INT64";
                } else {
                    throw "number too big";
                }
            } else {
                if(max < 256) {
                    type = "UINT8";
                    typeId = 1;
                } else if(max < 65536) {
                    type = "UINT16";
                    typeId = 2;
                } else if(max < 4294967295) {
                    type = "UINT32";
                    typeId = 3;
                } else if(val < 18446744073709551615) {
                    type = "UINT64";
                    typeId = 4;
                } else {
                    throw "number too big";
                }
            }
        }

        return { value: [
            { type: "UINT32", value: OperationArchitectureFactoryIDs.Offset + OperationArchitectureFactoryIDs.Table }, //factory ID
            { type: "FLOAT", value: table.MinX }, //MinXValue
            { type: "FLOAT", value: table.MaxX }, //MaxXValue
            { type: "FLOAT", value: table.MinY }, //MinYValue
            { type: "FLOAT", value: table.MaxY }, //MaxYValue
            { type: "UINT8", value: table.XResolution }, //XResolution
            { type: "UINT8", value: table.YResolution }, //YResolution
            { type: "UINT8", value: typeId }, //Type
            { type: type, value: tableValue }, //Table
        ]};
    }

    GetObjParameters() {
        if(!this.NoParamaterSelection) {
            return { value: [
                { type: "UINT8", value: 0 }, //variable
                { type: "UINT32", value: Increments[this.XSelection.reference].find(a => a.Name === this.XSelection.value && a.Measurement == this.XSelection.measurement).Id },
                { type: "UINT8", value: 0 }, //variable
                { type: "UINT32", value: Increments[this.YSelection.reference].find(a => a.Name === this.YSelection.value && a.Measurement == this.YSelection.measurement).Id }
            ]};
        }
        return { value: []};
    }
}
GenericConfigs.push(ConfigOperation_2AxisTable);

class Table {
    MinX = 0;
    MinXModifiable = true;
    MaxX = 0;
    MaxXModifiable = true;
    MinY = 0;
    MinYModifiable = true;
    MaxY = 0;
    MaxYModifiable = true;
    XResolution = 1;
    XResolutionModifiable = true;
    YResolution = 1;
    YResolutionModifiable = true;
    Value = [0];
    XLabel = "";
    YLabel = "";
    ZLabel = "";
    
    constructor(){
        this.GUID = getGUID();
    }

    SetXResolution(xRes){
        this.MaxX = parseFloat((this.MaxX - this.MinX) * (xRes-1) / (this.XResolution-1) + this.MinX);
        var newValue = new Array(Math.max(1, xRes) * Math.max(1, this.YResolution));
        for(var x=0; x<xRes; x++){
            for(var y=0; y<this.YResolution; y++){
                var oldValuesIndex = x + this.XResolution * y;
                var newValuesIndex = x + xRes * y;
                if(x >= this.XResolution){
                    var newValuesIndexMinus1 = (x-1) + xRes * y;
                    var newValuesIndexMinus2 = (x-2) + xRes * y;
                    if(x>1){
                        newValue[newValuesIndex] = newValue[newValuesIndexMinus1] + (newValue[newValuesIndexMinus1] - newValue[newValuesIndexMinus2]);
                    }
                } else {
                    newValue[newValuesIndex] = this.Value[oldValuesIndex];
                }
            }
        }
        this.XResolution = xRes;
        this.Value = newValue;
    }

    SetYResolution(yRes){
        this.MaxY = parseFloat((this.MaxY - this.MinY) * (yRes-1) / (this.YResolution-1) + this.MinY);
        var newValue = new Array(Math.max(1, this.XResolution) * Math.max(1, yRes));
        for(var x=0; x<this.XResolution; x++){
            for(var y=0; y<yRes; y++){
                var valuesIndex = x + this.XResolution * y;
                if(y >= this.YResolution){
                    var valuesIndexMinus1 = x + this.XResolution * (y-1);
                    var valuesIndexMinus2 = x + this.XResolution * (y-2);
                    if(y>1){
                        newValue[valuesIndex] = newValue[valuesIndexMinus1] + (newValue[valuesIndexMinus1] - newValue[valuesIndexMinus2]);
                    }
                } else {
                    newValue[valuesIndex] = this.Value[valuesIndex];
                }
            }
        }
        this.YResolution = yRes;
        this.Value = newValue;
    }

    Detach() {
        $(document).off("change."+this.GUID);
        $(document).off("click."+this.GUID);
        $(document).off("mousedown."+this.GUID);
        $(document).off("mouseup."+this.GUID);
        $(document).off("mousemove."+this.GUID);
        $(document).off("copy."+this.GUID);
        $(document).off("paste."+this.GUID);
        $(document).off("contextmenu."+this.GUID);
    }

    Attach() {
        var thisClass = this;

        $(document).on("click."+this.GUID, "#" + this.GUID + "-edit", function(){
            $("#" + thisClass.GUID + "-dialog").dialog({ width:'auto', modal:true, title: thisClass.ZLabel });
        });

        $(document).on("change."+this.GUID, "#" + this.GUID + "-table", function(e){
            thisClass.Detach();
            var x = $(e.target).data("x");
            var y = $(e.target).data("y");
            var value = parseFloat($(e.target).val());
            
            if(x === -1) {
                if(y === 0){
                    //TODO interpolate
                    thisClass.MinY = value;
                } else if (y === thisClass.YResolution - 1){
                    //TODO interpolate
                    thisClass.MaxY = value;
                }
                for(var i = 1; i < thisClass.YResolution - 1; i++) {
                    $("#" + thisClass.GUID + "-table input[data-x='-1'][data-y='" + i + "']").val(parseFloat(parseFloat(((thisClass.MaxY - thisClass.MinY) * i / (thisClass.YResolution-1) + thisClass.MinY).toFixed(6)).toPrecision(7)));
                }
            } else if(y === -1) {
                if(x === 0){
                    //TODO interpolate
                    thisClass.MinX = value;
                } else if (x === thisClass.XResolution - 1){
                    //TODO interpolate
                    thisClass.MaxX = value;
                }
                for(var i = 1; i < thisClass.XResolution - 1; i++) {
                    $("#" + thisClass.GUID + "-table input[data-x='"+i+"'][data-y='-1']").val(parseFloat(parseFloat(((thisClass.MaxX - thisClass.MinX) * i / (thisClass.XResolution-1) + thisClass.MinX).toFixed(6)).toPrecision(7)));
                }
            } else {
                $.each($("#" + thisClass.GUID + "-table input.selected"), function(index, cell) {
                    var index = parseInt($(cell).data("x")) + parseInt($(cell).data("y")) * thisClass.XResolution;
                    $(cell).val(value);
                    thisClass.Value[index] = value;
                });
            }

            thisClass.Attach();
        });

        var selecting = false;
        var dragX = false;
        var dragY = false;
        var pointX;
        var pointY;

        $(document).on("mousedown."+this.GUID, "#" + this.GUID + "-table .rowcol_expand", function(e){
            dragY = true;
            dragX = true;
            $("#overlay").addClass("rowcol_expand");
            $("#overlay").show();
        });

        $(document).on("mousedown."+this.GUID, "#" + this.GUID + "-table .col_expand", function(e){
            dragX = true;
            $("#overlay").addClass("col_expand");
            $("#overlay").show();
        });

        $(document).on("mousedown."+this.GUID, "#" + this.GUID + "-table .row_expand", function(e){
            dragY = true;
            $("#overlay").addClass("row_expand");
            $("#overlay").show();
        });

        $(document).on("mousedown."+this.GUID, "#" + this.GUID + "-table input", function(e){
            $(this).focus();
            $("#" + thisClass.GUID + "-table input").removeClass("selected");

            if($(this).data("x") === undefined || parseInt($(this).data("x")) < 0 || $(this).data("y") === undefined || parseInt($(this).data("y")) < 0)
                return;
                
            pointX =  $(this).offset().left - $(this).closest("table").offset().left;
            pointY =  $(this).offset().top - $(this).closest("table").offset().top;

            $(this).addClass("selected");
            selecting = true;
        });
        
        $(document).on("mouseup."+this.GUID, function(e){
            $("#" + thisClass.GUID + "-table input:focus").select();
            selecting = false;
            dragX = false;
            dragY = false;
            $("#overlay").removeClass("col_expand");
            $("#overlay").removeClass("row_expand");
            $("#overlay").removeClass("rowcol_expand");
            $("#overlay").hide();
        });
        
        $(document).on("mousemove."+this.GUID, function(e){
            var tableElement = $("#" + thisClass.GUID + "-table");
            if(dragX) {
                var cellElement = $("#" + thisClass.GUID + "-" + (thisClass.XResolution - 1) + "-axis");
                var relX = e.pageX - tableElement.offset().left;
                var elX = cellElement.offset().left - tableElement.offset().left;
                var comp = relX - elX;
                if(comp > (cellElement.width() * 3/2)){
                    thisClass.SetXResolution(thisClass.XResolution + 1);
                    thisClass.UpdateTable();
                }
                if(comp < 0 && thisClass.XResolution > 2){
                    thisClass.SetXResolution(thisClass.XResolution - 1);
                    thisClass.UpdateTable();
                }
            }
            if(dragY) {
                var cellElement = $("#" + thisClass.GUID + "-axis-" + (thisClass.YResolution - 1));
                var relY = e.pageY - tableElement.offset().top;
                var elY = cellElement.offset().top - tableElement.offset().top;
                var comp = relY - elY;
                if(comp > (cellElement.height() * 3/2)){
                    thisClass.SetYResolution(thisClass.YResolution + 1);
                    thisClass.UpdateTable();
                }
                if(comp < 0 && thisClass.YResolution > 2){
                    thisClass.SetYResolution(thisClass.YResolution - 1);
                    thisClass.UpdateTable();
                }
            }
            if(selecting){
                $.each($("#" + thisClass.GUID + "-table input"), function(index, cell) {
                    var cellElement = $(cell);
                    if(cellElement.data("x") === undefined || parseInt(cellElement.data("x")) < 0 || cellElement.data("y") === undefined || parseInt(cellElement.data("y")) < 0)
                        return;
        
                    var relX = e.pageX - tableElement.offset().left;
                    var elX = cellElement.offset().left - tableElement.offset().left;
                    var relY = e.pageY - tableElement.offset().top;
                    var elY = cellElement.offset().top - tableElement.offset().top;
                    if(((elX <= relX && elX >= pointX) || (elX >= (relX - cellElement.width()) && elX <= pointX) || (pointX == cellElement.offset().left - tableElement.offset().left)) &&
                        ((elY <= relY && elY >= pointY) || (elY >= (relY - cellElement.height()) && elY <= pointY) || (pointY == cellElement.offset().top - tableElement.offset().top))) {
                        cellElement.addClass("selected");
                    } else {
                        cellElement.removeClass("selected");
                    }
                });
            }
        });
        
        $(document).on("copy."+this.GUID, "#" + this.GUID + "-table input", function(e){
            if($(this).data("x") === undefined || parseInt($(this).data("x")) < 0 || $(this).data("y") === undefined || parseInt($(this).data("y")) < 0)
                return;

            var copyData = "";

            for(var y = 0; y < thisClass.YResolution; y++){
                var rowSelected = false
                    for(var x = 0; x < thisClass.XResolution; x++){
                    if($("#" + thisClass.GUID + "-table input[data-x='" + x + "'][data-y='" + y + "']").hasClass("selected")){
                        if(rowSelected){
                            copyData += "\t";
                        }
                        copyData += thisClass.Value[x + y * thisClass.XResolution];
                        rowSelected = true;
                    }
                }
                if(rowSelected){
                    copyData += "\n";
                }
            }

            if(copyData.length > 0){
                copyData = copyData.substring(0, copyData.length -1);//remove last new line
            }

            e.originalEvent.clipboardData.setData('text/plain', copyData);
            e.preventDefault();
        });

        $(document).on("paste."+this.GUID, "#" + this.GUID + "-table input", function(e){
            if($(this).data("x") === undefined || parseInt($(this).data("x")) < 0 || $(this).data("y") === undefined || parseInt($(this).data("y")) < 0)
                return;
                
            var val = e.originalEvent.clipboardData.getData('text/plain');

            var selectedCell = $("#" + thisClass.GUID + "-table input:focus")
            var x = selectedCell.data("x");
            var y = selectedCell.data("y");
            if(x < 0 || y < 0)
                return;

            $.each(val.split("\n"), function(yIndex, val) {
                var yPos = y + yIndex;
                if(yPos > thisClass.YResolution - 1)
                    return;
                $.each(val.split("\t"), function(xIndex, val) {
                    var xPos = x + xIndex;
                    if(xPos > thisClass.XResolution - 1)
                        return;

                    var v = parseFloat(val);
                    thisClass.Value[xPos + yPos * thisClass.XResolution] = v;
                    var cell = $("#" + thisClass.GUID + "-table input[data-x='" + xPos + "'][data-y='" + yPos + "']");
                    cell.val(v);
                    cell.addClass("selected");
                });
            });

            e.preventDefault();
        });
    }

    GetHtml() {
        return "<div id=\"" + this.GUID + "\">" + 
                    "<label for=\"" + this.GUID + "-edit\">" + this.Label + ":</label><input id=\"" + this.GUID + "-edit\" type=\"button\" class=\"button\" value=\"Edit Table\"></input>" + 
                    "<div id=\""+this.GUID + "-dialog\" style=\"display: none;\">" + this.GetTable() + "</div>" +
                "</div>";
    }

    UpdateTable() {
        $("#" + this.GUID + "-table").replaceWith(this.GetTable());
    }

    GetTable() {
        var row = "";
        var table = "<table id=\"" + this.GUID + "-table\" class=\"configtable\">";

        var xstart = -1;
        var ystart = -1;
        if(this.YResolution > 1 && this.XResolution > 1) {
            xstart = -2;
            ystart = -2;
        }

        for(var y = ystart; y < this.YResolution + 1; y++) {
            var row = "<tr>";
            for(var x = xstart; x < this.XResolution + 1; x++) {
                if(y === -2){
                    if(x === -2) {
                        // X-X - - -
                        // X-X - - -
                        // - - - - -
                        // - - - - -
                        // - - - - -
                        row += "<td colspan=\"2\" rowspan=\"2\" class=\"zlabel\">" + this.ZLabel + "</th>";
                    } else if(x === 0){
                        // - - X---X
                        // - - - - -
                        // - - - - -
                        // - - - - -
                        // - - - - -
                        row += "<td colspan=\""+this.XResolution+"\" class=\"xaxislabel\"><div>" + this.XLabel + "</div></th>"
                    } else if (x === this.XResolution) {
                        if(xstart === -2 && this.XResolutionModifiable) 
                            row += "<td class=\"col_expand\" rowspan=\"" + (this.YResolution + 2) + "\"></td>";
                    }
                } else if(y === -1) {
                    if(x === -1) {
                        // - - - - -
                        // - X - - -
                        // - - - - -
                        // - - - - -
                        // - - - - -
                        if(this.YResolution === 1) {
                            row += "<td class=\"xylabel\">" + this.XLabel + "</th>";
                        } else if(this.XResolution === 1) {
                            row += "<td class=\"xylabel\">" + this.YLabel + "</th>";
                        }
                    } else if(x === -2) {
                    } else if(x < this.XResolution) {
                        // - - - - -
                        // - - X X X
                        // - - - - -
                        // - - - - -
                        // - - - - -
                        if(this.XResolution === 1) {
                            row += "<td class=\"xaxis\">" + this.ZLabel + "</th>";
                        } else {
                            row += "<td class=\"xaxis\"><input id=\"" + this.GUID + "-" + x + "-axis\" oncontextmenu=\"return false;\" data-x=\"" + x + "\" data-y=\"" + y + "\" type=\"number\" " + ((x === 0 && this.MinXModifiable) || (x === this.XResolution - 1 && this.MaxXModifiable)? "" : "disabled") + " value=\"" + (parseFloat(parseFloat(((this.MaxX - this.MinX) * x / (this.XResolution-1) + this.MinX).toFixed(6)).toPrecision(7))) + "\"/></td>";
                        }
                    } else {
                        if(xstart === -1 && this.XResolutionModifiable)
                            row += "<td class=\"col_expand\" rowspan=\"" + (this.YResolution + 2) + "\"></td>";
                    }
                } else if(y < this.YResolution) {
                    if(x === -2) {
                        if(y === 0){
                            // - - - - -
                            // - - - - -
                            // X - - - -
                            // | - - - -
                            // X - - - -
                            row += "<td rowspan=\""+this.YResolution+"\" class=\"yaxislabel\"><div>" + this.YLabel; + "</div></th>";
                        }
                    } else if(x === -1) {
                        // - - - - -
                        // - - - - -
                        // - X - - -
                        // - X - - -
                        // - X - - -
                        if(this.YResolution === 1) {
                            row += "<td class=\"yaxis\">" + this.ZLabel + "</th>";
                        } else {
                            row += "<td class=\"yaxis\"><input id=\"" + this.GUID + "-axis-" + y + "\" oncontextmenu=\"return false;\" data-x=\"" + x + "\" data-y=\"" + y + "\" type=\"number\" " + ((y === 0 && this.MinYModifiable) || (y === this.YResolution - 1 && this.MaxYModifiable)? "" : "disabled") + " value=\"" + (parseFloat(parseFloat(((this.MaxY - this.MinY) * y / (this.YResolution-1) + this.MinY).toFixed(6)).toPrecision(7))) + "\"/></td>";
                        }
                    } else if(x < this.XResolution) {
                        // - - - - -
                        // - - - - -
                        // - - X X X
                        // - - X X X
                        // - - X X X
                        var valuesIndex = x + this.XResolution * y;
                        var inputId =  this.GUID + "-" + x + "-" + y;
                        var rowClass = $("#" + inputId).attr("class")
                        if(rowClass)
                            rowClass = " class =\"" + rowClass + "\"";
                        else
                            rowClass = "";
                        row += "<td><input oncontextmenu=\"return false;\" id=\"" + inputId + "\" data-x=\"" + x + "\" data-y=\"" + y + "\" type=\"number\" value=\"" + this.Value[valuesIndex] + "\""+rowClass+"/></td>";
                    }
                } else {
                    if(this.YResolutionModifiable && x == xstart) {
                        row += "<td class=\"row_expand\" colspan=\"" + (this.XResolution - xstart) + "\"></td>";
                        row += "<td class=\"rowcol_expand\"></td>";
                    }
                }
            }
            row += "</tr>";
            table += row;
        }

        return table + "</table>";
    }
}

document.addEventListener("dragstart", function(e){
    if($(e.target).hasClass("selected") || $(e.target).hasClass("row_expand") || $(e.target).hasClass("col_expand"))
        e.preventDefault();
});//disable dragging of selected items

function GetSelections(selection, measurement, configs) {
    var selections = "";
    var configSelected = false;
    if(configs) {
        for(var i = 0; i < configs.length; i++) {
            var selected = false;
            if(selection && !selection.reference && selection.value instanceof configs[i]){
                selected = true;
                configSelected = true;
            }

            selections += "<option value=\"" + i + "\"" + (selected? " selected" : "") + ">" + configs[i].Name + "</option>"
        }
        if(selections) 
            selections = "<optgroup label=\"Calculations\">" + selections + "</optgroup>";
    }
    
    for(var property in Increments){
        if(!Array.isArray(Increments[property]))
            continue;
        if(property === "PostEvent")
            continue;

        var arr = Increments[property];
        
        var arrSelections = "";

        for(var i = 0; i < arr.length; i++) {
            if(!measurement || arr[i].Measurement === measurement) {
                var selected = false;
                if(selection && selection.reference === property && selection.value === arr[i].Name && selection.measurement === arr[i].Measurement){
                    selected = true;
                    configSelected = true;
                }
    
                arrSelections += "<option reference=\"" + property + "\" value=\"" + arr[i].Name + "\" measurement=\"" + arr[i].Measurement + "\"" + (selected? " selected" : "") + ">" + arr[i].Name + (!measurement? " [" + GetUnitDisplay(arr[i].Measurement) + "]" : "") + "</option>"
            }
        }
        if(arrSelections) 
            arrSelections = "<optgroup label=\"" + property + "\">" + arrSelections + "</optgroup>";

        selections += arrSelections;
    }

    selections = "<option value=\"-1\" disabled" + (configSelected? "" : " selected") + ">Select</option>" + selections;

    return selections;
}

class ConfigOrVariableSelection {
    static Template = getFileContents("ConfigGui/ConfigOrVariableSelection.html");

    constructor(configs, valueLabel, valueMeasurement, variableListName){
        this.GUID = getGUID();
        this.Configs = configs;
        this.ValueLabel = valueLabel;
        this.ValueMeasurement = valueMeasurement;
        this.VariableListName = variableListName;
    }

    Configs = undefined;
    ValueLabel = undefined;
    ValueMeasurement = undefined;
    VariableListName = undefined;
    Selection = undefined;

    GetObj() {
        var gs = function(s) { return s? { reference: s.reference, value: s.reference? s.value : s.value.GetObj(), measurement: s.measurement } : undefined; };
        return { 
            Selection: gs(this.Selection),
        };
    }

    SetObj(obj) {
        this.Detach();

        if(obj)
            this.Selection = obj.Selection;
            
        if(this.Selection && !this.Selection.reference)
        {
            for(var i = 0; i < this.Configs.length; i++)
            {
                if(this.Configs[i].Name === this.Selection.value.Name) {
                    var c = this.Selection.value;
                    this.Selection.value = new this.Configs[i]();
                    this.Selection.value.ValueLabel = this.ValueLabel;
                    this.Selection.value.ValueMeasurement = this.ValueMeasurement;
                    this.Selection.value.SetObj(c);
                    if(this.ValueMeasurement === "Bool")
                        this.Selection.value.Type = "checkbox";
                    else
                        this.Selection.value.Type = "number";
                    break;
                }
            }
        }

        $("#" + this.GUID).replaceWith(this.GetHtml());
        this.Attach();
    }
    
    Detach() {
        $(document).off("change."+this.GUID);            
        if(this.Selection && !this.Selection.reference) 
            this.Selection.value.Detach();
    }
    
    Attach() {
        var thisClass = this;

        $(document).on("change."+this.GUID, "#" + this.GUID + "-selection", function(){
            thisClass.Detach();

            var val = $(this).val();
            if($('option:selected', this).attr('reference') === undefined)
            {
                if(val === "-1")
                    thisClass.Selection = undefined;
                else {
                    thisClass.Selection = {value: new thisClass.Configs[val]()}
                    thisClass.Selection.value.ValueLabel = thisClass.ValueLabel;
                    thisClass.Selection.value.ValueMeasurement = thisClass.ValueMeasurement;
                    if(thisClass.ValueMeasurement === "Bool")
                        thisClass.Selection.value.Type = "checkbox";
                    else
                        thisClass.Selection.value.Type = "number";
                }
            } else {
                thisClass.Selection = {reference: $('option:selected', this).attr('reference'), value: val, measurement: $('option:selected', this).attr('measurement')};
            }
            $("#" + thisClass.GUID).replaceWith(thisClass.GetHtml());
            
            thisClass.Attach();
        });

        if(this.Selection && !this.Selection.reference) 
            this.Selection.value.Attach();
    }

    GetHtml() {
        var template = GetClassProperty(this, "Template");

        template = template.replace(/[$]id[$]/g, this.GUID);
        
        $("#" + this.GUID + "-selection").html(GetSelections(this.Selection, this.ValueMeasurement, this.Configs));
        template = template.replace(/[$]selections[$]/g, GetSelections(this.Selection, this.ValueMeasurement, this.Configs));
        if(this.Selection && !this.Selection.reference) {
            template = template.replace(/[$]config[$]/g, this.Selection.value.GetHtml());
        } else {
            template = template.replace(/[$]config[$]/g, "");
        }
        template = template.replace(/[$]valuelabel[$]/g, this.ValueLabel);
        template = template.replace(/[$]value[$]/g, "");//this is for interactivity later
        template = template.replace(/[$]measurement[$]/g, GetMeasurementDisplay(this.ValueMeasurement));

        return template;
    }
    
    UpdateSelections() {
        $("#" + this.GUID + "-selection").html(GetSelections(this.Selection, this.ValueMeasurement, this.Configs));
    }
    
    GetCellByName(array, name) {
        if(!array)
            return undefined;
        for(var i = 0; i < array.length; i++) {
            if(name && name === array[i].Name && this.ValueMeasurement === array[i].Measurement)
                return array[i];
        }
        return undefined;
    }

    Id = -1;
    SetIncrements() {
        var thisClass = this;
        if(!Increments.PostEvent)
            Increments.PostEvent = [];
        Increments.PostEvent.push(function() { thisClass.UpdateSelections(); });

        if(this.Selection && this.VariableListName) {
            if(Increments[this.VariableListName] === undefined)
                Increments[this.VariableListName] = [];

            if(!this.Selection.reference && GetClassProperty(this.Selection.value, "Output")) {
                this.Id = 1;
                if(Increments.VariableIncrement === undefined)
                    Increments.VariableIncrement = 1;
                else
                    this.Id = ++Increments.VariableIncrement;

                if(this.Selection.value.SetIncrements)
                    this.Selection.value.SetIncrements();
                    
                Increments[this.VariableListName].push({ 
                    Name: this.ValueLabel, 
                    Id: this.Id,
                    Type: GetClassProperty(thisClass.Selection.value, "Output"),
                    Measurement: this.ValueMeasurement
                });
            } else {
                var cell = this.GetCellByName(Increments[this.Selection.reference], this.Selection.value);
                if(cell) {
                    Increments[this.VariableListName].push({ 
                        Name: this.ValueLabel, 
                        Id: cell.Id,
                        Type: cell.Type,
                        Measurement: this.ValueMeasurement
                    });
                }
            }
        }
    }
    
    IsImmediateOperation() {
        return this.Selection && !this.Selection.reference;
    }

    GetObjAsParameter(subOperationId) {
        //if immediate operation
        if(this.IsImmediateOperation()) {     
            return { value: [
                { type: "UINT8", value: subOperationId }, //use subOperation
                { type: "UINT8", value: 0 }, //use first return from operation
            ]};
        }

        var cell = this.GetCellByName(Increments[this.Selection.reference], this.Selection.value);
        return { value: [
            { type: "UINT8", value: 0 }, //use variable
            { type: "UINT32", value: cell.Id }, //ID
        ]};
    }
    
    GetObjOperation() {
        //if immediate operation
        if(this.IsImmediateOperation()) {
            return { value: [{ obj: this.Selection.value.GetObjOperation() }]};
        }

        return { value: []};
    }

    GetObjParameters() {
        //if immediate operation
        if(this.IsImmediateOperation()) {
            return { value: [{ obj: this.Selection.value.GetObjParameters() }]};
        }

        return { value: []};
    }

    GetObjPackage(subOperation){
        //if immediate operation
        if(this.IsImmediateOperation()) {      
            if(Increments.VariableIncrement === undefined && GetClassProperty(this.Selection.value, "Output"))
                throw "Set Increments First";
            if(this.Id === -1 && GetClassProperty(this.Selection.value, "Output"))
                throw "Set Increments First";


            var obj  = {value: [
                    { type: "PackageOptions", value: { Immediate: true, Store: true, Return: subOperation && GetClassProperty(this.Selection.value, "Output") }}, //immediate and store variable, return if subOperation
                    { obj: this.Selection.value.GetObjOperation() }
                ]};
            
            if(GetClassProperty(this.Selection.value, "Output"))
                obj.value.push({ type: "UINT32", value: this.Id });

            obj.value.push({ obj: this.Selection.value.GetObjParameters() });

            return obj;
        }  
                
        return { value: []};
    }
}