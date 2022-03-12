export default class UITemplate extends HTMLDivElement {
    onChange = [];

    constructor(prop) {
        super();
        this.style.display = `inline-block`;
        if(prop)
            this.Setup(prop);
    }

    Setup(prop) {
        Object.assign(this, prop);
        if(!Array.isArray(this.onChange))
            this.onChange = [ this.onChange ];
        var thisClass = this;
        var thisEntries = Object.entries(this);
        thisEntries.forEach(function([elementName, element]) {
            if(element?.onChange !== undefined && !element?.excludeFromOnChange) {
                element.onChange.push(function() {
                    thisClass.onChange.forEach(function(onChange) { onChange(); });
                });
            }
        });

        const template = this.Template ?? this.constructor.Template;
        this.innerHTML = template;
        this.querySelectorAll(`[data-element]`).forEach(function(element){
            let [matchingUIName, matchingUI] = thisEntries.find(function([elementName, e]) { return element.dataset.element === elementName; });
            console.log(matchingUI)
            element.replaceWith(matchingUI);
        });
    }
    
    get saveValue() {
        let saveValue = {};

        Object.entries(this).forEach(function([elementName, element]) {
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

        Object.entries(this).forEach(function([elementName, element]) {
            if(saveValue[elementName] !== undefined && typeof element === `object`) {
                element.saveValue = saveValue[elementName];
            }
        });
    }
}
customElements.define('ui-template', UITemplate, { extends: 'div' });