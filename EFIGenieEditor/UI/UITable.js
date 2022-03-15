export default class UITable extends HTMLDivElement {
    //value properties
    get value() {
        return [...this.#valueElement.children].map(x => x.value);
    }
    set value(value) {
        if(value === undefined)
            return;
        if(value.length !== this.xResolution * this.yResolution)
            throw `Value length does not match table length. Set xResolution and yResolution before setting value\ncurrent:${value.length}\nnew:${this.xResolution * this.yResolution}`;
        let same = true;
        for(let i = 0; i < this.#valueElement.children.length; i++){
            if(this.#valueElement.children[i].value === value[i])
                continue;
            same = false;
            break;
        }
        if(same)
            return;
        for(let i = 0; i < this.#valueElement.children.length; i++)
            this.#valueElement.children[i].value = value[i];
        this.dispatchEvent(new Event(`change`));
    }
    get saveValue() {
        return {
            Value: this.value,
            XAxis: this.xAxis,
            XResolution: this.xResolutionModifiable? this.xResolution : undefined,
            YAxis: this.yAxis,
            YResolution: this.yResolutionModifiable? this.yResolution : undefined,
        };
    }
    set saveValue(saveValue) {
        if(saveValue === undefined) 
            return;

        if(saveValue.XResolution !== undefined && this.xResolutionModifiable)
            this.xResolution = saveValue.XResolution;
        if(saveValue.YResolution !== undefined && this.yResolutionModifiable)
            this.yResolution = saveValue.YResolution;
        if(saveValue.Resolution !== undefined) {
            if(this.xResolutionModifiable && !this.yResolutionModifiable)
                this.xResolution = saveValue.Resolution;
            if(this.yResolutionModifiable && !this.xResolutionModifiable)
                this.yResolution = saveValue.Resolution;
        }

        if(saveValue.MaxX !== undefined && saveValue.MinX !== undefined) {
            const xAxisAdd = (saveValue.MaxX - saveValue.MinX) / (this.XResolution - 1);
            for(let x=0; x<this.XResolution; x++){
                this.xAxis[x] = saveValue.MinX + xAxisAdd * x;
            }
        }
        if(saveValue.MaxY !== undefined && saveValue.MinY !== undefined) {
            const yAxisAdd = (saveValue.MaxY - saveValue.MinY) / (this.YResolution - 1);
            for(let y=0; y<this.YResolution; y++){
                this.yAxis[y] = saveValue.MinY + yAxisAdd * y;
            }
        }

        if(saveValue.XAxis !== undefined)
            this.xAxis = saveValue.XAxis;
        if(saveValue.YAxis !== undefined)
            this.yAxis = saveValue.YAxis;

        if(saveValue.Value !== undefined && Array.isArray(saveValue.Value))
            this.value = saveValue.Value;
    }

    //axis properties
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
        if(this.yResolutionModifiable || xResolutionModifiable) {
            this.#xyResolutionDragElement.hidden = false;
            this.#resolutionElement.hidden = false;
        } else {
            this.#xyResolutionDragElement.hidden = true;
            this.#resolutionElement.hidden = true;
        }
    }
    get xResolution() {
        return this.#xAxisElement.children.length;
    }
    set xResolution(xResolution) {
        if(isNaN(xResolution) || xResolution === this.xResolution)
            return;

        const oldValue = this.value;
        let newValue = new Array(xResolution * this.yResolution);
        for(let x=0; x<xResolution; x++){
            for(let y=0; y<this.yResolution; y++){
                let oldValuesIndex = x + this.xResolution * y;
                let newValuesIndex = x + xResolution * y;
                if(x >= this.xResolution){
                    let newValuesIndexMinus1 = (x-1) + xResolution * y;
                    let newValuesIndexMinus2 = (x-2) + xResolution * y;
                    if(x>1){
                        newValue[newValuesIndex] = newValue[newValuesIndexMinus1] + (newValue[newValuesIndexMinus1] - newValue[newValuesIndexMinus2]);
                    }
                } else {
                    newValue[newValuesIndex] = oldValue[oldValuesIndex];
                }
                if(isNaN(newValue[newValuesIndex]))
                    newValue[newValuesIndex] = 0;
            }
        }
        this.#xResolutionElement.value = xResolution;
        while(xResolution < this.#xAxisElement.children.length) { this.#xAxisElement.removeChild(this.#xAxisElement.children[xResolution]); }
        for(let i = this.#xAxisElement.children.length; i < xResolution; i++) { 
            const xAxisElement = this.#xAxisElement.appendChild(document.createElement(`div`)); 
            Object.defineProperty(xAxisElement, 'value', UITable.#cellValueGetterSetter);
            const xAxisMinus1 = this.#xAxisElement.children[i-1]?.value;
            const xAxisMinus2 = this.#xAxisElement.children[i-2]?.value;
            let xAxisMinus0 = 0;
            if(xAxisMinus1 !== undefined && xAxisMinus2 !== undefined)
                xAxisMinus0 = xAxisMinus1 + (xAxisMinus1 - xAxisMinus2);
            xAxisElement.value = xAxisMinus0;
            xAxisElement.x = i;
        }
        this.#resolutionChanged();
        this.#buildTableElement();
        this.value = newValue;
        this.dispatchEvent(new Event(`change`));
    }
    get xAxis() {
        return [...this.#xAxisElement.children].map(x => x.value);
    }
    set xAxis(xAxis) {
        this.xResolution = xAxis.length;
        const thisClass = this;
        xAxis.forEach(function(xAxisValue, xAxisIndex) { const xAxisElement = thisClass.#xAxisElement.children[xAxisIndex]; xAxisElement.value = xAxisValue; });
        //interpolation
        this.dispatchEvent(new Event(`change`));
    }
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
        if(this.xResolutionModifiable || yResolutionModifiable) {
            this.#xyResolutionDragElement.hidden = false;
            this.#resolutionElement.hidden = false;
        } else {
            this.#xyResolutionDragElement.hidden = true;
            this.#resolutionElement.hidden = true;
        }
    }
    get yResolution() {
        return this.#yAxisElement.children.length;
    }
    set yResolution(yResolution) {
        if(isNaN(yResolution) || yResolution === this.yResolution)
            return;

        const oldValue = this.value;
        let newValue = new Array(this.xResolution * yResolution);
        for(let x=0; x<this.xResolution; x++){
            for(let y=0; y<yResolution; y++){
                let valuesIndex = x + this.xResolution * y;
                if(y >= this.yResolution){
                    let valuesIndexMinus1 = x + this.xResolution * (y-1);
                    let valuesIndexMinus2 = x + this.xResolution * (y-2);
                    if(y>1){
                        newValue[valuesIndex] = newValue[valuesIndexMinus1] + (newValue[valuesIndexMinus1] - newValue[valuesIndexMinus2]);
                    }
                } else {
                    newValue[valuesIndex] = oldValue[valuesIndex];
                }
                if(isNaN(newValue[valuesIndex]))
                    newValue[valuesIndex] = 0;
            }
        }
        this.#yResolutionElement.value = yResolution;
        while(yResolution < this.#yAxisElement.children.length) { this.#yAxisElement.removeChild(this.#yAxisElement.children[yResolution]); }
        for(let i = this.#yAxisElement.children.length; i < yResolution; i++) { 
            const yAxisElement = this.#yAxisElement.appendChild(document.createElement(`div`)); 
            Object.defineProperty(yAxisElement, 'value', UITable.#cellValueGetterSetter);
            const yAxisMinus1 = this.#yAxisElement.children[i-1]?.value;
            const yAxisMinus2 = this.#yAxisElement.children[i-2]?.value;
            let yAxisMinus0 = 0;
            if(yAxisMinus1 !== undefined && yAxisMinus2 !== undefined)
                yAxisMinus0 = yAxisMinus1 + (yAxisMinus1 - yAxisMinus2);
            yAxisElement.value = yAxisMinus0;
            yAxisElement.y = i;
        }
        this.#resolutionChanged();
        this.#buildTableElement();
        this.value = newValue;
        this.dispatchEvent(new Event(`change`));
    }
    get yAxis() {
        return [...this.#yAxisElement.children].map(x => x.value);
    }
    set yAxis(yAxis) {
        this.yResolution = yAxis.length;
        const thisClass = this;
        yAxis.forEach(function(yAxisValue, yAxisIndex) { const yAxisElement = thisClass.#yAxisElement.children[yAxisIndex]; yAxisElement.value = yAxisValue; });
        //interpolation
        this.dispatchEvent(new Event(`change`));
    }

    get selecting() {
        return this.#selecting;
    }
    set selecting(selecting) {
        if(JSON.stringify(this.#selecting) === JSON.stringify(selecting))
            return;
        this.#selecting = selecting;
        this.#valueElement.querySelectorAll(`.selected`).forEach(function(element) { element.classList.remove(`selected`) });
        this.#xAxisElement.querySelectorAll(`.selected`).forEach(function(element) { element.classList.remove(`selected`) });
        this.#yAxisElement.querySelectorAll(`.selected`).forEach(function(element) { element.classList.remove(`selected`) });
        if(selecting) {
            let elementArray = this.#valueElement.children;
            if(isNaN(selecting.startX))
                elementArray = this.#yAxisElement.children;
            if(isNaN(selecting.startY))
                elementArray = this.#xAxisElement.children;
            for(let i=0; i<elementArray.length; i++) {
                let element = elementArray[i];
                if( Math.min(selecting.endX, selecting.startX) > parseInt(element.x) ||
                    Math.max(selecting.endX, selecting.startX) < parseInt(element.x) ||
                    Math.min(selecting.endY, selecting.startY) > parseInt(element.y) ||
                    Math.max(selecting.endY, selecting.startY) < parseInt(element.y)){
                    continue;
                }
                element.classList.add(`selected`); 
            };
        }
        this.dispatchEvent(new Event(`select`))
    }

    //Label properties
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

    //table entry number attributes
    get step() {
        return this.#valueInputElement.step;
    }
    set step(step) {
        this.#valueInputElement.step = step;
    }
    get min() {
        return this.#valueInputElement.min;
    }
    set min(min) {
        this.#valueInputElement.min = min;
    }
    get max() {
        return this.#valueInputElement.max;
    }
    set max(max) {
        this.#valueInputElement.max = max;
    }

    //trail properties
    trailTime = 2000;

    //elements
    #modifyElement          = document.createElement(`div`);
    #modifyAddElement       = document.createElement(`div`);
    #modifySubtractElement  = document.createElement(`div`);
    #modifyMultiplyElement  = document.createElement(`div`);
    #modifyDivideElement    = document.createElement(`div`);
    #modifyPercentElement   = document.createElement(`div`);
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

    #trailElement = document.createElementNS(`http://www.w3.org/2000/svg`, `svg`);
    #tableElement = document.createElement(`table`);
    #xLabelElement = document.createElement(`div`);
    #xLabel = undefined;
    #yLabelElement = document.createElement(`div`);
    #yLabel = undefined;
    #zLabelElement = document.createElement(`div`);
    #zLabel = undefined;
    #xyResolutionDragElement = document.createElement(`td`);
    #xResolutionDragElement = document.createElement(`td`);
    #yResolutionDragElement = document.createElement(`td`);
    #xAxisElement = document.createElement(`div`);
    #yAxisElement = document.createElement(`div`);
    #valueElement       = document.createElement(`div`);
    #valueInputElement  = document.createElement(`input`);
    #selecting;

    //delete onchange and migrate to addEventListener(`change`)
    onChange = [];
    constructor(prop) {
        super();
        this.class = `ui`;
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
        this.#pasteEqualElement.class           = `paste-button equal selected`;
        this.#pasteEqualElement.value           = `equal`;
        this.#pasteAddElement.class             = `paste-button add`;
        this.#pasteAddElement.value             = `add`;
        this.#pasteSubtractElement.class        = `paste-button subtract`;
        this.#pasteSubtractElement.value        = `subtract`;
        this.#pasteMultiplyElement.class        = `paste-button multiply`;
        this.#pasteMultiplyElement.value        = `multiply`;
        this.#pasteMultiplyPElement.class       = `paste-button multiplyp`;
        this.#pasteMultiplyPElement.value       = `multiply%`;
        this.#pasteMultiplyP2Element.class      = `paste-button multiplyp2`;
        this.#pasteMultiplyP2Element.value      = `multiply%/2`;
        this.#pasteMultiplyP2Element.innerHTML  = `<span><sup>%</sup>&frasl;<sub>2</sub></span>`;
        //modify toolbar
        this.#rightToolbarElement.append(this.#modifyElement);
        this.#modifyElement.class = `modify container`;
        this.#modifyElement.append(this.#modifyValueElement);
        this.#modifyElement.append(this.#modifyAddElement);
        this.#modifyElement.append(this.#modifySubtractElement);
        this.#modifyElement.append(this.#modifyMultiplyElement);
        this.#modifyElement.append(this.#modifyDivideElement);
        this.#modifyElement.append(this.#modifyPercentElement);
        this.#modifyElement.append(this.#modifyEqualElement);
        this.#modifyValueElement.type       = `number`;
        this.#modifyValueElement.class      = `modify-value`;
        this.#modifyAddElement.class        = `modify-button add`;
        this.#modifySubtractElement.class   = `modify-button subtract`;
        this.#modifyMultiplyElement.class   = `modify-button multiply`;
        this.#modifyDivideElement.class     = `modify-button divide`;
        this.#modifyPercentElement.class    = `modify-button percent`;
        this.#modifyEqualElement.class      = `modify-button equal`;
        this.#modifySubtractElement.hidden  = true;
        this.#modifyDivideElement.hidden    = true;
        this.#modifyPercentElement.hidden    = true;
        //interpolate toolbar
        this.#rightToolbarElement.append(this.#interpolateElement);
        this.#interpolateElement.class = `interpolate container`;
        this.#interpolateElement.append(this.#interpolateXElement);
        this.#interpolateElement.append(this.#interpolateYElement);
        this.#interpolateElement.append(this.#interpolateXYElement);
        this.#interpolateXElement.class     = `modify-button interpolatex`;
        this.#interpolateYElement.class     = `modify-button interpolatey`;
        this.#interpolateXYElement.class    = `modify-button interpolatexy`;
        //trail
        this.#trailElement.style = `position:absolute; pointer-events: none;" z-index="100`;
        this.#trailElement.setAttribute(`overflow`, `visible`);
        this.#trailElement.setAttribute(`width`, 100);
        this.#trailElement.setAttribute(`height`, 60);
        this.#trailElement.classList.add(`trail`);
        //table
        this.append(this.#tableElement);
        this.#tableElement.class  = `numerictable`;
        this.#xLabelElement.class = `xlabel`;
        this.#yLabelElement.class = `ylabel`;
        this.#zLabelElement.class = `zlabel`;
        this.#xAxisElement.class  = `xAxis`;
        this.#yAxisElement.class  = `yAxis`;
        this.#valueElement.class  = `value`;
        this.#valueInputElement.type = `number`;
        this.#xResolutionDragElement.class = `xdrag`;
        this.#xResolutionDragElement.rowSpan = 2;
        this.#yResolutionDragElement.class = `ydrag`;
        this.#yResolutionDragElement.colSpan = 2;
        this.#xyResolutionDragElement.class = `xydrag`;
        const propValue = prop.value;
        delete prop.value;
        Object.assign(this, prop);
        this.value = propValue;
        //delete onchange and migrate to addEventListener(`change`)
        if(!Array.isArray(this.onChange))
            this.onChange = [ this.onChange ];
        const thisClass = this;
        this.addEventListener(`change`, function() {
            thisClass.onChange.forEach(function(onChange) { onChange(); });
        });

        this.#buildTableElement();

        this.#constructTableEventListeners();
        this.#constructModifyEventListeners();
        this.#constructInterpolateEventListeners();
    }
    static #cellValueGetterSetter = {
        get: function() { return parseFloat(this.style.getPropertyValue(`--data-value`)); },
        set: function(value) { 
            value = parseFloat(value);
            this.style.setProperty(`--data-value`, value);
            const inputElement = this.querySelector(`input`);
            if(inputElement) inputElement.value = value;
            else {
                const innerHTML = UITable.#formatElementForDisplay(value);
                if(this.innerHTML !== innerHTML)
                    this.innerHTML = innerHTML;
            }
        }
    }
    static #formatElementForDisplay(value, precision = 6) {
        let formattedVaue = parseFloat(parseFloat(parseFloat(value).toFixed(precision -1)).toPrecision(precision));
        if(isNaN(formattedVaue))
            formattedVaue = `&nbsp;`;
        return formattedVaue;
    }

    trail(x, y = 0, z) {
        const xAxis = this.xAxis;
        const yAxis = this.yAxis;
        const cellWidth = this.#valueElement.firstChild.offsetWidth;
        const cellHeight = this.#valueElement.firstChild.offsetHeight;
        const cellX = this.#valueElement.firstChild.offsetLeft;
        const celly = this.#valueElement.firstChild.offsetTop;
        let xAxisIndex = xAxis.findIndex(tx => tx>x);
        if(xAxisIndex < 0) xAxisIndex = xAxis.length-1;
        else if(xAxisIndex > 0 && xAxisIndex < xAxis.length-1) xAxisIndex += (x - xAxis[xAxisIndex-1])/ (xAxis[xAxisIndex] - xAxis[xAxisIndex-1]) - 1;
        let yAxisIndex = yAxis.findIndex(ty => ty>y);
        if(yAxisIndex < 0) yAxisIndex = yAxis.length-1;
        else if(yAxisIndex > 0 && yAxisIndex < yAxis.length-1) yAxisIndex += (y - yAxis[yAxisIndex-1])/ (yAxis[yAxisIndex] - yAxis[yAxisIndex-1]) - 1;
        x = cellX + xAxisIndex * cellWidth + cellWidth/2;
        y = celly + yAxisIndex * cellHeight + cellHeight/2;

        let ellipse;
        if(this.#trailElement.children.length > 0) {
            ellipse = this.#trailElement.firstChild;
            let line = document.createElementNS('http://www.w3.org/2000/svg','line');
            line.setAttribute(`x1`, ellipse.getAttribute(`cx`));
            line.setAttribute(`y1`, ellipse.getAttribute(`cy`));
            line.setAttribute(`x2`, x);
            line.setAttribute(`y2`, y);
            if(this.#trailElement.children.length > 1)
                this.#trailElement.insertBefore(line, this.#trailElement.children[1]);
            else
                this.#trailElement.append(line);
        } else {
            ellipse = document.createElementNS('http://www.w3.org/2000/svg','ellipse');
            this.#trailElement.append(ellipse);
        }
        ellipse.setAttribute(`rx`, cellWidth/2);
        ellipse.setAttribute(`ry`, cellHeight/2);
        ellipse.setAttribute(`cx`, x);
        ellipse.setAttribute(`cy`, y);

        const thisClass = this;
        setTimeout(function() {
            let last = thisClass.#trailElement.lastChild;
            if(last)
                thisClass.#trailElement.removeChild(last);
        }, this.trailTime);
    }

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
                row2.appendChild(document.createElement(`td`)).style = `width: auto; min-width: 2em;`;//auto width to take up zlabel slack
                const yAxisLabel = row2.appendChild(document.createElement(`td`));
                yAxisLabel.class = `ytrans`;
                yAxisLabel.append(this.#yLabelElement);
                row3.appendChild(document.createElement(`td`)).colSpan = 2;// pick up slack for ydrag
            }
            const yAxisTd = row2.appendChild(document.createElement(`td`));
            yAxisTd.class = `yaxis`;
            yAxisTd.append(this.#yAxisElement)
            row3.append(this.#yResolutionDragElement);
            row3.append(this.#xyResolutionDragElement);
        } else if (xResolution > 1) {
            const xAxisLabel    = row2.appendChild(document.createElement(`td`));
            xAxisLabel.class    = `xztrans`
            xAxisLabel.append(this.#xLabelElement);
        }
        const valueTd = row2.appendChild(document.createElement(`td`));
        valueTd.append(this.#trailElement);
        valueTd.append(this.#valueElement);
    }
    
    get #valueMin() {
        let valuemin = parseFloat(this.style.getPropertyValue('--valuemin'));
        return isNaN(valuemin)? 18000000000000000000 : valuemin;
    }
    set #valueMin(valueMin) {
        this.style.setProperty('--valuemin', valueMin);
    }
    get #valueMax() {
        let valuemax = parseFloat(this.style.getPropertyValue('--valuemax'));
        return isNaN(valuemax)? -9000000000000000000 : valuemax;
    }
    set #valueMax(valueMax) {
        this.style.setProperty('--valuemax', valueMax);
    }

    #resolutionChanged() {
        this.style.setProperty('--xresolution', this.xResolution);
        this.style.setProperty('--yresolution', this.yResolution);
        while(this.xResolution * this.yResolution < this.#valueElement.children.length) { this.#valueElement.removeChild(this.#valueElement.children[this.xResolution * this.yResolution]); }
        for(let i = 0; i < this.xResolution * this.yResolution; i++) { 
            const valueElement = this.#valueElement.children[i] ?? this.#valueElement.appendChild(document.createElement(`div`));
            Object.defineProperty(valueElement, 'value', UITable.#cellValueGetterSetter);
            valueElement.x = i % this.xResolution;
            valueElement.y = Math.trunc(i/this.xResolution);
        }
        if(this.xResolution > 1) {
            if(this.yResolution > 1) {
                this.#interpolateElement.classList.add(`interpolatexy`);
                this.#interpolateXYElement.hidden = false;
            } else {
                this.#interpolateElement.classList.remove(`interpolatexy`);
                this.#interpolateXYElement.hidden = true;
            }
            this.#interpolateXElement.hidden = false;
        }
        else {
            this.#interpolateElement.classList.remove(`interpolatexy`);
            this.#interpolateXYElement.hidden = true;
            this.#interpolateXElement.hidden = true;
        }
        if(this.yResolution > 1)
            this.#interpolateYElement.hidden = false;
        else
            this.#interpolateYElement.hidden = true;
    }
    #boundAxis(element) {
        if(element !== this.#xAxisElement && element !== this.#yAxisElement)
            return;
        let amin;
        let amax;
        if(element === this.#xAxisElement) {
            amin=Math.max(this.selecting.endX, this.selecting.startX);
            amax=Math.max(this.selecting.endX, this.selecting.startX);
        } else {
            amin=Math.max(this.selecting.endY, this.selecting.startY);
            amax=Math.max(this.selecting.endY, this.selecting.startY);
        }

        let mima = element.children[amax].value;
        for(let a=amax+1; a<element.children.length; a++) {
            if(element.children[a].value < mima) 
                element.children[a].value = mima;
            mima = element.children[a].value;
        }
        mima = element.children[amin].value;
        for(let a=amin-1; a>=0; a--) {
            if(element.children[a].value > mima) 
                element.children[a].value = mima;
            mima = element.children[a].value;
        }
    }

    //event listeners
    #constructTableEventListeners() {
        const thisClass = this;
        function calculateMinMaxValue() {
            thisClass.#valueMin = 18000000000000000000;
            thisClass.#valueMax = -9000000000000000000;
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
        this.#pasteOptionsElement.addEventListener(`click`, function(event) {
            let target = event.target;
            for(let i=0; i < 2; i++) if(!target.value) target = target.parentElement;
            if(target.value) {
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
        function valueInputChange(){
            if(!thisClass.#valueInputElement.parentElement)
                return;
            let x = parseInt(thisClass.#valueInputElement.parentElement.x);
            let y = parseInt(thisClass.#valueInputElement.parentElement.y);
            const oldVal = parseFloat(thisClass.#valueInputElement.value);
            let value = parseFloat(thisClass.#valueInputElement.value);
            if(isNaN(value) || value === oldVal || (x==undefined && y==undefined))
                return;
            
            let element = thisClass.#valueElement;
            if(isNaN(y))
                element = thisClass.#xAxisElement;
            else if(isNaN(x))
                element = thisClass.#yAxisElement;

            let operation = `equal`;
            // if(value - oldVal === Math.floor(oldVal+1) - oldVal) {
            //     operation = `increment`;
            //     value = oldVal + 1;
            // } else if(value - oldVal === Math.ceil(oldVal-1) - oldVal) {
            //     operation = `decrement`;
            //     value = oldVal - 1;
            // }
            element.querySelectorAll(`.selected`).forEach(function(selectedElement) {
                if(operation === `increment`)
                    selectedElement.value = parseFloat(selectedElement.value) + 1
                else if(operation === `decrement`)
                    selectedElement.value = parseFloat(selectedElement.value) - 1;
                else
                    selectedElement.value = value;
            });

            thisClass.#boundAxis(element);
        }
        this.#valueInputElement.addEventListener(`change`, valueInputChange); 

        thisClass.#valueInputElement.addEventListener(`copy`, function(event){
            let copyData = ``;

            let currentY;
            thisClass.#tableElement.querySelectorAll(`.selected`).forEach(function(element) {
                if(element.value === undefined)
                    return;
                let y = parseInt(element.y ?? -1);
                if(currentY !== undefined) {
                    if(currentY !== y) {
                        copyData += `\n`;
                    } else {
                        copyData += `\t`;
                    }
                }
                copyData += element.value;
                currentY = y;
            })

            event.clipboardData.setData(`text/plain`, copyData);
            event.preventDefault();
        });

        thisClass.#valueInputElement.addEventListener(`paste`, function(event){
            var val = event.clipboardData.getData(`text/plain`);
            const lines = val.split(`\n`).length;
            const cols = val.split(`\t`).length;
            let x = parseInt(event.target.parentElement.x);
            let y = parseInt(event.target.parentElement.y);
            let element = thisClass.#valueElement;
            if(isNaN(x)) {
                if(cols > 1)
                    return;
                x = 0;
                element = thisClass.#yAxisElement;
            }
            if(isNaN(y)) {
                if(lines > 1)
                    return;
                y = 0;
                element = thisClass.#xAxisElement;
            }

            let special = thisClass.#pasteOptionsElement.querySelector(`.selected`)?.value;

            val.split(`\n`).forEach(function(val, yIndex) {
                var yPos = y + yIndex;
                if(yPos > thisClass.yResolution - 1)
                    return;
                if(element === thisClass.#valueElement)
                    yPos *= thisClass.xResolution;
                val.split(`\t`).forEach(function(val, xIndex) {
                    var xPos = x + xIndex;
                    if(xPos > thisClass.xResolution - 1)
                        return;

                    var v = parseFloat(val);

                    let numberElement = element.children[xPos + yPos];
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
                });
            });
            thisClass.selecting = {
                startX: x,
                startY: y,
                endX: x + val.split(`\n`)[0].split(`\t`).length,
                endY: y + val.split(`\n`).length
            }
            event.preventDefault();
            thisClass.#boundAxis(element);
            thisClass.dispatchEvent(new Event(`change`));
        });

        this.#tableElement.addEventListener(`dragstart`, function(event) {
            event.preventDefault();
        });

        let dragX = false;
        let dragY = false;
        let selecting = false;

        function mouseMoveEvent(event) {
            move(event.pageX, event.pageY);
        }
        function touchMoveEvent(event) {
            var touch = event.touches[event.touches.length - 1];
            move(touch.pageX, touch.pageY);
        }

        function move(pageX, pageY) {
            if(dragX) {
                var width = thisClass.#xAxisElement.firstChild.offsetWidth;
                let diff = (pageX-dragX.startPageX)/width;
                const polarity = diff / Math.abs(diff);
                diff = parseInt((Math.abs(diff) + 1/2) * polarity);
                let xResolution = dragX.startXResolution + diff;
                if(xResolution < 2)
                    xResolution = 2;
                thisClass.xResolution = xResolution;
            }
            if(dragY) {
                var height = thisClass.#yAxisElement.firstChild.offsetHeight;
                let diff = (pageY-dragY.startPageY)/height;
                const polarity = diff / Math.abs(diff);
                diff = parseInt((Math.abs(diff) + 1/2) * polarity);
                let yResolution = dragY.startYResolution + diff;
                if(yResolution < 2)
                    yResolution = 2;
                thisClass.yResolution = yResolution;
            }
            if(selecting) {
                var rect = selecting.startElement.getBoundingClientRect();
                let xDiff = pageX - rect.left;
                if(xDiff < 0)
                    xDiff -= rect.width;
                let yDiff = pageY - rect.top;
                if(yDiff < 0)
                    yDiff -= rect.height;
                xDiff = parseInt(xDiff/rect.width);
                yDiff = parseInt(yDiff/rect.height);
                selecting.endX = Math.min(thisClass.xResolution-1, Math.max(0, selecting.startX + xDiff));
                selecting.endY = Math.min(thisClass.yResolution-1, Math.max(0, selecting.startY + yDiff));
                if(Math.abs(xDiff) > 0 || Math.abs(yDiff) > 0)
                    selecting.selectOnMove = false;
                if(!selecting.selectOnMove) {
                    thisClass.selecting = {
                        startX: selecting.startX,
                        startY: selecting.startY,
                        endX: selecting.endX,
                        endY: selecting.endY
                    }
                }
            }
        }

        let addSelectNumber = false;
        function up() {
            dragX = false;
            dragY = false;
            if(selecting) {
                const targetIsDataValue = selecting.startElement.x !== undefined || selecting.startElement.y !== undefined;
                if(addSelectNumber) {
                    if(targetIsDataValue) {
                        selecting.startElement.innerHTML = ``;
                        thisClass.#valueInputElement.value = selecting.startElement.value;
                        selecting.startElement.append(thisClass.#valueInputElement);
                        thisClass.#valueInputElement.select();
                    }
                }
            }
            selecting = false;
            document.removeEventListener(`touchmove`, touchMoveEvent);
            document.removeEventListener(`mousemove`, mouseMoveEvent);

        }
        document.addEventListener(`mouseup`, up);
        document.addEventListener(`touchend`, up);

        function down(event) {
            addSelectNumber = false;
            const targetIsDataValue = event.target.x !== undefined || event.target.y !== undefined;
            const parentIsDataValue = event.target.parentElement.x !== undefined || event.target.parentElement.y !== undefined;
            if(targetIsDataValue || parentIsDataValue) {
                selecting = { startElement: targetIsDataValue? event.target : event.target.parentElement, selectOnMove: parentIsDataValue };
                selecting.startX = parseInt(selecting.startElement.x);
                selecting.startY = parseInt(selecting.startElement.y);
                if(targetIsDataValue) {
                    valueInputChange();
                    if(!selecting.selectOnMove) {
                        thisClass.selecting = {
                            startX: selecting.startX,
                            startY: selecting.startY,
                            endX: selecting.startX,
                            endY: selecting.startY
                        }
                    }
                }
                if(event.target.type !== `number`) {
                    addSelectNumber = true;
                    thisClass.#tableElement.querySelectorAll(`input`)?.forEach(function(element) { element.parentElement.innerHTML = UITable.#formatElementForDisplay(element.parentElement.value); });
                }
            }
            document.addEventListener(`touchmove`, touchMoveEvent);
            document.addEventListener(`mousemove`, mouseMoveEvent);
        }
        this.#tableElement.addEventListener(`mousedown`, function(event) {
            if(event.button === 2) {
                down(event);
                event.target.select();
                up(event);
                event.preventDefault();
            } else if(event.button == 0) {
                down(event);
            }
        });
        this.#tableElement.addEventListener(`contextmenu`, function(event) {
            down(event);
            event.preventDefault();
        });

        this.#xyResolutionDragElement.addEventListener(`mousedown`, function(event) {
            dragX = { startPageX: event.pageX, startXResolution: thisClass.xResolution };
            dragY = { startPageY: event.pageY, startYResolution: thisClass.yResolution };
            document.addEventListener(`mousemove`, mouseMoveEvent);
        });
        this.#xResolutionDragElement.addEventListener(`mousedown`, function(event) {
            dragX = { startPageX: event.pageX, startXResolution: thisClass.xResolution };
            document.addEventListener(`mousemove`, mouseMoveEvent);
        });
        this.#yResolutionDragElement.addEventListener(`mousedown`, function(event) {
            dragY = { startPageY: event.pageY, startYResolution: thisClass.yResolution };
            document.addEventListener(`mousemove`, mouseMoveEvent);
        });

    }
    #constructModifyEventListeners() {
        const thisClass = this;
        this.#valueInputElement.addEventListener(`keypress`, function(event){
            //plus
            if(event.key === `+`) {
                event.preventDefault();
                thisClass.#modifyValueElement.select();
                thisClass.#modifyAddElement.classList.add(`selected`)
            }
            //minus
            if(event.key === `-`) {
                event.preventDefault();
                thisClass.#modifyAddElement.hidden = true;
                thisClass.#modifySubtractElement.hidden = false;
                thisClass.#modifyValueElement.select();
                thisClass.#modifySubtractElement.classList.add(`selected`)
            }
            //aterisk
            if(event.key === `*`) {
                event.preventDefault();
                thisClass.#modifyValueElement.select();
                thisClass.#modifyMultiplyElement.classList.add(`selected`)
            }
            //forward slash
            if(event.key === `/`) {
                event.preventDefault();
                thisClass.#modifyMultiplyElement.hidden = true;
                thisClass.#modifyDivideElement.hidden = false;
                thisClass.#modifyValueElement.select();
                thisClass.#modifyDivideElement.classList.add(`selected`)
            }
            //percent
            if(event.key === `%`) {
                event.preventDefault();
                thisClass.#modifyMultiplyElement.hidden = true;
                thisClass.#modifyPercentElement.hidden = false;
                thisClass.#modifyValueElement.select();
                thisClass.#modifyPercentElement.classList.add(`selected`)
            }
            //equals
            if(event.key === `=`) {
                event.preventDefault();
                thisClass.#modifyValueElement.select();
                thisClass.#modifyEqualElement.classList.add(`selected`)
            }
        });
        function modify(operation) {
            const value = parseFloat(thisClass.#modifyValueElement.value);
            if(isNaN(value))
                return;
            
            let element = thisClass.#valueElement;
            if(thisClass.#modifyValueElement.parentElement.x === undefined)
                element = thisClass.#yAxisElement;
            if(thisClass.#modifyValueElement.parentElement.y === undefined)
                element = thisClass.#xAxisElement;
            element.querySelectorAll(`.selected`).forEach(function(selectedElement) {
                switch(operation) {
                    case `equal`:
                        selectedElement.value = value;
                        break;
                    case `add`:
                        selectedElement.value += value;
                        break;
                    case `subtract`:
                        selectedElement.value -= value;
                        break;
                    case `multiply`:
                        selectedElement.value *= value;
                        break;
                    case `divide`:
                        selectedElement.value /= value;
                        break;
                    case `percent`:
                        selectedElement.value *= 1 + (value/100);
                        break;
                    default:
                        return;
                }
            });

            thisClass.#boundAxis(element);
            thisClass.dispatchEvent(new Event(`change`));
        }
        function blur() {
            thisClass.#modifyAddElement.hidden      = false;
            thisClass.#modifySubtractElement.hidden = true;
            thisClass.#modifyMultiplyElement.hidden = false;
            thisClass.#modifyDivideElement.hidden   = true;
            thisClass.#modifyPercentElement.hidden   = true;
            for(let i=0; i<thisClass.#modifyElement.children.length; i++) thisClass.#modifyElement.children[i].classList.remove(`selected`);
        }
        this.#modifyValueElement.addEventListener(`blur`, blur);
        this.#modifyValueElement.addEventListener(`keypress`, function(event) {
            if(event.key !== `Enter`)
                return;
            thisClass.#modifyElement.querySelector(`.selected`)?.dispatchEvent(new Event(`click`));
            blur();
            thisClass.#valueInputElement.select();
        });
        this.#modifyEqualElement.addEventListener(`click`, function() {
            modify(`equal`);
        });
        this.#modifyAddElement.addEventListener(`click`, function() {
            modify(`add`);
        });
        this.#modifySubtractElement.addEventListener(`click`, function() {
            modify(`subtract`);
        });
        this.#modifyMultiplyElement.addEventListener(`click`, function() {
            modify(`multiply`);
        });
        this.#modifyDivideElement.addEventListener(`click`, function() {
            modify(`divide`);
        });
        this.#modifyPercentElement.addEventListener(`click`, function() {
            modify(`percent`);
        });
    }
    #constructInterpolateEventListeners() {
        const thisClass = this;
        function interpolateX() {
            let selectedElements = thisClass.#valueElement.querySelectorAll(`.selected`);
            if(selectedElements.length < 3) {
                selectedElements = thisClass.#xAxisElement.querySelectorAll(`.selected`);
                if(selectedElements.length < 3)
                    return;
            }
            let xMin = 18000000000000000000;
            let xMax = -9000000000000000000;
            selectedElements.forEach(function(element) {
                const x = parseInt(element.x);
                if(x < xMin)
                    xMin = x;
                if(x > xMax)
                    xMax = x;
            });
            const xAxis = thisClass.xAxis;
            const xDiff = xAxis[xMax] - xAxis[xMin];
            if(selectedElements === thisClass.#valueElement) {
                const xResolution = thisClass.xResolution;
                const tableValue = thisClass.value;
                selectedElements.forEach(function(element) {
                    const x = parseInt(element.x);
                    const y = parseInt(element.y);
                    if(!isNaN(x) && !isNaN(y)) {
                        const xMinVal = tableValue[xMin + y * xResolution];
                        const xMaxVal = tableValue[xMax + y * xResolution];
                        const xMag = (xMaxVal - xMinVal) / xDiff;
                        let value = xMinVal + xMag * (xAxis[x]-xAxis[xMin]);
                        element.value = value;
                    }
                });
            } else {
                const xMag = xDiff / (xMax - xMin);
                selectedElements.forEach(function(element) {
                    const x = parseInt(element.x);
                    element.value = xAxis[xMin] + xMag * (x-xMin);
                });
            }
            thisClass.dispatchEvent(new Event(`change`));
        };
        function interpolateY() {
            let selectedElements = thisClass.#valueElement.querySelectorAll(`.selected`);
            if(selectedElements.length < 3) {
                selectedElements = thisClass.#yAxisElement.querySelectorAll(`.selected`);
                if(selectedElements.length < 3)
                    return;
            }
            let yMin = 18000000000000000000;
            let yMax = -9000000000000000000;
            selectedElements.forEach(function(element) {
                const y = parseInt(element.y);
                if(y < yMin)
                    yMin = y;
                if(y > yMax)
                    yMax = y;
            });
            const yAxis = thisClass.yAxis;
            const yDiff = yAxis[yMax] - yAxis[yMin];
            if(selectedElements === thisClass.#valueElement) {
                const xResolution = thisClass.xResolution;
                const tableValue = thisClass.value;
                selectedElements.forEach(function(element) {
                    const x = parseInt(element.x);
                    const y = parseInt(element.y);
                    if(!isNaN(x) && !isNaN(y)) {
                        const yMinVal = tableValue[x + yMin * xResolution];
                        const yMaxVal = tableValue[x + yMax * xResolution];
                        const yMag = (yMaxVal - yMinVal) / yDiff;
                        let value = yMinVal + yMag * (yAxis[y]-yAxis[yMin]);
                        element.value = value;
                    }
                });
            } else {
                const yMag = yDiff / (yMax - yMin);
                selectedElements.forEach(function(element) {
                    const y = parseInt(element.y);
                    element.value = yAxis[yMin] + yMag * (y-yMin);
                });
            }
            thisClass.dispatchEvent(new Event(`change`));
        };
        this.#interpolateXYElement.addEventListener(`click`, function() {
            const selectedElements = thisClass.#valueElement.querySelectorAll(`.selected`);
            if(selectedElements.length < 5) {
                if(thisClass.#xAxisElement.querySelectorAll(`.selected`).length > 2)
                    interpolateX();
                if(thisClass.#yAxisElement.querySelectorAll(`.selected`).length > 2)
                    interpolateY();
            }
            let xMin = 18000000000000000000;
            let xMax = -9000000000000000000;
            let yMin = 18000000000000000000;
            let yMax = -9000000000000000000;
            selectedElements.forEach(function(element) {
                const x = parseInt(element.x);
                const y = parseInt(element.y);
                if(x < xMin)
                    xMin = x;
                if(x > xMax)
                    xMax = x;
                if(y < yMin)
                    yMin = y;
                if(y > yMax)
                    yMax = y;
            });
            const xAxis = thisClass.xAxis;
            const yAxis = thisClass.yAxis;
            const xDiff = xAxis[xMax] - xAxis[xMin];
            const yDiff = yAxis[yMax] - yAxis[yMin];
            const xResolution = thisClass.xResolution;
            const tableValue = thisClass.value;
            selectedElements.forEach(function(element) {
                const x = parseInt(element.x);
                const y = parseInt(element.y);
                if(y !== yMin && y !== yMax)
                    return
                if(!isNaN(x) && !isNaN(y)) {
                    const xMinVal = tableValue[xMin + y * xResolution];
                    const xMaxVal = tableValue[xMax + y * xResolution];
                    const xMag = (xMaxVal - xMinVal) / xDiff;
                    let value = xMinVal + xMag * (xAxis[x]-xAxis[xMin]);
                    element.value = value;
                }
            });
            selectedElements.forEach(function(element) {
                const x = parseInt(element.x);
                const y = parseInt(element.y);
                if(x !== xMin && x !== xMax)
                    return
                if(!isNaN(x) && !isNaN(y)) {
                    const yMinVal = tableValue[x + yMin * xResolution];
                    const yMaxVal = tableValue[x + yMax * xResolution];
                    const yMag = (yMaxVal - yMinVal) / yDiff;
                    let value = yMinVal + yMag * (yAxis[y]-yAxis[yMin]);
                    element.value = value;
                }
            });
            selectedElements.forEach(function(element) {
                const x = parseInt(element.x);
                const y = parseInt(element.y);
                if(!isNaN(x) && !isNaN(y)) {
                    const xMinVal = tableValue[xMin + y * xResolution];
                    const xMaxVal = tableValue[xMax + y * xResolution];
                    const xMag = (xMaxVal - xMinVal) / xDiff;
                    const yMinVal = tableValue[x + yMin * xResolution];
                    const yMaxVal = tableValue[x + yMax * xResolution];
                    const yMag = (yMaxVal - yMinVal) / yDiff;
                    let value = xMinVal + xMag * (xAxis[x]-xAxis[xMin]) + yMinVal + yMag * (yAxis[y]-yAxis[yMin]);
                    value /= 2;
                    element.value = value;
                }
            });
            thisClass.dispatchEvent(new Event(`change`));
        });
        this.#interpolateXElement.addEventListener(`click`, interpolateX);
        this.#interpolateYElement.addEventListener(`click`, interpolateY);
    }
}
customElements.define('ui-table', UITable, { extends: 'div' });