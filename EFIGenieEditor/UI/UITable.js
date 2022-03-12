export default class UITable extends HTMLDivElement {
    #xLabelElement = document.createElement(`div`);
    #xLabel = undefined;
    get xLabel() {
        return this.#xLabel;
    }
    set xLabel(xLabel) {
        if(this.#xLabel === xLabel)
            return;
        this.#xLabel = xLabel;
        this.#xLabelElement.innerHTML = ``;
        if(xLabel !== undefined)
            this.#xLabelElement.append(xLabel);
    }

    #yLabelElement = document.createElement(`div`);
    #yLabel = undefined;
    get yLabel() {
        return this.#yLabel;
    }
    set yLabel(yLabel) {
        if(this.#yLabel === yLabel)
            return;
        this.#yLabel = yLabel;
        this.#yLabelElement.innerHTML = ``;
        if(yLabel !== undefined)
            this.#yLabelElement.append(yLabel);
    }

    #zLabelElement = document.createElement(`div`);
    #zLabel = undefined;
    get zLabel() {
        return this.#zLabel;
    }
    set zLabel(zLabel) {
        if(this.#zLabel === zLabel)
            return;
        this.#zLabel = zLabel;
        this.#zLabelElement.innerHTML = ``;
        if(zLabel !== undefined)
            this.#zLabelElement.append(zLabel);
    }

    get value() {
        return [...this.#valueElement.children].map(x => x.dataset.value);
    }
    set value(value) {
        if(value === undefined)
            return;
        if(value.length !== this.xResolution * this.yResolution)
            throw `Value length does not match table length. Set xResolution and yResolution before setting value`;
        for(let i = 0; i < this.#valueElement.children.length; i++) {
            this.#valueElement.children[i].dataset.value = parseFloat(value[i]);
        }
    }

    #resolutionChanged() {
        this.#valueElement.style.setProperty('--xresolution', this.xResolution);
        for(let i = this.xResolution * this.yResolution; i < this.#valueElement.children.length; i++) { this.#valueElement.removeChild(this.#valueElement.children[i]); }
        for(let i = 0; i < this.xResolution * this.yResolution; i++) { 
            const valueElement = this.#valueElement.children[i] ?? this.#valueElement.appendChild(document.createElement(`div`));
            valueElement.dataset.x = i % this.xResolution;
            valueElement.dataset.x = parseInt(i/this.yResolution);
            valueElement.dataset.value ??= 0;
        }
    }

    get xResolution() {
        return this.#xAxisElement.children.length;
    }
    set xResolution(xResolution) {
        if(xResolution === this.xResolution)
            return;

        for(let i = xResolution; i < this.#xAxisElement.children.length; i++) { this.#xAxisElement.removeChild(this.#xAxisElement.children[i]); }
        for(let i = this.#xAxisElement.children.length; i < xResolution; i++) { 
            const xAxisElement = this.#xAxisElement.appendChild(document.createElement(`div`)); 
            const xAxisMinus1 = this.#xAxisElement.children[i-1]?.dataset?.value;
            const xAxisMinus2 = this.#xAxisElement.children[i-2]?.dataset?.value;
            let xAxisMinus0 = 0;
            if(xAxisMinus1 !== undefined && xAxisMinus2 !== undefined)
                xAxisMinus0 = xAxisMinus1 + (xAxisMinus1 - xAxisMinus2);
            xAxisElement.dataset.value = xAxisMinus0;
            xAxisElement.dataset.x = i;
        }
        this.#resolutionChanged();
        //interpolation
        this.#buildTableElement();
    }

    get yResolution() {
        return this.#yAxisElement.children.length;
    }
    set yResolution(yResolution) {
        if(yResolution === this.yResolution)
            return;
        for(let i = yResolution; i < this.#yAxisElement.children.length; i++) { this.#yAxisElement.removeChild(this.#yAxisElement.children[i]); }
        for(let i = this.#yAxisElement.children.length; i < yResolution; i++) { 
            const yAxisElement = this.#yAxisElement.appendChild(document.createElement(`div`)); 
            const yAxisMinus1 = this.#yAxisElement.children[i-1]?.dataset?.value;
            const yAxisMinus2 = this.#yAxisElement.children[i-2]?.dataset?.value;
            let yAxisMinus0 = 0;
            if(yAxisMinus1 !== undefined && yAxisMinus2 !== undefined)
                yAxisMinus0 = yAxisMinus1 + (yAxisMinus1 - yAxisMinus2);
            yAxisElement.dataset.value = yAxisMinus0;
            yAxisElement.dataset.y = i;
        }
        this.#resolutionChanged();
        //interpolation
        this.#buildTableElement();
    }

    #xAxisElement = document.createElement(`div`);
    get xAxis() {
        return [...this.#xAxisElement.children].map(x => x.dataset.value);
    }
    set xAxis(xAxis) {
        this.xResolution = xAxis.length;
        const thisClass = this;
        xAxis.forEach(function(xAxisValue, xAxisIndex) { thisClass.#xAxisElement.children[xAxisIndex].dataset.value = xAxisValue; });
        //interpolation
    }
    
    #yAxisElement = document.createElement(`div`);
    get yAxis() {
        return [...this.#yAxisElement.children].map(x => x.dataset.value);
    }
    set yAxis(yAxis) {
        this.yResolution = yAxis.length;
        const thisClass = this;
        yAxis.forEach(function(yAxisValue, yAxisIndex) { thisClass.#yAxisElement.children[yAxisIndex].dataset.value = yAxisValue; });
        //interpolation
    }

    #valueElement = document.createElement(`div`);

    #tableElement = document.createElement(`table`);
    #buildTableElement() {
        this.#tableElement.innerHTML = ``;
        const xResolution = this.#xAxisElement.children.length;
        const yResolution = this.#yAxisElement.children.length;
        //row 0
        if(xResolution > 1 && yResolution > 1) {
            const row0          = this.#tableElement.appendChild(document.createElement(`tr`));
            const xLabelBlank   = row0.appendChild(document.createElement(`td`));
            xLabelBlank.colSpan = 3;
            const xLabelTd      = row0.appendChild(document.createElement(`td`));
            xLabelTd.class      = `xtrans`;
            xLabelTd.append(this.#xLabelElement);
        }
        //row1
        const row1 = this.#tableElement.appendChild(document.createElement(`tr`));
        if(xResolution > 1) {
            const xzAxisLabel   = row1.appendChild(document.createElement(`td`));
            xzAxisLabel.class   = `xztrans`;
            if(yResolution > 1) {
                xzAxisLabel.colSpan = 3;
                xzAxisLabel.append(this.#zLabelElement);
            } else {
                xzAxisLabel.append(this.#xLabelElement);
            }
            const xAxis = row1.appendChild(document.createElement(`td`));
            xAxis.append(this.#xAxisElement);
        } else if (yResolution > 1) {
            const ylabel        = row1.appendChild(document.createElement(`td`));
            yAxislabel.append(this.#yLabelElement);
            const zlabel        = row1.appendChild(document.createElement(`td`));
            zAxislabel.append(this.#zLabelElement);
        }
        //row2
        const row2 = this.#tableElement.appendChild(document.createElement(`tr`));
        if (yResolution > 1) {
            if(xResolution > 1) {
                row2.appendChild(document.createElement(`td`));//auto width to take up zlabel slack
                const yAxisLabel = row2.appendChild(document.createElement(`td`));
                yAxisLabel.class = `ytrans`;
                yAxisLabel.append(this.#yLabelElement);
            }
            const yAxis = row2.appendChild(document.createElement(`td`));
            yAxis.append(this.#yAxisElement)
        } else if (xResolution > 1) {
            const xAxisLabel    = row2.appendChild(document.createElement(`td`));
            xAxisLabel.class    = `xztrans`
            xAxisLabel.append(this.#xLabelElement);
        }
        const value = row2.appendChild(document.createElement(`td`));
        value.append(this.#valueElement);
    }

    onChange = [];
    constructor(prop) {
        super();
        this.style.display = `inline-block`;
        this.append(this.#tableElement);
        this.#xLabelElement.class = `xlabel`;
        this.#yLabelElement.class = `ylabel`;
        this.#zLabelElement.class = `zlabel`;
        this.#xAxisElement.class  = `xAxis`;
        this.#yAxisElement.class  = `yAxis`;
        this.#valueElement.class  = `value`;
        this.#tableElement.class  = `numerictable`;
        const propValue = prop.value;
        delete prop.value;
        Object.assign(this, prop);
        this.value = propValue;
        if(!Array.isArray(this.onChange))
            this.onChange = [ this.onChange ];
        this.#buildTableElement();
    }

    static #formatNumberForDisplay(number, precision = 6) {
        var ret = parseFloat(parseFloat(parseFloat(number).toFixed(precision -1)).toPrecision(precision));
        if(isNaN(ret))
            return `&nbsp;`;
        return ret;
    }
}
customElements.define('ui-table', UITable, { extends: 'div' });
// class TableOld {
//     XAxisModifiable = true;
//     YAxisModifiable = true;
//     XResolutionModifiable = true;
//     YResolutionModifiable = true;
//     onChange = [];
//     ReverseY = false;

//     _table3DDisplayWidth=800; 
//     _table3DDisplayHeight=450;
//     _table3DZoom=1;
  
//     _table3DtransformPrecalc=[];
//     _table3DOffsetX = 0;
//     _table3DOffsetY = 0
//     _table3DPitch = 0;
//     get Table3DPitch() {
//       return this._table3DPitch
//     }
//     set Table3DPitch(pitch) {
//       if(pitch === this._table3DPitch)
//         return;
//       this._table3DPitch = pitch;
//       var cosA=Math.cos(this._table3DPitch * (Math.PI / 180));
//       var sinA=Math.sin(this._table3DPitch * (Math.PI / 180));
//       var cosB=Math.cos(this._table3DYaw * (Math.PI / 180));
//       var sinB=Math.sin(this._table3DYaw * (Math.PI / 180));
//       this._table3DtransformPrecalc[0]=cosB;
//       this._table3DtransformPrecalc[1]=0;
//       this._table3DtransformPrecalc[2]=sinB;
//       this._table3DtransformPrecalc[3]=sinA*sinB;
//       this._table3DtransformPrecalc[4]=cosA;
//       this._table3DtransformPrecalc[5]=-sinA*cosB;
//       this._table3DtransformPrecalc[6]=-sinB*cosA;
//       this._table3DtransformPrecalc[7]=sinA;
//       this._table3DtransformPrecalc[8]=cosA*cosB;
//     }
//     _table3DYaw = 0;
//     get Table3DYaw() {
//       return this._table3DYaw
//     }
//     set Table3DYaw(yaw) {
//       if(yaw === this._table3DYaw)
//         return;
//       this._table3DYaw = yaw;
//       var cosA=Math.cos(this._table3DPitch * (Math.PI / 180));
//       var sinA=Math.sin(this._table3DPitch * (Math.PI / 180));
//       var cosB=Math.cos(this._table3DYaw * (Math.PI / 180));
//       var sinB=Math.sin(this._table3DYaw * (Math.PI / 180));
//       this._table3DtransformPrecalc[0]=cosB;
//       this._table3DtransformPrecalc[1]=0;
//       this._table3DtransformPrecalc[2]=sinB;
//       this._table3DtransformPrecalc[3]=sinA*sinB;
//       this._table3DtransformPrecalc[4]=cosA;
//       this._table3DtransformPrecalc[5]=-sinA*cosB;
//       this._table3DtransformPrecalc[6]=-sinB*cosA;
//       this._table3DtransformPrecalc[7]=sinA;
//       this._table3DtransformPrecalc[8]=cosA*cosB;
//     }
//     _transformPoint(point){
//         let x=this._table3DtransformPrecalc[0]*point[0]+this._table3DtransformPrecalc[1]*point[1]+this._table3DtransformPrecalc[2]*point[2];
//         let y=this._table3DtransformPrecalc[3]*point[0]+this._table3DtransformPrecalc[4]*point[1]+this._table3DtransformPrecalc[5]*point[2];
//         let z=this._table3DtransformPrecalc[6]*point[0]+this._table3DtransformPrecalc[7]*point[1]+this._table3DtransformPrecalc[8]*point[2];
//         return [x,y,z];
//     };

//     _value = [0];
//     get Value() {
//         return this._value;
//     }
//     set Value(value) {
//         this._value = value;
//         for(let i=0; i<this._value.length; i++) {
//             this._value[i] = parseFloat(this._value[i]);
//         }
//         this.UpdateHtml();
//     }

//     _onChange() {
//         this.UpdateSvgHtml();
//         const thisClass = this;
//         $(`#${this.GUID}-table .number`).each(function() {
//             const cellx = parseInt($(this).attr(`data-x`));
//             const celly = parseInt($(this).attr(`data-y`));
//             const index = cellx + celly * thisClass._xResolution;
//             if(!isNaN(index) && cellx > -1 && celly > -1) {
//                 $(this).parent().attr(`style`, `background-color: hsl(${thisClass._getHueFromValue(thisClass._value[index])},100%,50%);`);
//             }
//         });
//         this.onChange.forEach(function(onChange) { onChange(); });
//     }

//     _trailXY = [];
//     TrailTime = 2000;
//     Trail(x, y = 0, z) {
//         const thisClass = this;
//         this._trailXY.unshift([x, y]);
//         setTimeout(function() {
//             thisClass._trailXY.pop();
//             thisClass.UpdateTrailHtml();
//         }, this.TrailTime);
//         this.UpdateTrailHtml();
//     }
    
//     constructor(GUID, copyObject){
//         this.GUID = GUID;
//         if(copyObject)
//             Object.assign(this, copyObject);
//         if(!Array.isArray(this.onChange))
//             this.onChange = [ this.onChange ];
//         this.Table3DPitch = 17;
//         this.Table3DYaw = 30;
//     }

//     Detach() {
//         $(document).off(`keypress.${this.GUID}`);
//         $(document).off(`blur.${this.GUID}`);
//         $(document).off(`change.${this.GUID}`);
//         $(document).off(`click.${this.GUID}`);
//         $(document).off(`mousedown.${this.GUID}`);
//         $(document).off(`mouseup.${this.GUID}`);
//         $(document).off(`mousemove.${this.GUID}`);
//         $(document).off(`copy.${this.GUID}`);
//         $(document).off(`paste.${this.GUID}`);
//         $(document).off(`contextmenu.${this.GUID}`);
//         $(document).off(`touchstart.${this.GUID}`);
//         $(document).off(`touchend.${this.GUID}`);
//         $(document).off(`touchmove.${this.GUID}`);
//         $(document).off(`mousedown.${this.GUID}-svg`);
//         $(document).off(`mouseup.${this.GUID}-svg`);
//         $(document).off(`mousemove.${this.GUID}-svg`);
//         $(document).off(`mousewheel.${this.GUID}-svg`);
//     }

//     Attach() {
//         this.Detach();
//         this._attachTable();
//         this._attachSvg();
//         this._attachModify();
//         this._attachInterpolate();
//     }

//     _attachTable() {
//         const thisClass = this;
//         $(document).on(`change.${this.GUID}`, `#${this.GUID}-yres`, function(e){
//             let val = parseInt($(e.target).val());
//             if(val > 1)
//                 thisClass.YResolution = parseInt($(e.target).val());
//             $(e.target).val(thisClass.YResolution);
//         });
//         $(document).on(`change.${this.GUID}`, `#${this.GUID}-xres`, function(e){
//             let val = parseInt($(e.target).val());
//             if(val > 1)
//                 thisClass.XResolution = parseInt($(e.target).val());
//             $(e.target).val(thisClass.XResolution);
//         });
//         $(document).on(`keypress.${this.GUID}`, `#${this.GUID}-table`, function(e){
//             //minus
//             if(e.which === 45) {
//                 e.preventDefault();
//                 $(`#${thisClass.GUID}-add`).hide();
//                 $(`#${thisClass.GUID}-subtract`).show();
//                 $(`#${thisClass.GUID}-modifyvalue`).select();
//                 $(`#${thisClass.GUID}-subtract`).addClass(`selected`);
//             }
//             //add
//             if(e.which === 43) {
//                 e.preventDefault();
//                 $(`#${thisClass.GUID}-modifyvalue`).select();
//                 $(`#${thisClass.GUID}-add`).addClass(`selected`);
//             }
//             //multiply
//             if(e.which === 42) {
//                 e.preventDefault();
//                 $(`#${thisClass.GUID}-modifyvalue`).select();
//                 $(`#${thisClass.GUID}-multiply`).addClass(`selected`);
//             }
//             //divide
//             if(e.which === 47) {
//                 e.preventDefault();
//                 $(`#${thisClass.GUID}-multiply`).hide();
//                 $(`#${thisClass.GUID}-divide`).show();
//                 $(`#${thisClass.GUID}-modifyvalue`).select();
//                 $(`#${thisClass.GUID}-divide`).addClass(`selected`);
//             }
//             if(e.which === 61) {
//                 $(`#${thisClass.GUID}-modifyvalue`).select();
//                 $(`#${thisClass.GUID}-equal`).addClass(`selected`);
//                 e.preventDefault();
//             }
//         });
//         $(document).on(`change.${this.GUID}`, `#${this.GUID}-table`, function(e){
//             var x = parseInt($(e.target).attr(`data-x`));
//             var y = parseInt($(e.target).attr(`data-y`));
//             var value = parseFloat($(e.target).val());
//             if(isNaN(value))
//                 return;
            
//             if(x === -1) {
//                 thisClass.YAxis[y] = value;
//                 for(let ya=y; ya<thisClass._yResolution; ya++) {
//                     if(thisClass.YAxis[ya] < value) {
//                         thisClass.YAxis[ya] = value;
//                         $(`#${thisClass.GUID}-table .number[data-y='${ya}'][data-x='-1']`).html(Table._formatNumberForDisplay(value));
//                     }
//                 }
//                 for(let ya=y; ya>=0; ya--) {
//                     if(thisClass.YAxis[ya] > value) {
//                         thisClass.YAxis[ya] = value;
//                         $(`#${thisClass.GUID}-table .number[data-y='${ya}'][data-x='-1']`).html(Table._formatNumberForDisplay(value));
//                     }
//                 }
//             } else if(y === -1) {
//                 thisClass.XAxis[x] = value;
//                 for(let xa=x; xa<thisClass._xResolution; xa++) {
//                     if(thisClass.XAxis[xa] < value) {
//                         thisClass.XAxis[xa] = value;
//                         $(`#${thisClass.GUID}-table .number[data-x='${xa}'][data-y='-1']`).html(Table._formatNumberForDisplay(value));
//                     }
//                 }
//                 for(let xa=x; xa>=0; xa--) {
//                     if(thisClass.XAxis[xa] > value) {
//                         thisClass.XAxis[xa] = value;
//                         $(`#${thisClass.GUID}-table .number[data-x='${xa}'][data-y='-1']`).html(Table._formatNumberForDisplay(value));
//                     }
//                 }
//             } else {
//                 let operation = `equal`;
//                 if(value - Table._formatNumberForDisplay(thisClass._value[x + thisClass._xResolution * y]) === 1)
//                     operation = `increment`;
//                 if(Table._formatNumberForDisplay(thisClass._value[x + thisClass._xResolution * y]) - value === 1)
//                     operation = `decrement`;
//                 $.each($(`#${thisClass.GUID}-table .number.selected`), function(index, cell) {
//                     const cellx = parseInt($(cell).attr(`data-x`));
//                     const celly = parseInt($(cell).attr(`data-y`));
//                     index = cellx + celly * thisClass._xResolution;
//                     if(operation === `increment`)
//                         thisClass._value[index]++;
//                     else if(operation === `decrement`)
//                         thisClass._value[index]--;
//                     else
//                         thisClass._value[index] = value;
//                     if(cellx !== x || celly !== y) {
//                         $(cell).html(Table._formatNumberForDisplay(thisClass._value[index]));
//                     }
//                 });
//             }
//             thisClass._onChange();
//         });

//         var dragX = false;
//         var dragY = false;
//         var pointX;
//         var pointY;

//         $(document).on(`mousedown.${this.GUID}`, `#${this.GUID}-table .rowcol_expand`, function(e){
//             dragY = true;
//             dragX = true;
//             $(`#overlay`).addClass(`rowcol_expand`);
//             $(`#overlay`).show();
//             $(document).on(`mousemove.${thisClass.GUID}`, function(e){
//                 move(e.pageX, e.pageY);
//             });
//         });

//         $(document).on(`mousedown.${this.GUID}`, `#${this.GUID}-table .col_expand`, function(e){
//             dragX = true;
//             $(`#overlay`).addClass(`col_expand`);
//             $(`#overlay`).show();
//             $(document).on(`mousemove.${thisClass.GUID}`, function(e){
//                 move(e.pageX, e.pageY);
//             });
//         });

//         $(document).on(`mousedown.${this.GUID}`, `#${this.GUID}-table .row_expand`, function(e){
//             dragY = true;
//             $(`#overlay`).addClass(`row_expand`);
//             $(`#overlay`).show();
//             $(document).on(`mousemove.${thisClass.GUID}`, function(e){
//                 move(e.pageX, e.pageY);
//             });
//         });

//         function down() {
//             $(document).on(`touchmove.${thisClass.GUID}`, function(e){
//                 var touch = e.touches[e.touches.length - 1];
//                 move(touch.pageX, touch.pageY);
//             });
//             $(document).on(`mousemove.${thisClass.GUID}`, function(e){
//                 move(e.pageX, e.pageY);
//             });

//             const downElement = $(this);

//             downElement.focus();
//             $(`#${thisClass.GUID}-table .origselect`).each(function(index, cell) { 
//                 cell=$(cell);
//                 if(cell.attr(`data-x`) === downElement.attr(`data-x`) && cell.attr(`data-y`) === downElement.attr(`data-y`))
//                     return;
//                 cell.removeClass(`selected`);
//                 cell.removeClass(`origselect`);
//                 cell.parent().replaceWith(thisClass._formatNumberForDisplay(cell.attr(`id`)));
//             });
//             $(`#${thisClass.GUID}-tablesvg g path`).removeClass(`selected`);
//             $(`#${thisClass.GUID}-tablesvg g circle`).removeClass(`selected`);
//             $(`#${thisClass.GUID}-table .number`).removeClass(`selected`).removeClass(`origselect`);

//             downElement.addClass(`selected`);
//             downElement.addClass(`origselect`);

//             let x = parseInt(downElement.attr(`data-x`));
//             let y = parseInt(downElement.attr(`data-y`));

//             if(x === undefined || y === undefined)
//                 return;

//             x = parseInt(x);
//             y = parseInt(y);

//             thisClass._selecting = true;
//             thisClass._minSelectX = x;
//             thisClass._minSelectY = y;
//             thisClass._maxSelectX = x;
//             thisClass._maxSelectY = y;
//             let circleSelector = $(`#${thisClass.GUID}-tablesvg g circle[data-x='${x}'][data-y='${y}']`);
//             circleSelector.addClass(`selected`);

//             pointX =  downElement.offset().left - downElement.closest(`table`).offset()?.left;
//             pointY =  downElement.offset().top - downElement.closest(`table`).offset()?.top;
//         }

//         function up() {
//             $(document).off(`touchmove.${thisClass.GUID}`);
//             $(document).off(`mousemove.${thisClass.GUID}`);

//             thisClass._selecting = false;
//             $(`#${thisClass.GUID}-table .origselect`).each(function(index, cell) { 
//                 cell=$(cell);
//                 if(cell.is(`:input`))
//                     return;
//                 cell.parent().replaceWith(thisClass._formatNumberForDisplay(cell.attr(`id`)));
//                 $(`#${thisClass.GUID}-table .origselect`).select();
//             });
//             dragX = false;
//             dragY = false;
//             $(`#overlay`).removeClass(`col_expand`);
//             $(`#overlay`).removeClass(`row_expand`);
//             $(`#overlay`).removeClass(`rowcol_expand`);
//             $(`#overlay`).hide();
//         }

//         var selectOnMove = false;
//         function move(pageX, pageY) {
//             var tableElement = $(`#${thisClass.GUID}-table`);
//             const tableOffset = tableElement.offset();
//             if(dragX) {
//                 var cellElement = $(`#${thisClass.GUID}-${thisClass._xResolution - 1}-axis`);
//                 var relX = pageX - tableOffset.left;
//                 var elX = cellElement.offset().left - tableOffset.left;
//                 var comp = relX - elX;
//                 if(comp > (cellElement.width() * 3/2))
//                     thisClass.XResolution += 1;
//                 if(comp < 0 && thisClass._xResolution > 2)
//                     thisClass.XResolution -= 1;
//             }
//             if(dragY) {
//                 var cellElement = $(`#${thisClass.GUID}-axis-${thisClass._yResolution - 1}`);
//                 var relY = pageY - tableOffset.top;
//                 var elY = cellElement.offset().top - tableOffset.top;
//                 var comp = relY - elY;
//                 if(comp > (cellElement.height() * 3/2))
//                     thisClass.YResolution += 1;
//                 if(comp < 0 && thisClass._yResolution > 2)
//                     thisClass.YResolution-= 1;
//             }
//             if(thisClass._selecting || selectOnMove){
//                 thisClass._minSelectX = thisClass._xResolution;
//                 thisClass._minSelectY = thisClass._yResolution;
//                 thisClass._maxSelectX = 0;
//                 thisClass._maxSelectY = 0;
//                 let loopNumbers = `#${thisClass.GUID}-table .number`;
//                 if(parseInt($(`#${thisClass.GUID}-table .origselect`).attr(`data-x`)) === -1)
//                     loopNumbers += `[data-x=-1]`;
//                 if(parseInt($(`#${thisClass.GUID}-table .origselect`).attr(`data-y`)) === -1)
//                     loopNumbers += `[data-y=-1]`;
//                 $.each($(loopNumbers), function(index, cell) {
//                     var cellElement = $(cell);
//                     let x = parseInt(cellElement.attr(`data-x`));
//                     let y = parseInt(cellElement.attr(`data-y`));
//                     if(x === undefined || y === undefined)
//                         return;

//                     x = parseInt(x);
//                     y = parseInt(y);
        
//                     const cellOffset = cellElement.offset();
//                     const relX = pageX - tableOffset.left;
//                     const elX = cellOffset.left - tableOffset.left;
//                     const relY = pageY - tableOffset.top;
//                     const elY = cellOffset.top - tableOffset.top;
//                     if(((elX <= relX && elX >= pointX) || (elX >= (relX - cellElement.width()) && elX <= pointX) || (pointX == cellOffset.left - tableOffset.left)) &&
//                         ((elY <= relY && elY >= pointY) || (elY >= (relY - cellElement.height()) && elY <= pointY) || (pointY == cellOffset.top - tableOffset.top))) {
//                         if(thisClass._selecting) {
//                             if(x < thisClass._minSelectX)
//                                 thisClass._minSelectX = x;
//                             if(x > thisClass._maxSelectX)
//                                 thisClass._maxSelectX = x;
//                             if(y < thisClass._minSelectY)
//                                 thisClass._minSelectY = y;
//                             if(y > thisClass._maxSelectY)
//                                 thisClass._maxSelectY = y;
//                             cellElement.addClass(`selected`);
//                         }
//                         else if (selectOnMove && !cellElement.hasClass(`origselect`)) {
//                             selectOnMove = false;
//                             thisClass._selecting = true;
//                         }
//                     } else if(thisClass._selecting) {
//                         cellElement.removeClass(`selected`);
//                     }
//                 });
//                 $(`#${thisClass.GUID}-tablesvg g path`).removeClass(`selected`)
//                 for(let x=thisClass._minSelectX; x<thisClass._maxSelectX; x++) {
//                     for(let y=thisClass._minSelectY; y<thisClass._maxSelectY; y++) {
//                         $(`#${thisClass.GUID}-tablesvg g path[data-x='${x}'][data-y='${y}']`).addClass(`selected`);
//                     }
//                 }
//                 $(`#${thisClass.GUID}-tablesvg g circle`).removeClass(`selected`);
//                 for(let x=thisClass._minSelectX; x<thisClass._maxSelectX+1; x++) {
//                     for(let y=thisClass._minSelectY; y<thisClass._maxSelectY+1; y++) {
//                         $(`#${thisClass.GUID}-tablesvg g circle[data-x='${x}'][data-y='${y}']`).addClass(`selected`);
//                     }
//                 }
//             }
//         }

//         $(document).on(`contextmenu.${this.GUID}`, `#${this.GUID}-table .number`, function(e){
//             down.call(this);
//             e.preventDefault();
//         });
//         $(document).on(`mousedown.${this.GUID}`, `#${this.GUID}-table div.number`, function(e){
//             if(e.which === 3) {
//                 down.call(this);
//                 $(`#${$(this).attr(`id`)}`).select();
//                 up.call(this);
//                 e.preventDefault();
//             } else if(e.which == 1) {
//                 down.call(this);
//             }
//         });
        
//         $(document).on(`touchend.${this.GUID}`, function(e){
//             up.call(this);
//         });
//         $(document).on(`mouseup.${this.GUID}`, function(e){
//             up.call(this);
//         });

//         function getCopyData() {
//             var copyData = ``;

//             for(var y = -1; y < thisClass._yResolution; y++){
//                 var rowSelected = false
//                 for(var x = -1; x < thisClass._xResolution; x++){
//                     let numberSelector = $(`#${thisClass.GUID}-table .number[data-x='${x}'][data-y='${y}']`);
//                     if(numberSelector.hasClass(`selected`)){
//                         if(rowSelected){
//                             copyData += `\t`;
//                         }
//                         let value = ``;
//                         if(x > -1 && y > -1)
//                             value = thisClass._value[x + y * thisClass._xResolution];
//                         else if(x === -1)
//                             value = thisClass.YAxis[y];
//                         else if(y === -1)
//                             value = thisClass.XAxis[x];
//                         else
//                             value = numberSelector.val() ?? numberSelector.html();
//                         copyData += value;
//                         rowSelected = true;
//                     }
//                 }
//                 if(rowSelected){
//                     copyData += `\n`;
//                 }
//             }

//             if(copyData.length > 0){
//                 copyData = copyData.substring(0, copyData.length -1);//remove last new line
//             }

//             return copyData;
//         }

//         function pasteData(x,y,data,special) {
//             thisClass._minSelectX = x;
//             thisClass._minSelectY = y;
//             thisClass._maxSelectX = x + data.split(`\n`).length;
//             $.each(data.split(`\n`), function(yIndex, val) {
//                 thisClass._maxSelectY = y + val.split(`\t`).length;
//                 var yPos = y + yIndex;
//                 if(yPos > thisClass._yResolution - 1)
//                     return;
//                 $.each(val.split(`\t`), function(xIndex, val) {
//                     var xPos = x + xIndex;
//                     if(xPos > thisClass._xResolution - 1)
//                         return;

//                     var v = parseFloat(val);

//                     let numberSelector = $(`#${thisClass.GUID}-table .number[data-x='${xPos}'][data-y='${yPos}']`);
//                     let newValue;
//                     if(xPos > -1 && yPos > -1)
//                         newValue = thisClass._value[xPos + yPos * thisClass._xResolution];
//                     else if(xPos === -1)
//                         newValue = thisClass.YAxis[yPos];
//                     else if(yPos === -1)
//                         newValue = thisClass.XAxis[xPos];
//                     else
//                         newValue = numberSelector.val() ?? numberSelector.html();

//                     switch(special)
//                     {
//                         case `add`:
//                             newValue += v;
//                             break;
//                         case `subtract`:
//                             newValue -= v;
//                             break;
//                         case `multiply`:
//                             newValue *= v;
//                             break;
//                         case `multiply%`:
//                             newValue *= 1 + (v/100);
//                             break;
//                         case `multiply%/2`:
//                             newValue *= 1 + (v/200);
//                             break;
//                         case `average`:
//                             newValue += v;
//                             newValue /= 2;
//                             break;
//                         default:
//                             newValue = v;
//                             break;
//                     }

//                     if(xPos > -1 && yPos > -1)
//                         thisClass._value[xPos + yPos * thisClass._xResolution] = newValue;
//                     else if(xPos === -1)
//                         thisClass.YAxis[yPos] = newValue;
//                     else if(yPos === -1)
//                         thisClass.XAxis[xPos] = newValue;

//                     numberSelector.addClass(`selected`);
//                     const id = numberSelector.attr(`id`);
//                     numberSelector.parent().replaceWith(thisClass._formatNumberForDisplay(id, xPos, yPos, newValue));
//                     $(`#${id}`).select();
//                 });
//             });
//             thisClass._onChange();
//         }

//         $(document).on(`copy.${this.GUID}`, `#${this.GUID}-table .number`, function(e){
//             if($(this).attr(`data-x`) === undefined || $(this).attr(`data-y`) === undefined )
//                 return;

//             thisClass._selecting = false;
//             e.originalEvent.clipboardData.setData(`text/plain`, getCopyData());
//             e.preventDefault();
//         });

//         $(document).on(`paste.${this.GUID}`, `#${this.GUID}-table .number`, function(e){
//             if($(this).attr(`data-x`) === undefined || $(this).attr(`data-y`) === undefined)
//                 return;
//             var val = e.originalEvent.clipboardData.getData(`text/plain`);
//             const lines = val.split(`\n`).length;
//             const cols = val.split(`\t`).length;
//             if(parseInt($(this).attr(`data-x`)) < 0 && cols > 1)
//                 return;
//             if(parseInt($(this).attr(`data-y`)) < 0 && lines > 1)
//                 return;

//             var selectedCell = $(`#${thisClass.GUID}-table .number.origselect`)
//             var x = parseInt(selectedCell.attr(`data-x`));
//             var y = parseInt(selectedCell.attr(`data-y`));
//             if(x < 0 && cols > 1)
//                 return;
//             if(y < 0 && lines > 1)
//                 return;

//             pasteData(x,y,val,pastetype);

//             if(x < 0){
//                 $(`#${thisClass.GUID}-table .number[data-x='-1'][data-y='${y}']`).trigger(`change`);

//                 const cell = $(`#${thisClass.GUID}-table .number[data-x='-1'][data-y='${y+lines-1}']`);
//                 cell.addClass(`origselect`);
//                 cell.parent().replaceWith(thisClass._formatNumberForDisplay(cell.attr(`id`), -1, y+lines-1));
//                 $(`#${thisClass.GUID}-table .number[data-x='-1'][data-y='${y+lines-1}']`).trigger(`change`);
//             }
//             if(y < 0){
//                 $(`#${thisClass.GUID}-table .number[data-y='-1'][data-x='${x}']`).trigger(`change`);

//                 const cell = $(`#${thisClass.GUID}-table .number[data-y='-1'][data-x='${x+cols-1}']`);
//                 cell.addClass(`origselect`);
//                 cell.parent().replaceWith(thisClass._formatNumberForDisplay(cell.attr(`id`), x+cols-1, -1));
//                 $(`#${thisClass.GUID}-table .number[data-y='-1'][data-x='${x+cols-1}']`).trigger(`change`);
//             }

//             thisClass._selecting = false;
//             e.preventDefault();
//         });
//     }

//     _attachSvg() {
//         const thisClass = this;
//         let move3d = false;
//         let drag = false;
//         let dragValue = false;
//         $(document).on(`mousedown.${this.GUID}-svg`, `#${this.GUID}-tablesvg g`, function(e){
//             var relX = e.pageX - $(this).closest(`svg`).offset().left;
//             var relY = e.pageY - $(this).closest(`svg`).offset().top;
//             let circles = thisClass.svg.filter(x => x.circle).reverse();
//             let closestCircle = undefined;
//             circles.forEach(function(element, index) {
//                 let l = element.circle.cx - relX;
//                 let w = element.circle.cy - relY;
//                 element.dist = Math.sqrt(l*l+w*w);
//                 if(closestCircle === undefined || element.dist < closestCircle.dist)
//                     closestCircle = element;
//             });
//             const axis = thisClass._yResolution < 2? thisClass.XAxis : thisClass.YAxis;
//             if(closestCircle && e.which === 1) {
//                 let x = closestCircle.x;
//                 let y = closestCircle.y;
//                 thisClass._minSelectX = x;
//                 thisClass._minSelectY = y;
//                 thisClass._maxSelectX = x;
//                 thisClass._maxSelectY = y;
//                 index = x + thisClass._xResolution * y;
//                 dragValue=[
//                     e.pageY,
//                     x,
//                     y,
//                     thisClass._value[index],
//                     (thisClass._valueMax - thisClass._valueMin) / (thisClass._table3DDisplayHeight-thisClass._padding2D*2-thisClass._valueOffset2D), 
//                     `#${thisClass.GUID}-tablesvg g circle[data-x='${x}'][data-y='${y}']`, 
//                     e.pageX,
//                     (axis[axis.length - 1] - axis[0]) / (thisClass._table3DDisplayWidth-thisClass._padding2D*2-thisClass._axisOffset2D), 
//                     axis[index],
//                     thisClass._xResolution < 2 || thisClass._yResolution < 2? `#${thisClass.GUID}-table .number${thisClass.XAxis === axis? `[data-x='${x}'][data-y='-1']` : `[data-x='-1'][data-y='${y}']`}` : undefined];
//                 $(`#${thisClass.GUID}-tablesvg g path`).removeClass(`selected`);
//                 $(`#${thisClass.GUID}-tablesvg g circle`).removeClass(`selected`);
//                 $(`#${thisClass.GUID}-table .origselect`).each(function(index, cell) { 
//                     cell=$(cell);
//                     cell.removeClass(`selected`);
//                     cell.removeClass(`origselect`);
//                     cell.parent().replaceWith(thisClass._formatNumberForDisplay(cell.attr(`id`)));
//                 });
//                 $(`#${thisClass.GUID}-table .number`).removeClass(`selected`).removeClass(`origselect`);
//                 var cell = $(`#${thisClass.GUID}-table .number[data-x='${x}'][data-y='${y}']`);
//                 cell.addClass(`selected`).addClass(`origselect`);
//                 cell.parent().replaceWith(thisClass._formatNumberForDisplay(cell.attr(`id`), x, y, thisClass._value[index]));
//                 $(dragValue[9]).addClass(`origselect`);
//                 let closestCircleSelector = $(dragValue[5]);
//                 closestCircleSelector.addClass(`selected`);
//             } else if(thisClass._xResolution > 1 && thisClass._yResolution > 1) {
//                 if(e.which === 2) {
//                     move3d=[e.pageX,e.pageY,thisClass._table3DOffsetX,thisClass._table3DOffsetY];
//                     e.preventDefault();
//                 } else if(e.which === 3) {
//                     drag=[e.pageX,e.pageY,thisClass.Table3DYaw,thisClass.Table3DPitch];
//                     e.preventDefault();
//                 }
//             }

//             if((closestCircle && e.which === 1) || ((e.which === 2 || e.which === 3) && thisClass._xResolution > 1 && thisClass._yResolution > 1)) {
//                 $(document).on(`mousemove.${thisClass.GUID}-svg`, function(e){
//                     if(drag){          
//                         const yaw=drag[2]-(e.pageX-drag[0]);
//                         let pitch=drag[3]+(e.pageY-drag[1]);
//                         pitch=Math.max(-90,Math.min(90,pitch));
//                         if(yaw === thisClass.Table3DYaw && pitch === thisClass.Table3DPitch)
//                             return;
//                         thisClass.Table3DYaw = yaw;
//                         thisClass.Table3DPitch = pitch;
//                         thisClass.UpdateSvgHtml(true);
//                     } else if(move3d) {
//                         const xdiff=e.pageX-move3d[0];
//                         const ydiff=e.pageY-move3d[1];
//                         thisClass._table3DOffsetX = move3d[2] + xdiff;
//                         thisClass._table3DOffsetY = move3d[3] + ydiff;
//                         thisClass.UpdateSvgHtml(true);
//                     }else if(dragValue) {
//                         const xdiff=e.pageX-dragValue[6];
//                         const xmag=dragValue[7];
//                         const diff = dragValue[0] - e.pageY;
//                         let mag = dragValue[4]
//                         const index = dragValue[1] + thisClass._xResolution * dragValue[2];
//                         let value = thisClass._value[index] = dragValue[3] + diff * mag;
//                         if(thisClass._xResolution > 1 && thisClass._yResolution > 1) {
//                             mag = thisClass._table3DDisplayHeight / 2;
//                             value = mag * (0.5 - (value - thisClass._valueMin) / (thisClass._valueMax - thisClass._valueMin));
//                             const xMin = thisClass.XAxis[0];
//                             const xMag = thisClass.XAxis[thisClass._xResolution-1] - xMin;
//                             const yMin = thisClass.YAxis[0];
//                             const yMag = thisClass.YAxis[thisClass._yResolution-1] - yMin;
//                             let point = thisClass._transformPoint([
//                                 (thisClass.XAxis[dragValue[1]]-xMin-xMag/2)/(xMag*2)*thisClass._table3DDisplayWidth*thisClass._table3DZoom, 
//                                 value*thisClass._table3DZoom, 
//                                 (thisClass.ReverseY? 1 : -1) * (thisClass.YAxis[dragValue[2]]-yMin-yMag/2)/(yMag*2)*thisClass._table3DDisplayWidth*thisClass._table3DZoom
//                             ]);
//                             $(dragValue[5]).attr(`cy`, point[1]+thisClass._table3DDisplayHeight/2+thisClass._table3DOffsetY);
//                         } else {
//                             axis[index] = dragValue[8] + xdiff * xmag;
//                             $(dragValue[9]).html(Table._formatNumberForDisplay(axis[index]));
//                             thisClass.UpdateSvgHtml();
//                         }
//                         var cell = $(`#${thisClass.GUID}-table .number[data-x='${dragValue[1]}'][data-y='${dragValue[2]}']`);
//                         cell.val(Table._formatNumberForDisplay(thisClass._value[index]));
//                     }
//                 });
//                 $(document).on(`mouseup.${thisClass.GUID}-svg`,function(){
//                     drag=false;
//                     if(dragValue) {
//                         $(dragValue[9]).trigger(`change`);
//                         thisClass._onChange();
//                     } else {
//                         thisClass.UpdateSvgHtml();
//                     }
//                     dragValue = false;
//                     move3d = false
//                     $(document).off(`mouseup.${thisClass.GUID}-svg`);
//                     $(document).off(`mousemove.${thisClass.GUID}-svg`);
//                 });
//             }
//         });
//         document.addEventListener('wheel', function(e){
//             if( thisClass._xResolution < 2 || thisClass._yResolution < 2)
//                 return;

//             if($(e.target).parents(`#${thisClass.GUID}-tablesvg`).length > 0) {
//                 if(e.wheelDelta /120 > 0) {
//                     thisClass._table3DZoom *= 1.01;
//                 }
//                 else{
//                     thisClass._table3DZoom *= 0.99;
//                 }
//                 thisClass.UpdateSvgHtml();
//                 e.preventDefault();
//                 e.stopPropagation()
//                 return false;
//             }
//         }, {passive: false});
//     }

//     _attachModify() {
//         const thisClass = this;
//         $(document).on(`blur.${this.GUID}`, `#${this.GUID}-modifyvalue`, function(){
//             $(`#${thisClass.GUID}-add`).show();
//             $(`#${thisClass.GUID}-subtract`).hide();
//             $(`#${thisClass.GUID}-multiply`).show();
//             $(`#${thisClass.GUID}-divide`).hide();
//             $(`#${thisClass.GUID}-add`).removeClass(`selected`);
//             $(`#${thisClass.GUID}-subtract`).removeClass(`selected`);
//             $(`#${thisClass.GUID}-multiply`).removeClass(`selected`);
//             $(`#${thisClass.GUID}-divide`).removeClass(`selected`);
//             $(`#${thisClass.GUID}-equal`).removeClass(`selected`);
//         });
//         $(document).on(`keypress.${this.GUID}`, `#${this.GUID}-modifyvalue`, function(e){
//             if(e.which !== 13)
//                 return;
//             if($(`#${thisClass.GUID}-add`).hasClass(`selected`))
//                 $(`#${thisClass.GUID}-add`).trigger(`click`);
//             if($(`#${thisClass.GUID}-subtract`).hasClass(`selected`))
//                 $(`#${thisClass.GUID}-subtract`).trigger(`click`);
//             if($(`#${thisClass.GUID}-multiply`).hasClass(`selected`))
//                 $(`#${thisClass.GUID}-multiply`).trigger(`click`);
//             if($(`#${thisClass.GUID}-divide`).hasClass(`selected`))
//                 $(`#${thisClass.GUID}-divide`).trigger(`click`);
//             if($(`#${thisClass.GUID}-equal`).hasClass(`selected`))
//                 $(`#${thisClass.GUID}-equal`).trigger(`click`);
//             $(`#${thisClass.GUID}-modifyvalue`).blur();
//             $(`#${thisClass.GUID}-table .origselect`).select();
//         });
//         $(document).on(`click.${this.GUID}`, `#${this.GUID}-equal`, function(){
//             var value = parseFloat($(`#${thisClass.GUID}-modifyvalue`).val());
//             if(isNaN(value))
//                 return;
//             $.each($(`#${thisClass.GUID}-table .number.selected`), function(index, cell) {
//                 const id = $(cell).attr(`id`);
//                 const cellx = parseInt($(cell).attr(`data-x`));
//                 const celly = parseInt($(cell).attr(`data-y`));
//                 if(cellx > -1 && celly > -1) {
//                     index = cellx + celly * thisClass._xResolution;
//                     thisClass._value[index] = value;
//                     $(cell).parent().replaceWith(thisClass._formatNumberForDisplay(id, cellx, celly, thisClass._value[index]));
//                 }
//             });
//             thisClass._onChange();
//         });
//         $(document).on(`click.${this.GUID}`, `#${this.GUID}-add`, function(){
//             var value = parseFloat($(`#${thisClass.GUID}-modifyvalue`).val());
//             if(isNaN(value))
//                 return;
//             $.each($(`#${thisClass.GUID}-table .number.selected`), function(index, cell) {
//                 const id = $(cell).attr(`id`);
//                 const cellx = parseInt($(cell).attr(`data-x`));
//                 const celly = parseInt($(cell).attr(`data-y`));
//                 if(cellx > -1 && celly > -1) {
//                     index = cellx + celly * thisClass._xResolution;
//                     thisClass._value[index] += value;
//                     $(cell).parent().replaceWith(thisClass._formatNumberForDisplay(id, cellx, celly, thisClass._value[index]));
//                 }
//             });
//             thisClass._onChange();
//         });
//         $(document).on(`click.${this.GUID}`, `#${this.GUID}-subtract`, function(){
//             var value = parseFloat($(`#${thisClass.GUID}-modifyvalue`).val());
//             if(isNaN(value))
//                 return;
//             $.each($(`#${thisClass.GUID}-table .number.selected`), function(index, cell) {
//                 const id = $(cell).attr(`id`);
//                 const cellx = parseInt($(cell).attr(`data-x`));
//                 const celly = parseInt($(cell).attr(`data-y`));
//                 if(cellx > -1 && celly > -1) {
//                     index = cellx + celly * thisClass._xResolution;
//                     thisClass._value[index] -= value;
//                     $(cell).parent().replaceWith(thisClass._formatNumberForDisplay(id, cellx, celly, thisClass._value[index]));
//                 }
//             });
//             thisClass._onChange();
//         });
//         $(document).on(`click.${this.GUID}`, `#${this.GUID}-multiply`, function(){
//             var value = parseFloat($(`#${thisClass.GUID}-modifyvalue`).val());
//             if(isNaN(value))
//                 return;
//             $.each($(`#${thisClass.GUID}-table .number.selected`), function(index, cell) {
//                 const id = $(cell).attr(`id`);
//                 const cellx = parseInt($(cell).attr(`data-x`));
//                 const celly = parseInt($(cell).attr(`data-y`));
//                 if(cellx > -1 && celly > -1) {
//                     index = cellx + celly * thisClass._xResolution;
//                     thisClass._value[index] *= value;
//                     $(cell).parent().replaceWith(thisClass._formatNumberForDisplay(id, cellx, celly, thisClass._value[index]));
//                 }
//             });
//             thisClass._onChange();
//         });
//         $(document).on(`click.${this.GUID}`, `#${this.GUID}-divide`, function(){
//             var value = parseFloat($(`#${thisClass.GUID}-modifyvalue`).val());
//             if(isNaN(value))
//                 return;
//             $.each($(`#${thisClass.GUID}-table .number.selected`), function(index, cell) {
//                 const id = $(cell).attr(`id`);
//                 const cellx = parseInt($(cell).attr(`data-x`));
//                 const celly = parseInt($(cell).attr(`data-y`));
//                 if(cellx > -1 && celly > -1) {
//                     index = cellx + celly * thisClass._xResolution;
//                     thisClass._value[index] /= value;
//                     $(cell).parent().replaceWith(thisClass._formatNumberForDisplay(id, cellx, celly, thisClass._value[index]));
//                 }
//             });
//             thisClass._onChange();
//         });
//     }

//     _attachInterpolate() {
//         const thisClass = this;
//         $(document).on(`click.${this.GUID}`, `#${this.GUID}-interpolatexy`, function(){
//             const selected = $(`#${thisClass.GUID}-table .number.selected`);
//             if(selected.length === 0)
//                 return
//             let xMin = 10000000000;
//             let xMax = -10000000000;
//             let yMin = 10000000000;
//             let yMax = -10000000000;
//             $.each(selected, function(index, cell) {
//                 const cellx = parseInt($(cell).attr(`data-x`));
//                 const celly = parseInt($(cell).attr(`data-y`));
//                 if(cellx < xMin)
//                     xMin = cellx;
//                 if(cellx > xMax)
//                     xMax = cellx;
//                 if(celly < yMin)
//                     yMin = celly;
//                 if(celly > yMax)
//                     yMax = celly;
//             });
//             $.each(selected, function(index, cell) {
//                 const id = $(cell).attr(`id`);
//                 const cellx = parseInt($(cell).attr(`data-x`));
//                 const celly = parseInt($(cell).attr(`data-y`));
//                 if(cellx > -1 && celly > -1) {
//                     const xMinVal = thisClass._value[xMin + celly * thisClass._xResolution];
//                     const yMinVal = thisClass._value[cellx + yMin * thisClass._xResolution];
//                     const xMag = (thisClass._value[xMax + celly * thisClass._xResolution] - xMinVal) / (thisClass.XAxis[xMax] - thisClass.XAxis[xMin]);
//                     const yMag = (thisClass._value[cellx + yMax * thisClass._xResolution] - yMinVal) / (thisClass.YAxis[yMax] - thisClass.YAxis[yMin]);
//                     let value = xMinVal + xMag * (thisClass.XAxis[cellx]-thisClass.XAxis[xMin]) + yMinVal + yMag * (thisClass.YAxis[celly]-thisClass.YAxis[yMin])
//                     value /= 2;
//                     index = cellx + celly * thisClass._xResolution;
//                     thisClass._value[index] = value;
//                     $(cell).parent().replaceWith(thisClass._formatNumberForDisplay(id, cellx, celly, thisClass._value[index]));
//                 }
//             });
//             thisClass._onChange();
//         });
//         $(document).on(`click.${this.GUID}`, `#${this.GUID}-interpolatex`, function(){
//             const selected = $(`#${thisClass.GUID}-table .number.selected`);
//             if(selected.length === 0)
//                 return
//             let xMin = 10000000000;
//             let xMax = -10000000000;
//             $.each(selected, function(index, cell) {
//                 const cellx = parseInt($(cell).attr(`data-x`));
//                 if(cellx < xMin)
//                     xMin = cellx;
//                 if(cellx > xMax)
//                     xMax = cellx;
//             });
//             $.each(selected, function(index, cell) {
//                 const id = $(cell).attr(`id`);
//                 const cellx = parseInt($(cell).attr(`data-x`));
//                 const celly = parseInt($(cell).attr(`data-y`));
//                 if(cellx === xMin || cellx === xMax)
//                     return;
//                 if(cellx > -1 && celly > -1) {
//                     const xMinVal = thisClass._value[xMin + celly * thisClass._xResolution];
//                     const xMag = (thisClass._value[xMax + celly * thisClass._xResolution] - xMinVal) / (thisClass.XAxis[xMax] - thisClass.XAxis[xMin]);
//                     let value = xMinVal + xMag * (thisClass.XAxis[cellx]-thisClass.XAxis[xMin]);
//                     index = cellx + celly * thisClass._xResolution;
//                     thisClass._value[index] = value;
//                     $(cell).parent().replaceWith(thisClass._formatNumberForDisplay(id, cellx, celly, thisClass._value[index]));
//                 }
//             });
//             thisClass._onChange();
//         });
//         $(document).on(`click.${this.GUID}`, `#${this.GUID}-interpolatey`, function(){
//             const selected = $(`#${thisClass.GUID}-table .number.selected`);
//             if(selected.length === 0)
//                 return
//             let yMin = 10000000000;
//             let yMax = -10000000000;
//             $.each(selected, function(index, cell) {
//                 const celly = parseInt($(cell).attr(`data-y`));
//                 if(celly < yMin)
//                     yMin = celly;
//                 if(celly > yMax)
//                     yMax = celly;
//             });
//             $.each(selected, function(index, cell) {
//                 const id = $(cell).attr(`id`);
//                 const cellx = parseInt($(cell).attr(`data-x`));
//                 const celly = parseInt($(cell).attr(`data-y`));
//                 if(celly === yMin || celly === yMax)
//                     return;
//                 if(cellx > -1 && celly > -1) {
//                     const yMinVal = thisClass._value[cellx + yMin * thisClass._xResolution];
//                     const yMag = (thisClass._value[cellx + yMax * thisClass._xResolution] - yMinVal) / (thisClass.YAxis[yMax] - thisClass.YAxis[yMin]);
//                     let value = yMinVal + yMag * (thisClass.YAxis[celly]-thisClass.YAxis[yMin])
//                     index = cellx + celly * thisClass._xResolution;
//                     thisClass._value[index] = value;
//                     $(cell).parent().replaceWith(thisClass._formatNumberForDisplay(id, cellx, celly, thisClass._value[index]));
//                 }
//             });
//             thisClass._onChange();
//         });
//     }

//     GetHtml() {
//         return `<div id="${this.GUID}"${this._hidden? ` style="display: none;"` : ``} class="configtable"> 
//     ${this.GetSvgHtml()}
//     <div style="display: flex; flex-direction: row; flex-wrap: wrap; justify-content:space-between">
//         <div>
//             ${this.XResolutionModifiable || this.YResolutionModifiable? `<div style="display:inline-block; position: relative;">
//                 <div style="width: 100; position: absolute; top: -10; left: ${this.XResolutionModifiable && this.YResolutionModifiable? `32` : `0`}px;z-index:1">Table Size</div>
//                 <div class="container">
//                     ${this.XResolutionModifiable? `<input id="${this.GUID}-xres" class="xres" type="number" value="${this._xResolution}"></input>` : ``}
//                     ${this.XResolutionModifiable && this.YResolutionModifiable? `X` : ``}
//                     ${this.YResolutionModifiable? `<input id="${this.GUID}-yres" class="xres" type="number" value="${this._yResolution}"></input>` : ``}
//                 </div>
//             </div>` : ``}
//             ${GetPasteOptions()}
//         </div>
//         <div>
//             <div style="display:inline-block; position: relative;">
//                 <div style="width: 100; position: absolute; top: -10; left: 32px;z-index:1">Modify</div>
//                 <div class="container">
//                     <input id="${this.GUID}-modifyvalue" class="modify-value" type="number"></input>
//                     <div id="${this.GUID}-equal" class="modify-button"><h3>&nbsp;=&nbsp;</h3></div>
//                     <div id="${this.GUID}-add" class="modify-button"><h3>&nbsp;+&nbsp;</h3></div>
//                     <div id="${this.GUID}-subtract" style="display: none;" class="modify-button"><h3>&nbsp;-&nbsp;</h3></div>
//                     <div id="${this.GUID}-multiply" class="modify-button"><h3>&nbsp;x&nbsp;</h3></div>
//                     <div id="${this.GUID}-divide" style="display: none;" class="modify-button"><h3>&nbsp;÷&nbsp;</h3></div>
//                 </div>
//             </div>
//             <div style="display:inline-block; position: relative;">
//                 ${this._xResolution > 1 && this._yResolution > 1? `<div style="width: 100; position: absolute; top: -10; left: 32px;z-index:1">Interpolate</div>` : ``}
//                 <div class="container">
//                     ${this._xResolution > 1? `<div id="${this.GUID}-interpolatex" class="modify-button interpolate-x-button"><h3>&nbsp;☰&nbsp;</h3></div>` : ``}
//                     ${this._yResolution > 1? `<div id="${this.GUID}-interpolatey" class="modify-button interpolate-y-button"><h3>&nbsp;☰&nbsp;</h3></div>` : ``}
//                     ${this._xResolution > 1 && this._yResolution > 1? `<div id="${this.GUID}-interpolatexy" class="modify-button interpolate-xy-button"><h3>&nbsp;&#9632;&nbsp;</h3></div>` : ``}
//                 </div>
//             </div>
//         </div>
//     </div>
//     <div style="display: flex; justify-content: center;">
//         <div>${this.GetTrailHtml()}
//         ${this.GetTableHtml()}</div>
//     </div>
// </div>`;
//     }

//     UpdateHtml() {
//         $(`#${this.GUID}`).replaceWith(this.GetHtml());
//     }
  
//     GetSvgHtml(){
//         if(this._xResolution > 1 && this._yResolution > 1) {
//             this._calculateSvg3D();
//         } else {
//             this._calculateSvg2D();
//         }

//         let html = ``;

//         for(let i = 0; i < this.svg.length; i++) {
//             let svg = this.svg[i];
//             if(svg?.line && !isNaN(svg.line.x1) && !isNaN(svg.line.y1) && !isNaN(svg.line.x2) && !isNaN(svg.line.y2)) {
//                 html += Table._getSvgLineHtml(svg);
//             }
//         }

//         for(let i = 0; i < this.svg.length; i++) {
//             let svg = this.svg[i];
//             if(svg?.text) {
//                 html += `<text x="${svg.text.x}" y="${svg.text.y}"`+
//                     (svg.text.alignmentbaseline !== undefined? ` alignment-baseline="${svg.text.alignmentbaseline}"` : ``)+
//                     (svg.text.anchor !== undefined? ` text-anchor="${svg.text.anchor}"` : ``)+
//                     (svg.text.size !== undefined? ` font-size="${svg.text.size}"` : ``)+
//                     (svg.text.transform !== undefined? ` transform="${svg.text.transform}"` : ``)+
//                     (svg.hue !== undefined? ` style="fill:hsl(${svg.hue},60%,50%);"` : (svg.color !== undefined? ` style="fill:${svg.color};"` : ``))+
//                     ` transform-origin="${svg.text.x} ${svg.text.y}">${svg.text.text}</text>`;
//             }
//         }

//         for(let i = 0; i < this.svg.length; i++) {
//             let svg = this.svg[i];
//             if(svg?.path) {
//                 let pathSelected = this._minSelectX !== undefined && svg.x >= this._minSelectX && svg.x < this._maxSelectX && svg.y >= this._minSelectY && svg.y < this._maxSelectY;
//                 html += `<path${pathSelected? ` class="selected"` : ``} data-x="${svg.x}" data-y="${svg.y}" d="${svg.path}"${svg.hue !== undefined? ` style="fill:hsla(${svg.hue},60%,50%,90%);"` : (svg.color !== undefined? ` style="fill:${svg.color};"` : ``)}></path>`;
//             }
//         }

//         for(let i = 0; i < this.svg.length; i++) {
//             let svg = this.svg[i];
//             if(svg?.circle) {
//                 let pointSelected = this._minSelectX !== undefined && svg.x >= this._minSelectX && svg.x <= this._maxSelectX && svg.y >= this._minSelectY && svg.y <= this._maxSelectY;
//                 html += `<circle${pointSelected? ` class="selected"` : ``} data-x="${svg.x}" data-y="${svg.y}" cx="${svg.circle.cx}" cy="${svg.circle.cy}" r="${svg.circle.r}" ${svg.hue !== undefined? ` style="fill:hsl(${svg.hue},60%,50%);"` : (svg.color !== undefined? ` style="fill:${svg.color};"` : ``)}></circle>`;
//             }
//         }

//         return `<svg${this._xResolution > 1 && this._yResolution > 1? ` class="hidecircles"` : ``} overflow="visible" id="${this.GUID}-tablesvg" height="${this._table3DDisplayHeight}" width="${this._table3DDisplayWidth}"><g oncontextmenu="return false;">${html}</g></svg>`;
//     };

//     static _getSvgLineHtml(line) {
//         return `<line x1="${line.line.x1}" y1="${line.line.y1}" x2="${line.line.x2}" y2="${line.line.y2}"${line.hue !== undefined? ` style="stroke:hsl(${line.hue},100%,50%);"` : (line.color !== undefined? ` style="stroke:${line.color};"` : ``)}></line>`;
//     }

//     UpdateSvgHtml(drag){
//         if(this._xResolution > 1 && this._yResolution > 1) {
//             this._calculateSvg3D();
//         } else {
//             this._calculateSvg2D();
//         }
//         const thisClass = this;
//         const lines = this.svg.filter(x => x.line);
//         const lineSelector = $(`#${this.GUID}-tablesvg g line`);
//         if(lines.length !== lineSelector.length)
//             return $(`#${this.GUID}-tablesvg`).replaceWith(this.GetSvgHtml());
//         const texts = this.svg.filter(x => x.text);
//         const paths = this.svg.filter(x => x.path);
//         const circles = this.svg.filter(x => x.circle);
//         const textSelector = $(`#${this.GUID}-tablesvg g text`);
//         const pathSelector = $(`#${this.GUID}-tablesvg g path`);
//         const circleSelector = $(`#${this.GUID}-tablesvg g circle${drag? `:visible` : ``}`)
//         lines.forEach(function(line, index) {
//             const t = $(lineSelector[index]);
//             t.attr(`x1`, line.line.x1)
//                 .attr(`y1`, line.line.y1)
//                 .attr(`x2`, line.line.x2)
//                 .attr(`y2`, line.line.y2)
//                 .attr(`style`, line.hue !== undefined? `stroke:hsl(${line.hue},60%,50%);` : `stroke:${line.color};`);
//             if(line.hue === undefined && line.color === undefined)
//                 t.removeAttr(`style`);
//         });
//         textSelector.each(function(index) {
//             const t = $(this);
//             t.attr(`x`, texts[index].text.x)
//                 .attr(`y`, texts[index].text.y)
//                 .attr(`alignment-baseline`, texts[index].text.alignmentbaseline)
//                 .attr(`text-anchor`, texts[index].text.anchor)
//                 .attr(`style`, texts[index].hue !== undefined? `fill:hsl(${texts[index].hue},60%,50%)` : `fill:${texts[index].color};`)
//                 .attr(`font-size`, texts[index].text.size)
//                 .attr(`transform`, texts[index].text.transform)
//                 .attr(`transform-origin`, `${texts[index].text.x} ${texts[index].text.y}`)
//                 .html(texts[index].text.text);
//             if(texts[index].hue === undefined && texts[index].color === undefined)
//                 t.removeAttr(`style`);
//             if(texts[index].text.transform === undefined)
//                 t.removeAttr(`transform`);
//             if(texts[index].text.size === undefined)
//                 t.removeAttr(`font-size`);
//         });
//         pathSelector.each(function(index) { 
//             const pathSelected = thisClass._minSelectX !== undefined && paths[index].x >= thisClass._minSelectX && paths[index].x < thisClass._maxSelectX && paths[index].y >= thisClass._minSelectY && paths[index].y < thisClass._maxSelectY;
//             const t = $(this);
//             t.attr(`data-x`, paths[index].x)
//                 .attr(`data-y`, paths[index].y)
//                 .attr(`d`, paths[index].path)
//                 .attr(`style`, paths[index].hue !== undefined? `fill:hsl(${paths[index].hue},60%,50%,90%)` : `fill:${paths[index].color};`);
//             if(paths[index].hue === undefined && paths[index].color === undefined)
//                 t.removeAttr(`style`);

//             if(pathSelected) {
//                 t.attr(`class`, `selected`)
//             } else {
//                 t.removeAttr(`class`);
//             }
//         });
//         circleSelector.each(function(index) { 
//             const t = $(this);
//             let circle = circles[index];
//             if(drag) {
//                 let datax = parseInt(t.attr('data-x'));
//                 let datay = parseInt(t.attr('data-y'));
//                 circle = circles.filter(function(x) { return x.x === datax && x.y === datay; })[0];
//             }
//             const pointSelected = thisClass._minSelectX !== undefined && circle.x >= thisClass._minSelectX && circle.x <= thisClass._maxSelectX && circle.y >= thisClass._minSelectY && circle.y <= thisClass._maxSelectY;
//             t.attr(`data-x`, circle.x)
//                 .attr(`data-y`, circle.y)
//                 .attr(`cx`, circle.circle.cx)
//                 .attr(`cy`, circle.circle.cy)
//                 .attr(`r`, circle.circle.r)
//                 .attr(`style`, circle.hue !== undefined? `fill:hsl(${circle.hue},60%,50%)` : `fill:${circle.color};`);
//             if(circle.hue === undefined && circle.color === undefined)
//                 t.removeAttr(`style`);

//             if(pointSelected) {
//                 t.attr(`class`, `selected`)
//             } else {
//                 t.removeAttr(`class`);
//             }
//         });
//     }

//     GetTableHtml() {
//         this._calculateValueMinMax();
//         var row = ``;
//         var table = `<table id="${this.GUID}-table">`;

//         var xstart = -1;
//         var y = -1;
//         if(this._yResolution > 1 && this._xResolution > 1) {
//             xstart = -2;
//             y = -2;
//         }

//         while(true) {
//             var row = `<tr>`;
//             for(var x = xstart; x < this._xResolution + 1; x++) {
//                 if(y === -2){
//                     if(x == -2) {
//                         // X-X - - -
//                         // - - - - -
//                         // - - - - -
//                         // - - - - -
//                         // - - - - -
//                         row += `<td colspan="3"></td>`;
//                     } else if(x === 0){
//                         // - - X---X
//                         // - - - - -
//                         // - - - - -
//                         // - - - - -
//                         // - - - - -
//                         row += `<td colspan="${this._xResolution}" class="xaxislabel"><div class="xrot" id="${this.GUID}-xlabel">${this._xLabel}</div></td>`;
//                     }
//                 } else if(y === -1) {
//                     if(x === -2) {
//                     } else if(x === -1) {
//                         // - - - - -
//                         // - X - - -
//                         // - - - - -
//                         // - - - - -
//                         // - - - - -
//                         if(this._yResolution === 1) {
//                             row += `<td class="yaxis" id="${this.GUID}-xlabel">${this._xLabel}</td>`;
//                         } else if(this._xResolution === 1) {
//                             row += `<td class="xaxis" id="${this.GUID}-ylabel">${this._yLabel}</td>`;
//                         } else {
//                             row += `<td colspan="3" class="zlabel" id="${this.GUID}-zlabel">${this._zLabel}</td>`;
//                         }
//                     } else if(x === -2) {
//                     } else if(x < this._xResolution) {
//                         // - - - - -
//                         // - - X X X
//                         // - - - - -
//                         // - - - - -
//                         // - - - - -
//                         if(this._xResolution === 1) {
//                             row += `<td class="xaxis" id="${this.GUID}-zlabel">${this._zLabel}</td>`;
//                         } else {
//                             if(this.XAxisModifiable)
//                                 row += `<td class="xaxis">${this._formatNumberForDisplay(`${this.GUID}-${x}-axis`, x, y, this.XAxis[x])}</td>`;
//                             else
//                                 row += `<td class="xaxis"><div class="number" id="${this.GUID}-${x}-axis" data-x="${x}" data-y="${y}">${Table._formatNumberForDisplay(this.XAxis[x])}</div></td>`;
//                         }
//                     } else {
//                         if(this.XResolutionModifiable)
//                             row += `<td class="col_expand" rowspan="${this._yResolution + (xstart === -1? 2 : 1)}"></td>`;
//                     }
//                 } else if(y < this._yResolution) {
//                     if(x === -2) {
//                         if(y === (this.ReverseY? this._yResolution-1 : 0)){
//                             // - - - - -
//                             // - - - - -
//                             // X - - - -
//                             // | - - - -
//                             // X - - - -
//                             row += `<td rowspan="${this._yResolution}" style="width: auto;"></td><td rowspan="${this._yResolution}" class="yaxislabel"><div id="${this.GUID}-ylabel" class="yrot">${this._yLabel}</div></td>`;
//                         }
//                     } else if(x === -1) {
//                         // - - - - -
//                         // - - - - -
//                         // - X - - -
//                         // - X - - -
//                         // - X - - -
//                         if(this._yResolution === 1) {
//                             row += `<td class="yaxis" id="${this.GUID}-zlabel">${this._zLabel}</td>`;
//                         } else {
//                             if(this.YAxisModifiable)
//                                 row += `<td class="yaxis">${this._formatNumberForDisplay(`${this.GUID}-axis-${y}`, x, y, this.YAxis[y])}</td>`;
//                             else 
//                                 row += `<td class="yaxis"><div class="number" id="${this.GUID}-axis-${y}"  data-x="${x}" data-y="${y}">${Table._formatNumberForDisplay(this.YAxis[y])}</div></td>`;
//                         }
//                     } else if(x < this._xResolution) {
//                         // - - - - -
//                         // - - - - -
//                         // - - X X X
//                         // - - X X X
//                         // - - X X X
//                         var valuesIndex = x + this._xResolution * y;
//                         var inputId =  `${this.GUID}-${x}-${y}`;
//                         row += `<td>${this._formatNumberForDisplay(inputId, x, y, this._value[valuesIndex])}</td>`;
//                     }
//                 } else {
//                     if(this.YResolutionModifiable && x == xstart) {
//                         row += `<td colspan="2"></td><td class="row_expand" colspan="${this._xResolution - xstart-1}"></td>`;
//                         if(this.XResolutionModifiable)
//                             row += `<td class="rowcol_expand"></td>`;
//                     }
//                 }
//             }
//             row += `</tr>`;
//             table += row;

//             if(this.ReverseY) {
//                 if(y === -1)
//                     y += this._yResolution;
//                 else if(y === 0)
//                     y = this._yResolution;
//                 else if(y === this._yResolution)
//                     break;
//                 else if(y<0)
//                     y++;
//                 else
//                     y--;
//             } else {
//                 y++;
//                 if(y === this._yResolution + 1)
//                     break;
//             }
                
//         }

//         return table + `</table>`;
//     }

//     UpdateTableHtml() {
//         $(`#${this.GUID}-table`).replaceWith(this.GetTableHtml());
//     }

//     GetTrailHtml() {
//         let html = ``;

//         this._calculateSvgTrail();
//         for(let i = 0; i < this._trailSvg.length; i++) {
//             if(this._trailSvg[i].ellipse) {
//                 html += `<ellipse cx="${this._trailSvg[i].ellipse.x}" cy="${this._trailSvg[i].ellipse.y}" rx="${this._trailSvg[i].ellipse.rx}" ry="${this._trailSvg[i].ellipse.ry}" class="trail"></ellipse>`;
//             }
//             if(this._trailSvg[i].line) {
//                 html += `<line x1="${this._trailSvg[i].line.x1}" y1="${this._trailSvg[i].line.y1}" x2="${this._trailSvg[i].line.x2}" y2="${this._trailSvg[i].line.y2}" class="trail" stroke-width="1"></line>`
//             }
//         }

//         return `<svg style="position:absolute; pointer-events: none;" z-index="100" overflow="visible" id="${this.GUID}-trailsvg" height="60" width="100"><g>${html}</g></svg>`;
//     }
    
//     UpdateTrailHtml() {
//         if($(`#${this.GUID}-trailsvg`).is(":visible"))
//             $(`#${this.GUID}-trailsvg`).replaceWith(this.GetTrailHtml());
//     }

//     _dataSvg=[];
//     _xAxisSvg=[];
//     _yAxisSvg=[];
//     _padding2D = 25;
//     _axisOffset2D = 100;
//     _valueOffset2D = 25;
//     _calculateSvg2D() {
//         this._calculateValueMinMax();
//         this.svg=[];
//         const axis = this._yResolution < 2? this.XAxis : this.YAxis;
//         if(axis.length === 0)
//             return;
//         let axisMin = 10000000000;
//         let axisMax = -10000000000;
//         for(let i=0; i<axis.length; i++) {
//             let a = axis[i];
//             if(a < axisMin)
//                 axisMin = a;
//             if(a > axisMax)
//                 axisMax = a;
//         }
//         let valueaxis = new Array(parseInt(1.5+axis.length * this._table3DDisplayHeight/this._table3DDisplayWidth));
//         for(let i=0; i<valueaxis.length; i++) {
//             valueaxis[i] = i*(this._valueMax-this._valueMin)/(valueaxis.length-1) + this._valueMin;
//         }
//         const axisMag = (this._table3DDisplayWidth-this._axisOffset2D-this._padding2D*2) / (axisMax-axisMin);
//         const r = parseFloat((1/(axis.length*2)*this._table3DDisplayWidth/10).toFixed(10));
//         const valueMag = (this._table3DDisplayHeight-this._valueOffset2D-this._padding2D*2) / (this._valueMax-this._valueMin);

//         for(let i=0; i<axis.length; i++) {
//             if(this._value[i] === undefined)
//                 continue;

//             let x = this._yResolution < 2? i : 0;
//             let y = this._yResolution < 2? 0 : i;

//             this.svg[i+axis.length-1] ={
//                 circle: { 
//                     cx: parseFloat((this._axisOffset2D+this._padding2D+(parseFloat(axis[i])-axisMin) * axisMag).toFixed(10)), 
//                     cy: parseFloat(((this._table3DDisplayHeight-this._valueOffset2D-this._padding2D)-((parseFloat(this._value[i])-this._valueMin) * valueMag)).toFixed(10)), 
//                     r },
//                 x: x,
//                 y: y,
//                 midPointValue: this._value[i],
//                 hue: this._getHueFromValue(this._value[i])
//             };
//             if(i !== 0) {
//                 const midPointValue = (this._value[i] + this._value[i-1])/2
//                 this.svg[i-1] = {
//                     line: {
//                         x1: this.svg[i+axis.length-1].circle.cx, 
//                         y1: this.svg[i+axis.length-1].circle.cy,
//                         x2: this.svg[i+axis.length-2].circle.cx, 
//                         y2: this.svg[i+axis.length-2].circle.cy
//                     },
//                     midPointValue: midPointValue,
//                     hue: this._getHueFromValue(midPointValue)
//                 };
//             }
//         }
//         let axis0found = false;
//         for(let i=0; i<axis.length; i++) {
//             if(parseFloat(axis[i])===0)
//                 axis0found = true;
//             this.svg.unshift({
//                 line: {
//                     x1: parseFloat((this._axisOffset2D+this._padding2D+(parseFloat(axis[i])-axisMin) * axisMag).toFixed(10)), 
//                     y1: this._padding2D,
//                     x2: parseFloat((this._axisOffset2D+this._padding2D+(parseFloat(axis[i])-axisMin) * axisMag).toFixed(10)), 
//                     y2: this._table3DDisplayHeight-this._valueOffset2D-this._padding2D
//                 },
//                 color: parseFloat(axis[i])===0? undefined : `dimgrey`
//             });
//             this.svg.unshift({
//                 text: {
//                     x: this.svg[0].line.x2,
//                     y: this.svg[0].line.y2 + r,
//                     alignmentbaseline: `hanging`,
//                     text: Table._formatNumberForDisplay(axis[i])
//                 }
//             })
//         }
//         let value0found = false;
//         for(let i=0; i<valueaxis.length; i++) {
//             if(parseFloat(valueaxis[i])===0)
//                 value0found = true;
//             this.svg.unshift({
//                 line: {
//                     x1: this._axisOffset2D+this._padding2D,
//                     y1: this._table3DDisplayHeight-this._valueOffset2D-this._padding2D-parseFloat(((parseFloat(valueaxis[i])-this._valueMin) * valueMag).toFixed(10)),
//                     x2: this._table3DDisplayWidth-this._padding2D, 
//                     y2: this._table3DDisplayHeight-this._valueOffset2D-this._padding2D-parseFloat(((parseFloat(valueaxis[i])-this._valueMin) * valueMag).toFixed(10))
//                 },
//                 color: parseFloat(valueaxis[i])===0? undefined : `dimgrey`
//             });
//             this.svg.unshift({
//                 text: {
//                     x: this.svg[0].line.x1-r,
//                     y: this.svg[0].line.y1,
//                     alignmentbaseline: `middle`,
//                     anchor: `end`,
//                     text: Table._formatNumberForDisplay(valueaxis[i])
//                 }
//             })
//         }

//         //xy origin
//         if(axisMin <= 0 && axisMax >= 0 && !axis0found) {
//             this.svg.unshift({
//                 line: {
//                     x1: parseFloat((this._axisOffset2D+this._padding2D+(0-axisMin) * axisMag).toFixed(10)), 
//                     y1: this._padding2D,
//                     x2: parseFloat((this._axisOffset2D+this._padding2D+(0-axisMin) * axisMag).toFixed(10)), 
//                     y2: this._table3DDisplayHeight-this._valueOffset2D-this._padding2D
//                 }
//             });
//         }
//         let liney0 = this._table3DDisplayHeight-this._valueOffset2D-this._padding2D;
//         if(this._valueMin <= 0 && this._valueMax >= 0) liney0 = parseFloat(((liney0)-(0-this._valueMin) * valueMag).toFixed(10));
//         else if(this._valueMax < 0) liney0 = this._padding2D;
//         if(!value0found) {
//             this.svg.unshift({
//                 line: {
//                     x1: this._axisOffset2D+this._padding2D, 
//                     y1: liney0,
//                     x2: this._table3DDisplayWidth-this._padding2D, 
//                     y2: liney0
//                 }
//             });
//         }
//     }
//     _calculateSvg3D() {
//         this._calculateValueMinMax();
//         this.svg=[];
//         this._dataSvg.splice(this._xResolution);
//         const xMin = this.XAxis[0];
//         const xMag = this.XAxis[this._xResolution-1] - xMin;
//         const yMin = this.YAxis[0];
//         const yMag = this.YAxis[this._yResolution-1] - yMin;
//         const mag = this._table3DDisplayHeight / 2;
//         const textsize = (256/Math.max(this.XAxis.length, this.YAxis.length)) * this._table3DZoom;
//         let valueaxis = new Array(parseInt(1.5+Math.max(this.XAxis.length, this.YAxis.length) * this._table3DDisplayHeight/this._table3DDisplayWidth));
//         for(let i=0; i<valueaxis.length; i++) {
//             valueaxis[i] = i*(this._valueMax-this._valueMin)/(valueaxis.length-1) + this._valueMin;
//         }
//         for(let x=0;x<this._xResolution;x++){
//             let t = this._dataSvg[x];
//             if(!t) {
//                 t = [];
//                 this._dataSvg.push(t);
//             }
//             t.splice(this._yResolution);
//             for(let y=0;y<this._yResolution;y++){
//                 let valueY = this.ReverseY? y : (this.YResolution - y - 1);
//                 let value = this._value[x + this._xResolution * valueY];
//                 value = mag * (0.5 - (value - this._valueMin) / (this._valueMax - this._valueMin));
//                 t[y] = this._transformPoint([
//                     ((this.XAxis[x]-xMin-xMag/2)/(xMag*2))*this._table3DDisplayWidth*this._table3DZoom, 
//                     value*this._table3DZoom, 
//                     (this.ReverseY? 1 : -1) * ((this.YAxis[valueY]-yMin-yMag/2)/(yMag*2))*this._table3DDisplayWidth*this._table3DZoom
//                 ]);
//             }
//         }
//         this._xAxisSvg.splice(this._xResolution);
//         for(let x=0;x<this._xResolution;x++){
//             let t = this._xAxisSvg[x];
//             if(!t) {
//                 t = [];
//                 this._xAxisSvg.push(t);
//             }
//             for(let y=0;y<2;y++){
//                 t[y] = [];
//                 let vy = 0;
//                 if(y > 0)
//                     vy = this._yResolution - 1;
//                 let valueY = this.ReverseY? vy : (this.YResolution - vy - 1);

//                 const xMin = this.XAxis[0];
//                 const xMag = this.XAxis[this._xResolution-1] - xMin;
//                 const yMin = this.YAxis[0];
//                 const yMag = this.YAxis[this._yResolution-1] - yMin;
//                 for(let z=0;z<2;z++) {
//                     let value = this._valueMin;
//                     if(z > 0)
//                         value = this._valueMax;
//                     value = mag * (0.5 - (value - this._valueMin) / (this._valueMax - this._valueMin));
//                     t[y][z] = this._transformPoint([
//                         ((this.XAxis[x]-xMin-xMag/2)/(xMag*2))*this._table3DDisplayWidth*this._table3DZoom, 
//                         value*this._table3DZoom, 
//                         (this.ReverseY? 1 : -1) * ((this.YAxis[valueY]-yMin-yMag/2)/(yMag*2))*this._table3DDisplayWidth*this._table3DZoom
//                     ]);
//                 }
//             }
//         }
//         this._yAxisSvg.splice(this._yResolution);
//         for(let x=0;x<2;x++){
//             let t = this._yAxisSvg[x];
//             if(!t) {
//                 t = [];
//                 this._yAxisSvg.push(t);
//             }
//             let vx = 0;
//             if(x > 0)
//                 vx = this._xResolution - 1;
                
//             for(let y=0;y<this._yResolution;y++){
//                 t[y] = [];
//                 let valueY = this.ReverseY? y : (this.YResolution - y - 1);

//                 const xMin = this.XAxis[0];
//                 const xMag = this.XAxis[this._xResolution-1] - xMin;
//                 const yMin = this.YAxis[0];
//                 const yMag = this.YAxis[this._yResolution-1] - yMin;
//                 for(let z=0;z<2;z++) {
//                     let value = this._valueMin;
//                     if(z > 0)
//                         value = this._valueMax;
//                     value = mag * (0.5 - (value - this._valueMin) / (this._valueMax - this._valueMin));
//                     t[y][z] = this._transformPoint([
//                         ((this.XAxis[vx]-xMin-xMag/2)/(xMag*2))*this._table3DDisplayWidth*this._table3DZoom, 
//                         value*this._table3DZoom, 
//                         (this.ReverseY? 1 : -1) * ((this.YAxis[valueY]-yMin-yMag/2)/(yMag*2))*this._table3DDisplayWidth*this._table3DZoom
//                     ]);
//                 }
//             }
//         }
//         for(let x=0;x<this._xResolution;x++){
//             for(let y=0;y<this._yResolution;y++){
//                 let valueY = this.ReverseY? y : (this.YResolution - y - 1);
                
//                 let depth=this._dataSvg[x][y][2];
//                 let midPointValue = this._value[x + this._xResolution * valueY];
//                 this.svg.push({
//                     circle: {cx:parseFloat((this._dataSvg[x][y][0]+this._table3DDisplayWidth/2+this._table3DOffsetX).toFixed(10)), cy: parseFloat((this._dataSvg[x][y][1]+this._table3DDisplayHeight/2+this._table3DOffsetY).toFixed(10)), r:(1/(this._xResolution*2)*this._table3DDisplayWidth*this._table3DZoom/10).toFixed(10) },
//                     depth: depth, 
//                     x: x,
//                     y: valueY,
//                     midPointValue: midPointValue,
//                     hue: this._getHueFromValue(midPointValue)
//                 });

//                 if(y < this._yResolution - 1 && x < this._xResolution - 1) {
//                     if(!this.ReverseY)
//                         valueY -= 1;
//                     depth=(this._dataSvg[x][y][2]+this._dataSvg[x+1][y][2]+this._dataSvg[x+1][y+1][2]+this._dataSvg[x][y+1][2])/4;
//                     midPointValue = (this._value[x + this._xResolution * valueY] + this._value[x + this._xResolution * valueY + this._xResolution] + this._value[x + 1 + this._xResolution * valueY] + this._value[x + 1 + this._xResolution * valueY + this._xResolution])/4;
//                     this.svg.push({
//                         path:
//                             `M${(this._dataSvg[x][y][0]+this._table3DDisplayWidth/2+this._table3DOffsetX).toFixed(10)},${(this._dataSvg[x][y][1]+this._table3DDisplayHeight/2+this._table3DOffsetY).toFixed(10)}`+
//                             `L${(this._dataSvg[x+1][y][0]+this._table3DDisplayWidth/2+this._table3DOffsetX).toFixed(10)},${(this._dataSvg[x+1][y][1]+this._table3DDisplayHeight/2+this._table3DOffsetY).toFixed(10)}`+
//                             `L${(this._dataSvg[x+1][y+1][0]+this._table3DDisplayWidth/2+this._table3DOffsetX).toFixed(10)},${(this._dataSvg[x+1][y+1][1]+this._table3DDisplayHeight/2+this._table3DOffsetY).toFixed(10)}`+
//                             `L${(this._dataSvg[x][y+1][0]+this._table3DDisplayWidth/2+this._table3DOffsetX).toFixed(10)},${(this._dataSvg[x][y+1][1]+this._table3DDisplayHeight/2+this._table3DOffsetY).toFixed(10)}Z`,
//                         depth: depth, 
//                         x: x,
//                         y: valueY,
//                         midPointValue: midPointValue,
//                         hue: this._getHueFromValue(midPointValue)
//                     });
//                 }
//             }
//         }
//         this.svg.sort(function(a, b){return b.depth-a.depth});
//         const xaxisRearY = this._table3DtransformPrecalc[0] > 0? (this.ReverseY? 0 : 1) : (this.ReverseY? 1 : 0);
//         const xaxisFrontY = xaxisRearY === 1? 0 : 1; 
//         const yaxisRearX = this._table3DtransformPrecalc[2] > 0? 0 : 1;
//         const yaxisFrontX = yaxisRearX === 1? 0 : 1; 
//         const xyaxisRearZ = this.Table3DPitch > 0? 0 : 1
//         const scalextext = Math.abs(this._table3DtransformPrecalc[0]);
//         const scaleytext = Math.abs(this._table3DtransformPrecalc[2]);
//         const scaleztext = Math.abs(this._table3DtransformPrecalc[4]);
//         //xlines
//         for(let x=0; x<this._xResolution; x++) {
//             const coord = this._xAxisSvg[x][xaxisRearY];
//             const line = {
//                 line: {
//                     x1: parseFloat((coord[0][0]+this._table3DDisplayWidth/2+this._table3DOffsetX).toFixed(10)), 
//                     y1: parseFloat((coord[0][1]+this._table3DDisplayHeight/2+this._table3DOffsetY).toFixed(10)), 
//                     x2: parseFloat((coord[1][0]+this._table3DDisplayWidth/2+this._table3DOffsetX).toFixed(10)), 
//                     y2: parseFloat((coord[1][1]+this._table3DDisplayHeight/2+this._table3DOffsetY).toFixed(10))
//                 }
//             }
//             this.svg.unshift(line);
//             let xoffset = 0;
//             if(x === 0)
//                 xoffset = this._table3DtransformPrecalc[2]<0? 0 : this._table3DtransformPrecalc[0] * textsize/2;
//             if(x === this._xResolution-1)
//                 xoffset = this._table3DtransformPrecalc[2]>0? 0 : -this._table3DtransformPrecalc[0] * textsize/2;
//             this.svg.unshift({
//                 text: {
//                     x: line.line.x2 + xoffset,
//                     y: line.line.y2 - textsize/2 * scaleztext,
//                     alignmentbaseline: `middle`,
//                     anchor: `start`,
//                     transform: `scale(${scalextext} ${scaleztext}) rotate(-90)`,
//                     text: Table._formatNumberForDisplay(this.XAxis[x]),
//                     size: textsize
//                 }
//             })
//             this.svg.unshift({
//                 text: {
//                     x: line.line.x1 + xoffset,
//                     y: line.line.y1 + textsize/2 * scaleztext,
//                     alignmentbaseline: `middle`,
//                     anchor: `end`,
//                     transform: `scale(${scalextext} ${scaleztext}) rotate(-90)`,
//                     text: Table._formatNumberForDisplay(this.XAxis[x]),
//                     size: textsize
//                 }
//             })
//         }
//         //ylines
//         for(let y=0; y<this._yResolution; y++) {
//             const coord = this._yAxisSvg[yaxisRearX][y];
//             const line = {
//                 line: {
//                     x1: parseFloat((coord[0][0]+this._table3DDisplayWidth/2+this._table3DOffsetX).toFixed(10)), 
//                     y1: parseFloat((coord[0][1]+this._table3DDisplayHeight/2+this._table3DOffsetY).toFixed(10)), 
//                     x2: parseFloat((coord[1][0]+this._table3DDisplayWidth/2+this._table3DOffsetX).toFixed(10)), 
//                     y2: parseFloat((coord[1][1]+this._table3DDisplayHeight/2+this._table3DOffsetY).toFixed(10))
//                 }
//             };
//             this.svg.unshift(line);
//             let xoffset = 0;
//             if(y === 0)
//                 xoffset = this._table3DtransformPrecalc[0]>0? 0 : this._table3DtransformPrecalc[2] * textsize/2;
//             if(y === this._yResolution-1)
//                 xoffset = this._table3DtransformPrecalc[0]<0? 0 : -this._table3DtransformPrecalc[2] * textsize/2;
//             this.svg.unshift({
//                 text: {
//                     x: line.line.x2 + xoffset,
//                     y: line.line.y2 - textsize/2 * scaleztext,
//                     alignmentbaseline: `middle`,
//                     anchor: `start`,
//                     transform: `scale(${scaleytext} ${scaleztext}) rotate(-90)`,
//                     text: Table._formatNumberForDisplay(this.YAxis[y]),
//                     size: textsize
//                 }
//             })
//             this.svg.unshift({
//                 text: {
//                     x: line.line.x1 + xoffset,
//                     y: line.line.y1 + textsize/2 * scaleztext,
//                     alignmentbaseline: `middle`,
//                     anchor: `end`,
//                     transform: `scale(${scaleytext} ${scaleztext}) rotate(-90)`,
//                     text: Table._formatNumberForDisplay(this.YAxis[y]),
//                     size: textsize
//                 }
//             })
//         }
//         //z lines
//         let zhmag = (this._xAxisSvg[0][xaxisRearY][0][1] - this._xAxisSvg[0][xaxisRearY][1][1]) / (valueaxis.length-1);
//         const rotatex = Math.atan((this._xAxisSvg[0][xaxisRearY][0][1]-this._xAxisSvg[this._xResolution-1][xaxisRearY][0][1])/(this._xAxisSvg[0][xaxisRearY][0][0] - this._xAxisSvg[this._xResolution-1][xaxisRearY][0][0])) * 180 / Math.PI;
//         const rotatey = Math.atan((this._yAxisSvg[yaxisRearX][0][0][1]-this._yAxisSvg[yaxisRearX][this._yResolution-1][0][1])/(this._yAxisSvg[yaxisRearX][0][0][0]-this._yAxisSvg[yaxisRearX][this._yResolution-1][0][0])) * 180 / Math.PI;
//         for(let z=0; z<valueaxis.length; z++){
//             let zh = zhmag * z;
//             this.svg.unshift({
//                 line: {
//                     x1: parseFloat((this._xAxisSvg[0][xaxisRearY][0][0]+this._table3DDisplayWidth/2+this._table3DOffsetX).toFixed(10)), 
//                     y1: parseFloat((this._xAxisSvg[0][xaxisRearY][0][1]+this._table3DDisplayHeight/2+this._table3DOffsetY-zh).toFixed(10)), 
//                     x2: parseFloat((this._xAxisSvg[this._xResolution-1][xaxisRearY][0][0]+this._table3DDisplayWidth/2+this._table3DOffsetX).toFixed(10)), 
//                     y2: parseFloat((this._xAxisSvg[this._xResolution-1][xaxisRearY][0][1]+this._table3DDisplayHeight/2+this._table3DOffsetY-zh).toFixed(10))
//                 }
//             });
//             this.svg.unshift({
//                 line: {
//                     x1: parseFloat((this._yAxisSvg[yaxisRearX][0][0][0]+this._table3DDisplayWidth/2+this._table3DOffsetX).toFixed(10)), 
//                     y1: parseFloat((this._yAxisSvg[yaxisRearX][0][0][1]+this._table3DDisplayHeight/2+this._table3DOffsetY-zh).toFixed(10)), 
//                     x2: parseFloat((this._yAxisSvg[yaxisRearX][this._yResolution-1][0][0]+this._table3DDisplayWidth/2+this._table3DOffsetX).toFixed(10)), 
//                     y2: parseFloat((this._yAxisSvg[yaxisRearX][this._yResolution-1][0][1]+this._table3DDisplayHeight/2+this._table3DOffsetY-zh).toFixed(10))
//                 }
//             });
//             let mincoord = [this.svg[0].line.x1, this.svg[0].line.y1, scaleytext, rotatey];
//             let maxcoord = [this.svg[0].line.x1, this.svg[0].line.y1, scaleytext, rotatey];

//             if(this.svg[0].line.x2 < this.svg[0].line.x1)
//                 mincoord = [this.svg[0].line.x2, this.svg[0].line.y2, scaleytext, rotatey];
//             else 
//                 maxcoord = [this.svg[0].line.x2, this.svg[0].line.y2, scaleytext, rotatey];

//             if(this.svg[1].line.x1 < mincoord[0])
//                 mincoord = [this.svg[1].line.x1, this.svg[1].line.y1, scalextext, rotatex];
//             if(this.svg[1].line.x1 > maxcoord[0])
//                 maxcoord = [this.svg[1].line.x1, this.svg[1].line.y1, scalextext, rotatex];

//             if(this.svg[1].line.x2 < mincoord[0])
//                 mincoord = [this.svg[1].line.x2, this.svg[1].line.y2, scalextext, rotatex];
//             if(this.svg[1].line.x2 > maxcoord[0])
//                 maxcoord = [this.svg[1].line.x2, this.svg[1].line.y2, scalextext, rotatex];

//             this.svg.unshift({
//                 text: {
//                     x: mincoord[0] - textsize/2 * mincoord[2],
//                     y: mincoord[1],
//                     alignmentbaseline: `middle`,
//                     anchor: `end`,
//                     transform: `skewY(${mincoord[3]}) scale(${mincoord[2]} ${scaleztext})`,
//                     text: Table._formatNumberForDisplay(valueaxis[z]),
//                     size: textsize
//                 }
//             })
//             this.svg.unshift({
//                 text: {
//                     x: maxcoord[0] + textsize/2 * maxcoord[2],
//                     y: maxcoord[1],
//                     alignmentbaseline: `middle`,
//                     anchor: `start`,
//                     transform: `skewY(${maxcoord[3]}) scale(${maxcoord[2]} ${scaleztext})`,
//                     text: Table._formatNumberForDisplay(valueaxis[z]),
//                     size: textsize
//                 }
//             })
//         }

//         //front axis lines
//         this.svg.unshift({
//             line: {
//                 x1: parseFloat((this._yAxisSvg[yaxisFrontX][0][xyaxisRearZ][0]+this._table3DDisplayWidth/2+this._table3DOffsetX).toFixed(10)), 
//                 y1: parseFloat((this._yAxisSvg[yaxisFrontX][0][xyaxisRearZ][1]+this._table3DDisplayHeight/2+this._table3DOffsetY).toFixed(10)), 
//                 x2: parseFloat((this._yAxisSvg[yaxisFrontX][this._yResolution-1][xyaxisRearZ][0]+this._table3DDisplayWidth/2+this._table3DOffsetX).toFixed(10)), 
//                 y2: parseFloat((this._yAxisSvg[yaxisFrontX][this._yResolution-1][xyaxisRearZ][1]+this._table3DDisplayHeight/2+this._table3DOffsetY).toFixed(10))
//             }
//         });
//         this.svg.unshift({
//             line: {
//                 x1: parseFloat((this._xAxisSvg[0][xaxisFrontY][xyaxisRearZ][0]+this._table3DDisplayWidth/2+this._table3DOffsetX).toFixed(10)), 
//                 y1: parseFloat((this._xAxisSvg[0][xaxisFrontY][xyaxisRearZ][1]+this._table3DDisplayHeight/2+this._table3DOffsetY).toFixed(10)), 
//                 x2: parseFloat((this._xAxisSvg[this._xResolution-1][xaxisFrontY][xyaxisRearZ][0]+this._table3DDisplayWidth/2+this._table3DOffsetX).toFixed(10)), 
//                 y2: parseFloat((this._xAxisSvg[this._xResolution-1][xaxisFrontY][xyaxisRearZ][1]+this._table3DDisplayHeight/2+this._table3DOffsetY).toFixed(10))
//             }
//         });
//         //bottom
//         this.svg.unshift({
//             path:
//                 `M${(this._yAxisSvg[yaxisFrontX][0][xyaxisRearZ][0]+this._table3DDisplayWidth/2+this._table3DOffsetX).toFixed(10)},${(this._yAxisSvg[yaxisFrontX][0][xyaxisRearZ][1]+this._table3DDisplayHeight/2+this._table3DOffsetY).toFixed(10)}`+
//                 `L${(this._yAxisSvg[yaxisFrontX][this._yResolution-1][xyaxisRearZ][0]+this._table3DDisplayWidth/2+this._table3DOffsetX).toFixed(10)},${(this._yAxisSvg[yaxisFrontX][this._yResolution-1][xyaxisRearZ][1]+this._table3DDisplayHeight/2+this._table3DOffsetY).toFixed(10)}`+
//                 `L${(this._yAxisSvg[yaxisRearX][this._yResolution-1][xyaxisRearZ][0]+this._table3DDisplayWidth/2+this._table3DOffsetX).toFixed(10)},${(this._yAxisSvg[yaxisRearX][this._yResolution-1][xyaxisRearZ][1]+this._table3DDisplayHeight/2+this._table3DOffsetY).toFixed(10)}`+
//                 `L${(this._yAxisSvg[yaxisRearX][0][xyaxisRearZ][0]+this._table3DDisplayWidth/2+this._table3DOffsetX).toFixed(10)},${(this._yAxisSvg[yaxisRearX][0][xyaxisRearZ][1]+this._table3DDisplayHeight/2+this._table3DOffsetY).toFixed(10)}Z`,
//             color: this.Table3DPitch > 0? `#80808080` : `transparent`
//         });
//     }

//     _trailSvg = [];
//     _calculateSvgTrail() {
//         if($(`#${this.GUID}-table`).length === 0)
//             return;
//         const number0x0Selector = $(`#${this.GUID}-table .number[data-x=0][data-y=${this.ReverseY? this._yResolution-1 : 0}]`).parent();
//         const trailSvgSelector = $(`#${this.GUID}-trailsvg`);
//         const trailSvgOffset = trailSvgSelector.offset();

//         const number0x0Width = number0x0Selector.width();
//         const number0x0Height = number0x0Selector.height();
//         const number0x0Offset = number0x0Selector.offset()
//         const x0 = number0x0Offset.left - trailSvgOffset.left + number0x0Width/2;
//         const y0 = number0x0Offset.top - trailSvgOffset.top + number0x0Height/2;

//         this._trailSvg.splice(this._trailXY.length);
//         for(let i=0; i<this._trailXY.length; i++) {
//             let xAxisIndex = this.XAxis.findIndex(x => x>this._trailXY[i][0]);
//             if(xAxisIndex < 0) xAxisIndex = this._xResolution-1;
//             else if(xAxisIndex > 0 && xAxisIndex < this._xResolution-1) xAxisIndex += (this._trailXY[i][0] - this.XAxis[xAxisIndex-1])/ (this.XAxis[xAxisIndex] - this.XAxis[xAxisIndex-1]) - 1;
//             let yAxisIndex = this.YAxis.findIndex(y => y>this._trailXY[i][1]);
//             if(yAxisIndex < 0) yAxisIndex = this._yResolution-1;
//             else if(yAxisIndex > 0 && yAxisIndex < this._yResolution-1) yAxisIndex += (this._trailXY[i][1] - this.YAxis[yAxisIndex-1])/ (this.YAxis[yAxisIndex] - this.YAxis[yAxisIndex-1]) - 1;
//             const x = x0 + xAxisIndex * number0x0Width;
//             const y = y0 + (this.ReverseY? this._yResolution-yAxisIndex-1 : yAxisIndex) * number0x0Height;
//             if(i === 0) {
//                 this._trailSvg[0] = { ellipse: {
//                     x: parseFloat(x.toFixed(10)),
//                     y: parseFloat(y.toFixed(10)),
//                     rx: parseFloat((number0x0Width/2).toFixed(10)),
//                     ry: parseFloat((number0x0Height/2).toFixed(10))
//                 }};
//             } else {
//                 this._trailSvg[i] = { line: {
//                     x1: parseFloat(x.toFixed(10)),
//                     y1: parseFloat(y.toFixed(10)),
//                     x2: parseFloat(parseFloat(this._trailSvg[i-1].ellipse?.x ?? this._trailSvg[i-1].line?.x1).toFixed(10)),
//                     y2: parseFloat(parseFloat(this._trailSvg[i-1].ellipse?.y ?? this._trailSvg[i-1].line?.y1).toFixed(10))
//                 }}
//             }
//         }
//         this._trailSvg.reverse();
//     }

//     _calculateValueMinMax() {
//         this._valueMin = 10000000000;
//         this._valueMax = -10000000000;
//         for(let x=0;x<this._xResolution;x++){
//             for(let y=0;y<this._yResolution;y++){
//                 let value = this._value[x + this._xResolution * y];
//                 if(value < this._valueMin)
//                     this._valueMin = value;
//                 if(value > this._valueMax)
//                     this._valueMax = value;
//             }
//         }
//         if(this._valueMax === this._valueMin)
//             this._valueMax = this._valueMin + 1;
//     }

//     _getHueFromValue(value) {
//         return 180 - (180 * (parseFloat(value) - this._valueMin) / (this._valueMax - this._valueMin));
//     }

//     _formatNumberForDisplay(id, x, y, value) {
//         var rowClass = $(`#${id}`).attr(`class`)
//         if(rowClass)
//             rowClass = `class="${rowClass}"`;
//         else
//             rowClass = `class="number"`;
        
//         x ??=  parseInt($(`#${id}`).attr(`data-x`));
//         y ??=  parseInt($(`#${id}`).attr(`data-y`));
//         value ??= $(`#${id}`).val();
//         if(value === ``)
//             value = $(`#${id}`).html();

//         if(rowClass.indexOf(`origselect`) === -1)
//             return `<div${x>-1&&y>-1? ` style="background-color: hsl(${this._getHueFromValue(value)},100%,50%);"` : ``}><div ${rowClass} id="${id}" data-x="${x}" data-y="${y}">${Table._formatNumberForDisplay(value)}</div></div>`;
//         return `<div${x>-1&&y>-1? ` style="background-color: hsl(${this._getHueFromValue(value)},100%,50%);"` : ``}><input ${rowClass} id="${id}" data-x="${x}" data-y="${y}" value="${Table._formatNumberForDisplay(value)}" type="number"/></div>`;
//     }

//     static _formatNumberForDisplay(number, precision = 6) {
//         var ret = parseFloat(parseFloat(parseFloat(number).toFixed(precision -1)).toPrecision(precision));
//         if(isNaN(ret))
//             return `&nbsp;`;
//         return ret;
//     }
// }

// var pastetype = `equal`;

// function AttachPasteOptions() {
//     DetachPasteOptions();
//     $(document).on(`click.pasteoptions`, `#pasteoptions .paste-button`, function(){
//         pastetype = $(this).attr(`data-pastetype`);
//         $(`#pasteoptions div`).removeClass(`selected`);
//         $(`#pasteoptions div[data-pastetype="${pastetype}"`).addClass(`selected`);
//     });
// }

// function DetachPasteOptions() {
//     $(document).off(`click.pasteoptions`);
// }

// function GetPasteOptions() {
//     return `<div style="display:inline-block; position: relative;"><div style="width: 150; position: absolute; top: -10; left: 32px;z-index:1">Paste Options</div>
//     <div id="pasteoptions" class="container">
//         <div data-pastetype="equal"       class="paste-button${pastetype==`equal`? ` selected` : ``         }" style="position: relative;"><h3>📋</h3><span>=</span></div>
//         <div data-pastetype="add"         class="paste-button${pastetype==`add`? ` selected` : ``           }" style="position: relative;"><h3>📋</h3><span>+</span></div>
//         <div data-pastetype="subtract"    class="paste-button${pastetype==`subtract`? ` selected` : ``      }" style="position: relative;"><h3>📋</h3><span>-</span></div>
//         <div data-pastetype="multiply"    class="paste-button${pastetype==`multiply`? ` selected` : ``      }" style="position: relative;"><h3>📋</h3><span>x</span></div>
//         <div data-pastetype="multiply%"   class="paste-button${pastetype==`multiply%`? ` selected` : ``     }" style="position: relative;"><h3>📋</h3><span>%</span></div>
//         <div data-pastetype="multiply%/2" class="paste-button${pastetype==`multiply%/2`? ` selected` : ``   }" style="position: relative;"><h3>📋</h3><span><sup>%</sup>&frasl;<sub>2</sub></span></div>
//     </div>
// </div>`;
// }

// document.addEventListener(`dragstart`, function(e){
//     if($(e.target).hasClass(`selected`) || $(e.target).hasClass(`row_expand`) || $(e.target).hasClass(`col_expand`))
//         e.preventDefault();
// });//disable dragging of selected items