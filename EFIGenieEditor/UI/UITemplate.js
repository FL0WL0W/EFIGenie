import UIElement from "./UIElement.js"
export default class UITemplate extends UIElement {
    element = document.createElement(`input`);
    onChange = [];

    constructor(prop) {
        super(`div`);
        if(prop)
            this.Setup(prop);
    }

    Setup(prop) {
        Object.assign(this, prop);
        if(!Array.isArray(this.onChange))
            this.onChange = [ this.onChange ];
        var thisClass = this;
        var thisEntries = Object.entries(this);
        thisEntries.forEach(function(elementName, element) {
            if(element?.onChange !== undefined && !element?.excludeFromOnChange) {
                element.onChange.push(function() {
                    thisClass.onChange.forEach(function(onChange) { onChange(); });
                });
            }
        });

        const template = this.Template ?? this.constructor.Template;
        this.element.innerHTML = template;
        this.element.querySelectorAll(`span[data-element]`).forEach(function(element){
            let matchingUI = thisEntries.find(function(elementName) { return element.dataset.element === elementName; });
            element.replaceWith(matchingUI.element);
        });
    }
    
    get saveValue() {
        let saveValue = {};

        Object.entries(this).forEach(function(elementName, element) {
            if(element.saveValue !== undefined)
                saveValue[elementName] = element.saveValue;
        });

        if(Object.keys(saveValue).length === 0)
            return undefined;

        return saveValue;
    }

    set saveValue(saveValue) {
        if(saveValue === undefined)
            return;

        Object.entries(this).forEach(function(elementName, element) {
            if(saveValue[elementName] !== undefined && typeof element === `object`) {
                element.saveValue = saveValue[elementName];
            }
        });
    }
}