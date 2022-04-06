import UITemplate from "../JavascriptUI/UITemplate.js"
import Output_TDC from "../Output/Output_TDC.js"
export default class Fuel extends UITemplate {
    static template =   getFileContents(`ConfigGui/Fuel.html`);

    constructor(prop) {
        super();
        this.AFRConfigOrVariableSelection = new CalculationOrVariableSelection({
            calculations:            AFRConfigs,
            label:              `Air Fuel Ratio`,
            measurementName:        `Ratio`,
            referenceName:      `FuelParameters.Air Fuel Ratio`
        });
        this.InjectorEnableConfigOrVariableSelection = new CalculationOrVariableSelection({
            calculations:            InjectorEnableConfigs,
            label:              `Injector Enable`,
            measurementName:        `Bool`,
            referenceName:      `FuelParameters.Injector Enable`
        });
        this.InjectorPulseWidthConfigOrVariableSelection = new CalculationOrVariableSelection({
            calculations:            InjectorPulseWidthConfigs,
            label:              `Injector Pulse Width`,
            measurementName:        `Time`,
            referenceName:      `FuelParameters.Injector Pulse Width`,
            measurementUnitName:`ms`
        });
        this.InjectorEndPositionConfigOrVariableSelection = new CalculationOrVariableSelection({
            calculations:            GenericConfigs,
            label:              `Injector End Position(BTDC)`,
            measurementName:        `Angle`,
            referenceName:      `FuelParameters.Injector End Position`
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
                            label:          `Injector ${i+1}`,
                            measurementName:    `No Measurement`
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
                            calculations:        BooleanOutputConfigs,
                            label:          `Injector ${i+1}`,
                            measurementName:    `No Measurement`
                        }));
                    }
                    this.children[i].value = value[i];
                }
            }
        });
        this.Outputs.value = new Array(8);
        this.Setup(prop);
    }

    get saveValue() {
        return super.saveValue;
    }

    set saveValue(saveValue) {
        if(saveValue?.ConfigInjectorOutputs)
            saveValue.Outputs = saveValue.ConfigInjectorOutputs.Outputs;

        super.saveValue = saveValue;
    }

    RegisterVariables() {
        this.AFRConfigOrVariableSelection.RegisterVariables();
        VariableRegister.RegisterVariable(`FuelParameters.Cylinder Fuel Mass(Mass)`, `float`);
        this.InjectorEnableConfigOrVariableSelection.RegisterVariables();
        this.InjectorPulseWidthConfigOrVariableSelection.RegisterVariables();
        this.InjectorEndPositionConfigOrVariableSelection.RegisterVariables();
        for(var i = 0; i < this.Outputs.length; i++){
            this.Outputs[i].RegisterVariables();
        };
    }

    GetObjOperation() {
        var group = { 
            types : [{ type: `Operation_EngineScheduleInjection`, toObj() {
                return { value: [ {
                    type: `Package`,
                    value: [ 
                        { type: `UINT32`, value: EngineFactoryIDs.Offset + EngineFactoryIDs.ScheduleInjection }, //factory id
                        { type: `FLOAT`, value: this.value.TDC.value }, //tdc
                        this.value.GetObjOperation(),
                    ],
                    outputVariables: [ 
                        `temp`, //store in temp variable
                        `temp` //store in temp variable
                    ],
                    inputVariables: [
                        `EnginePositionId`,
                        `FuelParameters.Injector Enable`,
                        `FuelParameters.Injector Pulse Width`,
                        `FuelParameters.Injector End Position(BTDC)`
                    ]
                }]};
            }}],
            type: `Group`, 
            value: [
                this.AFRConfigOrVariableSelection.GetObjOperation(), 

                { 
                    type: `Operation_Divide`,
                    result: `FuelParameters.Cylinder Fuel Mass`,
                    a: `EngineParameters.Cylinder Air Mass`,
                    b: `FuelParameters.Air Fuel Ratio`
                },

                this.InjectorEnableConfigOrVariableSelection.GetObjOperation(), 
                this.InjectorPulseWidthConfigOrVariableSelection.GetObjOperation(), 
                this.InjectorEndPositionConfigOrVariableSelection.GetObjOperation()
            ]
        };

        for(var i = 0; i < this.Outputs.length; i++) {
            group.value.push({ type: `Operation_EngineScheduleInjection`, value: this.Outputs[i] });
        }

        return group;
    }
}
customElements.define(`top-fuel`, Fuel, { extends: `span` });
