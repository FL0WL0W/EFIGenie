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
        $(document).off("touchstart."+this.GUID);
        $(document).off("touchend."+this.GUID);
        $(document).off("touchmove."+this.GUID);
    }

    Attach() {
        this.Detach();
        var thisClass = this;

        $(document).on("click."+this.GUID, "#" + this.GUID + "-equal", function(){
            var value = parseFloat($("#" + thisClass.GUID + "-modifyvalue").val());
            $.each($("#" + thisClass.GUID + "-table input.selected"), function(index, cell) {
                var index = parseInt($(cell).data("x")) + parseInt($(cell).data("y")) * thisClass.XResolution;
                thisClass.Value[index] = value;
                $(cell).val(thisClass.Value[index]);
            });
        });
        $(document).on("click."+this.GUID, "#" + this.GUID + "-add", function(){
            var value = parseFloat($("#" + thisClass.GUID + "-modifyvalue").val());
            $.each($("#" + thisClass.GUID + "-table input.selected"), function(index, cell) {
                var index = parseInt($(cell).data("x")) + parseInt($(cell).data("y")) * thisClass.XResolution;
                thisClass.Value[index] += value;
                $(cell).val(thisClass.Value[index]);
            });
        });
        $(document).on("click."+this.GUID, "#" + this.GUID + "-multiply", function(){
            var value = parseFloat($("#" + thisClass.GUID + "-modifyvalue").val());
            $.each($("#" + thisClass.GUID + "-table input.selected"), function(index, cell) {
                var index = parseInt($(cell).data("x")) + parseInt($(cell).data("y")) * thisClass.XResolution;
                thisClass.Value[index] *= value;
                $(cell).val(thisClass.Value[index]);
            });
        });

        $(document).on("click."+this.GUID, "#" + this.GUID + "-edit", function(){
            $("#" + thisClass.GUID + "-dialog").dialog({ width:'auto', modal:true, title: thisClass.ZLabel });
        });

        $(document).on("change."+this.GUID, "#" + this.GUID + "-table", function(e){
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
                    thisClass.Value[index] = value;
                    $(cell).val(thisClass.Value[index]);
                });
            }
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

        function down() {
            $(this).focus();
            $("#" + thisClass.GUID + "-table input").removeClass("selected");
            $("#" + thisClass.GUID + "-table input").removeClass("origselect");

            if($(this).data("x") === undefined || parseInt($(this).data("x")) < 0 || $(this).data("y") === undefined || parseInt($(this).data("y")) < 0)
                return;
                
            pointX =  $(this).offset().left - $(this).closest("table").offset().left;
            pointY =  $(this).offset().top - $(this).closest("table").offset().top;

            $(this).addClass("selected");
            $(this).addClass("origselect");
            selecting = true;
        }

        function up() {
            selecting = false;
            dragX = false;
            dragY = false;
            $("#overlay").removeClass("col_expand");
            $("#overlay").removeClass("row_expand");
            $("#overlay").removeClass("rowcol_expand");
            $("#overlay").hide();
        }

        var selectOnMove = false;
        function move(pageX, pageY) {
            var tableElement = $("#" + thisClass.GUID + "-table");
            if(dragX) {
                var cellElement = $("#" + thisClass.GUID + "-" + (thisClass.XResolution - 1) + "-axis");
                var relX = pageX - tableElement.offset().left;
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
                var relY = pageY - tableElement.offset().top;
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
            if(selecting || selectOnMove){
                $.each($("#" + thisClass.GUID + "-table input"), function(index, cell) {
                    var cellElement = $(cell);
                    if(cellElement.data("x") === undefined || parseInt(cellElement.data("x")) < 0 || cellElement.data("y") === undefined || parseInt(cellElement.data("y")) < 0)
                        return;
        
                    var relX = pageX - tableElement.offset().left;
                    var elX = cellElement.offset().left - tableElement.offset().left;
                    var relY = pageY - tableElement.offset().top;
                    var elY = cellElement.offset().top - tableElement.offset().top;
                    if(((elX <= relX && elX >= pointX) || (elX >= (relX - cellElement.width()) && elX <= pointX) || (pointX == cellElement.offset().left - tableElement.offset().left)) &&
                        ((elY <= relY && elY >= pointY) || (elY >= (relY - cellElement.height()) && elY <= pointY) || (pointY == cellElement.offset().top - tableElement.offset().top))) {
                        if(selecting)
                            cellElement.addClass("selected");
                        else if (selectOnMove && !cellElement.hasClass("origselect")) {
                            selectOnMove = false;
                            selecting = true;
                        }
                    } else if(selecting) {
                        cellElement.removeClass("selected");
                    }
                });
            }
        }

        //lame stuff we have to do so the touchend call to contextmenu doesn't invalidate the select
        var touchEnd = false;
        var touchEndHandle;
        function touchEndHandler() { touchEnd=false; }
        function resetTouchEnd() { clearTimeout(touchEndHandle); touchEnd = true; touchEndHandle = setTimeout(touchEndHandler, 100); }

        //lame stuff we have to do to fix context menu when using mouse
        var leftClick = false;
        var leftClickHandle;
        function leftClickHandler() { leftClick=false; }
        function resetLeftClick() { clearTimeout(leftClickHandle); leftClick = true; leftClickHandle = setTimeout(leftClickHandler, 100); }

        $(document).on("contextmenu."+this.GUID, "#" + this.GUID + "-table input", function(e){
            if(!leftClick) {
                if(!touchEnd) {
                    if(!$(this).hasClass("origselect"))
                        down.call(this);
                    else
                        selectOnMove = true;
                }
            } else if (!$(this).hasClass("selected")) {
                $(this).select();
                down.call(this);
                selecting = false;
            } else if (!$(this).hasClass("origselect")) {
                e.preventDefault();
            }
        });
        $(document).on("touchend."+this.GUID, "#" + this.GUID + "-table input", function(e){
            selectOnMove = false;
            if($(this).hasClass("origselect"))
                e.preventDefault();
        });
        $(document).on("mousedown."+this.GUID, "#" + this.GUID + "-table input", function(e){
            if(e.which === 3)
                resetLeftClick();
            if(e.which !== 1)
                return;
            
            down.call(this);
        });
        
        $(document).on("touchend."+this.GUID, function(e){
            up.call(this);
            resetTouchEnd();
        });
        $(document).on("mouseup."+this.GUID, function(e){
            $("#" + thisClass.GUID + "-table input.origselect").select();
            up.call(this);
        });
        
        $(document).on("touchmove."+this.GUID, function(e){
            var touch = e.touches[e.touches.length - 1];
            move(touch.pageX, touch.pageY);
        });
        $(document).on("mousemove."+this.GUID, function(e){
            move(e.pageX, e.pageY);
        });

        function getCopyData() {
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

            return copyData;
        }

        function pasteData(x,y,data,special) {
            $.each(data.split("\n"), function(yIndex, val) {
                var yPos = y + yIndex;
                if(yPos > thisClass.YResolution - 1)
                    return;
                $.each(val.split("\t"), function(xIndex, val) {
                    var xPos = x + xIndex;
                    if(xPos > thisClass.XResolution - 1)
                        return;

                    var v = parseFloat(val);

                    switch(special)
                    {
                        case "add":
                            thisClass.Value[xPos + yPos * thisClass.XResolution] += v;
                            break;
                        case "subtract":
                            thisClass.Value[xPos + yPos * thisClass.XResolution] -= v;
                            break;
                        case "multiply":
                            thisClass.Value[xPos + yPos * thisClass.XResolution] *= v;
                            break;
                        case "multiply%":
                            thisClass.Value[xPos + yPos * thisClass.XResolution] *= 1 + (v/100);
                            break;
                        case "multiply%/2":
                            thisClass.Value[xPos + yPos * thisClass.XResolution] *= 1 + (v/200);
                            break;
                        case "average":
                            thisClass.Value[xPos + yPos * thisClass.XResolution] += v;
                            thisClass.Value[xPos + yPos * thisClass.XResolution] /= 2;
                            break;
                        default:
                            thisClass.Value[xPos + yPos * thisClass.XResolution] = v;
                            break;
                    }
                    var cell = $("#" + thisClass.GUID + "-table input[data-x='" + xPos + "'][data-y='" + yPos + "']");
                    cell.val(thisClass.Value[xPos + yPos * thisClass.XResolution]);
                    cell.addClass("selected");
                });
            });
        }

        $(document).on("copy."+this.GUID, "#" + this.GUID + "-table input", function(e){
            if($(this).data("x") === undefined || parseInt($(this).data("x")) < 0 || $(this).data("y") === undefined || parseInt($(this).data("y")) < 0)
                return;

            selecting = false;
            e.originalEvent.clipboardData.setData('text/plain', getCopyData());
            e.preventDefault();
        });

        $(document).on("paste."+this.GUID, "#" + this.GUID + "-table input", function(e){
            if($(this).data("x") === undefined || parseInt($(this).data("x")) < 0 || $(this).data("y") === undefined || parseInt($(this).data("y")) < 0)
                return;
            var val = e.originalEvent.clipboardData.getData('text/plain');

            var selectedCell = $("#" + thisClass.GUID + "-table input.origselect")
            var x = selectedCell.data("x");
            var y = selectedCell.data("y");
            if(x < 0 || y < 0)
                return;

            pasteData(x,y,val,pastetype);
            console.log(thisClass.GUID);

            selecting = false;
            e.preventDefault();
        });
    }

    GetHtml() {
        return "<div id=\"" + this.GUID + "\">" + 
                    "<label for=\"" + this.GUID + "-edit\">" + this.Label + ":</label><input id=\"" + this.GUID + "-edit\" type=\"button\" class=\"button\" value=\"Edit Table\"></input>" + 
                    "<div id=\""+this.GUID + "-dialog\" style=\"display: none;\"><div style=\"display:block;\">" + GetPasteOptions() + "<div style=\"display:inline-block; position: relative;\"><div style=\"width: 100; position: absolute; top: -10; left: 32px;z-index:1\">Modify</div><div class=\"configContainer\">" + 
                    "<div id=\""+this.GUID + "-equal\" class=\"w3-padding-tiny w3-bar-item w3-button\"><h3 style=\"padding:0px; margin:0px;\">&nbsp;=&nbsp;</h3></div>" +
                    "<div id=\""+this.GUID + "-add\" class=\"w3-padding-tiny w3-bar-item w3-button\"><h3 style=\"padding:0px; margin:0px;\">&nbsp;+&nbsp;</h3></div>" +
                    "<div id=\""+this.GUID + "-multiply\" class=\"w3-padding-tiny w3-bar-item w3-button\"><h3 style=\"padding:0px; margin:0px;\">&nbsp;x&nbsp;</h3></div>" +
                    "<input id=\""+this.GUID + "-modifyvalue\" type=\"number\"></input>" +
                    "</div></div></div>" + this.GetTable() + "</div>" +
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
                            row += "<td class=\"xaxis\"><input id=\"" + this.GUID + "-" + x + "-axis\" data-x=\"" + x + "\" data-y=\"" + y + "\" type=\"number\" " + ((x === 0 && this.MinXModifiable) || (x === this.XResolution - 1 && this.MaxXModifiable)? "" : "disabled") + " value=\"" + (parseFloat(parseFloat(((this.MaxX - this.MinX) * x / (this.XResolution-1) + this.MinX).toFixed(6)).toPrecision(7))) + "\"/></td>";
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
                            row += "<td class=\"yaxis\"><input id=\"" + this.GUID + "-axis-" + y + "\"  data-x=\"" + x + "\" data-y=\"" + y + "\" type=\"number\" " + ((y === 0 && this.MinYModifiable) || (y === this.YResolution - 1 && this.MaxYModifiable)? "" : "disabled") + " value=\"" + (parseFloat(parseFloat(((this.MaxY - this.MinY) * y / (this.YResolution-1) + this.MinY).toFixed(6)).toPrecision(7))) + "\"/></td>";
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

var pastetype = "equal";

function AttachPasteOptions() {
    DetachPasteOptions();
    $(document).on("click.pasteoptions", "#pasteoptions .w3-button", function(){
        pastetype = $(this).data("pastetype");
        $("#pasteoptions div").removeClass("active");
        $("#pasteoptions div[data-pastetype=\"" + pastetype + "\"").addClass("active");
    });
}

function DetachPasteOptions() {
    $(document).off("click.pasteoptions");
}

function GetPasteOptions() {
    var ret = "<div style=\"display:inline-block; position: relative;\"><div style=\"width: 150; position: absolute; top: -10; left: 32px;z-index:1\">Paste Options</div><div id=\"pasteoptions\" class=\"configContainer\">";
    ret += "<div data-pastetype=\"equal\"       class=\"w3-padding-tiny w3-bar-item w3-button" + (pastetype=="equal"? " active" : "") +         "\" style=\"position: relative;\"><h3 style=\"padding:0px; margin:0px;\">📋</h3><span style=\"padding:0px; margin:0px; color: #d03333; position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);\">=</span></div>";
    ret += "<div data-pastetype=\"add\"         class=\"w3-padding-tiny w3-bar-item w3-button" + (pastetype=="add"? " active" : "") +           "\" style=\"position: relative;\"><h3 style=\"padding:0px; margin:0px;\">📋</h3><span style=\"padding:0px; margin:0px; color: #d03333; position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);\">+</span></div>";
    ret += "<div data-pastetype=\"subtract\"    class=\"w3-padding-tiny w3-bar-item w3-button" + (pastetype=="subtract"? " active" : "") +      "\" style=\"position: relative;\"><h3 style=\"padding:0px; margin:0px;\">📋</h3><span style=\"padding:0px; margin:0px; color: #d03333; position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);\">-</span></div>";
    ret += "<div data-pastetype=\"multiply\"    class=\"w3-padding-tiny w3-bar-item w3-button" + (pastetype=="multiply"? " active" : "") +      "\" style=\"position: relative;\"><h3 style=\"padding:0px; margin:0px;\">📋</h3><span style=\"padding:0px; margin:0px; color: #d03333; position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);\">x</span></div>";
    ret += "<div data-pastetype=\"multiply%\"   class=\"w3-padding-tiny w3-bar-item w3-button" + (pastetype=="multiply%"? " active" : "") +     "\" style=\"position: relative;\"><h3 style=\"padding:0px; margin:0px;\">📋</h3><span style=\"padding:0px; margin:0px; color: #d03333; position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);\">%</span></div>";
    ret += "<div data-pastetype=\"multiply%/2\" class=\"w3-padding-tiny w3-bar-item w3-button" + (pastetype=="multiply%/2"? " active" : "") +   "\" style=\"position: relative;\"><h3 style=\"padding:0px; margin:0px;\">📋</h3><span style=\"padding:0px; margin:0px; color: #d03333; position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);\"><sup>%</sup>&frasl;<sub>2</sub></span></div>";
    ret += "</div></div>"

    return ret;
}

document.addEventListener("dragstart", function(e){
    if($(e.target).hasClass("selected") || $(e.target).hasClass("row_expand") || $(e.target).hasClass("col_expand"))
        e.preventDefault();
});//disable dragging of selected items