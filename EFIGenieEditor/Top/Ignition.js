import UITemplate from "../JavascriptUI/UITemplate.js"
import Output_TDC from "../Output/Output_TDC.js"
export default class Ignition extends UITemplate {
    static template = getFileContents(`ConfigGui/Ignition.html`);

    constructor(prop) {
        super();
        this.IgnitionEnableConfigOrVariableSelection = new CalculationOrVariableSelection({
            calculations:            IgnitionEnableConfigs,
            label:              `Ignition Enable`,
            measurementName:        `Bool`,
            referenceName:      `IgnitionParameters.Ignition Enable`
        });
        this.IgnitionAdvanceConfigOrVariableSelection = new CalculationOrVariableSelection({
            calculations:            IgnitionAdvanceConfigs,
            label:              `Ignition Advance`,
            measurementName:        `Angle`,
            referenceName:      `IgnitionParameters.Ignition Advance`
        });
        this.IgnitionDwellConfigOrVariableSelection = new CalculationOrVariableSelection({
            calculations:            IgnitionDwellConfigs,
            label:              `Ignition Dwell`,
            measurementName:        `Time`,
            referenceName:      `IgnitionParameters.Ignition Dwell`,
            measurementUnitName:`ms`
        });
        this.IgnitionDwellDeviationConfigOrVariableSelection = new CalculationOrVariableSelection({
            calculations:            IgnitionDwellConfigs,
            label:              `Ignition Dwell Deviation`,
            measurementName:        `Time`,
            referenceName:      `IgnitionParameters.Ignition Dwell Deviation`,
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
        this.IgnitionEnableConfigOrVariableSelection.RegisterVariables();
        this.IgnitionAdvanceConfigOrVariableSelection.RegisterVariables();
        this.IgnitionDwellConfigOrVariableSelection.RegisterVariables();
        this.IgnitionDwellDeviationConfigOrVariableSelection.RegisterVariables();

        for(var i = 0; i < this.Outputs.length; i++){
            this.Outputs[i].RegisterVariables();
        };
    }

    GetObjOperation() {
        var group  = { 
            types : [{ type: `Operation_EngineScheduleIgnition`, toObj() {
                return { value: [ {
                    type: `Package`,
                    value: [ 
                        { type: `UINT32`, value: EngineFactoryIDs.Offset + EngineFactoryIDs.ScheduleIgnition }, //factory id
                        { type: `FLOAT`, value: this.value.TDC.value }, //tdc
                        this.value.GetObjOperation(),
                    ],
                    outputVariables: [ 
                        `temp`, //store in temp variable
                        `temp` //store in temp variable
                    ],
                    inputVariables: [
                        `EnginePositionId`,
                        `IgnitionParameters.Ignition Enable`,
                        `IgnitionParameters.Ignition Dwell`,
                        `IgnitionParameters.Ignition Advance`,
                        `IgnitionParameters.Ignition Dwell Deviation`
                    ]
                }]};
            }}],
            type: `Group`, 
            value: [
                this.IgnitionEnableConfigOrVariableSelection.GetObjOperation(), 
                this.IgnitionAdvanceConfigOrVariableSelection.GetObjOperation(), 
                this.IgnitionDwellConfigOrVariableSelection.GetObjOperation(), 
                this.IgnitionDwellDeviationConfigOrVariableSelection.GetObjOperation(), 
            ]
        };

        for(var i = 0; i < this.Outputs.children.length; i++) {
            group.value.push({ type: `Operation_EngineScheduleIgnition`, value: this.Outputs.children[i] });
        }

        return group;
    }
}
customElements.define(`top-ignition`, Ignition, { extends: `span` });