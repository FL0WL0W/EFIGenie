import UISelection from "../JavascriptUI/UISelection.js";
export default class UIPinSelection extends UISelection {
    constructor(prop){
        super(prop);
        this.selectDisabled = prop.selectDisabled ?? true;
        this.selectValue = prop.selectValue ?? 0xFFFF;
        this.options = this.#generateOptionList();
        this.addEventListener(`change`, function() {
            UpdateOverlay();
        });
        this.selectedElement.dataset.pinselectmode = this.pinType;
        this.selectedElement.classList.add(`pinselect`);
    }
    
    #generateOptionList() {
        var options = []
        var endOptions = [];
        let pinOut = pinOverlay.pinOut;
        for(var i = 0; i < pinOut.Pins.length; i++) {
            const selected = this.value === pinOut.Pins[i].value;
            if(pinOut.Pins[i].supportedModes.split(` `). indexOf(this.pinType) === -1) {
                endOptions.push({
                    name: pinOut.Pins[i].name,
                    value: pinOut.Pins[i].value,
                    class: selected? `incompatible` : undefined,
                    disabled: true
                });
            } else {
                options.push({
                    name: pinOut.Pins[i].name,
                    value: pinOut.Pins[i].value
                });
            }
        }
        options = options.concat(endOptions);

        return options;
    }
}
customElements.define('ui-pinselection', UIPinSelection, { extends: `div` });