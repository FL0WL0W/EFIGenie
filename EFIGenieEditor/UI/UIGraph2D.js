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
    }
    get height() {
        return this.#svgElement.getAttribute(`height`) ?? this.offsetHeight ?? 150;
    }
    set height(height) {
        this.#svgElement.setAttribute(`height`, height);
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
        this.class = `ui graphd`;
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
        if(!Array.isArray(this.onChange))
            this.onChange = [ this.onChange ];
        this.addEventListener(`change`, function() {
            thisClass.onChange.forEach(function(onChange) { onChange(); });
        });
    }
    #cellToPoint(x, y, value) {
    //     if(isNaN(value))
    //         return;
    //     const xAxis = this.xAxis;
    //     const yAxis = this.yAxis;
    //     y = this.yResolution-y-1;
    //     x = (xAxis[x]-xAxis[0])/(xAxis[xAxis.length-1]-xAxis[0]);
    //     if(isNaN(x))
    //         x = 0;
    //     y = (yAxis[y]-yAxis[0])/(yAxis[yAxis.length-1]-yAxis[0]);
    //     if(isNaN(y))
    //         y = 0;
    //     value = (value-this._valueMin)/(this._valueMax-this._valueMin);
    //     return UIGraph3D.transformPoint([x-0.5, -(value-0.5)*Math.max(1,this.height)/(Math.max(1, this.width)), y-0.5], this.#transformPrecalc);
    }
    #axisToLine(x, y) {
    //     const xAxis = this.xAxis;
    //     const yAxis = this.yAxis;
    //     y = this.yResolution-y-1;
    //     if(x === undefined || isNaN(x))
    //         x = this.#transformPrecalc?.sinYaw > 0? 0 : 1;
    //     else
    //         x = (xAxis[x]-xAxis[0])/(xAxis[xAxis.length-1]-xAxis[0]);
    //     if(isNaN(x))
    //         x = 0;
    //     if(y === undefined || isNaN(y))
    //         y = this.#transformPrecalc?.cosYaw > 0? 1 : 0;
    //     else
    //         y = (yAxis[y]-yAxis[0])/(yAxis[yAxis.length-1]-yAxis[0]);
    //     if(isNaN(y))
    //         y = 0;
    //     return [
    //         UIGraph3D.transformPoint([x-0.5,  0.5*Math.max(1,this.height)/(Math.max(1, this.width)), y-0.5], this.#transformPrecalc),
    //         UIGraph3D.transformPoint([x-0.5, -0.5*Math.max(1,this.height)/(Math.max(1, this.width)), y-0.5], this.#transformPrecalc)
    //     ];
    }
    #zAxisToLine(z) {
    //     const x = this.#transformPrecalc.sinYaw > 0? 0 : 1;
    //     const y = this.#transformPrecalc.cosYaw > 0? 1 : 0;
    //     z = (z-this._valueMin)/(this._valueMax-this._valueMin);
    //     return [[
    //         UIGraph3D.transformPoint([x-0.5, -(z-0.5)*Math.max(1,this.height)/(Math.max(1, this.width)), -0.5], this.#transformPrecalc),
    //         UIGraph3D.transformPoint([x-0.5, -(z-0.5)*Math.max(1,this.height)/(Math.max(1, this.width)),  0.5], this.#transformPrecalc)
    //     ],[
    //         UIGraph3D.transformPoint([-0.5, -(z-0.5)*Math.max(1,this.height)/(Math.max(1, this.width)), y-0.5], this.#transformPrecalc),
    //         UIGraph3D.transformPoint([ 0.5, -(z-0.5)*Math.max(1,this.height)/(Math.max(1, this.width)), y-0.5], this.#transformPrecalc)
    //     ]];
    }

    _resolutionChanged(axisElements, axisResolution) {
        const thisClass = this;
        const textSize = (0.45/Math.max(this.xResolution, this.yResolution, axisResolution));
        while(axisResolution < axisElements.children.length) { axisElements.removeChild(axisElements.lastChild); }
        for(let i = axisElements.children.length; i < axisResolution; i++) { 
            const axisElement = axisElements.appendChild(document.createElementNS(`http://www.w3.org/2000/svg`,`g`)); 
            axisElement.append(document.createElementNS(`http://www.w3.org/2000/svg`,`line`));
            const textLabel = axisElement.appendChild(document.createElementNS(`http://www.w3.org/2000/svg`,`text`));
            textLabel.setAttribute(`alignment-baseline`, `middle`);
            textLabel.setAttribute(`text-anchor`, `end`);
            axisElement.update = function() {
                const line = thisClass.#axisToLine(this.x, this.y);
                this.children[0].setAttribute(`x1`, line[0][0]);
                this.children[0].setAttribute(`y1`, line[0][1]);
                this.children[0].setAttribute(`x2`, line[1][0]);
                this.children[0].setAttribute(`y2`, line[1][1]);

                this.children[1].setAttribute(`x`, line[0][0]);
                this.children[1].setAttribute(`y`, line[0][1]);
                this.children[1].setAttribute(`font-size`, this.textSize);
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
        for(let i = 0; i < this.xResolution; i++) { this._xAxisElement.children[i].textSize = textSize; }
        for(let i = 0; i < this.yResolution; i++) { this._yAxisElement.children[i].textSize = textSize; }
        const zResolution = parseInt(1.5+Math.max(this.xResolution, this.yResolution));
        while(zResolution < this.#zAxisElement.children.length) { this.#zAxisElement.removeChild(this.#zAxisElement.lastChild); }
        for(let i = 0; i < zResolution; i++) {
            let axisElement = this.#zAxisElement.children[i];
            if(!axisElement) {
                axisElement = this.#zAxisElement.appendChild(document.createElementNS(`http://www.w3.org/2000/svg`,`g`)); 
                axisElement.append(document.createElementNS(`http://www.w3.org/2000/svg`,`line`));
                const textLabel = axisElement.appendChild(document.createElementNS(`http://www.w3.org/2000/svg`,`text`));
                textLabel.setAttribute(`alignment-baseline`, `middle`);
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

                    this.children[1].setAttribute(`x`, line[0][0]);
                    this.children[1].setAttribute(`y`, line[0][1]);
                    this.children[1].setAttribute(`font-size`, this.textSize);
                    this.children[1].innerHTML = formatNumberForDisplay(zValue);
                }
            }
            axisElement.textSize = textSize;
            axisElement.zResolution = zResolution;
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
        while(Math.max(0, (this.xResolution-1) * (this.yResolution-1)) < this.#valueLineElement.children.length) { this.#valueLineElement.removeChild(this.#valueLineElement.lastChild); }
        for(let i = 0; i < (this.xResolution-1) * (this.yResolution-1); i++) { 
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
            valueLineElement.x1 = valueLineElement.x2 = i % (this.xResolution-1);
            if(valueLineElement.x1 + 1 < this.xResolution)
                valueLineElement.x2++;
            valueLineElement.y1 = valueLineElement.y2 = Math.trunc(i/(this.xResolution-1));
            if(valueLineElement.y1 + 1 < this.yResolution)
                valueLineElement.y2++;
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
            valueElement.vl1 = valueLineElements.find(element => element.x1 === valueElement.x && element.y1 === valueElement.y);
            valueElement.vl2 = valueLineElements.find(element => element.x2 === valueElement.x && element.y2 === valueElement.y);
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
                dragValue = {
                    pageY: event.pageY,
                    closestCircle,
                    value: closestCircle.value,
                    mag: (thisClass._valueMax - thisClass._valueMin) / thisClass.height, 
                }
            }

            //dragValue
            if(dragValue) {
                function mouseMove(event) {
                    dragValue.closestCircle.value = dragValue.value + (dragValue.pageY - event.pageY) * dragValue.mag 
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