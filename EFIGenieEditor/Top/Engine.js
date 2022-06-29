import UITemplate from "../JavascriptUI/UITemplate.js"
export default class Engine extends UITemplate {
    static template = getFileContents(`ConfigGui/Engine.html`);

    constructor(prop) {
        super();
        this.CrankPositionConfigOrVariableSelection = new CalculationOrVariableSelection({
            calculations:        undefined,
            label:              `Crank Position`,
            measurementName:    `Reluctor`,
            output:             `ReluctorResult`,
        });
        this.CamPositionConfigOrVariableSelection = new CalculationOrVariableSelection({
            calculations:        undefined,
            label:              `Cam Position`,
            measurementName:    `Reluctor`,
            output:             `ReluctorResult`,
        });
        this.CylinderAirmassConfigOrVariableSelection = new CalculationOrVariableSelection({
            calculations:       CylinderAirmassConfigs,
            label:              `Cylinder Air Mass`,
            measurementName:    `Mass`,
            output:             `float`,
        });
        this.CylinderAirTemperatureConfigOrVariableSelection = new CalculationOrVariableSelection({
            calculations:       CylinderAirTemperatureConfigs,
            label:              `Cylinder Air Temperature`,
            measurementName:    `Temperature`,
            output:             `float`,
        });
        this.ManifoldAbsolutePressureConfigOrVariableSelection = new CalculationOrVariableSelection({
            calculations:       ManifoldAbsolutePressureConfigs,
            label:              `Manifold Absolute Pressure`,
            measurementName:    `Pressure`,
            output:             `float`,
        });
        this.VolumetricEfficiencyConfigOrVariableSelection = new CalculationOrVariableSelection({
            calculations:       VolumetricEfficiencyConfigs,
            label:              `Volumetric Efficiency`,
            measurementName:    `Percentage`,
            output:             `float`,
        });
        this.Setup(prop);
    }

    RegisterVariables() {
        this.CrankPositionConfigOrVariableSelection.RegisterVariables(`EngineParameters.Crank Position`);
        this.CamPositionConfigOrVariableSelection.RegisterVariables(`EngineParameters.Cam Position`);

        VariableRegister.RegisterVariable(`EngineParameters.Engine Speed(AngularSpeed)`, `float`);

        var requirements = [];

        if(!this.CylinderAirmassConfigOrVariableSelection.IsVariable()) {
            requirements = GetClassProperty(this.CylinderAirmassConfigOrVariableSelection.GetSubConfig(), `Requirements`);
        }

        this.ManifoldAbsolutePressureConfigOrVariableSelection.hidden = (requirements?.indexOf(`Manifold Absolute Pressure`) ?? -1) < 0;
        if(!this.ManifoldAbsolutePressureConfigOrVariableSelection.hidden) 
            this.ManifoldAbsolutePressureConfigOrVariableSelection.RegisterVariables(`EngineParameters.Manifold Absolute Pressure`);
        
        this.CylinderAirTemperatureConfigOrVariableSelection.hidden = (requirements?.indexOf(`Cylinder Air Temperature`) ?? -1) < 0;
        if(!this.CylinderAirTemperatureConfigOrVariableSelection.hidden) 
            this.CylinderAirTemperatureConfigOrVariableSelection.RegisterVariables(`EngineParameters.Cylinder Air Temperature`);
        
        this.VolumetricEfficiencyConfigOrVariableSelection.hidden = (requirements?.indexOf(`Volumetric Efficiency`) ?? -1) < 0;
        if(!this.VolumetricEfficiencyConfigOrVariableSelection.hidden) 
            this.VolumetricEfficiencyConfigOrVariableSelection.RegisterVariables(`EngineParameters.Volumetric Efficiency`);

        this.CylinderAirmassConfigOrVariableSelection.RegisterVariables(`EngineParameters.Cylinder Air Mass`);
    }

    get value() { return { ...super.value, type: `Engine`, CrankPriority: 1, requirements: GetClassProperty(this.CylinderAirmassConfigOrVariableSelection.GetSubConfig(), `Requirements`) } }
    set value(value) { super.value = value }
}
customElements.define(`top-engine`, Engine, { extends: `span` });