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

    get #valueMin() {
        return this.style.getPropertyValue('--valuemin') ?? 18000000000000000000;
    }
    set #valueMin(valueMin) {
        this.style.setProperty('--valuemin', valueMin);
    }
    get #valueMax() {
        return this.style.getPropertyValue('--valuemax') ?? -9000000000000000000;
    }
    set #valueMax(valueMin) {
        this.style.setProperty('--valuemax', valueMin);
    }

    #valueElement = document.createElement(`div`);
    get value() {
        return [...this.#valueElement.children].map(x => x.value);
    }
    set value(value) {
        if(value === undefined)
            return;
        if(value.length !== this.xResolution * this.yResolution)
            throw `Value length does not match table length. Set xResolution and yResolution before setting value`;
        for(let i = 0; i < this.#valueElement.children.length; i++) {
            this.#valueElement.children[i].value = parseFloat(value[i]);
            UITable.#formatElementForDisplay(this.#valueElement.children[i]);
        }
        this.dispatchEvent(new Event(`change`));
    }

    static #numberValueGetterSetter = {
        get: function() { return this.dataset.value; },
        set: function(value) { this.dataset.value = value; this.style.setProperty(`--data-value`, value); }
    }
    #resolutionChanged() {
        this.style.setProperty('--xresolution', this.xResolution);
        this.style.setProperty('--yresolution', this.yResolution);
        while(this.xResolution * this.yResolution < this.#valueElement.children.length) { this.#valueElement.removeChild(this.#valueElement.children[this.xResolution * this.yResolution]); }
        for(let i = 0; i < this.xResolution * this.yResolution; i++) { 
            const valueElement = this.#valueElement.children[i] ?? this.#valueElement.appendChild(document.createElement(`div`));
            Object.defineProperty(valueElement, 'value', UITable.#numberValueGetterSetter);
            valueElement.dataset.x = i % this.xResolution;
            valueElement.dataset.x = parseInt(i/this.yResolution);
            UITable.#formatElementForDisplay(valueElement);
        }
        if(this.xResolution > 1) {
            if(this.yResolution > 1)
                this.#interpolateXYElement.hidden = false;
            else
                this.#interpolateXYElement.hidden = true;
            this.#interpolateXElement.hidden = false;
        }
        else {
            this.#interpolateXYElement.hidden = true;
            this.#interpolateXElement.hidden = true;

        }
        if(this.yResolution > 1)
            this.#interpolateYElement.hidden = false;
        else
            this.#interpolateYElement.hidden = true;
    }

    #xResolutionDragElement = document.createElement(`td`);
    get xResolutionModifiable() {
        return !this.#xResolutionDragElement.hidden;
    }
    set xResolutionModifiable(xResolutionModifiable) {
        this.#xResolutionDragElement.hidden = !xResolutionModifiable;
        this.#xResolutionElement.hidden = !xResolutionModifiable;
        if(this.yResolutionModifiable && xResolutionModifiable)
            this.#resolutionTextElement.hidden = false;
        else 
            this.#resolutionTextElement.hidden = true;
        if(this.yResolutionModifiable || xResolutionModifiable)
            this.#resolutionElement.hidden = false;
        else 
            this.#resolutionElement.hidden = true;
    }

    get xResolution() {
        return this.#xAxisElement.children.length;
    }
    set xResolution(xResolution) {
        if(xResolution === this.xResolution)
            return;

        this.#xResolutionElement.value = xResolution;

        while(xResolution < this.#xAxisElement.children.length) { this.#xAxisElement.removeChild(this.#xAxisElement.children[xResolution]); }
        for(let i = this.#xAxisElement.children.length; i < xResolution; i++) { 
            const xAxisElement = this.#xAxisElement.appendChild(document.createElement(`div`)); 
            Object.defineProperty(xAxisElement, 'value', UITable.#numberValueGetterSetter);
            const xAxisMinus1 = parseFloat(this.#xAxisElement.children[i-1]?.dataset?.value);
            const xAxisMinus2 = parseFloat(this.#xAxisElement.children[i-2]?.dataset?.value);
            let xAxisMinus0 = 0;
            if(xAxisMinus1 !== undefined && xAxisMinus2 !== undefined)
                xAxisMinus0 = xAxisMinus1 + (xAxisMinus1 - xAxisMinus2);
            xAxisElement.value = xAxisMinus0;
            xAxisElement.dataset.x = i;
            UITable.#formatElementForDisplay(xAxisElement);
        }
        this.#resolutionChanged();
        //interpolation
        this.#buildTableElement();
        this.dispatchEvent(new Event(`change`));
    }

    #yResolutionDragElement = document.createElement(`td`);
    get yResolutionModifiable() {
        return !this.#yResolutionDragElement.hidden;
    }
    set yResolutionModifiable(yResolutionModifiable) {
        this.#yResolutionDragElement.hidden = !yResolutionModifiable;
        this.#yResolutionElement.hidden = !yResolutionModifiable;
        if(this.xResolutionModifiable && yResolutionModifiable)
            this.#resolutionTextElement.hidden = false;
        else 
            this.#resolutionTextElement.hidden = true;
        if(this.xResolutionModifiable || yResolutionModifiable)
            this.#resolutionElement.hidden = false;
        else 
            this.#resolutionElement.hidden = true;
    }

    get yResolution() {
        return this.#yAxisElement.children.length;
    }
    set yResolution(yResolution) {
        if(yResolution === this.yResolution)
            return;

        this.#yResolutionElement.value = yResolution;
        while(yResolution < this.#yAxisElement.children.length) { this.#yAxisElement.removeChild(this.#yAxisElement.children[yResolution]); }
        for(let i = this.#yAxisElement.children.length; i < yResolution; i++) { 
            const yAxisElement = this.#yAxisElement.appendChild(document.createElement(`div`)); 
            Object.defineProperty(yAxisElement, 'value', UITable.#numberValueGetterSetter);
            const yAxisMinus1 = parseFloat(this.#yAxisElement.children[i-1]?.dataset?.value);
            const yAxisMinus2 = parseFloat(this.#yAxisElement.children[i-2]?.dataset?.value);
            let yAxisMinus0 = 0;
            if(yAxisMinus1 !== undefined && yAxisMinus2 !== undefined)
                yAxisMinus0 = yAxisMinus1 + (yAxisMinus1 - yAxisMinus2);
            yAxisElement.value = yAxisMinus0;
            yAxisElement.dataset.y = i;
            UITable.#formatElementForDisplay(yAxisElement);
        }
        this.#resolutionChanged();
        //interpolation
        this.#buildTableElement();
        this.dispatchEvent(new Event(`change`));
    }

    #xAxisElement = document.createElement(`div`);
    get xAxis() {
        return [...this.#xAxisElement.children].map(x => x.dataset.value);
    }
    set xAxis(xAxis) {
        this.xResolution = xAxis.length;
        const thisClass = this;
        xAxis.forEach(function(xAxisValue, xAxisIndex) { const xAxisElement = thisClass.#xAxisElement.children[xAxisIndex]; xAxisElement.dataset.value = xAxisValue; UITable.#formatElementForDisplay(xAxisElement); });
        //interpolation
        this.dispatchEvent(new Event(`change`));
    }
    
    #yAxisElement = document.createElement(`div`);
    get yAxis() {
        return [...this.#yAxisElement.children].map(x => x.dataset.value);
    }
    set yAxis(yAxis) {
        this.yResolution = yAxis.length;
        const thisClass = this;
        yAxis.forEach(function(yAxisValue, yAxisIndex) { const yAxisElement = thisClass.#yAxisElement.children[yAxisIndex]; yAxisElement.dataset.value = yAxisValue; UITable.#formatElementForDisplay(yAxisElement); });
        //interpolation
        this.dispatchEvent(new Event(`change`));
    }


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
            const xAxisTd = row1.appendChild(document.createElement(`td`));
            xAxisTd.append(this.#xAxisElement);
            row1.append(this.#xResolutionDragElement);
        } else if (yResolution > 1) {
            const ylabelTd      = row1.appendChild(document.createElement(`td`));
            ylabelTd.append(this.#yLabelElement);
            const zlabelTd      = row1.appendChild(document.createElement(`td`));
            zlabelTd.append(this.#zLabelElement);
        }
        //row2/3
        const row2 = this.#tableElement.appendChild(document.createElement(`tr`));
        const row3 = this.#tableElement.appendChild(document.createElement(`tr`));
        if (yResolution > 1) {
            if(xResolution > 1) {
                row2.appendChild(document.createElement(`td`));//auto width to take up zlabel slack
                const yAxisLabel = row2.appendChild(document.createElement(`td`));
                yAxisLabel.class = `ytrans`;
                yAxisLabel.append(this.#yLabelElement);
                row3.appendChild(document.createElement(`td`)).colSpan = 2;// pick up slack for ydrag
            }
            const yAxisTd = row2.appendChild(document.createElement(`td`));
            yAxisTd.append(this.#yAxisElement)
            row3.append(this.#yResolutionDragElement);
        } else if (xResolution > 1) {
            const xAxisLabel    = row2.appendChild(document.createElement(`td`));
            xAxisLabel.class    = `xztrans`
            xAxisLabel.append(this.#xLabelElement);
        }
        const valueTd = row2.appendChild(document.createElement(`td`));
        valueTd.append(this.#valueElement);
    }

    #modifyElement          = document.createElement(`div`);
    #modifyAddElement       = document.createElement(`div`);
    #modifySubtractElement  = document.createElement(`div`);
    #modifyMultiplyElement  = document.createElement(`div`);
    #modifyDivideElement    = document.createElement(`div`);
    #modifyEqualElement     = document.createElement(`div`);
    #modifyValueElement     = document.createElement(`input`);

    #interpolateElement     = document.createElement(`div`);
    #interpolateXElement    = document.createElement(`div`);
    #interpolateYElement    = document.createElement(`div`);
    #interpolateXYElement   = document.createElement(`div`);

    #resolutionElement      = document.createElement(`div`);
    #xResolutionElement     = document.createElement(`input`);
    #yResolutionElement     = document.createElement(`input`);
    #resolutionTextElement  = document.createElement(`span`);

    #pasteOptionsElement    = document.createElement(`div`);
    #pasteEqualElement      = document.createElement(`div`);
    #pasteAddElement        = document.createElement(`div`);
    #pasteSubtractElement   = document.createElement(`div`);
    #pasteMultiplyElement   = document.createElement(`div`);
    #pasteMultiplyPElement  = document.createElement(`div`);
    #pasteMultiplyP2Element = document.createElement(`div`);
    
    #toolbarElement         = document.createElement(`div`);
    #rightToolbarElement    = document.createElement(`div`);
    #leftToolbarElement     = document.createElement(`div`);

    onChange = [];
    constructor(prop) {
        super();
        this.class = `uitable`;
        //toolbar
        this.append(this.#toolbarElement);
        this.#toolbarElement.class = `toolbar`;
        this.#toolbarElement.append(this.#leftToolbarElement);
        this.#leftToolbarElement.class = `lefttoolbar`;
        this.#toolbarElement.append(this.#rightToolbarElement);
        this.#rightToolbarElement.class = `righttoolbar`;
        //resolution toolbar
        this.#leftToolbarElement.append(this.#resolutionElement);
        this.#resolutionElement.class = `resolution container`;
        this.#resolutionElement.append(this.#xResolutionElement);
        this.#resolutionElement.append(this.#resolutionTextElement);
        this.#resolutionElement.append(this.#yResolutionElement);
        this.#xResolutionElement.type       = `number`;
        this.#xResolutionElement.class      = `resolution-value`;
        this.#yResolutionElement.type       = `number`;
        this.#yResolutionElement.class      = `resolution-value`;
        this.#resolutionTextElement.innerHTML = `X`;
        //paste options toolbar
        this.#leftToolbarElement.append(this.#pasteOptionsElement);
        this.#pasteOptionsElement.class = `paste container`;
        this.#pasteOptionsElement.append(this.#pasteEqualElement);
        this.#pasteOptionsElement.append(this.#pasteAddElement);
        this.#pasteOptionsElement.append(this.#pasteSubtractElement);
        this.#pasteOptionsElement.append(this.#pasteMultiplyElement);
        this.#pasteOptionsElement.append(this.#pasteMultiplyPElement);
        this.#pasteOptionsElement.append(this.#pasteMultiplyP2Element);
        this.#pasteEqualElement.class               = `paste-button equal selected`;
        this.#pasteEqualElement.dataset.value       = `equal`;
        this.#pasteAddElement.class                 = `paste-button add`;
        this.#pasteAddElement.dataset.value         = `add`;
        this.#pasteSubtractElement.class            = `paste-button subtract`;
        this.#pasteSubtractElement.dataset.value    = `subtract`;
        this.#pasteMultiplyElement.class            = `paste-button multiply`;
        this.#pasteMultiplyElement.dataset.value    = `multiply`;
        this.#pasteMultiplyPElement.class           = `paste-button multiplyp`;
        this.#pasteMultiplyPElement.dataset.value   = `multiply%`;
        this.#pasteMultiplyP2Element.class          = `paste-button multiplyp2`;
        this.#pasteMultiplyP2Element.dataset.value  = `multiply%/2`;
        this.#pasteMultiplyP2Element.innerHTML      = `<span><sup>%</sup>&frasl;<sub>2</sub></span>`;
        //modify toolbar
        this.#rightToolbarElement.append(this.#modifyElement);
        this.#modifyElement.class = `modify container`;
        this.#modifyElement.append(this.#modifyValueElement);
        this.#modifyElement.append(this.#modifyAddElement);
        this.#modifyElement.append(this.#modifySubtractElement);
        this.#modifyElement.append(this.#modifyMultiplyElement);
        this.#modifyElement.append(this.#modifyDivideElement);
        this.#modifyElement.append(this.#modifyEqualElement);
        this.#modifyValueElement.type       = `number`;
        this.#modifyValueElement.class      = `modify-value`;
        this.#modifyAddElement.class        = `modify-button add`;
        this.#modifySubtractElement.class   = `modify-button subtract`;
        this.#modifyMultiplyElement.class   = `modify-button multiply`;
        this.#modifyDivideElement.class     = `modify-button divide`;
        this.#modifyEqualElement.class      = `modify-button equal`;
        this.#modifySubtractElement.hidden  = true;
        this.#modifyDivideElement.hidden    = true;
        //interpolate toolbar
        this.#rightToolbarElement.append(this.#interpolateElement);
        this.#interpolateElement.class = `interpolate container`;
        this.#interpolateElement.append(this.#interpolateXElement);
        this.#interpolateElement.append(this.#interpolateYElement);
        this.#interpolateElement.append(this.#interpolateXYElement);
        this.#interpolateXElement.class     = `modify-button interpolatex`;
        this.#interpolateYElement.class     = `modify-button interpolatey`;
        this.#interpolateXYElement.class    = `modify-button interpolatexy`;
        //table
        this.append(this.#tableElement);
        this.#tableElement.class  = `numerictable`;
        this.#xLabelElement.class = `xlabel`;
        this.#yLabelElement.class = `ylabel`;
        this.#zLabelElement.class = `zlabel`;
        this.#xAxisElement.class  = `xAxis`;
        this.#yAxisElement.class  = `yAxis`;
        this.#valueElement.class  = `value`;
        this.#xResolutionDragElement.class = `xdrag`;
        this.#xResolutionDragElement.rowSpan = 2;
        this.#yResolutionDragElement.class = `ydrag`;
        this.#yResolutionDragElement.colSpan = 2;
        const propValue = prop.value;
        delete prop.value;
        Object.assign(this, prop);
        this.value = propValue;
        if(!Array.isArray(this.onChange))
            this.onChange = [ this.onChange ];
        const thisClass = this;
        this.addEventListener(`change`, function(event) {
            thisClass.onChange.forEach(function(onChange) { onChange(); });
        });
        this.#buildTableElement();

        function calculateMinMaxValue() {
            thisClass.#valueMin = 10000000000;
            thisClass.#valueMax = -10000000000;
            const arrayValue = thisClass.value;
            for(let i = 0; i < arrayValue.length; i++) {
                let value = arrayValue[i];
                if(value < thisClass.#valueMin)
                    thisClass.#valueMin = value;
                if(value > thisClass.#valueMax)
                    thisClass.#valueMax = value;
            }
            if(thisClass.#valueMax === thisClass.#valueMin)
                thisClass.#valueMax = thisClass.#valueMin + 1;
        }
        this.addEventListener(`change`, calculateMinMaxValue);
        calculateMinMaxValue();

        this.constructTableEventListeners();
    }

    constructTableEventListeners() {
        const thisClass = this;
        this.#pasteOptionsElement.addEventListener(`click`, function(event) {
            let target = event.target;
            for(let i=0; i < 2; i++) if(!target.dataset.value) target = event.target.parentElement;
            if(target.dataset.value) {
                thisClass.#pasteOptionsElement.querySelectorAll(`.selected`).forEach(function(element) { element.classList.remove(`selected`) });
                target.classList.add(`selected`);
            }
        });
        this.#xResolutionElement.addEventListener(`change`, function(event) {
            thisClass.xResolution = parseInt(event.target.value);
        });
        this.#yResolutionElement.addEventListener(`change`, function(event) {
            thisClass.yResolution = parseInt(event.target.value);
        });
        this.#tableElement.addEventListener(`change`, function(event){
            var x = event.target.dataset.x;
            var y = event.target.dataset.y;
            var value = parseFloat(event.target.value);
            if(isNaN(value))
                return;
            
            if(x === undefined) {
                thisClass.#yAxisElement.children[y].value = value;
                for(let ya=y; ya<thisClass.yResolution; ya++)
                    if(thisClass.#yAxisElement.children[ya].value < value) 
                        thisClass.#yAxisElement.children[ya].value = value;
                for(let ya=y; ya>=0; ya--) 
                    if(thisClass.#yAxisElement.children[ya].value > value) 
                        thisClass.#yAxisElement.children[ya].value = value;
            } else if(y === undefined) {
                thisClass.#xAxisElement.children[x].value = value;
                for(let xa=x; xa<thisClass.xResolution; xa++)
                    if(thisClass.#xAxisElement.children[xa].value < value) 
                        thisClass.#xAxisElement.children[xa].value = value;
                for(let xa=x; xa>=0; xa--) 
                    if(thisClass.#xAxisElement.children[xa].value > value) 
                        thisClass.#xAxisElement.children[xa].value = value;
            } else {
                let operation = `equal`;
                if(value - thisClass.#valueElement.children[x + thisClass.xResolution * y].value === 1)
                    operation = `increment`;
                if(thisClass.#valueElement.children[x + thisClass.xResolution * y].value - value === 1)
                    operation = `decrement`;
                let selectedElements = thisClass.#valueElement.querySelectorAll(`.selected`)
                selectedElements.forEach(function(selectedElement) {
                    if(operation === `increment`)
                        selectedElement.value++;
                    else if(operation === `decrement`)
                        selectedElement.value--;
                    else
                        selectedElement.value = value;
                });
            }
        });
        this.#tableElement.addEventListener(`keypress`, function(event){
            //plus
            if(e.which === 43) {
                e.preventDefault();
                thisClass.#modifyValueElement.select();
                thisClass.#modifyAddElement.classList.add(`selected`)
            }
            //minus
            if(e.which === 45) {
                e.preventDefault();
                thisClass.#modifyAddElement.hidden = true;
                thisClass.#modifySubtractElement.hidden = false;
                thisClass.#modifyValueElement.select();
                thisClass.#modifySubtractElement.classList.add(`selected`)
            }
            //aterisk
            if(e.which === 42) {
                e.preventDefault();
                thisClass.#modifyValueElement.select();
                thisClass.#modifyMultiplyElement.classList.add(`selected`)
            }
            //divide
            if(e.which === 47) {
                e.preventDefault();
                thisClass.#modifyMultiplyElement.hidden = true;
                thisClass.#modifyDivideElement.hidden = false;
                thisClass.#modifyValueElement.select();
                thisClass.#modifyDivideElement.classList.add(`selected`)
            }
            //forward slash
            if(e.which === 61) {
                e.preventDefault();
                thisClass.#modifyValueElement.select();
                thisClass.#modifyEqualElement.classList.add(`selected`)
            }
        });

        this.#tableElement.addEventListener(`copy`, function(event){
            let copyData = ``;

            let currentY;
            thisClass.#tableElement.querySelectorAll(`.selected`).forEach(function(element) {
                let y = parseInt(element.dataset.y) ?? -1;
                if(currentY !== undefined) {
                    if(currentY !== y) {
                        copyData += `\n`;
                    } else {
                        copyData += `\t`;
                    }
                }
                copydata += element.value;
                currentY = y;
            })

            event.originalEvent.clipboardData.setData(`text/plain`, copyData);
            event.preventDefault();
        });

        this.#tableElement.addEventListener(`paste`, function(event){
            var val = event.clipboardData.getData(`text/plain`);
            const lines = val.split(`\n`).length;
            const cols = val.split(`\t`).length;
            const x = parseInt(event.target.dataset.x);
            const y = parseInt(event.target.dataset.y);
            if(x === undefined && cols > 1)
                return;
            if(y === undefined && lines > 1)
                return;

            let special = thisClass.#pasteOptionsElement.querySelector(`.selected`)?.dataset?.value;

            thisClass.#valueElement.querySelectorAll(`.selected`).forEach(function(element) { element.classList.remove(`selected`) })
            val.split(`\n`).each(function(val, yIndex) {
                var yPos = y + yIndex;
                if(yPos > thisClass.yResolution - 1)
                    return;
                val.split(`\t`).each(function(val, xIndex) {
                    var xPos = x + xIndex;
                    if(xPos > thisClass.xResolution - 1)
                        return;

                    var v = parseFloat(val);

                    let numberElement = thisClass.#valueElement.children[xPos + yPos * thisClass.xResolution];
                    switch(special)
                    {
                        case `add`:
                            numberElement.value += v;
                            break;
                        case `subtract`:
                            numberElement.value -= v;
                            break;
                        case `multiply`:
                            numberElement.value *= v;
                            break;
                        case `multiply%`:
                            numberElement.value *= 1 + (v/100);
                            break;
                        case `multiply%/2`:
                            numberElement.value *= 1 + (v/200);
                            break;
                        case `average`:
                            numberElement.value += v;
                            numberElement.value /= 2;
                            break;
                        default:
                            numberElement.value = v;
                            break;
                    }

                    numberElement.classList.add(`selected`);
                });
            });
            e.preventDefault();
            thisClass.dispatchEvent(new Event(`change`));
        });
    }

    static #formatElementForDisplay(element, precision = 6) {
        // let formattedVaue = parseFloat(parseFloat(parseFloat(element.value).toFixed(precision -1)).toPrecision(precision));
        // if(isNaN(formattedVaue))
        //     formattedVaue = `&nbsp;`;
        element.innerHTML = element.value;
    }
}
customElements.define('ui-table', UITable, { extends: 'div' });
// class TableOld {
//     ReverseY = false;

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

//     _attachTable() {
//         const thisClass = this;

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


// document.addEventListener(`dragstart`, function(e){
//     if($(e.target).hasClass(`selected`) || $(e.target).hasClass(`row_expand`) || $(e.target).hasClass(`col_expand`))
//         e.preventDefault();
// });//disable dragging of selected items





//svg stuff
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