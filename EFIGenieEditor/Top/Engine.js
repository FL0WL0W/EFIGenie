import UITemplate from "../JavascriptUI/UITemplate.js"
export default class Engine extends UITemplate {
    static template = getFileContents(`ConfigGui/Engine.html`)

    CrankPositionConfigOrVariableSelection = new CalculationOrVariableSelection({
        calculations:   undefined,
        label:          `Crank Position`,
        outputTypes:    [ `ReluctorResult` ],
    })
    CamPositionConfigOrVariableSelection = new CalculationOrVariableSelection({
        calculations:   undefined,
        label:          `Cam Position`,
        outputTypes:    [ `ReluctorResult` ],
    })
    CylinderAirmassConfigOrVariableSelection = new CalculationOrVariableSelection({
        calculations:   CylinderAirmassConfigs,
        label:          `Cylinder Air Mass`,
        selectName:     `No Calculation`,
        outputUnits:    [ `g` ],
        value:          { selection: `CylinderAirmass_SpeedDensity` }
    })
    CylinderAirTemperatureConfigOrVariableSelection = new CalculationOrVariableSelection({
        calculations:   CylinderAirTemperatureConfigs,
        label:          `Cylinder Air Temperature`,
        outputUnits:    [ `°C` ],
    })
    ManifoldAbsolutePressureConfigOrVariableSelection = new CalculationOrVariableSelection({
        calculations:   ManifoldAbsolutePressureConfigs,
        label:          `Manifold Absolute Pressure`,
        outputUnits:    [ `Bar` ],
    })
    ThrottlePositionConfigOrVariableSelection = new CalculationOrVariableSelection({
        calculations:   ThrottlePositionConfigs,
        label:          `Throttle Position`,
        outputUnits:    [ `%` ],
    })
    VolumetricEfficiencyConfigOrVariableSelection = new CalculationOrVariableSelection({
        calculations:   VolumetricEfficiencyConfigs,
        label:          `Volumetric Efficiency`,
        outputUnits:    [ `[0.0-1.0]` ],
        displayUnits:   [ `%` ]
    })
    constructor(prop) {
        super()
        this.Setup(prop)
    }

    RegisterVariables() {
        VariableRegister.RegisterVariable({ name: `EngineParameters.Engine Speed`, unit: `RPM` })

        this.CrankPositionConfigOrVariableSelection.RegisterVariables({ name: `EngineParameters.Crank Position` })
        this.CamPositionConfigOrVariableSelection.RegisterVariables({ name: `EngineParameters.Cam Position` })
        this.CylinderAirmassConfigOrVariableSelection.RegisterVariables({ name: `EngineParameters.Cylinder Air Mass` })

        var requirements = GetClassProperty(this.CylinderAirmassConfigOrVariableSelection.SubConfig, `Requirements`)

        this.ManifoldAbsolutePressureConfigOrVariableSelection.hidden = (requirements?.indexOf(`Manifold Absolute Pressure`) ?? -1) === -1
        if(!this.ManifoldAbsolutePressureConfigOrVariableSelection.hidden) 
            this.ManifoldAbsolutePressureConfigOrVariableSelection.RegisterVariables({ name: `EngineParameters.Manifold Absolute Pressure` })

        this.ThrottlePositionConfigOrVariableSelection.hidden = (requirements?.indexOf(`Throttle Position`) ?? -1) === -1
        if(!this.ThrottlePositionConfigOrVariableSelection.hidden) 
            this.ThrottlePositionConfigOrVariableSelection.RegisterVariables({ name: `EngineParameters.Throttle Position` })
        
        this.CylinderAirTemperatureConfigOrVariableSelection.hidden = (requirements?.indexOf(`Cylinder Air Temperature`) ?? -1) === -1
        if(!this.CylinderAirTemperatureConfigOrVariableSelection.hidden) 
            this.CylinderAirTemperatureConfigOrVariableSelection.RegisterVariables({ name: `EngineParameters.Cylinder Air Temperature` })
        
        this.VolumetricEfficiencyConfigOrVariableSelection.hidden = (requirements?.indexOf(`Volumetric Efficiency`) ?? -1) === -1
        if(!this.VolumetricEfficiencyConfigOrVariableSelection.hidden) 
            this.VolumetricEfficiencyConfigOrVariableSelection.RegisterVariables({ name: `EngineParameters.Volumetric Efficiency` })
    }

    get value() { return { ...super.value, CrankPriority: 1, requirements: GetClassProperty(this.CylinderAirmassConfigOrVariableSelection.SubConfig, `Requirements`) } }
    set value(value) { super.value = value }
}
customElements.define(`top-engine`, Engine, { extends: `span` })