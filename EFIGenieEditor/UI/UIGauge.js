import UIParameterWithUnit from "./UIParameterWithUnit.js"
export default class UIGauge extends HTMLDivElement {
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
></canvas>
<div data-element="variable" style="
    position: absolute;
    inset: auto auto 100px 0px;
    z-index: 1;
    display: flex;
    justify-content: center;
    width: 350;
"></div>`

    get template() { return this.innerHTML }
    set template(template) {
        this.innerHTML = template
        this.querySelector(`[data-element="variable"]`).replaceChildren(this.variable)
        const canvas = this.querySelector(`canvas`)
        BaseGauge.fromElement(canvas)
        this.gauge = document.gauges.find(x=> x.canvas.element === canvas)
        this.#updateGauge()
    }

    get displayUnit() { return this.variable.displayUnit }
    set displayUnit(displayUnit) { this.variable.displayUnit = displayUnit }

    #value
    get value() { return this.#value }
    set value(value) { 
        if(this.#value === value)
            return
        this.#value = value
        this.gauge.value = ConvertValueFromUnitToUnit(value, this.valueUnit, this.displayUnit)
    }

    get saveValue() { return {
        min: this.min,
        max: this.max,
        step: this.step,
        redline: this.redline,
        scale: this.scale,
        variable: this.variable.saveValue
    }}
    set saveValue(saveValue) {
        if(saveValue == undefined)
            return
        
        this.min = saveValue.min
        this.max = saveValue.max
        this.step = saveValue.step
        this.redline = saveValue.redline
        this.scale = saveValue.scale
        this.variable.saveValue = saveValue.variable
    }

    #min
    get min() { return this.#min }
    set min(min) { 
        if(this.#min === min)
            return
        this.#min = min
        this.#updateGauge()
    }

    #max
    get max() { return this.#max }
    set max(max) { 
        if(this.#min === max)
            return
        this.#max = max
        this.#updateGauge()
    }

    #step
    get step() { return this.#step }
    set step(step) { 
        if(this.#step === step)
            return
        this.#step = step
        this.#updateGauge()
    }

    #redline
    get redline() { return this.#redline }
    set redline(redline) { 
        if(this.#redline === redline)
            return
        this.#redline = redline
        this.#updateGauge()
    }

    get scale() { return this.style.scale ?? `` !== ``? this.style.scale : undefined }
    set scale(scale) { this.style.scale = scale }

    #updateGauge() {
        let unitDefaultOptions = GetDefaultMinMaxStepRedlineFromUnit(this.valueUnit)
        let options = {}
        options.minValue = parseFloat(ConvertValueFromUnitToUnit(this.min ?? unitDefaultOptions?.min, this.valueUnit, this.displayUnit)?.toFixed(2) ?? 0)
        options.maxValue = parseFloat(ConvertValueFromUnitToUnit(this.max ?? unitDefaultOptions?.max, this.valueUnit, this.displayUnit)?.toFixed(2) ?? 100)
        let i = options.minValue
        options.majorTicks = [i]
        const step = ConvertValueFromUnitToUnit(this.step ?? unitDefaultOptions?.step, this.valueUnit, this.displayUnit) ?? 10
        while((i+=step) < (options.maxValue - step /2))
            options.majorTicks.push(parseFloat(i.toFixed(2)))
        options.majorTicks.push(parseFloat(i.toFixed(2)))
        options.highlights = []
        const redline = ConvertValueFromUnitToUnit(this.redline ?? unitDefaultOptions?.redline, this.valueUnit, this.displayUnit)
        if(redline != undefined) {
            options.highlights.push({
                from: redline,
                to: options.maxValue,
                color: `rgba(200, 50, 50, .75)`
            })
        }
        options.title = this.parameter
        this.gauge.update(options)
    }

    constructor(prop) {
        super()
        this.style.position = `relative`
        this.canvas = this.appendChild(document.createElement(`div`))
        this.variable = this.appendChild(new UIParameterWithUnit({
            options: VariableRegister.GetSelections(undefined, defaultFilter(undefined, [ `float` ])),
        }))
        this.variable.parameterSelection.selectedElement.style.minWidth = `auto`
        this.variable.parameterSelection.selectedElement.style.maxWidth = `150px`
        this.variable.addEventListener(`change`, () => {
            this.#updateGauge()
            this.RegisterVariables()
        })
        this.template = this.constructor.template
        Object.assign(this, prop)
    }

    GUID = generateGUID()
    RegisterVariables() {
        let options = VariableRegister.GetSelections(undefined, defaultFilter(undefined, [ `float` ]))
        let metadataOptions = communication.variableMetadata?.GetSelections(undefined, defaultFilter(undefined, [ `float` ]))
        for(const i in metadataOptions) {
            const option = metadataOptions[i]
            if(option.group) {
                const optionGroup = options.find(x => x.group === option.group)
                if(optionGroup == undefined) {
                    options.push(option)
                } else {
                    for(const i in option.options) {
                        const optionG = option.options[i]
                        if(optionGroup.options.find(x => objectTester(x.value, optionG.value)) == undefined) {
                            optionGroup.options.push(optionG)
                        }
                    }
                }
            } else {
                if(options.find(x => objectTester(x.value, option.value)) == undefined) {
                    options.push(option)
                }
            }
        }
        this.variable.options = options

        const reference = this.variable.value
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
customElements.define(`ui-gauge`, UIGauge, { extends: `div` })