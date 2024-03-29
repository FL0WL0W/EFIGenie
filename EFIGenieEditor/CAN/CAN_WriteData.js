import UINumber from "../JavascriptUI/UINumber.js"
import UISelection from "../JavascriptUI/UISelection.js"
import UITemplate from "../JavascriptUI/UITemplate.js"
import ConfigList from "../Top/ConfigList.js"
import PinOverlay from "../UI/UIPinOverlay.js"
import CAN_PackData from "./CAN_PackData.js"
export default class CAN_WriteData extends UITemplate {
    static displayName = `CAN Write`
    static outputTypes = [ ]
    static inputTypes = [ ]
    static template = `<div data-element="canBusLabel"></div><div data-element="canBus"></div><div data-element="canIDLabel"></div><div data-element="canID"></div>Interval:<div data-element="interval"></div><div data-element="packData"></div>`

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
    interval = new UISelection({
        value: 100,
        options: [
            { name: `100Hz`, value: 100 },
            { name: `33Hz`, value: 33 },
            { name: `25Hz`, value: 25 },
            { name: `20Hz`, value: 20 },
            { name: `10Hz`, value: 10 },
            { name: `5Hz`, value: 5 },
            { name: `4Hz`, value: 4 },
            { name: `3Hz`, value: 3 },
            { name: `2Hz`, value: 2 },
            { name: `1Hz`, value: 1 },
        ],
        selectHidden: true,
        class: `can-write-interval`
    })
    packData = new ConfigList({
        itemConstructor: CAN_PackData,
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
        this.packData.RegisterVariables(reference)
    }
}
CANConfigs.push(CAN_WriteData)
customElements.define(`can-write-data`, CAN_WriteData, { extends: `span` })