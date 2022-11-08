import UITemplate from "../JavascriptUI/UITemplate.js"
import UIGauge from "../UI/UIGauge.js"
export default class Dashboard extends UITemplate {
    static template = getFileContents(`ConfigGui/Dashboard.html`)

    gauges = document.createElement(`div`)// = [ new UIGauge(), new UIGauge(), new UIGauge(), new UIGauge(), new UIGauge(), new UIGauge() ]

    constructor(prop) {
        super()
        this.gauges.class = `gauges`
        Object.defineProperty(this.gauges, 'saveValue', {
            get: function() { return [...this.children].map(x => x.saveValue) },
            set: function(saveValue) { 
                while(this.children.length > saveValue.length) this.removeChild(this.lastChild)
                for(let i = 0; i < saveValue.length; i++){
                    if(!this.children[i]) {
                        this.append(new UIGauge())
                    }
                    this.children[i].saveValue = saveValue[i]
                }
            }
        })
        this.gauges.saveValue = new Array(8)
        this.Setup(prop)
    }

    RegisterVariables() {
        [...this.gauges.children].forEach(x => x.RegisterVariables())
    }
}
customElements.define(`top-dashboard`, Dashboard, { extends: `span` })