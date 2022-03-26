import UITableBase from "./UITableBase.js"

export default class UIGraph2D extends UITableBase {
    get xAxis() { return super.xAxis; }
    set xAxis(xAxis) {
        super.xAxis = xAxis;
        this._valueElement.update();
        this.#valueLineElement.update();
        this._xAxisElement.update();
        this._yAxisElement.update();
    }
    get yAxis() { return super.yAxis; }
    set yAxis(yAxis) {
        super.yAxis = yAxis;
        this._valueElement.update();
        this.#valueLineElement.update();
        this._xAxisElement.update();
        this._yAxisElement.update();
    }
    get axis() {
        if(this.xResolution < 2)
            return this.yAxis;
        return this.xAxis;
    }
    set axis(axis) {
        if(this.xResolution < 2)
            this.yAxis = axis;
        else
            this.xAxis = axis;
    }
    get selecting() {
        return super.selecting;
    }
    set selecting(selecting) {
        if(JSON.stringify(this.selecting) === JSON.stringify(selecting))
            return;
        this.#valueLineElement.querySelectorAll(`.selected`).forEach(function(element) { element.classList.remove(`selected`) });
        if(selecting) {
            if( selecting.startX !== undefined && selecting.endX !== undefined &&
                selecting.startY !== undefined && selecting.endY !== undefined) {
                for(let i=0; i<this.#valueLineElement.children.length; i++) {
                    let element = this.#valueLineElement.children[i];
                    if( Math.min(selecting.endX, selecting.startX) > parseInt(element.x1) ||
                        Math.max(selecting.endX, selecting.startX) < parseInt(element.x2) ||
                        Math.min(selecting.endY, selecting.startY) > parseInt(element.y1) ||
                        Math.max(selecting.endY, selecting.startY) < parseInt(element.y3)){
                        continue;
                    }
                    element.classList.add(`selected`); 
                }
            }
        }
        super.selecting = selecting;
    }
    get width() {
        return this.#svgElement.getAttribute(`width`) ?? this.offsetWidth ?? 300;
    }
    set width(width) {
        this.#svgElement.setAttribute(`width`, width);
        const textSize = width/(7.5 * Math.max(this.xResolution, this.yResolution));
        const r = textSize/2;
        this.#paddingLeft = textSize * 5;
        this.#paddingBottom = r + textSize;
        this.#paddingTop = r;
        this.#paddingRight = r;
        [...this._valueElement.children].forEach(function(element) { element.textSize = textSize; element.setAttribute(`r`, r.toFixed(10)); element.update(); });
        [...this._xAxisElement.children].forEach(function(element) { element.textSize = textSize; element.r = r; element.update(); });
        [...this._yAxisElement.children].forEach(function(element) { element.textSize = textSize; element.r = r; element.update(); });
        [...this.#zAxisElement.children].forEach(function(element) { element.textSize = textSize; element.r = r; element.update(); });
    }
    get height() {
        return this.#svgElement.getAttribute(`height`) ?? this.offsetHeight ?? 150;
    }
    set height(height) {
        this.#svgElement.setAttribute(`height`, height);
        [...this._valueElement.children].forEach(function(element) { element.update(); });
        [...this._xAxisElement.children].forEach(function(element) { element.update(); });
        [...this._yAxisElement.children].forEach(function(element) { element.update(); });
        [...this.#zAxisElement.children].forEach(function(element) { element.update(); });
    }

    #zAxisElement       = document.createElementNS('http://www.w3.org/2000/svg','g');
    _xAxisElement       = document.createElementNS('http://www.w3.org/2000/svg','g');
    _yAxisElement       = document.createElementNS('http://www.w3.org/2000/svg','g');
    _valueElement       = document.createElementNS('http://www.w3.org/2000/svg','g');
    #valueLineElement   = document.createElementNS('http://www.w3.org/2000/svg','g');
    #svgElement         = document.createElementNS('http://www.w3.org/2000/svg','svg');

    trail(x, y = 0, z) {/*TODO*/}
    
    get _valueMin() { return super._valueMin; }
    set _valueMin(valueMin) {
        super._valueMin = valueMin;
        this._valueElement.update();
        this.#valueLineElement.update();
        this.#zAxisElement.update();
    }
    get _valueMax() { return super._valueMax; }
    set _valueMax(valueMax) {
        super._valueMax = valueMax;
        this._valueElement.update();
        this.#valueLineElement.update();
        this.#zAxisElement.update();
    }

    //delete onchange and migrate to addEventListener(`change`)
    onChange = [];
    constructor(prop) {
        super();
        this.class = `ui graph2d`;
        this.append(this.#svgElement);
        this.#svgElement.setAttribute(`overflow`, `visible`)
        this.#svgElement.append(this._xAxisElement);
        this.#svgElement.append(this._yAxisElement);
        this.#svgElement.append(this.#zAxisElement);
        this.#svgElement.append(this.#valueLineElement);
        this.#svgElement.append(this._valueElement);
        function update() {
            [...this.children].forEach(function(element) { element.update(); });
        }
        this._xAxisElement.update = update;
        this._yAxisElement.update = update;
        this.#zAxisElement.update = update;
        this._valueElement.update = update;
        this.#valueLineElement.update = update;
        const propValue = prop.value;
        delete prop.value;
        Object.assign(this, prop);
        this.#createEventListeners();
        this.value = propValue;
        //delete onchange and migrate to addEventListener(`change`)
        const thisClass = this;
        if(!Array.isArray(this.onChange))
            this.onChange = [ this.onChange ];
        this.addEventListener(`change`, function() {
            thisClass.onChange.forEach(function(onChange) { onChange(); });
        });
    }
    #paddingLeft = 75;
    #paddingBottom = 25;
    #paddingRight = 25;
    #paddingTop = 25;
    #cellToPoint(x, y, value) {
        if(isNaN(value))
            return;
        const axis = this.axis;
        const axisIndex = this.xResolution < 2? y : x;
        const axisMax = axis[axis.length - 1];
        const axisMin = axis[0];
        const axisX = this.#paddingLeft + (this.width-this.#paddingLeft-this.#paddingRight) * (axis[axisIndex] - axisMin)/(axisMax-axisMin);

        const valueY = this.height - (this.#paddingBottom + (this.height-this.#paddingBottom-this.#paddingTop) * (value - this._valueMin)/(this._valueMax-this._valueMin));
        return [axisX, valueY];
    }
    #axisToLine(x, y) {
        const axis = x === undefined? this.yAxis : this.xAxis;
        const axisIndex = x === undefined? y : x;
        const axisMax = axis[axis.length - 1];
        const axisMin = axis[0];
        const axisX = this.#paddingLeft + (this.width-this.#paddingLeft-this.#paddingRight) * (axis[axisIndex] - axisMin)/(axisMax-axisMin);

        const axisY1 = this.height-this.#paddingBottom;
        const axisY2 = this.#paddingTop;

        return [[axisX, axisY1], [axisX, axisY2]];
    }
    #zAxisToLine(zValue) {
        const axisX1 = this.#paddingLeft;
        const axisX2 = this.width-this.#paddingRight;
        
        const axisY = this.height - (this.#paddingBottom + (this.height-this.#paddingBottom-this.#paddingTop) * (zValue - this._valueMin)/(this._valueMax-this._valueMin));

        return [[axisX1, axisY], [axisX2, axisY]];
    }

    _resolutionChanged(axisElements, axisResolution) {
        const thisClass = this;
        const textSize = this.width/(7.5 * Math.max(this.xResolution, this.yResolution, axisResolution));
        const r = textSize/2;
        this.#paddingLeft = textSize * 5;
        this.#paddingBottom = r + textSize;
        this.#paddingTop = r;
        this.#paddingRight = r;
        while(axisResolution < axisElements.children.length) { axisElements.removeChild(axisElements.lastChild); }
        for(let i = axisElements.children.length; i < axisResolution; i++) { 
            const axisElement = axisElements.appendChild(document.createElementNS(`http://www.w3.org/2000/svg`,`g`)); 
            axisElement.append(document.createElementNS(`http://www.w3.org/2000/svg`,`line`));
            const textLabel = axisElement.appendChild(document.createElementNS(`http://www.w3.org/2000/svg`,`text`));
            textLabel.setAttribute(`alignment-baseline`, `hanging`);
            axisElement.update = function() {
                const line = thisClass.#axisToLine(this.x, this.y);
                this.children[0].setAttribute(`x1`, line[0][0]);
                this.children[0].setAttribute(`y1`, line[0][1]);
                this.children[0].setAttribute(`x2`, line[1][0]);
                this.children[0].setAttribute(`y2`, line[1][1]);

                this.children[1].setAttribute(`x`, line[0][0]);
                this.children[1].setAttribute(`y`, line[0][1] + this.r);
                this.children[1].setAttribute(`font-size`, this.textSize.toFixed(10));
                this.children[1].innerHTML = formatNumberForDisplay(this.value);
            }
            const axisMinus1 = axisElements.children[i-1]?.value;
            const axisMinus2 = axisElements.children[i-2]?.value;
            let axisMinus0 = 0;
            if(axisMinus1 !== undefined && axisMinus2 !== undefined) 
                axisMinus0 = axisMinus1 + (axisMinus1 - axisMinus2);
            axisElement.value = axisMinus0;
            if(axisElements === this._xAxisElement)
                axisElement.x = i;
            else
                axisElement.y = i;
        }
        for(let i = 0; i < this._xAxisElement.children.length; i++) { 
            const axisElement = this._xAxisElement.children[i];
            axisElement.textSize = textSize; 
            axisElement.children[1]?.setAttribute(`text-anchor`, `middle`);
            axisElement.r = r;
        }
        for(let i = 0; i < this._yAxisElement.children.length; i++) { 
            const axisElement = this._yAxisElement.children[i];
            axisElement.textSize = textSize; 
            axisElement.children[1]?.setAttribute(`text-anchor`, `middle`); 
            axisElement.r = r;
        }
        this._xAxisElement.lastChild?.children[1]?.setAttribute(`text-anchor`, `end`);
        this._yAxisElement.lastChild?.children[1]?.setAttribute(`text-anchor`, `end`);
        this._xAxisElement.firstChild?.children[1]?.setAttribute(`text-anchor`, `start`);
        this._yAxisElement.firstChild?.children[1]?.setAttribute(`text-anchor`, `start`);
        if(this.xResolution < 2) {
            this._xAxisElement.hidden = true;
            this._yAxisElement.hidden = false;
        } else {
            this._yAxisElement.hidden = true;
            this._xAxisElement.hidden = false;
        }
        const zResolution = parseInt(1.5+Math.max(this.xResolution, this.yResolution));
        while(zResolution < this.#zAxisElement.children.length) { this.#zAxisElement.removeChild(this.#zAxisElement.lastChild); }
        for(let i = 0; i < zResolution; i++) {
            let axisElement = this.#zAxisElement.children[i];
            if(!axisElement) {
                axisElement = this.#zAxisElement.appendChild(document.createElementNS(`http://www.w3.org/2000/svg`,`g`)); 
                axisElement.append(document.createElementNS(`http://www.w3.org/2000/svg`,`line`));
                const textLabel = axisElement.appendChild(document.createElementNS(`http://www.w3.org/2000/svg`,`text`));
                textLabel.setAttribute(`text-anchor`, `end`);
                axisElement.update = function() {
                    const zMag = (thisClass._valueMax - thisClass._valueMin)/(this.zResolution-1);
                    let zValue = zMag * this.z + thisClass._valueMin;
                    if(this.z === (this.zResolution-1))
                        zValue = thisClass._valueMax;
                    let line = thisClass.#zAxisToLine(zValue);
                    this.children[0].setAttribute(`x1`, line[0][0]);
                    this.children[0].setAttribute(`y1`, line[0][1]);
                    this.children[0].setAttribute(`x2`, line[1][0]);
                    this.children[0].setAttribute(`y2`, line[1][1]);

                    this.children[1].setAttribute(`x`, line[0][0] - this.r);
                    this.children[1].setAttribute(`y`, line[0][1]);
                    this.children[1].setAttribute(`font-size`, this.textSize.toFixed(10));
                    this.children[1].innerHTML = formatNumberForDisplay(zValue);
                }
            }
            if(i===0)
                axisElement.children[1].setAttribute(`alignment-baseline`, `normal`);
            else if(i===zResolution-1)
                axisElement.children[1].setAttribute(`alignment-baseline`, `hanging`);
            else
                axisElement.children[1].setAttribute(`alignment-baseline`, `middle`);
            axisElement.textSize = textSize;
            axisElement.zResolution = zResolution;
            axisElement.r = r;
            axisElement.z = i;
        }

        function getLineVGetterSetter(index) {
            let vi = `v${index}`;
            return {
                get: function() { return parseFloat(this.dataset[vi]); },
                set: function(v) { 
                    v = parseFloat(v);
                    if(this[vi] === v)
                        return;
                    this.dataset[vi] = v;
                    this.value = (parseFloat(this.v1) + parseFloat(this.v2))/2;
                    // this.update();
                }
            }
        }
        this.style.setProperty('--xresolution', this.xResolution);
        this.style.setProperty('--yresolution', this.yResolution);
        while(Math.max(0, (this.xResolution-1) * (this.yResolution)) < this.#valueLineElement.children.length) { this.#valueLineElement.removeChild(this.#valueLineElement.lastChild); }
        for(let i = 0; i < (this.xResolution-1) * (this.yResolution); i++) { 
            let valueLineElement = this.#valueLineElement.children[i];
            if(!valueLineElement) {
                valueLineElement = this.#valueLineElement.appendChild(document.createElementNS('http://www.w3.org/2000/svg','line'));
                Object.defineProperty(valueLineElement, 'value', {
                    get: function() { return parseFloat(this.style.getPropertyValue(`--data-value`)); },
                    set: function(value) { this.style.setProperty(`--data-value`, value); }
                });
                valueLineElement.update = function() {
                    if(!this.p1 || !this.p2)
                        return;
                        
                    this.setAttribute(`x1`, this.p1[0]);
                    this.setAttribute(`y1`, this.p1[1]);
                    this.setAttribute(`x2`, this.p2[0]);
                    this.setAttribute(`y2`, this.p2[1]);
                };
                Object.defineProperty(valueLineElement, 'v1', getLineVGetterSetter(1));
                Object.defineProperty(valueLineElement, 'v2', getLineVGetterSetter(2));
            }
            valueLineElement.xp1 = valueLineElement.xp2 = i % (this.xResolution-1);
            if(valueLineElement.xp1 + 1 < this.xResolution)
                valueLineElement.xp2++;
            valueLineElement.yp1 = valueLineElement.yp2 = Math.trunc(i/(this.xResolution-1));
        }
        const valueLineElements = [...thisClass.#valueLineElement.children];
        while(this.xResolution * this.yResolution < this._valueElement.children.length) { this._valueElement.removeChild(this._valueElement.lastChild); }
        for(let i = 0; i < this.xResolution * this.yResolution; i++) { 
            let valueElement = this._valueElement.children[i] 
            if(!valueElement) {
                valueElement = this._valueElement.appendChild(document.createElementNS('http://www.w3.org/2000/svg','circle'));
                Object.defineProperty(valueElement, 'value', {
                    get: function() { return parseFloat(this.style.getPropertyValue(`--data-value`)); },
                    set: function(value) { 
                        value = parseFloat(value);
                        if(this.value === value )
                            return;
                        if(value < thisClass._valueMin)
                            thisClass._valueMin = value;
                        if(value > thisClass._valueMax)
                            thisClass._valueMax = value;
                        this.style.setProperty(`--data-value`, value); 
                        this.update();
                        if(this.vl1) this.vl1.v1 = value;
                        if(this.vl2) this.vl2.v2 = value;
                    }
                });
                Object.defineProperty(valueElement, 'p', {
                    get: function() { return this.dataset.p? JSON.parse(this.dataset.p) : undefined; },
                    set: function(p) {
                        if(!p) 
                            return;
                        const jsonP = JSON.stringify(p);
                        if(jsonP === this.dataset.p)
                            return;
                        this.dataset.p = jsonP;
                        p[0] = p[0].toFixed(10);
                        p[1] = p[1].toFixed(10);
                        if(this.vl1) { this.vl1.p1 = p; this.vl1.v1 = this.value; }
                        if(this.vl2) { this.vl2.p2 = p; this.vl2.v2 = this.value; }
                    }
                });
                valueElement.update = function circleUpdater() {
                    if(!(this.p = thisClass.#cellToPoint(this.x, this.y, this.value)))
                        return;
                    const p = this.p;
                    this.setAttribute(`cx`, p[0]);
                    this.setAttribute(`cy`, p[1]);
                };
            }
            valueElement.x = i % this.xResolution;
            valueElement.y = Math.trunc(i/this.xResolution);
            valueElement.vl1 = valueLineElements.find(element => element.xp1 === valueElement.x && element.yp1 === valueElement.y);
            valueElement.vl2 = valueLineElements.find(element => element.xp2 === valueElement.x && element.yp2 === valueElement.y);
            valueElement.setAttribute(`r`, r.toFixed(10));
        }
    }

    #createEventListeners() {
        const thisClass = this;
        function minmax() {
            const minmax = calculateMinMaxValue(thisClass.value);
            thisClass._valueMin = minmax[0];
            thisClass._valueMax = minmax[1];
        }
        this.addEventListener(`change`, minmax);
        minmax();
        this.#svgElement.addEventListener('mousedown', function(event){
            var rect = thisClass.#svgElement.getBoundingClientRect();
            var relX = event.pageX - rect.left;
            var relY = event.pageY - rect.top;
            let circles = [...thisClass._valueElement.children].sort(function(a, b) { return a.depth-b.depth; });
            let closestCircle = undefined;
            let dragValue;
            circles.forEach(function(element, index) {
                let l = element.p[0] - relX;
                let w = element.p[1] - relY;
                element.dist = Math.sqrt(l*l+w*w);
                if(closestCircle === undefined || element.dist < closestCircle.dist)
                    closestCircle = element;
            });
            if(closestCircle && event.button === 0) {
                const x = closestCircle.x;
                const y = closestCircle.y;
                thisClass.selecting = {
                    startX: x,
                    startY: y,
                    endX: x,
                    endY: y
                }
                const axis = thisClass.axis;
                const axisElement = thisClass.xResolution < 2? thisClass._yAxisElement.children[closestCircle.y] : thisClass._xAxisElement.children[closestCircle.x];
                dragValue = {
                    pageX: event.pageX,
                    pageY: event.pageY,
                    closestCircle,
                    value: closestCircle.value,
                    mag: (thisClass._valueMax - thisClass._valueMin) / (thisClass.height - thisClass.#paddingTop - thisClass.#paddingBottom), 
                    axisElement,
                    axisValue: axisElement.value,
                    axisMag: (axis[axis.length - 1] - axis[0]) / (thisClass.width - thisClass.#paddingLeft - thisClass.#paddingRight)
                }
            }

            //dragValue
            if(dragValue) {
                function mouseMove(event) {
                    dragValue.closestCircle.value = dragValue.value + (dragValue.pageY - event.pageY) * dragValue.mag;
                    dragValue.axisElement.value = dragValue.axisValue + (event.pageX - dragValue.pageX) * dragValue.axisMag;

                    thisClass._boundAxis(dragValue.axisElement.parentElement);
                    thisClass.dispatchEvent(new Event(`change`));
                }
                function mouseUp() {
                    document.removeEventListener(`mousemove`, mouseMove);
                    document.removeEventListener(`mouseup`, mouseUp);
                }
                document.addEventListener(`mousemove`, mouseMove);
                document.addEventListener(`mouseup`, mouseUp);
            }
        });
    }
}
customElements.define(`ui-graph-2d`, UIGraph2D, { extends: `div` });