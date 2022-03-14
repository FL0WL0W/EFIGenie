export default class UIGraph3D extends HTMLDivElement {
    onChange = [];
    get value() {
        const thisClass = this;
        return [...this.#valueElement.children].sort(function(a, b) {(a.x - b.x) + thisClass.xResolution * (a.y - b.y)}).map(x => x.value);
    }
    set value(value) {
        if(value === undefined)
            return;
        if(value.length !== this.xResolution * this.yResolution)
            throw `Value length does not match table length. Set xResolution and yResolution before setting value`;
        let same = true;
        let prevValue = this.value;
        for(let i = 0; i < prevValue.length; i++){
            if(prevValue[i] === value[i])
                continue;
            same = false;
            break;
        }
        if(same)
            return;

        this.#valueMin = 18000000000000000000;
        this.#valueMax = -9000000000000000000;
        for(let i = 0; i < value.length; i++) {
            if(value[i] < this.#valueMin)
                this.#valueMin = value[i];
            if(value[i] > this.#valueMax)
                this.#valueMax = value[i];
        }
        if(this.#valueMax === this.#valueMin)
            this.#valueMax = this.#valueMin + 1;
        const thisClass = this;
        let childElements = [...this.#valueElement.children].sort(function(a, b) {(a.x - b.x) + thisClass.xResolution * (a.y - b.y)});
        for(let i = 0; i < childElements.length; i++)
            childElements[i].value = value[i];
        this.dispatchEvent(new Event(`change`));
    }
    get saveValue() {
        return {
            Value: this.value,
            XAxis: this.xAxis,
            XResolution: this.xResolution,
            YAxis: this.yAxis,
            YResolution: this.yResolution,
        };
    }
    set saveValue(saveValue) {
        if(saveValue === undefined) 
            return;

        if(saveValue.Value !== undefined && Array.isArray(saveValue.Value))
            this.value = saveValue.Value;
        if(saveValue.XResolution !== undefined)
            this.xResolution = saveValue.XResolution;
        if(saveValue.XAxis !== undefined)
            this.xAxis = saveValue.XAxis;
        if(saveValue.YResolution !== undefined)
            this.yResolution = saveValue.YResolution;
        if(saveValue.YAxis !== undefined)
            this.yAxis = saveValue.YAxis;
    }

    //axis properties
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
        while(xResolution < this.#xAxisElement.children.length) { this.#xAxisElement.removeChild(this.#xAxisElement.children[xResolution]); }
        for(let i = this.#xAxisElement.children.length; i < xResolution; i++) { 
            const xAxisElement = this.#xAxisElement.appendChild(document.createElementNS('http://www.w3.org/2000/svg','line')); 
            // Object.defineProperty(xAxisElement, 'value', UITable.#cellValueGetterSetter);
            const xAxisMinus1 = this.#xAxisElement.children[i-1]?.value;
            const xAxisMinus2 = this.#xAxisElement.children[i-2]?.value;
            let xAxisMinus0 = 0;
            if(xAxisMinus1 !== undefined && xAxisMinus2 !== undefined)
                xAxisMinus0 = xAxisMinus1 + (xAxisMinus1 - xAxisMinus2);
            xAxisElement.value = xAxisMinus0;
            xAxisElement.x = i;
        }
        this.#resolutionChanged();
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
        while(yResolution < this.#yAxisElement.children.length) { this.#yAxisElement.removeChild(this.#yAxisElement.children[yResolution]); }
        for(let i = this.#yAxisElement.children.length; i < yResolution; i++) { 
            const yAxisElement = this.#yAxisElement.appendChild(document.createElementNS('http://www.w3.org/2000/svg','line')); 
            // Object.defineProperty(yAxisElement, 'value', UITable.#cellValueGetterSetter);
            const yAxisMinus1 = this.#yAxisElement.children[i-1]?.value;
            const yAxisMinus2 = this.#yAxisElement.children[i-2]?.value;
            let yAxisMinus0 = 0;
            if(yAxisMinus1 !== undefined && yAxisMinus2 !== undefined)
                yAxisMinus0 = yAxisMinus1 + (yAxisMinus1 - yAxisMinus2);
            yAxisElement.value = yAxisMinus0;
            yAxisElement.y = i;
        }
        this.#resolutionChanged();
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

    get pitch() {
        return this.#pitch;
    }
    set pitch(pitch) {
        pitch = parseFloat(pitch);
        this.#pitch = pitch;
        this.#transformPrecalc = UIGraph3D.transformPrecalc(this);
    }
    get yaw() {
        return this.#yaw;
    }
    set yaw(yaw) {
        yaw = parseFloat(yaw);
        this.#yaw = yaw;
        this.#transformPrecalc = UIGraph3D.transformPrecalc(this);
    }
    get width() {
        return this.#svgElement.getAttribute(`width`) ?? this.offsetWidth;
    }
    set width(width) {
        this.#svgElement.setAttribute(`width`, width);
    }
    get height() {
        return this.#svgElement.getAttribute(`height`) ?? this.offsetHeight;
    }
    set height(height) {
        this.#svgElement.setAttribute(`height`, height);
    }

    #xAxisElement       = document.createElementNS('http://www.w3.org/2000/svg','g');
    #yAxisElement       = document.createElementNS('http://www.w3.org/2000/svg','g');
    #valueElement       = document.createElementNS('http://www.w3.org/2000/svg','g');
    #valuePathElement   = document.createElementNS('http://www.w3.org/2000/svg','g');
    #svgElement         = document.createElementNS('http://www.w3.org/2000/svg','svg');

    #transformPrecalcPrivate;
    get #transformPrecalc() {
        return this.#transformPrecalcPrivate;
    }
    set #transformPrecalc(transformPrecalc) {
        this.#transformPrecalcPrivate = transformPrecalc;
        const r = transformPrecalc.zoom/(7.5 * Math.max(this.xResolution, this.yResolution));
        [...this.#valueElement.children].forEach(element => element.setAttribute(`r`, r.toFixed(10)));
    }
    #yaw;
    #pitch;
    
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

    constructor(prop) {
        super();
        this.class = `ui graph3d`;
        this.append(this.#svgElement);
        this.#svgElement.setAttribute(`overflow`, `visible`)
        this.#svgElement.append(this.#valuePathElement);
        this.#svgElement.append(this.#valueElement);
        const propValue = prop.value;
        delete prop.value;
        Object.assign(this, prop);
        this.#createEventListeners();
        if(prop?.pitch === undefined)
            this.pitch = 17;
        if(prop?.yaw === undefined)
            this.yaw = 30;
        this.value = propValue;
        //delete onchange and migrate to addEventListener(`change`)
        if(!Array.isArray(this.onChange))
            this.onChange = [ this.onChange ];
        const thisClass = this;
        this.addEventListener(`change`, function() {
            thisClass.onChange.forEach(function(onChange) { onChange(); });
        });
    }
    static transformPrecalc({width = 0, height = 0, pitch = 0, yaw = 0, cameraX = 0, cameraY = 0, zoom = 1} = {}) {
        let cosPitch=Math.cos(pitch * (Math.PI / 180));
        let sinPitch=Math.sin(pitch * (Math.PI / 180));
        let cosYaw=Math.cos(yaw * (Math.PI / 180));
        let sinYaw=Math.sin(yaw * (Math.PI / 180));
        return {
            cosPitch,
            sinPitch,
            cosYaw,
            sinYaw,
            sinPitchSinYaw: sinPitch*sinYaw,
            nSinPitchCosYaw: -sinPitch*cosYaw,
            nCosPitchSinYaw: -cosPitch*sinYaw,
            cosPitchcosYaw: cosPitch*cosYaw,
            offsetX: width/2 - cameraX,
            offsetY: height/2 - cameraY,
            zoom: 0.7*width*zoom
        }
    }
    static transformPoint(point, transformPrecalc){
        if(!transformPrecalc)
            transformPrecalc = UIGraph3D.transformPrecalc();
        let x=(transformPrecalc.cosYaw*point[0]+transformPrecalc.sinYaw*point[2])*transformPrecalc.zoom+transformPrecalc.offsetX;
        let y=(transformPrecalc.sinPitchSinYaw*point[0]+transformPrecalc.cosPitch*point[1]+transformPrecalc.nSinPitchCosYaw*point[2])*transformPrecalc.zoom+transformPrecalc.offsetY;
        let depth=(transformPrecalc.nCosPitchSinYaw*point[0]+transformPrecalc.sinPitch*point[1]+transformPrecalc.cosPitchcosYaw*point[2])*transformPrecalc.zoom;
        return [x,y,depth];
    }
    #cellToPoint(x, y, value) {
        y = this.yResolution-y-1;
        let valueMax = this.#valueMax === this.#valueMin? this.#valueMin + 1 : this.#valueMax;
        return UIGraph3D.transformPoint([x/(this.xResolution-1)-0.5, -(value/(valueMax-this.#valueMin)-0.5)*Math.max(1,this.height)/(Math.max(1, this.width)), y/(this.yResolution-1)-0.5], this.#transformPrecalc);
    }

    #resolutionChanged() {
        const thisClass = this;
        let circleValueGetterSetter = {
            get: function() { return parseFloat(this.style.getPropertyValue(`--data-value`)); },
            set: function(value) { 
                value = parseFloat(value);
                if(this.value === value)
                    return;
                if(value < thisClass.#valueMin)
                    thisClass.#valueMin = value;
                if(value > thisClass.#valueMax)
                    thisClass.#valueMax = value;
                this.style.setProperty(`--data-value`, value); 
                const valuePathElements = [...thisClass.#valuePathElement.children];
                let vp1 = valuePathElements.find(element => element.x1 === this.x && element.y1 === this.y);
                let vp2 = valuePathElements.find(element => element.x2 === this.x && element.y2 === this.y);
                let vp3 = valuePathElements.find(element => element.x3 === this.x && element.y3 === this.y);
                let vp4 = valuePathElements.find(element => element.x4 === this.x && element.y4 === this.y);
                if(vp1) vp1.v1 = value;
                if(vp2) vp2.v2 = value;
                if(vp3) vp3.v3 = value;
                if(vp4) vp4.v4 = value;
                this.p = thisClass.#cellToPoint(this.x, this.y, value);
            }
        }
        let circleDepthGetterSetter = {
            get: function() { return parseFloat(this.dataset.depth); },
            set: function(depth) { 
                depth = parseFloat(depth);
                if(this.depth === depth)
                    return;
                this.dataset.depth = depth;
                thisClass.#valueElement.removeChild(this);
                const valueElement = [...thisClass.#valueElement.children];
                const after = valueElement.find(element => element.depth<depth)
                if(!after)
                    thisClass.#valueElement.append(this);
                else
                    thisClass.#valueElement.insertBefore(this, after);
            }
        }
        let circlePGetterSetter = {
            get: function() { return this.dataset.p? JSON.parse(this.dataset.p) : undefined; },
            set: function(p) {
                let dataP = JSON.stringify(p);
                if(this.dataset.p === dataP)
                    return;
                this.dataset.p = dataP;
                this.depth = p[2];
                this.setAttribute(`cx`, p[0].toFixed(10));
                this.setAttribute(`cy`, p[1].toFixed(10));
            }
        }
        let pathValueGetterSetter = {
            get: function() { return parseFloat(this.style.getPropertyValue(`--data-value`)); },
            set: function(value) { this.style.setProperty(`--data-value`, value); }
        }
        let pathDepthGetterSetter = {
            get: function() { return parseFloat(this.dataset.depth); },
            set: function(depth) { 
                depth = parseFloat(depth);
                if(this.depth === depth)
                    return;
                this.dataset.depth = depth;
                thisClass.#valuePathElement.removeChild(this);
                const valuePathElements = [...thisClass.#valuePathElement.children];
                const after = valuePathElements.find(element => element.depth<depth)
                if(!after)
                    thisClass.#valuePathElement.append(this);
                else
                    thisClass.#valuePathElement.insertBefore(this, after);
            }
        }
        function pathPSetter() {
            if(!this.p1 || !this.p2 || !this.p3 || !this.p4)
                return;
            this.depth = (parseFloat(this.p1[2]) + parseFloat(this.p2[2]) + parseFloat(this.p3[2]) + parseFloat(this.p4[2]))/4;
            this.setAttribute(`d`, 
                            `M${this.p1[0].toFixed(10)},${this.p1[1].toFixed(10)}`+
                            `L${this.p2[0].toFixed(10)},${this.p2[1].toFixed(10)}`+
                            `L${this.p3[0].toFixed(10)},${this.p3[1].toFixed(10)}`+
                            `L${this.p4[0].toFixed(10)},${this.p4[1].toFixed(10)}Z`)
        }
        function getPathPGetterSetter(index) {
            let pi = `p${index}`;
            return {
                get: function() { return this.dataset[pi]? JSON.parse(this.dataset[pi]) : undefined; },
                set: function(p) { 
                    let dataP = JSON.stringify(p);
                    if(this.dataset[pi] === dataP)
                        return;
                    this.dataset[pi] = dataP;
                    pathPSetter.call(this);
                }
            }
        }
        function getPathVGetterSetter(index) {
            let xi = `x${index}`;
            let yi = `y${index}`;
            let vi = `v${index}`;
            let pi = `p${index}`;
            return {
                get: function() { return parseFloat(this.dataset[vi]); },
                set: function(v) { 
                    v = parseFloat(v);
                    if(this[vi] === v)
                        return;
                    this.dataset[vi] = v;
                    this[pi] = thisClass.#cellToPoint(this[xi], this[yi], v);
                    this.value = (parseFloat(this.v1) + parseFloat(this.v2) + parseFloat(this.v3) + parseFloat(this.v4))/4;
                }
            }
        }
        this.style.setProperty('--xresolution', this.xResolution);
        this.style.setProperty('--yresolution', this.yResolution);
        // while((this.xResolution-1) * (this.yResolution-1) < this.#valuePathElement.children.length) { this.#valuePathElement.removeChild(this.#valuePathElement.children[(this.xResolution-1) * (this.yResolution-1)]); }
        for(let i = 0; i < (this.xResolution-1) * (this.yResolution-1); i++) { 
            const valuepathElement = this.#valuePathElement.children[i] ?? this.#valuePathElement.appendChild(document.createElementNS('http://www.w3.org/2000/svg','path'));
            Object.defineProperty(valuepathElement, 'value', pathValueGetterSetter);
            Object.defineProperty(valuepathElement, 'v1', getPathVGetterSetter(1));
            Object.defineProperty(valuepathElement, 'v2', getPathVGetterSetter(2));
            Object.defineProperty(valuepathElement, 'v3', getPathVGetterSetter(3));
            Object.defineProperty(valuepathElement, 'v4', getPathVGetterSetter(4));
            Object.defineProperty(valuepathElement, 'p1', getPathPGetterSetter(1));
            Object.defineProperty(valuepathElement, 'p2', getPathPGetterSetter(2));
            Object.defineProperty(valuepathElement, 'p3', getPathPGetterSetter(3));
            Object.defineProperty(valuepathElement, 'p4', getPathPGetterSetter(4));
            Object.defineProperty(valuepathElement, 'depth', pathDepthGetterSetter);
            valuepathElement.x1 = valuepathElement.x4 = i % (this.xResolution-1);
            valuepathElement.y1 = valuepathElement.y2 = Math.trunc(i/(this.xResolution-1));
            valuepathElement.x2 = valuepathElement.x3 = valuepathElement.x1 + 1;
            valuepathElement.y3 = valuepathElement.y4 = valuepathElement.y1 + 1;
        }
        while(this.xResolution * this.yResolution < this.#valueElement.children.length) { this.#valueElement.removeChild(this.#valueElement.children[this.xResolution * this.yResolution]); }
        for(let i = 0; i < this.xResolution * this.yResolution; i++) { 
            const valueElement = this.#valueElement.children[i] ?? this.#valueElement.appendChild(document.createElementNS('http://www.w3.org/2000/svg','circle'));
            Object.defineProperty(valueElement, 'value', circleValueGetterSetter);
            Object.defineProperty(valueElement, 'p', circlePGetterSetter);
            Object.defineProperty(valueElement, 'depth', circleDepthGetterSetter);
            valueElement.x = i % this.xResolution;
            valueElement.y = Math.trunc(i/this.xResolution);
            if(this.#transformPrecalc)
                valueElement.setAttribute(`r`, this.#transformPrecalc.width.toFixed(10));
        }
    }

    #createEventListeners() {
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
    }
}
customElements.define(`ui-graph-3d`, UIGraph3D, { extends: `div` });

//svg stuff
//     _table3DDisplayWidth=800; 
//     _table3DDisplayHeight=450;
//     _table3DZoom=1;


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


//     $(`#${thisClass.GUID}-tablesvg g path`).removeClass(`selected`)
//     for(let x=thisClass._minSelectX; x<thisClass._maxSelectX; x++) {
//         for(let y=thisClass._minSelectY; y<thisClass._maxSelectY; y++) {
//             $(`#${thisClass.GUID}-tablesvg g path[data-x='${x}'][data-y='${y}']`).addClass(`selected`);
//         }
//     }
//     $(`#${thisClass.GUID}-tablesvg g circle`).removeClass(`selected`);
//     for(let x=thisClass._minSelectX; x<thisClass._maxSelectX+1; x++) {
//         for(let y=thisClass._minSelectY; y<thisClass._maxSelectY+1; y++) {
//             $(`#${thisClass.GUID}-tablesvg g circle[data-x='${x}'][data-y='${y}']`).addClass(`selected`);
//         }
//     }