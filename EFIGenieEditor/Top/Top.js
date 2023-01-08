import UITemplate from "../JavascriptUI/UITemplate.js"
import UIButton from "../JavascriptUI/UIButton.js"
import Dashboard from "./Dashboard.js"
import Engine from "./Engine.js"
import Ignition from "./Ignition.js"
import Fuel from "./Fuel.js"
import Inputs from "./Inputs.js"
export default class Top extends UITemplate {
    static template = getFileContents(`ConfigGui/Top.html`)

    title = document.createElement(`div`)
    dashboardTab = document.createElement(`div`)
    inputsTabExpend = document.createElement(`span`)
    inputsTab = document.createElement(`div`)
    engineTab = document.createElement(`div`)
    fuelTab = document.createElement(`div`)
    ignitionTab = document.createElement(`div`)
    Dashboard = new Dashboard()
    Inputs = new Inputs()
    Engine = new Engine()
    Fuel = new Fuel()
    Ignition = new Ignition()
    sidebarClose = new UIButton({className: `sidebaropenclose w3-button w3-padding-16 w3-right`})
    sidebarOpen = new UIButton({className: `sidebaropenclose w3-button w3-padding-16`})
    constructor(prop){
        super()
        this.Engine.addEventListener(`change`, () => {
            if(this.Engine.value.CylinderAirmassConfigOrVariableSelection.selection == undefined) {
                this.fuelTab.classList.add(`disabled`)
            } else {
                this.fuelTab.classList.remove(`disabled`)
            }
        })
        this.sidebarOpen.addEventListener(`click`, () => {
            window.localStorage.setItem(`expanded`, true)
            var sidebarElement = this.firstChild
            var containerElement = this.lastChild
            sidebarElement.hidden = false
            var width = sidebarElement.offsetWidth
            var moveamount = 0.005 * width / 0.1
            var left = parseFloat(containerElement.style.left)
            if(isNaN(left))
                left = 0
            sidebarElement.style.left= `${left-width}px`
            var intervalId = setInterval(() => {
                if (left >= width) {
                    clearInterval(intervalId)
                } else {
                    left += moveamount
                    containerElement.style.marginRight = containerElement.style.left = `${left}px`
                    sidebarElement.style.left = `${left-width}px`
                    sidebarElement.style.opacity = left / width
                }
            }, 5)
            this.sidebarOpen.hidden = true
        })
        this.sidebarClose.addEventListener(`click`, () => {
            window.localStorage.setItem(`expanded`, false)
            var sidebarElement = this.firstChild
            var containerElement = this.lastChild
            var width = sidebarElement.offsetWidth
            var moveamount = 0.005 * width / 0.1
            var left = parseFloat(containerElement.style.left)
            if(isNaN(left))
                left = 0
            sidebarElement.style.left= `${left-width}px`
            var intervalId = setInterval(() => {
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
            this.sidebarOpen.hidden = false
        })
        this.title.class = `w3-padding-16`
        this.title.style.display = `inline-block`
        this.title.style.margin = `3px`
        this.activeTab = window.localStorage.getItem(`lastTab`) ?? `Inputs`
        this.dashboardTab.class = `w3-bar-item w3-button dashboard-tab`
        this.dashboardTab.addEventListener(`click`, () => {
            this.activeTab = `Dashboard`
        })
        this.inputsTabList = this.Inputs.inputListElement
        this.inputsTabList.addEventListener(`click`, () => {
            this.activeTab = `Inputs`
        })
        this.inputsTabExpend.className = `despand`
        this.inputsTabExpend.addEventListener(`click`, event => {
            this.inputsTabList.hidden = !this.inputsTabList.hidden
            if(this.inputsTabList.hidden) {
                window.localStorage.setItem(`inputExpanded`, false)
                this.inputsTabExpend.className = `expand`
            } else {
                window.localStorage.setItem(`inputExpanded`, true)
                this.inputsTabExpend.className = `despand`
            }
            event.preventDefault()
            event.stopPropagation()
            return false
        })
        this.inputsTab.append(this.inputsTabExpend)
        this.inputsTab.class = `w3-bar-item w3-button input-tab`
        this.inputsTab.addEventListener(`click`, () => {
            this.activeTab = `Inputs`
        })
        this.engineTab.class = `w3-bar-item w3-button engine-tab`
        this.engineTab.addEventListener(`click`, () => {
            this.activeTab = `Engine`
        })
        this.fuelTab.class = `w3-bar-item w3-button fuel-tab`
        this.fuelTab.addEventListener(`click`, () => {
            if(!this.fuelTab.classList.contains(`disabled`))
                this.activeTab = `Fuel`
        })
        this.ignitionTab.class = `w3-bar-item w3-button ignition-tab`
        this.ignitionTab.addEventListener(`click`, () => {
            this.activeTab = `Ignition`
        })
        this.Setup(prop)
        let touched = false
        this.querySelector(`.sidebarSelection`).addEventListener(`touchstart`, () => {
            touched = true
        })
        this.addEventListener(`click`, () => {
            if(touched) {
                touched = false
                this.sidebarClose.dispatchEvent(new Event(`click`))
            }
        })
        window.setTimeout(() => {
            if(window.localStorage.getItem(`inputExpanded`) ?? true === false) {
                this.inputsTabExpend.dispatchEvent(new Event(`click`))
            }
            if(window.localStorage.getItem(`expanded`) ?? false) {
                this.sidebarOpen.dispatchEvent(new Event(`click`))
            }
        }, 50)
    }

    get activeTab() { return this.title.textContent }
    set activeTab(activeTab) {
        window.localStorage.setItem(`lastTab`, activeTab)
        this.title.textContent = activeTab
        this.Dashboard.hidden = true
        this.Inputs.hidden = true
        this.Engine.hidden = true
        this.Fuel.hidden = true
        this.Ignition.hidden = true
        this.dashboardTab.classList.remove(`active`)
        this.inputsTab.classList.remove(`active`)
        this.engineTab.classList.remove(`active`)
        this.fuelTab.classList.remove(`active`)
        this.ignitionTab.classList.remove(`active`)
        switch(activeTab) {
            case `Dashboard`:
                this.Dashboard.hidden = false
                this.dashboardTab.classList.add(`active`)
                break
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
        communication.variablesToPoll = []
        this.Inputs.RegisterVariables()
        this.Engine.RegisterVariables()
        this.Fuel.RegisterVariables()
        this.Ignition.RegisterVariables()
        this.Dashboard.RegisterVariables()
    }
}
customElements.define(`top-top`, Top, { extends: `span` })