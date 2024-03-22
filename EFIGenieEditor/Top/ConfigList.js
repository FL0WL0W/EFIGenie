import UITemplate from "../JavascriptUI/UITemplate.js"
import UIButton from "../JavascriptUI/UIButton.js"
export default class ConfigList extends HTMLDivElement {
    constructor(prop) {
        super()
        this.newItemElement = new UIButton({className: `controlnew`})
        this.newItemElement.addEventListener(`click`, () => { this.appendNewItem() })
        prop ??= {}
        const propSaveValue = prop.saveValue ?? [{}]
        const propValue = prop.value
        delete prop.saveValue
        delete prop.value
        Object.assign(this, prop)
        if(propSaveValue != undefined)
            this.saveValue = propSaveValue
        if(propValue != undefined)
            this.value = propValue
    }

    updateControls() {
        for(let i = 0; i < this.children.length; i++) {
            let up = this.children[i].controlElement.children[1]
            let down = this.children[i].controlElement.children[3]
            if(i === 0) {
                up.className = `controlDummy`
                up.disabled = true
            } else {
                up.className = `controlUp`
                up.disabled = false
            }
            if(i === this.children.length-1) {
                down.className = `controlDummy`
                down.disabled = true
            } else {
                down.className = `controlDown`
                down.disabled = false
            }
        }
        this.lastChild.controlElement.append(this.newItemElement)
        this.dispatchEvent(new Event(`change`, {bubbles: true}))
    }

    appendNewItem(before) {
        let item = document.createElement(`div`)
        item.classList.add(`itemContainer`)
        item.style.display = `flex`
        item.item = item.appendChild(new (this.itemConstructor ?? this.constructor.itemConstructor)())
        item.item.classList.add(`configContainer`)
        item.controlElement = item.appendChild(document.createElement(`span`))
        item.controlElement.classList.add(`controlcontainer`)
        let addElement = item.controlElement.appendChild(document.createElement(`span`))
        addElement.className = `controladd`
        const thisClass = this
        addElement.addEventListener(`click`, function() {
            thisClass.appendNewItem(this.parentElement.parentElement)
        })
        let upElement = item.controlElement.appendChild(document.createElement(`span`))
        upElement.className = `controlup`
        upElement.addEventListener(`click`, function() {
            if(this.disabled)
                return
            this.parentElement.parentElement.previousSibling.before(this.parentElement.parentElement)
            thisClass.updateControls()
        })
        let deleteElement = item.controlElement.appendChild(document.createElement(`span`))
        deleteElement.className = `controldelete`
        deleteElement.addEventListener(`click`, function() {
            if(this.disabled)
                return
            this.parentElement.parentElement.parentElement.removeChild(this.parentElement.parentElement)
            thisClass.updateControls()
        })
        let downElement = item.controlElement.appendChild(document.createElement(`span`))
        downElement.className = `controldown`
        downElement.addEventListener(`click`, function() {
            if(this.disabled)
                return
            this.parentElement.parentElement.nextSibling.after(this.parentElement.parentElement)
            thisClass.updateControls()
        })

        item.RegisterVariables = function() { this.item.RegisterVariables() }
        Object.entries(item.item).forEach(([elementName, element]) => {
            if(item[elementName] !== undefined)
                return
            Object.defineProperty(item, elementName, {
                get: function() { return this.item[elementName] },
                set: function(elementValue) { this.item[elementName] = elementValue }
            })
        })
        item.item.addEventListener(`change`, () => {
            this.dispatchEvent(new Event(`change`, {bubbles: true}))
        })
        if(before === undefined) {
            this.append(item)
        } else {
            this.insertBefore(item, before)
        }
        this.updateControls()
    }

    get saveValue () { return [...this.children].map(e => e.saveValue) }
    set saveValue(saveValue) { 
        while(this.children.length > saveValue.length) this.removeChild(this.lastChild)
        for(let i = 0; i < saveValue.length; i++){
            if(!this.children[i]) {
                this.appendNewItem()
            }
            this.children[i].saveValue = saveValue[i]
        }
    }

    get value() { return [...this.children].map(e => e.value) }
    set value(value) { 
        while(this.children.length > value.length) this.removeChild(this.lastChild)
        for(let i = 0; i < value.length; i++){
            if(!this.children[i]) {
                this.appendNewItem()
            }
            this.children[i].value = value[i]
        }
    }

    RegisterVariables() {
        for(var i = 0; i < this.children.length; i++){
            this.children[i].RegisterVariables()
        }
    }
}
customElements.define(`top-config-list`, ConfigList, { extends: `div` })