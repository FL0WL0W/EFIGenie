import UISelection from "../JavascriptUI/UISelection.js"
export default class PinOverlay extends HTMLDivElement {
    get pinSelectElements() {
        function getNameFromPinSelectChildren(element){
            if(element.classList.contains(`pinselectname`)){
                const name = element.value
                if(!name)
                    return element.textContent
                return name
            }
    
            const elements = element.children
            for(var i = 0; i < elements?.length; i++) {
                const name = getNameFromPinSelectChildren(elements[i])
                if(name)
                    return name
            }
        }
        function getNameFromPinSelectElement(element){
            if(!element)
                return
            const name = getNameFromPinSelectChildren(element)
            if(name)
                return name
    
            return getNameFromPinSelectElement(element.parentElement)
        }

        let pinSelectElements = [...document.querySelectorAll(`.pinselect`)]
        var elements = []
        if(pinSelectElements) {
            for(var i=0; i<pinSelectElements.length; i++) {
                elements.push({
                    name: getNameFromPinSelectElement(pinSelectElements[i]),
                    pinselectmode: pinSelectElements[i].getAttribute(`data-pinselectmode`),
                    pin: pinSelectElements[i].value,
                    element: pinSelectElements[i]
                })
            }
        }
        return elements
    }

    #pinOut
    get pinOut() {
        return this.#pinOut
    }
    set pinOut(pinOut) {
        if(!pinOut)
            return
        this.#pinOut = pinOut
        let scale = 750 / (pinOut.OverlayWidth + 300)
        this.style.width = pinOut.OverlayWidth
        this.style.transform = `scale(${scale})`
        this.overlayImage.src = pinOut.Overlay
        while(pinOut.Pins.length < this.pinElements.children.length) this.pinElements.removeChild(this.pinElements.lastChild)
        for(let i = 0; i < pinOut.Pins.length; i++) {
            let pinElement = this.pinElements.children[i]
            if(!pinElement) {
                pinElement = this.pinElements.appendChild(new UISelection())
                pinElement.firstChild.style.minWidth = `100px`
                pinElement.style.width = `150px`
                pinElement.style.position = `absolute`
                Object.defineProperty(pinElement, 'pinSelectElements', {
                    set: function(pinSelectElements) { 
                        this._pinSelectElements = pinSelectElements
                        let options = []
                        let selectedOption
                        for(let s=0; s<pinSelectElements.length; s++) {
                            let option = {
                                name: pinSelectElements[s].name,
                                value: s,
                                disabled: this.supportedModes.split(` `).indexOf(pinSelectElements[s].pinselectmode) === -1
                            }
                            if(pinSelectElements[s].pin == this.pin) {
                                if(selectedOption) {
                                    option.Class = `pinconflict`
                                    if(typeof selectedOption !== `string`)
                                    selectedOption.Class = `pinconflict`
                                    selectedOption = `conflict`
                                } else {
                                    selectedOption = option
                                }
                            }
                            options.push(option)
                        }
                        this.options = options
                        if(!selectedOption) {
                            this.value = undefined
                        } else if(selectedOption === `conflict`) {
                            this.classList.add(`pinconflict`)
                            this.value = undefined
                        }
                        else {
                            this.classList.remove(`pinconflict`)
                            this.value = selectedOption.value
                        }
                    }
                })
                pinElement.addEventListener(`change`, function() {
                    if(this.value !== undefined)
                        this._pinSelectElements[this.value].element.parentElement.value = this.pin
                })
            }
            pinElement.pin = pinOut.Pins[i].value
            pinElement.supportedModes = pinOut.Pins[i].supportedModes
            pinElement.style.top = pinOut.Pins[i].overlayY - pinOut.OverlayElementHeight / 2 + `px`
            pinElement.style.left = (pinOut.Pins[i].align === `left`? pinOut.Pins[i].overlayX + 150 : pinOut.OverlayWidth - pinOut.Pins[i].overlayX) + `px`
        }
        this.update()
    }
    update() {
        const pinSelectElements = this.pinSelectElements
        const childElements = [...this.pinElements.children]
        childElements.forEach(element => element.pinSelectElements = pinSelectElements)
    }
    pinElements = document.createElement(`div`)
    overlayImage = document.createElement(`img`)
    constructor() {
        super()
        this.class = `pinoverlay`
        this.overlayImage.style.position = `absolute`
        this.overlayImage.style.left = `150px`
        this.append(this.overlayImage)
        this.append(this.pinElements)
    }
}
customElements.define('config-pinoverlay', PinOverlay, { extends: `div` })