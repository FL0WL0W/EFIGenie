import UITemplate from "../JavascriptUI/UITemplate.js"
import UIButton from "../JavascriptUI/UIButton.js"
export default class ConfigList extends HTMLDivElement {
    #staticItems = []
    get staticItems() { return this.#staticItems }
    set staticItems(staticItems) {
        if(objectTester(this.#staticItems, staticItems))
            return
        this.#staticItems = staticItems
        this.#addStaticItems();
    }
    #addStaticItems() {
        this.staticItems.forEach((item, index) => {
            if([...this.children].find(x => x.item === item.item) !== undefined)
                return
            const prevItem = this.staticItems[index - 1]
            //if previousItem not contained in list
            if(prevItem === undefined || [...this.children].find(x => x.item === prevItem.item) === undefined ) {
                //look for nextItem
                let nextIndex = 1
                let nextItem = this.staticItems[index + nextIndex]
                while(nextItem !== undefined && [...this.children].find(x => x.item === nextItem.item) === undefined) nextItem = this.staticItems[++nextIndex]
                if(nextItem === undefined)
                    return this.appendNewItem(item.item)
                return this.appendNewItem(item.item, [...this.children].find(x => x.item === nextItem))
            }
            return this.appendNewItem(item.item, [...this.children].find(x => x.item === prevItem).nextSibling)
        })
    }

    constructor(prop) {
        super()
        this.newItemElement = new UIButton({className: `controlnew`})
        this.newItemElement.addEventListener(`click`, () => { this.appendNewItem(this.#createNewItem()) })
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
            const up = this.children[i].controlElement.children[1]
            const del = this.children[i].controlElement.children[2]
            const down = this.children[i].controlElement.children[3]
            const isStatic = this.staticItems.find(x => x.item === this.children[i].item) !== undefined
            if(i === 0 || (isStatic && this.staticItems.find(x => x.item === this.children[i-1].item) !== undefined)) {
                up.className = `controldummy`
                up.disabled = true
            } else {
                up.className = `controlup`
                up.disabled = false
            }
            if(isStatic) {
                del.className = `controldummy`
                del.disabled = true
            } else {
                del.className = `controldelete`
                del.disabled = false
            }
            if(i === this.children.length-1 || (isStatic && this.staticItems.find(x => x.item === this.children[i+1].item) !== undefined)) {
                down.className = `controldummy`
                down.disabled = true
            } else {
                down.className = `controldown`
                down.disabled = false
            }
        }
        this.lastChild.controlElement.append(this.newItemElement)
        this.dispatchEvent(new Event(`change`, {bubbles: true}))
    }

    appendNewItem(newItem, before) {
        let itemContainer = document.createElement(`div`)
        itemContainer.classList.add(`itemContainer`)
        itemContainer.style.display = `flex`
        itemContainer.item = itemContainer.appendChild(newItem)
        itemContainer.item.classList.add(`configContainer`)
        itemContainer.controlElement = itemContainer.appendChild(document.createElement(`span`))
        itemContainer.controlElement.classList.add(`controlcontainer`)
        let addElement = itemContainer.controlElement.appendChild(document.createElement(`span`))
        addElement.className = `controladd`
        const thisClass = this
        addElement.addEventListener(`click`, function() {
            thisClass.appendNewItem(thisClass.#createNewItem(), this.parentElement.parentElement)
        })
        let upElement = itemContainer.controlElement.appendChild(document.createElement(`span`))
        upElement.className = `controlup`
        upElement.addEventListener(`click`, function() {
            if(this.disabled)
                return
            this.parentElement.parentElement.previousSibling.before(this.parentElement.parentElement)
            thisClass.updateControls()
        })
        let deleteElement = itemContainer.controlElement.appendChild(document.createElement(`span`))
        deleteElement.className = `controldelete`
        deleteElement.addEventListener(`click`, function() {
            if(this.disabled)
                return
            this.parentElement.parentElement.parentElement.removeChild(this.parentElement.parentElement)
            thisClass.updateControls()
        })
        let downElement = itemContainer.controlElement.appendChild(document.createElement(`span`))
        downElement.className = `controldown`
        downElement.addEventListener(`click`, function() {
            if(this.disabled)
                return
            this.parentElement.parentElement.nextSibling.after(this.parentElement.parentElement)
            thisClass.updateControls()
        })

        itemContainer.RegisterVariables = function() { this.item.RegisterVariables?.() }
        Object.entries(itemContainer.item).forEach(([elementName, element]) => {
            if(itemContainer[elementName] !== undefined)
                return
            Object.defineProperty(itemContainer, elementName, {
                get: function() { return this.item[elementName] },
                set: function(elementValue) { this.item[elementName] = elementValue }
            })
        })
        itemContainer.item.addEventListener(`change`, () => {
            this.dispatchEvent(new Event(`change`, {bubbles: true}))
        })
        if(before === undefined) {
            this.append(itemContainer)
        } else {
            this.insertBefore(itemContainer, before)
        }
        this.updateControls()
    }

    #createNewItem() {
        return new (this.itemConstructor ?? this.constructor.itemConstructor)()
    }

    get saveValue () { return [...this.children].map(e => { return { ...e.saveValue, name: this.staticItems.find(x => x.item === e.item)?.name } }) }
    set saveValue(saveValue) { 
        //remove all static items from list, we will add them back as we populate
        [...this.children].forEach(item => {
            if(this.staticItems.find(x => x.item === item.item) !== undefined)
                this.removeChild(item)
        })
        while(this.children.length > saveValue.length) this.removeChild(this.lastChild)
        for(let i = 0; i < saveValue.length; i++){
            const staticItem = this.staticItems.find(x => x.name === saveValue[i]?.name)?.item 
            if(!this.children[i] || staticItem !== undefined) {
                const item = staticItem ?? this.#createNewItem()
                this.appendNewItem(item, this.children[i])
            }
            this.children[i].saveValue = saveValue[i]
        }
        this.#addStaticItems();
    }

    get saveValue () { return [...this.children].map(e => { return { ...e.value, name: this.staticItems.find(x => x.item === e.item)?.name } }) }
    set value(value) { 
        //remove all static items from list, we will add them back as we populate
        [...this.children].forEach(item => {
            if(this.staticItems.find(x => x.item === item.item) !== undefined)
                this.removeChild(item)
        })
        while(this.children.length > value.length) this.removeChild(this.lastChild)
        for(let i = 0; i < value.length; i++){
            const staticItem = this.staticItems.find(x => x.name === value[i]?.name)?.item 
            if(!this.children[i] || staticItem !== undefined) {
                const item = staticItem ?? this.#createNewItem()
                this.appendNewItem(item, this.children[i])
            }
            this.children[i].value = value[i]
        }
        this.#addStaticItems();
    }

    RegisterVariables() {
        for(var i = 0; i < this.children.length; i++){
            this.children[i].RegisterVariables()
        }
    }
}
customElements.define(`top-config-list`, ConfigList, { extends: `div` })