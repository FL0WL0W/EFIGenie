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
        this.selectedElement.dataset.pinselectmode = this.PinType;
        this.selectedElement.classList.add(`pinselect`);
    }
    
    #generateOptionList() {
        var options = []
        var endOptions = [];
        let pinOut = pinOverlay.pinOut;
        for(var i = 0; i < pinOut.Pins.length; i++) {
            const selected = this.Value === pinOut.Pins[i].Value;
            if(pinOut.Pins[i].SupportedModes.split(` `). indexOf(this.PinType) === -1) {
                endOptions.push({
                    Name: pinOut.Pins[i].Name,
                    Value: pinOut.Pins[i].Value,
                    Selected: selected,
                    Class: selected? `incompatible` : undefined,
                    Disabled: true
                });
            } else {
                options.push({
                    Name: pinOut.Pins[i].Name,
                    Value: pinOut.Pins[i].Value,
                    Selected: selected
                });
            }
        }
        options = options.concat(endOptions);

        return options;
    }
}
customElements.define('ui-pinselection', UIPinSelection, { extends: `div` });