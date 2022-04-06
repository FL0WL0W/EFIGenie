import UITemplate from "../JavascriptUI/UITemplate.js";
import UINumberWithMeasurement from "../UI/UINumberWithMeasurement.js";
export default class CylinderAirmass_SpeedDensity extends UITemplate {
    static displayName = `Speed Density`;
    static measurementNameName = `Mass`;
    static output = `float`;
    static Requirements = [`Cylinder Air Temperature`, `Manifold Absolute Pressure`, `Volumetric Efficiency`];
    static template = `<label>Cylinder Volume:</label><div data-element="CylinderVolume"></div>`;

    constructor(prop) {
        super();
        this.CylinderVolume = new UINumberWithMeasurement({
            value:              0.66594,
            step:               0.001,
            min:                0.001,
            measurementName:        `Volume`,
            measurementUnitName:`mL`
        });
        this.style.display = `block`;
        this.Setup(prop);
    }

    GetObjOperation(outputVariableId) {
        return { value: [{ 
            type: `Package`,
            value: [ 
                { type: `UINT32`, value: EngineFactoryIDs.Offset + EngineFactoryIDs.CylinderAirMass_SD },  //factory id
                { type: `FLOAT`, value: this.CylinderVolume.value }, //Cylinder Volume
            ],
            outputVariables: [ outputVariableId ?? 0 ], //Return
            inputVariables: [ 
                `EngineParameters.Cylinder Air Temperature`,
                `EngineParameters.Manifold Absolute Pressure`,
                `EngineParameters.Volumetric Efficiency`
            ]
        }]};
    }
}
CylinderAirmassConfigs.push(CylinderAirmass_SpeedDensity);
customElements.define(`cylinderairmass-speeddensity`, CylinderAirmass_SpeedDensity, { extends: `span` });