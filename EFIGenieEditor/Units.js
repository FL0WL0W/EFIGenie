var BlankUnits = [ { name: ``, DisplayMultiplier: 1, DisplayOffset: 0} ];
var PercentUnits = [ { name: `%`, DisplayMultiplier: 100, DisplayOffset: 0 }, { name: `[0.0-1.0]`, DisplayMultiplier: 1, DisplayOffset: 0} ];
var PercentageAccelerationUnits = PerSecond(PercentUnits);// [ { name: `(0.0-1.0)/s`, DisplayMultiplier: 1, DisplayOffset: 0}, { name: `%/s`, DisplayMultiplier: 100, DisplayOffset: 0 } ];
var TimeUnits = [ { name: `s`, DisplayMultiplier: 1, DisplayOffset: 0 }, { name: `ms`, DisplayMultiplier: 1000, DisplayOffset: 0 }, { name: `us`, DisplayMultiplier: 1000000, DisplayOffset: 0 }, { name: `ns`, DisplayMultiplier: 1000000000, DisplayOffset: 0 } ];
var FrequencyUnits = [ { name: `Hz`, DisplayMultiplier: 1, DisplayOffset: 0 }, { name: `KHz`, DisplayMultiplier: 0.001, DisplayOffset: 0 }, { name: `MHz`, DisplayMultiplier: 0.000001, DisplayOffset: 0 } ];
var AngleUnits = [ { name: `°`, DisplayMultiplier: 1, DisplayOffset: 0 } ];
var VoltageUnits = [ { name: `V`, DisplayMultiplier: 1, DisplayOffset: 0 }, { name: `mV`, DisplayMultiplier: 1000, DisplayOffset: 0 } ];
var PressureUnits = [ { name: `Bar`, DisplayMultiplier: 1, DisplayOffset: 0 }, { name: `kPa`, DisplayMultiplier: 100, DisplayOffset: 0 } ];
var AngularSpeedUnits = [ { name: `RPM`, DisplayMultiplier: 1, DisplayOffset: 0 } ];
var SpeedUnits = [ { name: `KPH`, DisplayMultiplier: 1, DisplayOffset: 0 }, { name: `MPH`, DisplayMultiplier: 1.61, DisplayOffset: 0 } ];
var TemperatureUnits = [ { name: `°C`, DisplayMultiplier: 1, DisplayOffset: 0 }, { name: `°F`, DisplayMultiplier: 1.8, DisplayOffset: 32 } ];
var GasConstantUnits = [ { name: `J/kg K`, DisplayMultiplier: 1, DisplayOffset: 0 }, { name: `kJ/kg K`, DisplayMultiplier: 0.1, DisplayOffset: 0 } ];
var MassUnits = [ { name: `g`, DisplayMultiplier: 1, DisplayOffset: 0 }, { name: `mg`, DisplayMultiplier: 1000, DisplayOffset: 0 }, { name: `kg`, DisplayMultiplier: 0.001, DisplayOffset: 0 } ];
var Ratio = [ { name: `:1`, DisplayMultiplier: 1, DisplayOffset: 0 } ];
var CycleUnits = [ { name: `Cycles`, DisplayMultiplier: 1, DisplayOffset: 0 } ];
var LambdaUnits = [ { name: `λ`, DisplayMultiplier: 1, DisplayOffset: 0 } ];
var VolumeUnits = [ { name: `L`, DisplayMultiplier: 1, DisplayOffset: 0 }, { name: `mL`, DisplayMultiplier: 1000, DisplayOffset: 0 } ];
var MassFlowUnits = [ { name: `g/s`, DisplayMultiplier: 1, DisplayOffset: 0 }, { name: `g/min`, DisplayMultiplier: 60, DisplayOffset: 0 } ];
var ResistanceUnits = [ { name: `Ω`, DisplayMultiplier: 1, DisplayOffset: 0 }, { name: `kΩ`, DisplayMultiplier: 0.001, DisplayOffset: 0 } ];
var Bool = [ { name: ``, DisplayMultiplier: 1, DisplayOffset: 0 } ];

var Measurements = {
    None: BlankUnits,
    Reluctor: [],
    Voltage: VoltageUnits,
    Temperature: TemperatureUnits,
    Pressure: PressureUnits,
    Mass: MassUnits,
    MassFlow: MassFlowUnits,
    Volume: VolumeUnits,
    Speed: SpeedUnits,
    Time: TimeUnits,
    Frequency: FrequencyUnits,
    Percentage: PercentUnits,
    PercentageAcceleration: PercentageAccelerationUnits,
    Lambda: LambdaUnits,
    Angle: AngleUnits,
    AngularSpeed: AngularSpeedUnits,
    Ratio: Ratio,
    Resistance: ResistanceUnits,
    Bool: Bool
}

var MeasurementType = {
    None: `float`,
    Reluctor: `ReluctorResult`,
    Voltage: `float`,
    Temperature: `float`,
    Pressure: `float`,
    Mass: `float`,
    MassFlow: `float`,
    Volume: `float`,
    Speed: `float`,
    Time: `float`,
    Frequency: `float`,
    Percentage: `float`,
    PercentageAcceleration: `float`,
    Lambda: `float`,
    Angle: `float`,
    AngularSpeed: `float`,
    Ratio: `float`,
    Resistance: `float`,
    Bool: `bool`
}

function GetMeasurementDisplay(measurement, index) {
    var measurementString;
    if(typeof measurement === `string`) {
        measurementString = measurement;
        measurement = Measurements[measurement];
    }

    if(!measurement)
        return ``;

    if(index !== undefined && index >= measurement.length)
        return ``;

    if(measurementString){
        if(index !== undefined && measurement[index].name !== ``)
            return measurementString + ` [` + measurement[index].name + `]`;
        else
            return measurementString;
    }

    return measurement[index].name;
}

function GetUnitDisplay(measurement, name) {
    return GetUnit(measurement, name).name;
}

function GetUnit(measurement, name) {
    if(typeof measurement === `string`) {
        measurement = Measurements[measurement];
    }

    if(!measurement)
        return ``;
    
    if(measurement.length < 1)
        return ``;

    let index = 0

    if(name) {
        for(let i=0; i<measurement.length; i++){
            if(measurement[i].name === name) {
                index = i;
                break;
            }
        }
    }
        
    return measurement[index];
}

function GetDefaultUnitIndex(measurement) {
    return 0;
}

function PerSecond(units)
{
    var newUnits = [];

    units.forEach(function(value, index){
        newUnits.push( { name: value.name + `/s`, DisplayMultiplier: value.DisplayMultiplier, DisplayOffset: value.DisplayOffset });
    });

    return newUnits;
}

function PerMinute(units)
{
    var newUnits = [];

    units.forEach(function(value, index){
        newUnits.push( { name: value.name + `/min`, DisplayMultiplier: value.DisplayMultiplier * 60, DisplayOffset: value.DisplayOffset * 60 });
    });

    return newUnits;
}