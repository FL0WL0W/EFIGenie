export default class UITableBase extends HTMLDivElement {
    get value() {
        return [...this._valueElement.children].map(x => x.value);
    }
    set value(value) {
        if(value === undefined)
            return;
        if(value.length !== this.xResolution * this.yResolution)
            throw `Value length does not match table length. Set xResolution and yResolution before setting value\ncurrent:${value.length}\nnew:${this.xResolution * this.yResolution}`;
        let same = true;
        for(let i = 0; i < this._valueElement.children.length; i++){
            if(this._valueElement.children[i].value === value[i])
                continue;
            same = false;
            break;
        }
        if(same)
            return;
        for(let i = 0; i < this._valueElement.children.length; i++)
            this._valueElement.children[i].value = value[i];
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
    get xResolution() {
        return this._xAxisElement.children.length;
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
        if(this._xResolutionElement)
            this._xResolutionElement.value = xResolution;
        this._resolutionChanged(this._xAxisElement, xResolution);
        this.value = newValue;
    }
    get xAxis() {
        return [...this._xAxisElement.children].map(x => x.value);
    }
    set xAxis(xAxis) {
        this.xResolution = xAxis.length;
        const thisClass = this;
        xAxis.forEach(function(xAxisValue, xAxisIndex) { const xAxisElement = thisClass._xAxisElement.children[xAxisIndex]; xAxisElement.value = xAxisValue; });
        ///*TODO*/interpolation
        this.dispatchEvent(new Event(`change`));
    }
    get yResolution() {
        return this._yAxisElement.children.length;
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
        if(this._yResolutionElement)
            this._yResolutionElement.value = yResolution;
        this._resolutionChanged(this._yAxisElement, yResolution);
        this.value = newValue;
    }
    get yAxis() {
        return [...this._yAxisElement.children].map(x => x.value);
    }
    set yAxis(yAxis) {
        this.yResolution = yAxis.length;
        const thisClass = this;
        yAxis.forEach(function(yAxisValue, yAxisIndex) { const yAxisElement = thisClass._yAxisElement.children[yAxisIndex]; yAxisElement.value = yAxisValue; });
        ///*TODO*/interpolation
        this.dispatchEvent(new Event(`change`));
    }

    get selecting() {
        return this._selecting;
    }
    set selecting(selecting) {
        if(JSON.stringify(this._selecting) === JSON.stringify(selecting))
            return;
        this._selecting = selecting;
        this._valueElement.querySelectorAll(`.selected`).forEach(function(element) { element.classList.remove(`selected`) });
        this._xAxisElement.querySelectorAll(`.selected`).forEach(function(element) { element.classList.remove(`selected`) });
        this._yAxisElement.querySelectorAll(`.selected`).forEach(function(element) { element.classList.remove(`selected`) });
        if(selecting) {
            let elementArray = this._valueElement.children;
            if(isNaN(selecting.startX))
                elementArray = this._yAxisElement.children;
            if(isNaN(selecting.startY))
                elementArray = this._xAxisElement.children;
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

    get _valueMin() {
        let valuemin = parseFloat(this.style.getPropertyValue('--valuemin'));
        return isNaN(valuemin)? 18000000000000000000 : valuemin;
    }
    set _valueMin(valueMin) {
        this.style.setProperty('--valuemin', valueMin);
    }
    get _valueMax() {
        let valuemax = parseFloat(this.style.getPropertyValue('--valuemax'));
        return isNaN(valuemax)? -9000000000000000000 : valuemax;
    }
    set _valueMax(valueMax) {
        this.style.setProperty('--valuemax', valueMax);
    }
}