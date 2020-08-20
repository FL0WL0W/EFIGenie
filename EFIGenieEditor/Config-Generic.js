var GenericConfigs = [];

var configOperation_StaticScalarTemplate;
class ConfigOperation_StaticScalar {
    static Name = "Static";
    static Output = "float";
    static Inputs = [];
    static Measurement = "Selectable";
    static ValueLabel = "Value";
    static ValueMeasurement = "None";

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
        this.Type = obj.Type;
        this.Value = obj.Value;
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

            thisClass.Attach();
        });

        $(document).on("change."+this.GUID, "#" + this.GUID + "-value", function(){
            thisClass.Detach();

            thisClass.Value = parseFloat($(this).val());

            thisClass.Attach();
        });
    }

    GetHtml() {
        if(!configOperation_StaticScalarTemplate)
            configOperation_StaticScalarTemplate = getFileContents("ConfigGui/Operation_StaticScalar.html");
        var template = configOperation_StaticScalarTemplate;

        template = template.replace(/[$]id[$]/g, this.GUID);
        template = template.replace(/[$]type[$]/g, this.Type);
        template = template.replace(/[$]value[$]/g, this.Value);
        template = template.replace(/[$]valuelabel[$]/g, GetClassProperty(this, "ValueLabel"));
        template = template.replace(/[$]valuemeasurement[$]/g, GetMeasurementDisplay(Measurements[GetClassProperty(this, "ValueMeasurement")]));
        template = template.replace(/[$]numberselected[$]/g, this.Type==="number" ? " selected" : "");
        template = template.replace(/[$]boolselected[$]/g, this.Type==="bool" ? " selected" : "");
        template = template.replace(/[$]tickselected[$]/g, this.Type==="tick" ? " selected" : "");

        return template;
    }

    GetArrayBuffer() {
        var arrayBuffer = new ArrayBuffer();

        arrayBuffer = arrayBuffer.concatArray(new Uint16Array([13]).buffer); //factory ID
        switch(this.Type)
        {
            case "number":
                if(this.Value % 1 != 0){
                    arrayBuffer = arrayBuffer.concatArray(new Uint8Array([9]).buffer); //type
                    arrayBuffer = arrayBuffer.concatArray(new Float32Array([this.Value]).buffer); //value
                } else {
                    if(this.Value < 0) {
                        if(this.Value < 128 && this.Value > -129) {
                            arrayBuffer = arrayBuffer.concatArray(new Uint8Array([5]).buffer); //type
                            arrayBuffer = arrayBuffer.concatArray(new Int8Array([this.Value]).buffer); //value
                        } else if(this.Value < 32768 && this.Value > -32759) {
                            arrayBuffer = arrayBuffer.concatArray(new Uint8Array([6]).buffer); //type
                            arrayBuffer = arrayBuffer.concatArray(new Int16Array([this.Value]).buffer); //value
                        } else if(this.Value < 2147483648 && this.Value > -2147483649) {
                            arrayBuffer = arrayBuffer.concatArray(new Uint8Array([7]).buffer); //type
                            arrayBuffer = arrayBuffer.concatArray(new Int32Array([this.Value]).buffer); //value
                        } else {
                            throw "number too big";
                        }
                    } else {
                        if(this.Value < 256) {
                            arrayBuffer = arrayBuffer.concatArray(new Uint8Array([1]).buffer); //type
                            arrayBuffer = arrayBuffer.concatArray(new Uint8Array([this.Value]).buffer); //value
                        } else if(this.Value < 65536) {
                            arrayBuffer = arrayBuffer.concatArray(new Uint8Array([2]).buffer); //type
                            arrayBuffer = arrayBuffer.concatArray(new Uint16Array([this.Value]).buffer); //value
                        } else if(this.Value < 4294967295) {
                            arrayBuffer = arrayBuffer.concatArray(new Uint8Array([3]).buffer); //type
                            arrayBuffer = arrayBuffer.concatArray(new Uint32Array([this.Value]).buffer); //value
                        } else {
                            throw "number too big";
                        }
                    }
                }
                break;
            case "bool":
                arrayBuffer = arrayBuffer.concatArray(new Uint8Array([11]).buffer); //type
                arrayBuffer = arrayBuffer.concatArray(new Uint8Array([this.Value]).buffer); //value
                break;
            case "tick":
                arrayBuffer = arrayBuffer.concatArray(new Uint8Array([5]).buffer); //type
                arrayBuffer = arrayBuffer.concatArray(new Uint32Array([this.Value]).buffer); //value
                break;
        }
        
        return arrayBuffer;
    }
}

GenericConfigs.push(ConfigOperation_StaticScalar);

var configOperation_LookupTableTemplate;
class ConfigOperation_LookupTable {
    static Name = "Lookup Table";
    static Output = "float";
    static Inputs = ["float"];
    static Measurement = "Selectable";
    static ValueLabel = "Value";
    static ValueMeasurement = "None";

    InputSelection = undefined;
    Type = "number";
    Table;

    constructor(){
        this.GUID = getGUID();
        this.Table = new Table();
        this.Table.YResolutionModifiable = false;
        this.Table.SetXResolution(10);
        this.Table.SetYResolution(1);
    }


    GetObj() {
        return {
            Name: this.constructor.Name,
            Type: this.Type,
            Value: this.Table.Value,
            MinX: this.Table.MinX,
            MaxX: this.Table.MaxX,
            Resolution: this.Table.XResolution,
            InputSelection: this.InputSelection
        };
    }

    SetObj(obj) {
        this.Type = obj.Type;
        this.Table.MinX = obj.MinX;
        this.Table.MaxX = obj.MaxX;
        this.Table.SetXResolution(obj.Resolution);
        this.Table.Value = obj.Value;
        this.InputSelection = obj.InputSelection;
        $("#" + this.GUID).replaceWith(this.GetHtml());
    }

    Attach() {
        var thisClass = this;

        $(document).on("change."+this.GUID, "#" + this.GUID + "-inputselection", function(){
            thisClass.Detach();

            var val = $(this).val();
            thisClass.InputSelection = {reference: $('option:selected', this).attr('reference'), value: val};
            $("#" + thisClass.GUID).replaceWith(thisClass.GetHtml());
            
            thisClass.Attach();
        });
        
        this.Table.Attach();
    }

    Detach() {
        this.Table.Detach();
    }

    GetHtml() {
        if(!configOperation_LookupTableTemplate)
            configOperation_LookupTableTemplate = getFileContents("ConfigGui/Operation_LookupTable.html");
        var template = configOperation_LookupTableTemplate;

        template = template.replace(/[$]id[$]/g, this.GUID);
        template = template.replace(/[$]type[$]/g, this.Type);
        this.Table.XLabel = "<select style=\"width: 100%;\" id=\"" + this.GUID + "-inputselection\">" + GetSelections(this.InputSelection) + "</select>";
        this.Table.ZLabel = GetClassProperty(this, "ValueLabel") + " " + GetMeasurementDisplay(Measurements[GetClassProperty(this, "ValueMeasurement")]);
        template = template.replace(/[$]table[$]/g, this.Table.GetHtml());
        template = template.replace(/[$]numberselected[$]/g, this.Type==="number" ? " selected" : "");
        template = template.replace(/[$]boolselected[$]/g, this.Type==="bool" ? " selected" : "");
        template = template.replace(/[$]tickselected[$]/g, this.Type==="tick" ? " selected" : "");

        return template;
    }
    
    UpdateSelections() {
        $("#" + this.GUID + "-inputselection").html(GetSelections(this.InputSelection));
    }

    SetIncrements() {
        var thisClass = this;
        if(!Increments.PostEvent)
            Increments.PostEvent = [];
        Increments.PostEvent.push(function() { thisClass.UpdateSelections(); });
    }

    GetArrayBuffer() {
        var table = this.Table.Value;
        var type;
        var min;
        var max;

        for(var i = 0; i < table.length; i++) {
            if(table[i] % 1 != 0){
                type = "float";
                break;
            }
            if(min === undefined || table[i] < min){
                min = table[i];
            }
            if(max === undefined || table[i] < max){
                max = table[i];
            }
        }
        if(!type){
            if(min < 0) {
                if(max < 128 && min > -129) {
                    type = "int8"
                } else if(max < 32768 && min > -32759) {
                    type = "int16"
                } else if(max < 2147483648 && min > -2147483649) {
                    type = "int32"
                } else {
                    throw "number too big";
                }
            } else {
                if(max < 256) {
                    type = "uint8"
                } else if(max < 65536) {
                    type = "uint16"
                } else if(max < 4294967295) {
                    type = "uint32"
                } else {
                    throw "number too big";
                }
            }
        }

        var arrayBuffer = new ArrayBuffer();

        arrayBuffer = arrayBuffer.concatArray(new Uint16Array([2]).buffer); //factory ID
        arrayBuffer = arrayBuffer.concatArray(new Float32Array([table.MinX]).buffer); //MinXValue
        arrayBuffer = arrayBuffer.concatArray(new Float32Array([table.MaxX]).buffer); //MaxXValue
        arrayBuffer = arrayBuffer.concatArray(new Float32Array([table.XResolution]).buffer); //XResolution
        switch(this.Type)
        {
            case "number":
                switch(type){
                    case "float": 
                        arrayBuffer = arrayBuffer.concatArray(new Uint8Array([9]).buffer); //type
                        arrayBuffer = arrayBuffer.concatArray(new Float32Array(table).buffer); //value
                    break;
                    case "int8":
                        arrayBuffer = arrayBuffer.concatArray(new Uint8Array([5]).buffer); //type
                        arrayBuffer = arrayBuffer.concatArray(new Int8Array(table).buffer); //value
                    break;
                    case "int16":
                        arrayBuffer = arrayBuffer.concatArray(new Uint8Array([6]).buffer); //type
                        arrayBuffer = arrayBuffer.concatArray(new Int16Array(table).buffer); //value
                    break;
                    case "int32":
                        arrayBuffer = arrayBuffer.concatArray(new Uint8Array([7]).buffer); //type
                        arrayBuffer = arrayBuffer.concatArray(new Int32Array(table).buffer); //value
                    break;
                    case "uint8":
                        arrayBuffer = arrayBuffer.concatArray(new Uint8Array([1]).buffer); //type
                        arrayBuffer = arrayBuffer.concatArray(new Uint8Array(table).buffer); //value
                    break;
                    case "uint16":
                        arrayBuffer = arrayBuffer.concatArray(new Uint8Array([2]).buffer); //type
                        arrayBuffer = arrayBuffer.concatArray(new Uint16Array(table).buffer); //value
                    break;
                    case "uint32":
                        arrayBuffer = arrayBuffer.concatArray(new Uint8Array([3]).buffer); //type
                        arrayBuffer = arrayBuffer.concatArray(new Uint32Array(table).buffer); //value
                }
                break;
            case "bool":
                arrayBuffer = arrayBuffer.concatArray(new Uint8Array([11]).buffer); //type
                arrayBuffer = arrayBuffer.concatArray(new Uint8Array(table).buffer); //value
                break;
            case "tick":
                arrayBuffer = arrayBuffer.concatArray(new Uint8Array([5]).buffer); //type
                arrayBuffer = arrayBuffer.concatArray(new Uint32Array(table).buffer); //value
                break;
        }

        arrayBuffer = arrayBuffer.concatArray(new Uint8Array([ Increments[this.InputSelection.reference].find(a => a.Name === this.InputSelection.value).Channel ]).buffer);
        arrayBuffer = arrayBuffer.concatArray(new Uint8Array([ Increments[this.InputSelection.reference].find(a => a.Name === this.InputSelection.value).Id ]).buffer);
                
        return arrayBuffer;
    }
}
GenericConfigs.push(ConfigOperation_LookupTable);

var configOperation_2AxisTableTemplate;
class ConfigOperation_2AxisTable {
    static Name = "2 Axis Table";
    static Output = "float";
    static Inputs = ["float", "float"];
    static Measurement = "Selectable";
    static ValueLabel = "Value";
    static ValueMeasurement = "None";

    XSelection = undefined;
    YSelection = undefined;
    Type = "number";
    Table;

    constructor(){
        this.GUID = getGUID();
        this.Table = new Table();
        this.Table.SetXResolution(10);
        this.Table.SetYResolution(10);
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
            XSelection: this.XSelection,
            YSelection: this.YSelection
        };
    }

    SetObj(obj) {
        this.Type = obj.Type;
        this.Table.MinX = obj.MinX;
        this.Table.MaxX = obj.MaxX;
        this.Table.MinY = obj.MinY;
        this.Table.MaxY = obj.MaxY;
        this.Table.SetXResolution(obj.XResolution);
        this.Table.SetYResolution(obj.YResolution);
        this.Table.Value = obj.Value;
        this.XSelection = obj.XSelection;
        this.YSelection = obj.YSelection;
        $("#" + this.GUID).replaceWith(this.GetHtml());
    }

    Attach() {
        var thisClass = this;

        $(document).on("change."+this.GUID, "#" + this.GUID + "-xselection", function(){
            thisClass.Detach();

            var val = $(this).val();
            thisClass.XSelection = {reference: $('option:selected', this).attr('reference'), value: val};
            $("#" + thisClass.GUID).replaceWith(thisClass.GetHtml());
            
            thisClass.Attach();
        });

        $(document).on("change."+this.GUID, "#" + this.GUID + "-yselection", function(){
            thisClass.Detach();

            var val = $(this).val();
            thisClass.YSelection = {reference: $('option:selected', this).attr('reference'), value: val};
            $("#" + thisClass.GUID).replaceWith(thisClass.GetHtml());
            
            thisClass.Attach();
        });
        
        this.Table.Attach();
    }

    Detach() {
        this.Table.Detach();
    }

    GetHtml() {
        if(!configOperation_2AxisTableTemplate)
            configOperation_2AxisTableTemplate = getFileContents("ConfigGui/Operation_2AxisTable.html");
        var template = configOperation_2AxisTableTemplate;

        template = template.replace(/[$]id[$]/g, this.GUID);
        template = template.replace(/[$]type[$]/g, this.Type);
        this.Table.XLabel = "<select style=\"width: 100%;\" id=\"" + this.GUID + "-xselection\">" + GetSelections(this.XSelection) + "</select>";
        this.Table.YLabel = "<select style=\"width: $height$px;\" id=\"" + this.GUID + "-yselection\">" + GetSelections(this.YSelection) + "</select>";
        this.Table.ZLabel = GetClassProperty(this, "ValueLabel") + " " + GetMeasurementDisplay(Measurements[GetClassProperty(this, "ValueMeasurement")]);
        template = template.replace(/[$]table[$]/g, this.Table.GetHtml());
        template = template.replace(/[$]numberselected[$]/g, this.Type==="number" ? " selected" : "");
        template = template.replace(/[$]boolselected[$]/g, this.Type==="bool" ? " selected" : "");
        template = template.replace(/[$]tickselected[$]/g, this.Type==="tick" ? " selected" : "");

        return template;
    }

    UpdateSelections() {
        $("#" + this.GUID + "-xselection").html(GetSelections(this.XSelection));
        $("#" + this.GUID + "-yselection").html(GetSelections(this.YSelection));
    }

    SetIncrements() {
        var thisClass = this;
        if(!Increments.PostEvent)
            Increments.PostEvent = [];
        Increments.PostEvent.push(function() { thisClass.UpdateSelections(); });
    }

    GetArrayBuffer() {
        var table = this.Table.Value;
        var type;
        var min;
        var max;

        for(var i = 0; i < table.length; i++) {
            if(table[i] % 1 != 0){
                type = "float";
                break;
            }
            if(min === undefined || table[i] < min){
                min = table[i];
            }
            if(max === undefined || table[i] < max){
                max = table[i];
            }
        }
        if(!type){
            if(min < 0) {
                if(max < 128 && min > -129) {
                    type = "int8"
                } else if(max < 32768 && min > -32759) {
                    type = "int16"
                } else if(max < 2147483648 && min > -2147483649) {
                    type = "int32"
                } else {
                    throw "number too big";
                }
            } else {
                if(max < 256) {
                    type = "uint8"
                } else if(max < 65536) {
                    type = "uint16"
                } else if(max < 4294967295) {
                    type = "uint32"
                } else {
                    throw "number too big";
                }
            }
        }

        var arrayBuffer = new ArrayBuffer();

        arrayBuffer = arrayBuffer.concatArray(new Uint16Array([3]).buffer); //factory ID
        arrayBuffer = arrayBuffer.concatArray(new Float32Array([table.MinX]).buffer); //MinXValue
        arrayBuffer = arrayBuffer.concatArray(new Float32Array([table.MaxX]).buffer); //MaxXValue
        arrayBuffer = arrayBuffer.concatArray(new Float32Array([table.XResolution]).buffer); //XResolution
        arrayBuffer = arrayBuffer.concatArray(new Float32Array([table.MinY]).buffer); //MinYValue
        arrayBuffer = arrayBuffer.concatArray(new Float32Array([table.MaxY]).buffer); //MaxYValue
        arrayBuffer = arrayBuffer.concatArray(new Float32Array([table.YResolution]).buffer); //YResolution
        switch(this.Type)
        {
            case "number":
                switch(type){
                    case "float": 
                        arrayBuffer = arrayBuffer.concatArray(new Uint8Array([9]).buffer); //type
                        arrayBuffer = arrayBuffer.concatArray(new Float32Array(table).buffer); //value
                    break;
                    case "int8":
                        arrayBuffer = arrayBuffer.concatArray(new Uint8Array([5]).buffer); //type
                        arrayBuffer = arrayBuffer.concatArray(new Int8Array(table).buffer); //value
                    break;
                    case "int16":
                        arrayBuffer = arrayBuffer.concatArray(new Uint8Array([6]).buffer); //type
                        arrayBuffer = arrayBuffer.concatArray(new Int16Array(table).buffer); //value
                    break;
                    case "int32":
                        arrayBuffer = arrayBuffer.concatArray(new Uint8Array([7]).buffer); //type
                        arrayBuffer = arrayBuffer.concatArray(new Int32Array(table).buffer); //value
                    break;
                    case "uint8":
                        arrayBuffer = arrayBuffer.concatArray(new Uint8Array([1]).buffer); //type
                        arrayBuffer = arrayBuffer.concatArray(new Uint8Array(table).buffer); //value
                    break;
                    case "uint16":
                        arrayBuffer = arrayBuffer.concatArray(new Uint8Array([2]).buffer); //type
                        arrayBuffer = arrayBuffer.concatArray(new Uint16Array(table).buffer); //value
                    break;
                    case "uint32":
                        arrayBuffer = arrayBuffer.concatArray(new Uint8Array([3]).buffer); //type
                        arrayBuffer = arrayBuffer.concatArray(new Uint32Array(table).buffer); //value
                }
                break;
            case "bool":
                arrayBuffer = arrayBuffer.concatArray(new Uint8Array([11]).buffer); //type
                arrayBuffer = arrayBuffer.concatArray(new Uint8Array(table).buffer); //value
                break;
            case "tick":
                arrayBuffer = arrayBuffer.concatArray(new Uint8Array([5]).buffer); //type
                arrayBuffer = arrayBuffer.concatArray(new Uint32Array(table).buffer); //value
                break;
        }

        arrayBuffer = arrayBuffer.concatArray(new Uint8Array([ Increments[this.XSelection.reference].find(a => a.Name === this.XSelection.value).Channel ]).buffer);
        arrayBuffer = arrayBuffer.concatArray(new Uint8Array([ Increments[this.XSelection.reference].find(a => a.Name === this.XSelection.value).Id ]).buffer);
        arrayBuffer = arrayBuffer.concatArray(new Uint8Array([ Increments[this.YSelection.reference].find(a => a.Name === this.YSelection.value).Channel ]).buffer);
        arrayBuffer = arrayBuffer.concatArray(new Uint8Array([ Increments[this.YSelection.reference].find(a => a.Name === this.YSelection.value).Id ]).buffer);
                
        return arrayBuffer;
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
        //TODO interpolate
        this.XResolution = xRes;
        this.Value = new Array(Math.max(1, this.XResolution) * Math.max(1, this.YResolution));
    }

    SetYResolution(yRes){
        //TODO interpolate
        this.YResolution = yRes;
        this.Value = new Array(Math.max(1, this.XResolution) * Math.max(1, this.YResolution));
    }

    Detach() {
        $(document).off("change."+this.GUID);
        $(document).off("click."+this.GUID);
    }

    Attach() {
        var thisClass = this;

        $(document).on("change."+this.GUID, "#" + this.GUID, function(e){
            thisClass.Detach();

            var x = $(e.target).data("x");
            var y = $(e.target).data("y");
            var value = parseFloat($(e.target).val());
            
            if(x === -1) {
                if(y === 0){
                    thisClass.MinY = value;
                } else if (y === thisClass.YResolution - 1){
                    thisClass.MaxY = value;
                }
                for(var i = 1; i < thisClass.YResolution - 1; i++) {
                    $("#" + thisClass.GUID + " input[data-x='-1'][data-y='" + i + "']").val(parseFloat(parseFloat(((thisClass.MaxY - thisClass.MinY) * i / (thisClass.YResolution-1) + thisClass.MinY).toFixed(6)).toPrecision(7)));
                }
            } else if(y === -1) {
                if(x === 0){
                    thisClass.MinX = value;
                } else if (x === thisClass.XResolution - 1){
                    thisClass.MaxX = value;
                }
                for(var i = 1; i < thisClass.XResolution - 1; i++) {
                    $("#" + thisClass.GUID + " input[data-x='"+i+"'][data-y='-1']").val(parseFloat(parseFloat(((thisClass.MaxX - thisClass.MinX) * i / (thisClass.XResolution-1) + thisClass.MinX).toFixed(6)).toPrecision(7)));
                }
            } else {
                var index = x + y * thisClass.XResolution;
                thisClass.Value[index] = value;
            }

            thisClass.Attach();
        });

        $(document).on("click."+this.GUID, "#" + this.GUID + "-addX", function(e){
            thisClass.Detach();

            thisClass.SetXResolution(thisClass.XResolution + 1);

            $("#" + thisClass.GUID).replaceWith(thisClass.GetHtml());

            thisClass.Attach();
        });

        $(document).on("click."+this.GUID, "#" + this.GUID + "-subX", function(e){
            thisClass.Detach();
            
            thisClass.SetXResolution(thisClass.XResolution - 1);

            $("#" + thisClass.GUID).replaceWith(thisClass.GetHtml());

            thisClass.Attach();
        });

        $(document).on("click."+this.GUID, "#" + this.GUID + "-addY", function(e){
            thisClass.Detach();
            
            thisClass.SetYResolution(thisClass.YResolution + 1);

            $("#" + thisClass.GUID).replaceWith(thisClass.GetHtml());

            thisClass.Attach();
        });

        $(document).on("click."+this.GUID, "#" + this.GUID + "-subY", function(e){
            thisClass.Detach();
            
            thisClass.SetYResolution(thisClass.YResolution - 1);

            $("#" + thisClass.GUID).replaceWith(thisClass.GetHtml());

            thisClass.Attach();
        });
    }

    GetHtml() {
        var row = "";
        var table = "<table class=\"configtable\">";

        var xstart = -1;
        var ystart = -1;
        if(this.YResolution > 1 && this.XResolution > 1) {
            xstart = -2;
            ystart = -2;
        }

        for(var y = ystart; y < this.YResolution + 1; y++) {
            var row = "<tr style=\"height: 26px;\">";
            for(var x = xstart; x < this.XResolution + 1; x++) {
                if(y === -2){
                    if(x === -2) {
                        // X-X - - -
                        // X-X - - -
                        // - - - - -
                        // - - - - -
                        // - - - - -
                        row += "<th colspan=\"2\" rowspan=\"2\" style=\"border-right-style: sold; border-right-width:5px; border-bottom-style: sold; border-bottom-width:5px;\">" + this.ZLabel + "</th>";
                    } else if(x === 0){
                        // - - X---X
                        // - - - - -
                        // - - - - -
                        // - - - - -
                        // - - - - -
                        row += "<th colspan=\""+this.XResolution+"\">" + this.XLabel + "</th>"
                    } else if (x === this.XResolution) {
                        if(xstart === -2 && this.XResolutionModifiable)
                            row += "<td rowspan=\"2\"></td>";
                    }
                } else if(y === -1) {
                    if(x === -1) {
                        // - - - - -
                        // - X - - -
                        // - - - - -
                        // - - - - -
                        // - - - - -
                        if(this.YResolution === 1) {
                            row += "<th style=\"border-right-style: sold; border-right-width:5px;\">" + this.XLabel + "</th>";
                        } else if(this.XResolution === 1) {
                            row += "<th style=\"border-bottom-style: sold; border-bottom-width:5px;\">" + this.YLabel + "</th>";
                        }
                    } else if(x === -2) {
                    } else if(x < this.XResolution) {
                        // - - - - -
                        // - - X X X
                        // - - - - -
                        // - - - - -
                        // - - - - -
                        if(this.XResolution === 1) {
                            row += "<th style=\"border-bottom-style: sold; border-right-width:5px;\">" + this.ZLabel + "</th>";
                        } else {
                            row += "<td style=\"border-bottom-style: sold; border-bottom-width:5px;\"><input data-x=\"" + x + "\" data-y=\"" + y + "\" type=\"number\" " + ((x === 0 && this.MinXModifiable) || (x === this.XResolution - 1 && this.MaxXModifiable)? "" : "disabled") + " value=\"" + (parseFloat(parseFloat(((this.MaxX - this.MinX) * x / (this.XResolution-1) + this.MinX).toFixed(6)).toPrecision(7))) + "\"/></td>";
                        }
                    } else {
                        if(xstart === -1 && this.XResolutionModifiable)
                            row += "<td></td>";
                    }
                } else if(y < this.YResolution) {
                    if(x === -2) {
                        if(y === 0){
                            // - - - - -
                            // - - - - -
                            // X - - - -
                            // | - - - -
                            // X - - - -
                            row += "<th rowspan=\""+this.YResolution+"\" style=\"width: 26px;\"><div style=\"text-align: center; width: 26px; transform: rotate(-90deg) translateX(" + (-26 * this.YResolution + 26) + "px);\">" + this.YLabel.replace(/[$]height[$]/g, "" + (26 * this.YResolution)); + "</div></th>";
                        }
                    } else if(x === -1) {
                        // - - - - -
                        // - - - - -
                        // - X - - -
                        // - X - - -
                        // - X - - -
                        if(this.YResolution === 1) {
                            row += "<th style=\"border-right-style: sold; border-right-width:5px;\">" + this.ZLabel + "</th>";
                        } else {
                            row += "<td style=\"border-right-style: sold; border-right-width:5px;\"><input data-x=\"" + x + "\" data-y=\"" + y + "\" type=\"number\" " + ((y === 0 && this.MinYModifiable) || (y === this.YResolution - 1 && this.MaxYModifiable)? "" : "disabled") + " value=\"" + (parseFloat(parseFloat(((this.MaxY - this.MinY) * y / (this.YResolution-1) + this.MinY).toFixed(6)).toPrecision(7))) + "\"/></td>";
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
                        row += "<td><input id=\"" + inputId + "\" data-x=\"" + x + "\" data-y=\"" + y + "\" type=\"number\" value=\"" + this.Value[valuesIndex] + "\""+rowClass+"/></td>";
                    } else {
                        if(y === 0 && this.XResolutionModifiable) {
                            row += "<td style=\"vertical-align: text-top;\" rowspan=\"" + this.YResolution + "\"><input id=\"" + this.GUID + "-addX\" style=\"width:24px\" type=\"button\" value=\"+\"><br><input id=\"" + this.GUID + "-subX\" style=\"width:24px\" type=\"button\" value=\"-\"></td>";
                        }
                    }
                } else {
                    if(x === -1 && this.YResolutionModifiable) {
                        row += "<td colspan=\"" + (-xstart) + "\"></td>";
                    }
                    else if(x === 0 && this.YResolutionModifiable) {
                        row += "<td colspan=\"" + this.XResolution + "\"><input id=\"" + this.GUID + "-addY\" style=\"width:24px\" type=\"button\" value=\"+\"><input id=\"" + this.GUID + "-subY\" style=\"width:24px\" type=\"button\" value=\"-\"></td>";
                    }
                }
            }
            row += "</tr>";
            table += row;
        }

        table = table + "</table>"

        return "<span id=\"" + this.GUID + "\">"+table+"</span>";
    }
}