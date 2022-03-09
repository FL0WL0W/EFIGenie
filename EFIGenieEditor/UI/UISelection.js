import UIElement from "./UIElement.js"
export default class UISelection extends UIElement {
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

    selectedElement = document.createElement(`div`);
    contextMenuElement = document.createElement(`div`);
    onChange = [];

    selectDisabled = false;

    #selectName = `select`;
    get selectName() {
        return this.#selectName;
    }
    set selectName(selectName) {
        if(this.#selectName === selectName)
            return;

        this.#selectName = selectName;
        if(this.selectedOption === undefined)
            this.selectedElement.innerHTML = `${this.selectName}<div style="float: right;">▼</div>`;
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
            this.selectedElement.dataset.value = UISelection.ParseValue(`string`, selectValue)
            this.selectedElement.dataset.type = typeof selectValue;
        }
    }

    #options = [];
    get options() {
        return this.#options;
    }
    set options(options) {
        if(objectTester(this.#options, options)) 
            return;
        
        this.#options = options;
        
        function setElementOption(element, option) {
            element.removeAttribute("class")
            if(option.Group) {
                delete element.dataset.type;
                delete element.dataset.value;

                let subElement = document.createElement(`div`);
                subElement.classList.add(`selectgroup`);
                subElement.innerHTML = option.Group;
                element.append(subElement);
                option.Options.forEach(function(option) {
                    let subElement = document.createElement(`div`);
                    element.append(subElement);
                    setElementOption(subElement, option);
                });
            } else {
                element.classList.add(`selectoption`);
                if(option.Disabled)
                    element.classList.add(`selectdisabled`)
                element.dataset.type = typeof option.Value;
                element.dataset.value =  UISelection.ParseValue(`string`, option.Value);
                element.innerHTML = option.Name + (option.Info? ` ${option.Info}` : ``);
            }
        }

        const thisClass = this;
        for(let i = options.length + thisClass.selectNotVisible? 0 : 1; i < thisClass.contextMenuElement.children.length; i++){
            thisClass.contextMenuElement.removeChild(thisClass.contextMenuElement.children[i]);
        }
        if(!thisClass.selectNotVisible){
            let optionElement = thisClass.contextMenuElement.children[0];
            if(optionElement === undefined)
            thisClass.contextMenuElement.append(optionElement = document.createElement(`div`))
            setElementOption(optionElement, { Name: thisClass.selectName, Disabled: thisClass.selectDisabled, Value: thisClass.selectValue });
        }
        options.forEach(function(option, index) {
            let optionElement = thisClass.contextMenuElement.children[index + thisClass.selectNotVisible? 0 : 1];
            if(optionElement === undefined)
                thisClass.contextMenuElement.append(optionElement = document.createElement(`div`))

            setElementOption(optionElement, option);
        });
    }

    get selectedOption() {
        const stringValue = this.selectedElement.dataset.value;
        let selectedOption = this.options.find(x => UISelection.ParseValue(`string`, x.Value) === stringValue || x.Options?.findIndex(x => UISelection.ParseValue(`string`, x.Value) === stringValue) > -1)
        if(selectedOption?.Group)
            selectedOption = selectedOption.Options.find(x => UISelection.ParseValue(`string`, x.Value) === stringValue);
        return selectedOption;
    }
    set selectedOption(selectedOption) {
        this.value = selectedOption.Value;
    }

    get value() {
        return UISelection.ParseValue(this.selectedElement.dataset.type, this.selectedElement.dataset.value);
    }
    set value(value) {
        if(this.value === value)
            return;

        this.selectedElement.dataset.type = typeof value;
        this.selectedElement.dataset.value = UISelection.ParseValue(`string`, value);
        this.selectedElement.innerHTML = `${this.selectedOption?.Name ?? this.selectName}<div style="float: right;">▼</div>`;
        this.onChange.forEach(function(onChange) { onChange(); });
    }

    get saveValue() {
        return this.value;
    }
    set saveValue(saveValue){
        this.value = saveValue;
    }

    constructor(prop) {
        super(`div`);
        this.element.append(this.selectedElement);
        this.selectedElement.classList.add(`select`);
        this.contextMenuElement.classList.add(`context-menu`);
        Object.assign(this, prop);
        if(!Array.isArray(this.onChange))
            this.onChange = [ this.onChange ];

        const thisClass = this;
        let visible = false;
        this.selectedElement.addEventListener(`click`, function(event) {
            if(visible) 
                return;

            function clickHandler() {
                thisClass.element.removeChild(thisClass.contextMenuElement);
                document.removeEventListener(`click`, clickHandler);
                visible = false;
            }
            document.addEventListener(`click`, clickHandler);
            window.setTimeout(function() { thisClass.element.append(thisClass.contextMenuElement); visible = true; }, 1);
        });
        this.contextMenuElement.addEventListener(`click`, function(event) {
            if(event.target.classList.contains(`selectdisabled`))
                return;
            if(!event.target.classList.contains(`selectoption`))
                return;
            
            thisClass.value = UISelection.ParseValue(event.target.dataset.type, event.target.dataset.value);
        })
    }
}