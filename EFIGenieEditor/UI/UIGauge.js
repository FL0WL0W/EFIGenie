import UIDialog from "../JavascriptUI/UIDialog.js"
import UITemplate from "../JavascriptUI/UITemplate.js"
import Dashboard from "../Top/Dashboard.js"
import UIParameterWithUnit from "./UIParameterWithUnit.js"
import UINumberWithUnit from "./UINumberWithUnit.js"
export default class UIGauge extends UITemplate {
    static template = 
`<canvas data-type="radial-gauge"
    data-width="350"
    data-height="350"
    data-minor-ticks="2"
    data-stroke-ticks="true"
    data-color-plate="rgba(0,0,0,0)",
    data-color-major-ticks="#eee"
    data-color-minor-ticks="#ddd"
    data-color-numbers="#eee"
    data-border-shadow-width="0"
    data-borders="false"
    data-needle-type="arrow"
    data-needle-width="2"
    data-needle-circle-size="7"
    data-needle-circle-outer="true"
    data-needle-circle-inner="false"
    data-animation-duration="50"
    data-animation-rule="linear"
></canvas>`

    Setup(prop) {
        super.Setup(prop)
        const canvas = this.querySelector(`canvas`)
        canvas.addEventListener(`click`, () => {
            this.configDialog.show()
        })
        BaseGauge.fromElement(canvas)
        //this.gauge = { update: () => {}, draw: () => {} }
        this.gauge = document.gauges.find(x=> x.canvas.element === canvas)
        this.#updateGauge()
    }

    get displayUnit() { return this.configTemplate.variable.displayUnit }
    set displayUnit(displayUnit) { this.configTemplate.variable.displayUnit = displayUnit }

    #value
    get value() { return this.#value }
    set value(value) { 
        if(this.#value === value)
            return
        this.#value = value
        this.gauge.value = ConvertValueFromUnitToUnit(value, this.valueUnit, this.displayUnit)
    }

    get saveValue() { return this.configTemplate.saveValue }
    set saveValue(saveValue) { this.configTemplate.saveValue = saveValue }
    get min() { return this.configTemplate.min.value }
    set min(min) { this.configTemplate.min.value = min }
    get max() { return this.configTemplate.max.value }
    set max(max) { this.configTemplate.max.value = max }
    get step() { return this.configTemplate.step.value }
    set step(step) { this.configTemplate.step.value = step }
    get highRedline() { return this.configTemplate.highRedline.value }
    set highRedline(highRedline) { this.configTemplate.highRedline.value = highRedline }
    get lowRedline() { return this.configTemplate.lowRedline.value }
    set lowRedline(lowRedline) { this.configTemplate.lowRedline.value = lowRedline }

    #updateGauge() {
        let options = {}
        options.minValue = parseFloat(ConvertValueFromUnitToUnit(this.min, this.valueUnit, this.displayUnit)?.toFixed(2) ?? 0)
        options.maxValue = parseFloat(ConvertValueFromUnitToUnit(this.max, this.valueUnit, this.displayUnit)?.toFixed(2) ?? 100)
        let i = options.minValue
        options.majorTicks = [i]
        const step = ConvertValueFromUnitToUnit(this.step, this.valueUnit, this.displayUnit) ?? 10
        while((i+=step) < (options.maxValue - step /2))
            options.majorTicks.push(parseFloat(i.toFixed(2)))
        options.majorTicks.push(parseFloat(i.toFixed(2)))
        options.highlights = []
        const highRedline = ConvertValueFromUnitToUnit(this.highRedline, this.valueUnit, this.displayUnit)
        if(highRedline != undefined) {
            options.highlights.push({
                from: highRedline,
                to: options.maxValue,
                color: `rgba(200, 50, 50, .75)`
            })
        }
        const lowRedline = ConvertValueFromUnitToUnit(this.lowRedline, this.valueUnit, this.displayUnit)
        if(lowRedline != undefined) {
            options.highlights.push({
                from: options.minValue,
                to: lowRedline,
                color: `rgba(200, 50, 50, .75)`
            })
        }
        options.title = this.configTemplate.variable.value?.name
        options.title = options.title?.substring(options.title.indexOf(`.`) + 1)
        options.unit = this.configTemplate.variable.value?.unit


        this.gauge.update(options)
        this.gauge.value = ConvertValueFromUnitToUnit(this.value, this.valueUnit, this.displayUnit)
        this.gauge.draw()
    }

    constructor(prop) {
        super()
        this.style.position = `relative`
        this.configTemplate = new UITemplate({
            template:  `<span style="display: block;"><label>Variable:</label><div data-element="variable"></div><span>
                        <span style="display: block;"><label>Min:</label><div data-element="min"></div><span>
                        <span style="display: block;"><label>Low:</label><div data-element="lowRedline"></div><span>
                        <span style="display: block;"><label>Step:</label><div data-element="step"></div><span>
                        <span style="display: block;"><label>High:</label><div data-element="highRedline"></div><span>
                        <span style="display: block;"><label>Max:</label><div data-element="max"></div><span>`,
            variable: new UIParameterWithUnit({
                options: VariableRegister.GetSelections(undefined, defaultFilter(undefined, [ `float` ]))
            }),
            min: new UINumberWithUnit(),
            max: new UINumberWithUnit(),
            step: new UINumberWithUnit({ min: 0.0000001 }),
            highRedline: new UINumberWithUnit(),
            lowRedline: new UINumberWithUnit()
        })
        let previousDisplayUnit
        let previousValueUnit
        this.configTemplate.variable.addEventListener(`change`, () => {
            if(previousDisplayUnit != this.displayUnit) {
                const pdu = previousDisplayUnit
                previousDisplayUnit = this.displayUnit
                if(pdu === this.configTemplate.min.displayUnit) this.configTemplate.min.displayUnit = this.displayUnit
                if(pdu === this.configTemplate.max.displayUnit) this.configTemplate.max.displayUnit = this.displayUnit
                if(pdu === this.configTemplate.step.displayUnit) this.configTemplate.step.displayUnit = this.displayUnit
                if(pdu === this.configTemplate.highRedline.displayUnit) this.configTemplate.highRedline.displayUnit = this.displayUnit
                if(pdu === this.configTemplate.lowRedline.displayUnit) this.configTemplate.lowRedline.displayUnit = this.displayUnit
            }
            this.RegisterVariables()
            if(previousValueUnit != this.valueUnit) {
                previousValueUnit = this.valueUnit
                this.configTemplate.min.valueUnit = this.valueUnit
                this.configTemplate.max.valueUnit = this.valueUnit
                this.configTemplate.step.valueUnit = this.valueUnit
                this.configTemplate.highRedline.valueUnit = this.valueUnit
                this.configTemplate.lowRedline.valueUnit = this.valueUnit

                let unitDefaultOptions = GetDefaultMinMaxStepRedlineFromUnit(this.valueUnit)
                this.min = unitDefaultOptions?.min ?? this.min
                this.max = unitDefaultOptions?.max ?? this.max
                this.step = unitDefaultOptions?.step ?? this.step
                this.highRedline = unitDefaultOptions?.highRedline ?? unitDefaultOptions?.max ?? this.highRedline
                this.lowRedline = unitDefaultOptions?.lowRedline ?? unitDefaultOptions?.min ?? this.lowRedline
            }
        })
        let previousMin
        let previousMax
        this.configTemplate.addEventListener(`change`, () => {
            this.RegisterVariables()

            this.configTemplate.min.step = this.configTemplate.max.step = this.configTemplate.highRedline.step = this.configTemplate.lowRedline.step = this.step
        
            if(previousMin != this.min) {
                const pMin = previousMin
                previousMin = this.min
                this.configTemplate.lowRedline.min = this.configTemplate.highRedline.min = this.min
                if(this.lowRedline === pMin)
                    this.lowRedline = this.min
            }
            if(previousMax != this.min) {
                const pMax = previousMax
                previousMax = this.max
                this.configTemplate.lowRedline.max = this.configTemplate.highRedline.max = this.max
                if(this.highRedline === pMax)
                    this.highRedline = this.max
            }
            this.#updateGauge()
        })
        this.configDialog = new UIDialog({ title: `Edit Gauge` })
        this.configDialog.content.append(this.configTemplate)
        this.Setup(prop)
    }

    GUID = generateGUID()
    RegisterVariables() {
        let options = Dashboard.thisDashboard.options.map(x => x.group && x.options? {...x, options: x.options.map(x => { return {...x, disabled: !x.disabled}})} : {...x, disabled: !x.disabled})
        this.configTemplate.variable.options = options

        const reference = this.configTemplate.variable.value
        const variable = this.communication?.variableMetadata?.GetVariableByReference(reference) ?? VariableRegister.GetVariableByReference(reference)
        if(!reference?.unit && reference?.type?.split(`|`)?.indexOf(`float`) === -1) return
        this.valueUnit = variable?.unit
        if(communication.variablesToPoll.indexOf(reference) === -1)
            communication.variablesToPoll.push(reference)
        communication.liveUpdateEvents[this.GUID] = (variableMetadata, currentVariableValues) => {
            if(reference) { 
                const variableId = variableMetadata?.GetVariableId(reference)
                if(currentVariableValues?.[variableId] != undefined) {
                    this.value = currentVariableValues[variableId]
                }
            }
        }
    }
}
customElements.define(`ui-gauge`, UIGauge, { extends: `span` })