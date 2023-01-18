import UITemplate from "../JavascriptUI/UITemplate.js"
export default class Engine extends UITemplate {
    static template = getFileContents(`ConfigGui/Engine.html`)

    CrankPosition = new CalculationOrVariableSelection({
        calculations:   undefined,
        label:          `Crank Position`,
        outputTypes:    [ `ReluctorResult` ],
    })
    CamPosition = new CalculationOrVariableSelection({
        calculations:   undefined,
        label:          `Cam Position`,
        outputTypes:    [ `ReluctorResult` ],
    })
    CylinderAirmass = new CalculationOrVariableSelection({
        calculations:   CylinderAirmassConfigs,
        label:          `Cylinder Air Mass`,
        selectName:     `No Calculation`,
        outputUnits:    [ `g` ],
        value:          { selection: `CylinderAirmass_SpeedDensity` }
    })
    CylinderAirTemperature = new CalculationOrVariableSelection({
        calculations:   CylinderAirTemperatureConfigs,
        label:          `Cylinder Air Temperature`,
        outputUnits:    [ `°C` ],
    })
    ManifoldAbsolutePressure = new CalculationOrVariableSelection({
        calculations:   ManifoldAbsolutePressureConfigs,
        label:          `Manifold Absolute Pressure`,
        outputUnits:    [ `Bar` ],
    })
    ThrottlePosition = new CalculationOrVariableSelection({
        calculations:   ThrottlePositionConfigs,
        label:          `Throttle Position`,
        outputUnits:    [ `%` ],
    })
    VolumetricEfficiency = new CalculationOrVariableSelection({
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

        this.CrankPosition.RegisterVariables({ name: `EngineParameters.Crank Position` })
        this.CamPosition.RegisterVariables({ name: `EngineParameters.Cam Position` })
        this.CylinderAirmass.RegisterVariables({ name: `EngineParameters.Cylinder Air Mass` })

        var requirements = GetClassProperty(this.CylinderAirmass.SubConfig, `Requirements`)

        this.ManifoldAbsolutePressure.hidden = (requirements?.indexOf(`Manifold Absolute Pressure`) ?? -1) === -1
        if(!this.ManifoldAbsolutePressure.hidden) 
            this.ManifoldAbsolutePressure.RegisterVariables({ name: `EngineParameters.Manifold Absolute Pressure` })

        this.ThrottlePosition.hidden = (requirements?.indexOf(`Throttle Position`) ?? -1) === -1
        if(!this.ThrottlePosition.hidden) 
            this.ThrottlePosition.RegisterVariables({ name: `EngineParameters.Throttle Position` })
        
        this.CylinderAirTemperature.hidden = (requirements?.indexOf(`Cylinder Air Temperature`) ?? -1) === -1
        if(!this.CylinderAirTemperature.hidden) 
            this.CylinderAirTemperature.RegisterVariables({ name: `EngineParameters.Cylinder Air Temperature` })
        
        this.VolumetricEfficiency.hidden = (requirements?.indexOf(`Volumetric Efficiency`) ?? -1) === -1
        if(!this.VolumetricEfficiency.hidden) 
            this.VolumetricEfficiency.RegisterVariables({ name: `EngineParameters.Volumetric Efficiency` })
    }

    get value() { return { ...super.value, CrankPriority: 1, requirements: GetClassProperty(this.CylinderAirmass.SubConfig, `Requirements`) } }
    set value(value) { super.value = value }
}
customElements.define(`top-engine`, Engine, { extends: `span` })