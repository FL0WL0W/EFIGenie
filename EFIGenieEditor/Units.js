var BlankUnits = [ { name: ``, SIMultiplier: 1, SIOffset: 0} ]
var PercentUnits = [ { name: `%`, SIMultiplier: 100, SIOffset: 0 }, { name: `[0.0-1.0]`, SIMultiplier: 1, SIOffset: 0} ]
var PercentageAccelerationUnits = PerSecond(PercentUnits)// [ { name: `(0.0-1.0)/s`, SIMultiplier: 1, SIOffset: 0}, { name: `%/s`, SIMultiplier: 100, SIOffset: 0 } ]
var TimeUnits = [ { name: `s`, SIMultiplier: 1, SIOffset: 0 }, { name: `ms`, SIMultiplier: 1000, SIOffset: 0 }, { name: `us`, SIMultiplier: 1000000, SIOffset: 0 }, { name: `ns`, SIMultiplier: 1000000000, SIOffset: 0 } ]
var FrequencyUnits = [ { name: `Hz`, SIMultiplier: 1, SIOffset: 0 }, { name: `KHz`, SIMultiplier: 0.001, SIOffset: 0 }, { name: `MHz`, SIMultiplier: 0.000001, SIOffset: 0 } ]
var AngleUnits = [ { name: `°`, SIMultiplier: 1, SIOffset: 0 } ]
var VoltageUnits = [ { name: `V`, SIMultiplier: 1, SIOffset: 0 }, { name: `mV`, SIMultiplier: 1000, SIOffset: 0 } ]
var PressureUnits = [ { name: `Bar`, SIMultiplier: 1, SIOffset: 0 }, { name: `kPa`, SIMultiplier: 100, SIOffset: 0 } ]
var AngularSpeedUnits = [ { name: `RPM`, SIMultiplier: 1, SIOffset: 0 } ]
var SpeedUnits = [ { name: `KPH`, SIMultiplier: 1, SIOffset: 0 }, { name: `MPH`, SIMultiplier: 1.61, SIOffset: 0 } ]
var TemperatureUnits = [ { name: `°C`, SIMultiplier: 1, SIOffset: 0 }, { name: `°F`, SIMultiplier: 1.8, SIOffset: 32 } ]
var GasConstantUnits = [ { name: `J/kg K`, SIMultiplier: 1, SIOffset: 0 }, { name: `kJ/kg K`, SIMultiplier: 0.1, SIOffset: 0 } ]
var MassUnits = [ { name: `g`, SIMultiplier: 1, SIOffset: 0 }, { name: `mg`, SIMultiplier: 1000, SIOffset: 0 }, { name: `kg`, SIMultiplier: 0.001, SIOffset: 0 } ]
var Ratio = [ { name: `:1`, SIMultiplier: 1, SIOffset: 0 } ]
var CycleUnits = [ { name: `Cycles`, SIMultiplier: 1, SIOffset: 0 } ]
var LambdaUnits = [ { name: `λ`, SIMultiplier: 1, SIOffset: 0 } ]
var VolumeUnits = [ { name: `L`, SIMultiplier: 1, SIOffset: 0 }, { name: `mL`, SIMultiplier: 1000, SIOffset: 0 } ]
var MassFlowUnits = [ { name: `g/s`, SIMultiplier: 1, SIOffset: 0 }, { name: `g/min`, SIMultiplier: 60, SIOffset: 0 } ]
var ResistanceUnits = [ { name: `Ω`, SIMultiplier: 1, SIOffset: 0 }, { name: `kΩ`, SIMultiplier: 0.001, SIOffset: 0 } ]

var Measurements = {
    'No Unit': BlankUnits,
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
}

function ConvertValueFromUnitToUnit(value, fromUnit, toUnit) {
    let fromMeasurement = GetMeasurementNameFromUnitName(fromUnit)
    fromUnit = GetUnitFromName(fromUnit)
    let toMeasurement = GetMeasurementNameFromUnitName(toUnit)
    toUnit = GetUnitFromName(toUnit)
    if(value == undefined || fromUnit == undefined || toUnit == undefined || fromMeasurement !== toMeasurement || fromUnit === toUnit)
        return value
    if(Array.isArray(value))
        return value.map(x => x == undefined? x : (x - fromUnit.SIOffset) / fromUnit.SIMultiplier * toUnit.SIMultiplier + toUnit.SIOffset)
    return (value - fromUnit.SIOffset) / fromUnit.SIMultiplier * toUnit.SIMultiplier + toUnit.SIOffset
}

function GetUnitFromName(unitName) { return unitName == undefined? undefined :
                                            Measurements[GetMeasurementNameFromUnitName(unitName)]?.find(u => u.name === unitName) ?? 
                                            Measurements[GetMeasurementNameFromUnitName(unitName)]?.find(u => u.name === `°${unitName}`) ?? 
                                            BlankUnits[0] }

function GetMeasurementNameFromUnitName(unit){
    if(Array.isArray(unit))
        return unit.map(x => GetMeasurementNameFromUnitName(x))
    for(let measurementName in Measurements) {
        for(let measurementIndex in Measurements[measurementName]) {
            if(unit === Measurements[measurementName][measurementIndex].name)
                return measurementName
        }
    }
    for(let measurementName in Measurements) {
        for(let measurementIndex in Measurements[measurementName]) {
            if(`°${unit}` === Measurements[measurementName][measurementIndex].name)
                return measurementName
        }
    }
    return `None`
}

function GetDefaultUnitFromMeasurement(measurement) {
    if(Array.isArray(measurement)) measurement = measurement[0]
    return Measurements[measurement]?.[0]?.name
}

function GetDefaultMinMaxStepRedlineFromUnit(unit) {
    switch(unit){
        case `%`:           return { min: 0,      max: 100,       step: 10,       lowRedline: undefined,    highRedline: undefined }
        case `[0.0-1.0]`:   return { min: 0,      max: 1,         step: 0.1,      lowRedline: undefined,    highRedline: undefined }
        case `RPM`:         return { min: 0,      max: 8000,      step: 1000,     lowRedline: undefined,    highRedline: 6500      }
        case `Bar`:         return { min: 0.2,    max: 3,         step: 0.2,      lowRedline: 0.25,         highRedline: undefined }
        case `kPa`:         return { min: 20,     max: 300,       step: 20,       lowRedline: 25,           highRedline: undefined }
        case `V`:           return { min: 0,      max: 5,         step: 1,        lowRedline: undefined,    highRedline: undefined }
        case `mV`:          return { min: 0,      max: 5000,      step: 1000,     lowRedline: undefined,    highRedline: undefined }
    }
}

function GetUnit(measurement, name) {
    if(typeof measurement === `string`) {
        measurement = Measurements[measurement]
    }

    if(!measurement)
        return ``
    
    if(measurement.length < 1)
        return ``

    let index = 0

    if(name) {
        for(let i=0; i<measurement.length; i++){
            if(measurement[i].name === name) {
                index = i
                break
            }
        }
    }
        
    return measurement[index]
}

function PerSecond(units)
{
    return units.map(value => { return { name: value.name + `/s`, SIMultiplier: value.SIMultiplier, SIOffset: value.SIOffset } } )
}

function PerMinute(units)
{
    return units.map(value => { return { name: value.name + `/min`, SIMultiplier: value.SIMultiplier * 60, SIOffset: value.SIOffset * 60 } } )
}