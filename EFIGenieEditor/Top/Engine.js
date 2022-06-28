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

    CrankPriority = 1;//static set this for now

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

    GetObjOperation() {
        var mapRequired = false;
        var catRequired = false;
        var veRequired  = false;
        if(!this.CylinderAirmassConfigOrVariableSelection.IsVariable()) {
            var requirements = GetClassProperty(this.CylinderAirmassConfigOrVariableSelection.GetSubConfig(), `Requirements`);
            mapRequired = (requirements?.indexOf(`Manifold Absolute Pressure`) ?? -1) > -1;
            catRequired = (requirements?.indexOf(`Cylinder Air Temperature`) ?? -1) > -1
            veRequired  = (requirements?.indexOf(`Volumetric Efficiency`) ?? -1) > -1;
        }

        var group = { type: `Group`, value: [
            this.CrankPositionConfigOrVariableSelection.GetObjOperation(`EngineParameters.Crank Position`),
            this.CamPositionConfigOrVariableSelection.GetObjOperation(`EngineParameters.Cam Position`),

            //CalculateEnginePosition
            { 
                type: `Package`,
                value: [ 
                    { type: `UINT32`, value: EngineFactoryIDs.Offset + EngineFactoryIDs.Position + ( this.CrankPriority? 0 : 1) },  //factory id
                ],
                outputVariables: [ `EnginePositionId` ],
                inputVariables: [
                    `EngineParameters.Crank Position`,
                    `EngineParameters.Cam Position`
                ]
            },

            //EngineParameters
            { 
                type: `Package`,
                value: [ 
                    { type: `UINT32`, value: EngineFactoryIDs.Offset + EngineFactoryIDs.EngineParameters },  //factory id
                ],
                outputVariables: [ 
                    `EngineParameters.Engine Speed`,
                    `EngineSequentialId`,
                    `EngineSyncedId`
                ],
                inputVariables: [ `EnginePositionId`  ]
            }
        ]};
        
        if(mapRequired) {
            group.value.push(this.ManifoldAbsolutePressureConfigOrVariableSelection.GetObjOperation(`EngineParameters.Manifold Absolute Pressure`));
        }

        if(catRequired) {
            group.value.push(this.CylinderAirTemperatureConfigOrVariableSelection.GetObjOperation(`EngineParameters.Cylinder Air Temperature`));
        }
        
        if(veRequired) {
            group.value.push(this.VolumetricEfficiencyConfigOrVariableSelection.GetObjOperation(`EngineParameters.Volumetric Efficiency`));
        }
        
        group.value.push(this.CylinderAirmassConfigOrVariableSelection.GetObjOperation(`EngineParameters.Cylinder Air Mass`));

        return group;
    }
}
customElements.define(`top-engine`, Engine, { extends: `span` });