export default class UISelection extends HTMLDivElement {
    static ParseValue(type, value) {
        switch(type) {
            case `number`:
                return parseFloat(value);
            case `boolean`:
                if(typeof value === `number`)
                    return value !== 0;
                if(typeof value === `boolean`)
                    return value;
                if(typeof value === `string`)
                    return value === `true` || value === `True` || value === `1`;
                if(typeof value === `object`) {
                    if(value)
                        return true;
                    return false;
                }
            case `string`:
                if(typeof value === `number` || typeof value === `boolean`)
                    return `${value}`;
                if(typeof value === `string`)
                    return value;
                if(typeof value === `object`)
                    return JSON.stringify(value);
            case `object`:
                if(typeof value === `number` || typeof value === `boolean` || typeof value === `object`)
                    return value;
                if(typeof value === `string`)
                    return JSON.parse(value);
                break;
        }
    }

    onChange = [];

    #selectDisabled = false;
    get selectDisabled() {
        return this.#selectDisabled;
    }
    set selectDisabled(selectDisabled) {
        this.#selectDisabled = selectDisabled;
        if(!this.selectNotVisible){
            setElementOption(this.#selectElement, { Name: this.selectName, Disabled: this.selectDisabled, Value: this.selectValue });
        }
    }

    #selectName = `select`;
    get selectName() {
        return this.#selectName;
    }
    set selectName(selectName) {
        if(this.#selectName === selectName)
            return;

        this.#selectName = selectName;
        if(this.selectedOption === undefined)
            this.selectedElement.innerHTML = this.selectName;
        if(!this.selectNotVisible){
            setElementOption(this.#selectElement, { Name: this.selectName, Disabled: this.selectDisabled, Value: this.selectValue });
        }
    }

    #selectValue = undefined;
    get selectValue() {
        return this.#selectValue;
    }
    set selectValue(selectValue) {
        if(this.#selectValue === selectValue)
            return;
            
        this.#selectValue = selectValue;
        if(this.selectedOption === undefined) {
            this.selectedElement.value = UISelection.ParseValue(`string`, selectValue)
            this.selectedElement.type = typeof selectValue;
        }
        if(!this.selectNotVisible){
            setElementOption(this.#selectElement, { Name: this.selectName, Disabled: this.selectDisabled, Value: this.selectValue });
        }
    }

    #selectElement;
    #selectNotVisible = false;
    get selectNotVisible() {
        return this.#selectNotVisible;
    }
    set selectNotVisible(selectNotVisible) {
        if(this.#selectNotVisible === selectNotVisible)
            return;

        this.#selectNotVisible = selectNotVisible;
        if(!this.selectNotVisible){
            setElementOption(this.#selectElement, { Name: this.selectName, Disabled: this.selectDisabled, Value: this.selectValue });
        } else if(this.contextMenuElement.children[0] !== undefined) {
            this.contextMenuElement.removeChild(this.contextMenuElement.children[0]);
        }
    }

    #updateSelectElement() {
        const selectedElement = this.selectedElement;
        let selected = false;
        [...this.contextMenuElement.children].forEach(function(element) { 
            [...element.children].forEach(function(element) { 
                if(element.value !== selectedElement.value) element.classList.remove(`selected`);
                else { element.classList.add(`selected`); selected = true;}
            });
            if(element.value !== selectedElement.value) element.classList.remove(`selected`);
            else { element.classList.add(`selected`); selected = true;}
        });
        if(!selected) this.#selectElement.classList.add(`selected`);
        selectedElement.innerHTML = this.selectedOption?.Name ?? this.selectName;
    }

    #options = [];
    get options() {
        return this.#options;
    }
    set options(options) {
        this.#options = options;

        const thisClass = this;
        for(let i = options.length + (thisClass.selectNotVisible? 0 : 1); i < thisClass.contextMenuElement.children.length; i++){
            thisClass.contextMenuElement.removeChild(thisClass.contextMenuElement.children[i]);
        }
        if(!thisClass.selectNotVisible){
            this.#selectElement = thisClass.contextMenuElement.children[0];
            if(this.#selectElement === undefined)
                this.#selectElement = thisClass.contextMenuElement.appendChild(document.createElement(`div`));
            setElementOption(this.#selectElement, { Name: thisClass.selectName, Disabled: thisClass.selectDisabled, Value: thisClass.selectValue });
        }
        options.forEach(function(option, index) {
            let optionElement = thisClass.contextMenuElement.children[index + (thisClass.selectNotVisible? 0 : 1)];
            if(optionElement === undefined)
                optionElement = thisClass.contextMenuElement.appendChild(document.createElement(`div`));
            setElementOption(optionElement, option);
        });
        this.#updateSelectElement();
    }

    get selectedOption() {
        const stringValue = this.selectedElement.value;
        let selectedOption = this.options.find(x => UISelection.ParseValue(`string`, x.Value) === stringValue || x.Options?.findIndex(x => UISelection.ParseValue(`string`, x.Value) === stringValue) > -1)
        if(selectedOption?.Group) 
            selectedOption = selectedOption.Options.find(x => UISelection.ParseValue(`string`, x.Value) === stringValue);
        return selectedOption;
    }
    set selectedOption(selectedOption) {
        this.value = selectedOption.Value;
    }

    get value() {
        return UISelection.ParseValue(this.selectedElement.type, this.selectedElement.value);
    }
    set value(value) {
        if(this.value === value)
            return;

        const selectedElement = this.selectedElement;
        selectedElement.type = typeof value;
        selectedElement.value = UISelection.ParseValue(`string`, value);
        this.#updateSelectElement();
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
        this.class = `ui select`;
        this.selectedElement = this.appendChild(document.createElement(`div`));
        this.selectedElement.class = `ui selected`;
        this.contextMenuElement = document.createElement(`div`);
        this.contextMenuElement.class = `ui context-menu`;
        this.#selectElement = document.createElement(`div`);
        this.contextMenuElement.prepend(this.#selectElement)
        setElementOption(this.#selectElement, { Name: this.selectName, Disabled: this.selectDisabled, Value: this.selectValue });
        Object.assign(this, prop);
        if(!Array.isArray(this.onChange))
            this.onChange = [ this.onChange ];
        const thisClass = this;
        this.addEventListener(`change`, function() {
            thisClass.onChange.forEach(function(onChange) { onChange(); });
        });

        let visible = false;
        this.selectedElement.addEventListener(`click`, function() {
            if(visible) 
                return;

            function clickHandler() {
                if(!visible) 
                    return;
                thisClass.removeChild(thisClass.contextMenuElement);
                document.removeEventListener(`click`, clickHandler);
                visible = false;
            }
            document.addEventListener(`click`, clickHandler);
            window.setTimeout(function() { thisClass.append(thisClass.contextMenuElement); visible = true; }, 1);
        });
        this.contextMenuElement.addEventListener(`click`, function(event) {
            if(event.target.classList.contains(`selectdisabled`))
                return;
            if(!event.target.classList.contains(`selectoption`))
                return;
            
            thisClass.value = UISelection.ParseValue(event.target.type, event.target.value);
        })
    }
}

function setElementOption(element, option) {
    element.removeAttribute("class")
    if(option.Group) {
        delete element.type;
        delete element.value;
        element.innerHTML = ``;
        let selectGroupElement = element.appendChild(document.createElement(`div`));
        selectGroupElement.classList.add(`selectgroup`);
        selectGroupElement.innerHTML = option.Group;
        option.Options.forEach(function(option) {
            let optionElement = element.appendChild(document.createElement(`div`));
            setElementOption(optionElement, option);
        });
    } else {
        element.classList.add(`selectoption`);
        if(option.Disabled)
            element.classList.add(`selectdisabled`)
        element.type = typeof option.Value;
        element.value =  UISelection.ParseValue(`string`, option.Value);
        element.innerHTML = option.Name + (option.Info? ` ${option.Info}` : ``);
    }
}
customElements.define(`ui-selection`, UISelection, { extends: `div` });