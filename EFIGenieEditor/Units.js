var BlankUnits = [ { Name: "", DisplayMultiplier: 1, DisplayOffset: 0} ];
var PercentUnits = [ { Name: "0.0-1.0", DisplayMultiplier: 1, DisplayOffset: 0}, { Name: "%", DisplayMultiplier: 100, DisplayOffset: 0 } ];
var PercentageAccelerationUnits = PerSecond(PercentUnits);// [ { Name: "(0.0-1.0)/s", DisplayMultiplier: 1, DisplayOffset: 0}, { Name: "%/s", DisplayMultiplier: 100, DisplayOffset: 0 } ];
var TimeUnits = [ { Name: "s", DisplayMultiplier: 1, DisplayOffset: 0 }, { Name: "ms", DisplayMultiplier: 1000, DisplayOffset: 0 }, { Name: "us", DisplayMultiplier: 1000000, DisplayOffset: 0 }, { Name: "ns", DisplayMultiplier: 1000000000, DisplayOffset: 0 } ];
var FrequencyUnits = [ { Name: "Hz", DisplayMultiplier: 1, DisplayOffset: 0 }, { Name: "KHz", DisplayMultiplier: 0.001, DisplayOffset: 0 }, { Name: "MHz", DisplayMultiplier: 0.000001, DisplayOffset: 0 } ];
var AngleUnits = [ { Name: "°", DisplayMultiplier: 1, DisplayOffset: 0 } ];
var VoltageUnits = [ { Name: "V", DisplayMultiplier: 1, DisplayOffset: 0 }, { Name: "mV", DisplayMultiplier: 1000, DisplayOffset: 0 } ];
var PressureUnits = [ { Name: "Bar", DisplayMultiplier: 1, DisplayOffset: 0 }, { Name: "kPa", DisplayMultiplier: 100, DisplayOffset: 0 } ];
var AngularSpeedUnits = [ { Name: "RPM", DisplayMultiplier: 1, DisplayOffset: 0 } ];
var SpeedUnits = [ { Name: "KPH", DisplayMultiplier: 1, DisplayOffset: 0 }, { Name: "MPH", DisplayMultiplier: 1.61, DisplayOffset: 0 } ];
var TemperatureUnits = [ { Name: "°C", DisplayMultiplier: 1, DisplayOffset: 0 }, { Name: "°F", DisplayMultiplier: 1.8, DisplayOffset: 32 } ];
var GasConstantUnits = [ { Name: "J/kg K", DisplayMultiplier: 1, DisplayOffset: 0 }, { Name: "kJ/kg K", DisplayMultiplier: 0.1, DisplayOffset: 0 } ];
var MassUnits = [ { Name: "g", DisplayMultiplier: 1, DisplayOffset: 0 }, { Name: "mg", DisplayMultiplier: 1000, DisplayOffset: 0 }, { Name: "kg", DisplayMultiplier: 0.001, DisplayOffset: 0 } ];
var Ratio = [ { Name: ":1", DisplayMultiplier: 1, DisplayOffset: 0 } ];
var CycleUnits = [ { Name: "Cycles", DisplayMultiplier: 1, DisplayOffset: 0 } ];
var LambdaUnits = [ { Name: "λ", DisplayMultiplier: 1, DisplayOffset: 0 } ];
var VolumeUnits = [ { Name: "L", DisplayMultiplier: 1, DisplayOffset: 0 }, { Name: "mL", DisplayMultiplier: 1000, DisplayOffset: 0 } ];
var MassFlowUnits = [ { Name: "g/s", DisplayMultiplier: 1, DisplayOffset: 0 }, { Name: "g/min", DisplayMultiplier: 60, DisplayOffset: 0 } ];
var Bool = [ { Name: "", DisplayMultiplier: 1, DisplayOffset: 0 } ];

var Measurements = {
    None: BlankUnits,
    Percentage: PercentUnits,
    PercentageAcceleration: PercentageAccelerationUnits,
    Time: TimeUnits,
    Frequency: FrequencyUnits,
    Angle: AngleUnits,
    Voltage: VoltageUnits,
    Pressure: PressureUnits,
    AngularSpeed: AngularSpeedUnits,
    Speed: SpeedUnits,
    Temperature: TemperatureUnits,
    Mass: MassUnits,
    Volume: VolumeUnits,
    Lambda: LambdaUnits,
    MassFlow: MassFlowUnits,
    Ratio: Ratio,
    Bool: Bool
}

function GetMeasurementDisplay(measurement, index) {
    var measurementString;
    if(typeof measurement === "string") {
        measurementString = measurement;
        measurement = Measurements[measurement];
    }

    if(!measurement)
        return "";

    if(index !== undefined && index >= measurement.length)
        return "";

    if(measurementString){
        if(index !== undefined && measurement[index].Name !== "")
            return measurementString + " [" + measurement[index].Name + "]";
        else
            return measurementString;
    }

    return measurement[index].Name;
}

function GetUnitDisplay(measurement, index) {
    if(typeof measurement === "string") {
        measurement = Measurements[measurement];
    }

    if(!measurement)
        return "";
    
    if(!index)
        index = 0;

    if(index >= measurement.length)
        return "";
        
    return measurement[index].Name;
}

function GetDefaultUnitIndex(measurement) {
    return 0;
}

function PerSecond(units)
{
    var newUnits = [];

    $.each(units, function(index, value){
        newUnits.push( { Name: value.Name + "/s", DisplayMultiplier: value.DisplayMultiplier, DisplayOffset: value.DisplayOffset });
    });

    return newUnits;
}

function PerMinute(units)
{
    var newUnits = [];

    $.each(units, function(index, value){
        newUnits.push( { Name: value.Name + "/min", DisplayMultiplier: value.DisplayMultiplier * 60, DisplayOffset: value.DisplayOffset * 60 });
    });

    return newUnits;
}