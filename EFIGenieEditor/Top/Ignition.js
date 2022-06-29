import UITemplate from "../JavascriptUI/UITemplate.js"
import Output_TDC from "../Output/Output_TDC.js"
export default class Ignition extends UITemplate {
    static template = getFileContents(`ConfigGui/Ignition.html`);

    get value() { return { ...super.value, type: `Ignition` } }
    set value(value) { super.value = value }

    constructor(prop) {
        super();
        this.IgnitionEnableConfigOrVariableSelection = new CalculationOrVariableSelection({
            calculations:            IgnitionEnableConfigs,
            label:              `Ignition Enable`,
            measurementName:        `Bool`,
        });
        this.IgnitionAdvanceConfigOrVariableSelection = new CalculationOrVariableSelection({
            calculations:            IgnitionAdvanceConfigs,
            label:              `Ignition Advance`,
            measurementName:        `Angle`,
        });
        this.IgnitionDwellConfigOrVariableSelection = new CalculationOrVariableSelection({
            calculations:            IgnitionDwellConfigs,
            label:              `Ignition Dwell`,
            measurementName:        `Time`,
            measurementUnitName:`ms`
        });
        this.IgnitionDwellDeviationConfigOrVariableSelection = new CalculationOrVariableSelection({
            calculations:            IgnitionDwellConfigs,
            label:              `Ignition Dwell Deviation`,
            measurementName:        `Time`,
            measurementUnitName:`ms`
        });
        this.Outputs = document.createElement(`div`)
        Object.defineProperty(this.Outputs, 'saveValue', {
            get: function() { return [...this.children].map(e => e.saveValue); },
            set: function(saveValue) { 
                while(this.children.length > saveValue.length) this.removeChild(this.lastChild);
                for(let i = 0; i < saveValue.length; i++){
                    if(!this.children[i]) {
                        this.append(new Output_TDC({
                            calculations:        BooleanOutputConfigs,
                            label:          `Injector ${i+1}`
                        }));
                    }
                    this.children[i].saveValue = saveValue[i];
                }
            }
        });
        Object.defineProperty(this.Outputs, 'value', {
            get: function() { return [...this.children].map(e => e.value); },
            set: function(value) { 
                while(this.children.length > value.length) this.removeChild(this.lastChild);
                for(let i = 0; i < value.length; i++){
                    if(!this.children[i]) {
                        this.append(new Output_TDC({
                            calculations:            BooleanOutputConfigs,
                            label:              `Ignition ${i+1}`
                        }));
                    }
                    this.children[i].value = value[i];
                }
            }
        });
        this.Outputs.value = new Array(8);
        this.Setup(prop);
    }

    RegisterVariables() {
        this.IgnitionEnableConfigOrVariableSelection.RegisterVariables(`IgnitionParameters.Ignition Enable`);
        this.IgnitionAdvanceConfigOrVariableSelection.RegisterVariables(`IgnitionParameters.Ignition Advance`);
        this.IgnitionDwellConfigOrVariableSelection.RegisterVariables(`IgnitionParameters.Ignition Dwell`);
        this.IgnitionDwellDeviationConfigOrVariableSelection.RegisterVariables(`IgnitionParameters.Ignition Dwell Deviation`);

        for(var i = 0; i < this.Outputs.length; i++){
            this.Outputs[i].RegisterVariables();
        };
    }
}
customElements.define(`top-ignition`, Ignition, { extends: `span` });