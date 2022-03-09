export default class UIElement {
    set class(pclass) {
        const thisClass = this;
        pclass.split(` `).forEach(function(pclass) { thisClass.addClass(pclass); });
    }
    addClass(pclass) {
        this.element.classList.add(pclass);
    }
    removeClass(pclass) {
        this.element.classList.add(pclass);
    }

    #hidden = false;
    get hidden() {
        return this.#hidden;
    }
    set hidden(hidden) {
        if(this.#hidden === hidden)
            return;
            
        this.#hidden = hidden;
        if(hidden) {
            this.element.style.display = `none`;
        } else {
            this.element.style.display = `inline-block`;
        }
    }

    constructor(tagName) {
        this.element = document.createElement(tagName);
        this.element.style.display = `inline-block`;
    }
}