Object.defineProperty(HTMLElement.prototype, 'hidden', {
    enumerable: true,
    get: function() {
        return this.style.display === `none`;
    },
    set: function(hidden) {
        if(hidden && this.style.display !== `none`) {
            if(this.style.display)
                this._previousDisplayValue = this.style.display;
            this.style.display = `none`;
        } else if(!hidden && this.style.display === `none`) {
            if(this._previousDisplayValue)
                this.style.display = this._previousDisplayValue;
            else 
                this.style.display = null;
            delete this._previousDisplayValue;
        }
    }
});
Object.defineProperty(HTMLElement.prototype, 'class', {
    enumerable: true,
    set: function(pclass) {
        const thisClass = this;
        pclass.split(` `).forEach(function(pclass) { thisClass.classList.add(pclass); });
    }
});
function formatNumberForDisplay(value, precision = 6) {
    let formattedVaue = parseFloat(parseFloat(parseFloat(value).toFixed(precision -1)).toPrecision(precision));
    if(isNaN(formattedVaue))
        formattedVaue = `&nbsp;`;
    return formattedVaue;
}

function calculateMinMaxValue(array, minDiff = 1) {
    let valueMin = 18000000000000000000;
    let valueMax = -9000000000000000000;
    for(let i = 0; i < array.length; i++) {
        let value = array[i];
        if(value < valueMin)
            valueMin = value;
        if(value > valueMax)
            valueMax = value;
    }
    if(minDiff && valueMax === valueMin)
        valueMax = valueMin + minDiff;
    return [valueMin, valueMax];
}