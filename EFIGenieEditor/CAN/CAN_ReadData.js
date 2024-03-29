import UINumber from "../JavascriptUI/UINumber.js"
import UISelection from "../JavascriptUI/UISelection.js"
import UITemplate from "../JavascriptUI/UITemplate.js"
import ConfigList from "../Top/ConfigList.js"
import PinOverlay from "../UI/UIPinOverlay.js"
import CAN_ParseData from "./CAN_ParseData.js"
export default class CAN_ReadData extends UITemplate {
    static displayName = `CAN Read`
    static outputTypes = [ ]
    static inputTypes = [ ]
    static template = `<div data-element="canBusLabel"></div><div data-element="canBus"></div><div data-element="canIDLabel"></div><div data-element="canID"></div><div data-element="parseData"></div>`

    canIDLabel = document.createElement(`span`)
    canID = new UINumber({
        min: 0,
        max: 536870911,
        step: 1,
        value: 0
    })
    canBusLabel = document.createElement(`span`)
    canBus = new UISelection({
        value: 0,
        selectHidden: true,
        class: `can-bus-selection`
    })
    parseData = new ConfigList({
        itemConstructor: CAN_ParseData,
        saveValue: [{}],
        class: `configContainer`
    })

    constructor(prop) {
        super()
        this.canBusLabel.innerText = `Bus:`
        this.canIDLabel.innerText = "Identifier:"
        this.updateOptions()
        this.Setup(prop)
    }

    updateOptions() {
        var options = []
        let pinOut = PinOverlay.PinOut //this sucks
        if(!pinOut) return
        console.log(pinOut.CANBusCount)
        for(var i = 0; i < pinOut.CANBusCount; i++) {
            options.push({
                name: i,
                value: i
            })
        }

        this.canBus.options = options
        if(options.length < 2) {
            this.canBusLabel.hidden = true
            this.canBus.hidden = true
        }
    }

    RegisterVariables(reference) {
        this.updateOptions()
        this.parseData.RegisterVariables(reference)
    }
}
CANConfigs.push(CAN_ReadData)
customElements.define(`can-read-data`, CAN_ReadData, { extends: `span` })