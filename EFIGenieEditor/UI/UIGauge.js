export default class UIGauge extends HTMLDivElement {
    static template = 
`<canvas data-type="radial-gauge"
    data-width="300"
    data-height="300"
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
    data-animation-duration="1500"
    data-animation-rule="linear"
></canvas>`

    get template() { return this.innerHTML }
    set template(template) {
        this.innerHTML = template
        BaseGauge.fromElement(this.children[0])
        this.gauge = document.gauges.find(x=> x.canvas.element === this.children[0])
        this.#updateGauge()
    }

    #value
    get value() { return this.#value }
    set value(value) { 
        if(this.#value === value)
            return
        this.#value = value
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

    #updateGauge() {
        let options = {}
        options.minValue = this.min
        options.maxValue = this.max
        let i = this.min
        options.majorTicks = [i]
        while((i+=this.step) < this.max)
            options.majorTicks.push(i)
        options.majorTicks.push(i)
        options.highlights = []
        if(this.redline != undefined) {
            options.highlights.push({
                from: this.redline,
                to: options.maxValue,
                color: `rgba(200, 50, 50, .75)`
            })
        }
        this.gauge.update(options)
    }

    constructor(prop) {
        super()
        this.template = this.constructor.template
        Object.assign(this, prop)
    }
}
customElements.define(`ui-gauge`, UIGauge, { extends: `div` })