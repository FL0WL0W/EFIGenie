import UITemplate from "../JavascriptUI/UITemplate.js";
import UINumberWithMeasurement from "../UI/UINumberWithMeasurement.js";
export default class InjectorPulseWidth_DeadTime extends UITemplate {
    static displayName = `Dead Time`;
    static output = `float`;
    static measurementNameName = `Time`;
    static template =   `<div data-element="FlowRateConfigOrVariableSelection"></div>` +
                        `<div data-element="DeadTimeConfigOrVariableSelection"></div>` +
                        `<label>Min Injector Fuel Mass:</label><div data-element="MinInjectorFuelMass"></div>`;

    constructor(prop) {
        super();
        this.FlowRateConfigOrVariableSelection = new CalculationOrVariableSelection({
            calculations:            GenericConfigs,
            label:              `Injector Flow Rate`,
            measurementName:        `MassFlow`,
        });
        this.DeadTimeConfigOrVariableSelection = new CalculationOrVariableSelection({
            calculations:            GenericConfigs,
            label:              `Injector Dead Time`,
            measurementName:        `Time`,
            measurementUnitName:`ms`
        });
        this.MinInjectorFuelMass = new UINumberWithMeasurement({
            value:              0.005,
            step:               0.001,
            measurementName:        `Mass`,
            measurementUnitName:`g`
        });
        this.style.display = `block`;
        this.Setup(prop);
    }

    RegisterVariables() {
        this.DeadTimeConfigOrVariableSelection.RegisterVariables(`FuelParameters.Injector Dead Time`);
        this.FlowRateConfigOrVariableSelection.RegisterVariables(`FuelParameters.Injector Flow Rate`);
    }

    // GetObjOperation(result) {
    //     let obj = this.value
    //     obj.type = `InjectorPulseWidth_DeadTime`
    //     obj.result = result

    //     return obj
    // }

    GetObjOperation(result) {
        let group = { type: `Group`, value: [
            this.FlowRateConfigOrVariableSelection.GetObjOperation(),
            this.DeadTimeConfigOrVariableSelection.GetObjOperation(),
            
            //Store a value of 2 into the temporary variable which will be used for SquirtsPerCycle (2 squirts per cycle default)
            { type: `Calculation_StaticVariable`, value: 2, result: `temp` },//static value of 2
            
            //Subtract 1 to temporary variable if Engine is running sequentially. This will be used for SquirtsPerCycle (1 squirts per cycle when sequential)
            { 
                type: `Calculation_Subtract`,
                result: `temp`, //Return
                a: `temp`,
                b: `EngineSequentialId`
            },

            { 
                type: `Package`,
                value: [ 
                    { type: `UINT32`, value: EngineFactoryIDs.Offset + EngineFactoryIDs.InjectorDeadTime },
                    { type: `FLOAT`, value: this.MinInjectorFuelMass.value }
                ],
                outputVariables: [ result ], //Return
                inputVariables: [ 
                    `temp`,
                    `FuelParameters.Cylinder Fuel Mass`,
                    `FuelParameters.Injector Flow Rate`,
                    `FuelParameters.Injector Dead Time`
                ]
            }
        ]};

        return group;
    }
}
InjectorPulseWidthConfigs.push(InjectorPulseWidth_DeadTime);
customElements.define(`injectorpulsewidth-deadtime`, InjectorPulseWidth_DeadTime, { extends: `span` });
