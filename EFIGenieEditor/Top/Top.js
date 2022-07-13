import UITemplate from "../JavascriptUI/UITemplate.js"
import UIButton from "../JavascriptUI/UIButton.js"
import Engine from "./Engine.js"
import Ignition from "./Ignition.js"
import Fuel from "./Fuel.js"
import Inputs from "../Input/Inputs.js"
export default class Top extends UITemplate {
    static template = getFileContents(`ConfigGui/Top.html`)

    title = document.createElement(`div`)
    inputsTabExpend = document.createElement(`span`)
    inputsTab = document.createElement(`div`)
    engineTab = document.createElement(`div`)
    fuelTab = document.createElement(`div`)
    ignitionTab = document.createElement(`div`)
    Inputs = new Inputs()
    Engine = new Engine()
    Fuel = new Fuel()
    Ignition = new Ignition()
    sidebarClose = new UIButton({className: `sidebaropenclose w3-button w3-padding-16 w3-right`})
    sidebarOpen = new UIButton({className: `sidebaropenclose w3-button w3-padding-16`})
    constructor(prop){
        super()
        const thisClass = this
        this.sidebarOpen.addEventListener(`click`, function() {
            window.localStorage.setItem(`expanded`, true)
            var sidebarElement = thisClass.firstChild
            var containerElement = thisClass.lastChild
            sidebarElement.hidden = false
            var width = sidebarElement.offsetWidth
            var moveamount = 0.005 * width / 0.1
            var left = parseFloat(containerElement.style.left)
            if(isNaN(left))
                left = 0
            sidebarElement.style.left= `${left-width}px`
            var intervalId = setInterval(function() {
                if (left >= width) {
                    clearInterval(intervalId)
                } else {
                    left += moveamount
                    containerElement.style.marginRight = containerElement.style.left = `${left}px`
                    sidebarElement.style.left = `${left-width}px`
                    sidebarElement.style.opacity = left / width
                }
            }, 5)
            thisClass.sidebarOpen.hidden = true
        })
        this.sidebarClose.addEventListener(`click`, function() {
            window.localStorage.setItem(`expanded`, false)
            var sidebarElement = thisClass.firstChild
            var containerElement = thisClass.lastChild
            var width = sidebarElement.offsetWidth
            var moveamount = 0.005 * width / 0.1
            var left = parseFloat(containerElement.style.left)
            if(isNaN(left))
                left = 0
            sidebarElement.style.left= `${left-width}px`
            var intervalId = setInterval(function() {
                if (left <= 0) {
                    clearInterval(intervalId)
                    sidebarElement.hidden = true
                } else {
                    left -= moveamount
                    containerElement.style.marginRight = containerElement.style.left = `${left}px`
                    sidebarElement.style.left = `${left-width}px`
                    sidebarElement.style.opacity = left / width
                }
            }, 5)
            thisClass.sidebarOpen.hidden = false
        })
        this.title.class = `w3-padding-16`
        this.title.style.display = `inline-block`
        this.title.style.margin = `3px`
        this.activeTab = window.localStorage.getItem(`lastTab`) ?? `Inputs`
        this.inputsTabList = this.Inputs.inputListElement
        this.inputsTabList.addEventListener(`click`, function() {
            thisClass.activeTab = `Inputs`
        })
        this.inputsTabExpend.className = `despand`
        this.inputsTabExpend.addEventListener(`click`, function(event) {
            thisClass.inputsTabList.hidden = !thisClass.inputsTabList.hidden
            if(thisClass.inputsTabList.hidden) {
                window.localStorage.setItem(`inputExpanded`, false)
                thisClass.inputsTabExpend.className = `expand`
            } else {
                window.localStorage.setItem(`inputExpanded`, true)
                thisClass.inputsTabExpend.className = `despand`
            }
            event.preventDefault()
            event.stopPropagation()
            return false
        })
        this.inputsTab.append(this.inputsTabExpend)
        this.inputsTab.class = `w3-bar-item w3-button input-tab`
        this.inputsTab.addEventListener(`click`, function() {
            thisClass.activeTab = `Inputs`
        })
        this.engineTab.class = `w3-bar-item w3-button engine-tab`
        this.engineTab.addEventListener(`click`, function() {
            thisClass.activeTab = `Engine`
        })
        this.fuelTab.class = `w3-bar-item w3-button fuel-tab`
        this.fuelTab.addEventListener(`click`, function() {
            thisClass.activeTab = `Fuel`
        })
        this.ignitionTab.class = `w3-bar-item w3-button ignition-tab`
        this.ignitionTab.addEventListener(`click`, function() {
            thisClass.activeTab = `Ignition`
        })
        this.Setup(prop)
        let touched = false
        this.querySelector(`.sidebarSelection`).addEventListener(`touchstart`, function() {
            touched = true
        })
        this.addEventListener(`click`, function() {
            if(touched) {
                touched = false
                thisClass.sidebarClose.dispatchEvent(new Event(`click`))
            }
        })
        window.setTimeout(function() {
            if(window.localStorage.getItem(`inputExpanded`) ?? true === false) {
                thisClass.inputsTabExpend.dispatchEvent(new Event(`click`))
            }
            if(window.localStorage.getItem(`expanded`) ?? false) {
                thisClass.sidebarOpen.dispatchEvent(new Event(`click`))
            }
        }, 50)
    }

    get activeTab() { return this.title.textContent }
    set activeTab(activeTab) {
        window.localStorage.setItem(`lastTab`, activeTab)
        this.title.textContent = activeTab
        this.Inputs.hidden = true
        this.Engine.hidden = true
        this.Fuel.hidden = true
        this.Ignition.hidden = true
        this.inputsTab.classList.remove(`active`)
        this.engineTab.classList.remove(`active`)
        this.fuelTab.classList.remove(`active`)
        this.ignitionTab.classList.remove(`active`)
        switch(activeTab) {
            case `Inputs`:
                this.Inputs.hidden = false
                this.inputsTab.classList.add(`active`)
                break
            case `Engine`:
                this.Engine.hidden = false
                this.engineTab.classList.add(`active`)
                break
            case `Fuel`:
                this.Fuel.hidden = false
                this.fuelTab.classList.add(`active`)
                break
            case `Ignition`:
                this.Ignition.hidden = false
                this.ignitionTab.classList.add(`active`)
                break
        }
    }

    get saveValue() { return super.saveValue }
    set saveValue(saveValue) {
        super.saveValue = saveValue
        this.RegisterVariables()
    }

    RegisterVariables() {
        VariableRegister.Clear()
        communication.liveUpdateEvents = []
        this.Inputs.RegisterVariables()
        this.Engine.RegisterVariables()
        this.Fuel.RegisterVariables()
        this.Ignition.RegisterVariables()
    }
}
customElements.define(`top-top`, Top, { extends: `span` })