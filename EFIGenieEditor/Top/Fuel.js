import Calculation_Formula from "../Calculation/Calculation_Formula.js";
import UITemplate from "../JavascriptUI/UITemplate.js"
import Output_TDC from "../Output/Output_TDC.js"
export default class Fuel extends UITemplate {
    static template =   getFileContents(`ConfigGui/Fuel.html`);

    constructor(prop) {
        super();
        this.AFRConfigOrVariableSelection = new Calculation_Formula({
            calculations:       AFRConfigs,
            label:              `Air Fuel Ratio`,
            measurementName:    `Ratio`,
        });
        this.InjectorEnableConfigOrVariableSelection = new CalculationOrVariableSelection({
            calculations:       InjectorEnableConfigs,
            label:              `Injector Enable`,
            measurementName:    `Bool`,
        });
        this.InjectorPulseWidthConfigOrVariableSelection = new CalculationOrVariableSelection({
            calculations:       InjectorPulseWidthConfigs,
            label:              `Injector Pulse Width`,
            measurementName:    `Time`,
            measurementUnitName:`ms`
        });
        this.InjectorEndPositionConfigOrVariableSelection = new CalculationOrVariableSelection({
            calculations:       GenericConfigs,
            label:              `Injector End Position`,
            measurementName:    `Angle`,
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
                            calculations:        BooleanOutputConfigs,
                            label:          `Injector ${i+1}`
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
        this.AFRConfigOrVariableSelection.RegisterVariables(`FuelParameters.Air Fuel Ratio`);
        VariableRegister.RegisterVariable(`FuelParameters.Cylinder Fuel Mass(Mass)`, `float`);
        this.InjectorEnableConfigOrVariableSelection.RegisterVariables(`FuelParameters.Injector Enable`);
        this.InjectorPulseWidthConfigOrVariableSelection.RegisterVariables(`FuelParameters.Injector Pulse Width`);
        this.InjectorEndPositionConfigOrVariableSelection.RegisterVariables(`FuelParameters.Injector End Position`);
        for(var i = 0; i < this.Outputs.length; i++){
            this.Outputs[i].RegisterVariables();
        };
    }

    GetObjOperation() {
        var group = { 
            types : [{ type: `Calculation_EngineScheduleInjection`, toDefinition() {
                return { type: `definition`, value: [ {
                    type: `Package`,
                    value: [ 
                        { type: `UINT32`, value: EngineFactoryIDs.Offset + EngineFactoryIDs.ScheduleInjection }, //factory id
                        { type: `FLOAT`, value: this.value.TDC }, //tdc
                        this.value,
                    ],
                    outputVariables: [ 
                        `temp`, //store in temp variable
                        `temp` //store in temp variable
                    ],
                    inputVariables: [
                        `EnginePositionId`,
                        `FuelParameters.Injector Enable`,
                        `FuelParameters.Injector Pulse Width`,
                        `FuelParameters.Injector End Position`
                    ]
                }]};
            }}],
            type: `Group`, 
            value: [
                this.AFRConfigOrVariableSelection.GetObjOperation(`FuelParameters.Air Fuel Ratio`), 

                { 
                    type: `Calculation_Divide`,
                    result: `FuelParameters.Cylinder Fuel Mass`,
                    a: `EngineParameters.Cylinder Air Mass`,
                    b: `FuelParameters.Air Fuel Ratio`
                },

                this.InjectorEnableConfigOrVariableSelection.GetObjOperation(`FuelParameters.Injector Enable`), 
                this.InjectorPulseWidthConfigOrVariableSelection.GetObjOperation(`FuelParameters.Injector Pulse Width`), 
                this.InjectorEndPositionConfigOrVariableSelection.GetObjOperation(`FuelParameters.Injector End Position`)
            ]
        };

        for(var i = 0; i < this.Outputs.children.length; i++) {
            group.value.push({ type: `Calculation_EngineScheduleInjection`, value: this.Outputs.value[i] });
        }

        return group;
    }
}
customElements.define(`top-fuel`, Fuel, { extends: `span` });
