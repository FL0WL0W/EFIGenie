import UITemplate from "../JavascriptUI/UITemplate.js"
export default class ConfigContainer extends UITemplate {
    labelElement = document.createElement(`span`)
    get label() { return this.labelElement.textContent }
    set label(label) { this.labelElement.textContent = label }

    Setup(prop) {
        super.Setup({ ...prop, template: `<span data-element="labelElement"></span><div class="configContainer">${prop?.template ?? this.setup ?? this.constructor.template}</div>` })
    }
}
customElements.define(`top-config-container`, ConfigContainer, { extends: `span` })