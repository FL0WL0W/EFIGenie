import UITemplate from "../JavascriptUI/UITemplate.js";
import UINumberWithMeasurement from "../UI/UINumberWithMeasurement.js";
export default class InjectorPulseWidth_DeadTime extends UITemplate {
    static displayName = `Dead Time`;
    static output = `float`;
    static measurementNameName = `Time`;
    static template =   `<div data-element="FlowRateConfigOrVariableSelection"></div>` +
                        `<div data-element="DeadTimeConfigOrVariableSelection"></div>` +
                        `<label>Min Injector Fuel Mass:</label><div data-element="MinInjectorFuelMass"></div>`;

    get value() { return { ...super.value, type: `InjectorPulseWidth_DeadTime` } }
    set value(value) { super.value = value }

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
}
InjectorPulseWidthConfigs.push(InjectorPulseWidth_DeadTime);
customElements.define(`injectorpulsewidth-deadtime`, InjectorPulseWidth_DeadTime, { extends: `span` });
