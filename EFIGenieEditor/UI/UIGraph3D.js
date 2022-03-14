export default class UIGraph3D extends SVGElement {
    onChange = [];

    #valueElement       = document.createElementNS('http://www.w3.org/2000/svg','g');
    #valuePathElement   = document.createElementNS('http://www.w3.org/2000/svg','g');
    get value() {
        return [...this.#valueElement.children].map(x => x.value);
    }
    set value(value) {
        if(value === undefined)
            return;
        if(value.length !== this.xResolution * this.yResolution)
            throw `Value length does not match table length. Set xResolution and yResolution before setting value`;
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
        return this.value;
    }
    set saveValue(saveValue){
        this.value = saveValue;
    }

    constructor(prop) {
        super();
        this.class = `ui graph3d`;
    }
}
customElements.define(`ui-graph-3d`, UIGraph3D, { extends: `svg` });

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