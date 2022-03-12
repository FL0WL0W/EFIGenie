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
        } else if(this.style.display === `none`) {
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
        pclass.split(` `).forEach(function(pclass) { thisClass.addClass(pclass); });
    }
})
HTMLElement.prototype.addClass = function(pclass) {
    this.classList.add(pclass);
}
HTMLElement.prototype.removeClass = function(pclass) {
    this.classList.remove(pclass);
}