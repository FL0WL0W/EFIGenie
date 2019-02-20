var PercentUnits = [ { Name: "%", DisplayMultiplier: 100 }, { Name: "0.0-1.0", DisplayMultiplier: 1} ];
var PercentPerSecondUnits = [ { Name: "%/s", DisplayMultiplier: 100 }, { Name: "(0.0-1.0)/s", DisplayMultiplier: 1} ];
var TimeUnits = [ { Name: "s", DisplayMultiplier: 1 }, { Name: "ms", DisplayMultiplier: 1000 }, { Name: "us", DisplayMultiplier: 1000000 }, { Name: "ns", DisplayMultiplier: 1000000000 } ];
var FrequencyUnits = [ { Name: "Hz", DisplayMultiplier: 1 }, { Name: "KHz", DisplayMultiplier: 0.001 }, { Name: "MHz", DisplayMultiplier: 0.000001 } ];
var DegreeUnits = [ { Name: "°", DisplayMultiplier: 1 } ];
var VoltUnits = [ { Name: "V", DisplayMultiplier: 1 }, { Name: "mV", DisplayMultiplier: 1000 } ];
var PressureUnits = [ { Name: "Bar", DisplayMultiplier: 1 }, { Name: "kPa", DisplayMultiplier: 100 } ];
var RPMUnits = [ { Name: "RPM", DisplayMultiplier: 1 } ];

var SpeeduinoIni_loadSourceNames = ["MAP", "TPS", "IMAP/EMAP", "INVALID",   "INVALID", "INVALID", "INVALID", "INVALID"];

SpeeduinoIni = {
    Blank: { Variables : [
    ] },

    Main: { Tabbed: true, Variables: [
        { Page1: { Label: "General Page", ConfigName: "Page1" } },
        { Page2: { Label: "Fuel Map Page", ConfigName: "Page2" } },
        { Page3: { Label: "Ignition Table Page", ConfigName: "Blank" } },
        { Page4: { Label: "Ignition Settings Page", ConfigName: "Blank" } },
        { Page5: { Label: "AFR Table Page", ConfigName: "Blank" } },
        { Page6: { Label: "O2/AFR Page", ConfigName: "Blank" } },
        { Page7: { Label: "Boost/VVT Page", ConfigName: "Blank" } },
        { Page8: { Label: "Sequential Fuel Trim Page", ConfigName: "Blank" } },
        { Page9: { Label: "CAN/AUX Page", ConfigName: "Blank" } },
        { Page10: { Label: "Misc Page", ConfigName: "Blank" } }
    ] },

    Page1: { Size: 128, Variables: [
        { unused2_1: { Offset: 0, Type: "int8", Value: 0, Hidden: true } },
        { unused2_2: { Offset: 1, Type: "int8", Value: 0, Hidden: true } },
        { asePct: { Offset: 2, Label: "asePct", Type: "uint8", Value: 0, Max: 95, ValueMultiplier: 100, Units: PercentUnits } },
        { aseCount: { Offset: 3, Label: "aseCount", Type: "uint8", Value: 0, Units: TimeUnits } },
        { wueRate: { Offset: 4, Label: "wueRate", Type: "uint8", Value: 0, XResolution: 10, Dialog: true, ValueMultiplier: 100, Units: PercentUnits } },
        { crankingPct: { Offset: 14, Label: "crankingPct", Type: "uint8", Value: 0, ValueMultiplier: 100, Units: PercentUnits } },
        { pinLayout: { Offset: 15, Label: "pinLayout", Type: "uint8", Value: 0, Selections: [ "Speeduino v0.1", "Speeduino v0.2", "Speeduino v0.3", "Speeduino v0.4", "INVALID", "INVALID", "INVALID", "INVALID", "INVALID", "NA6 MX5 PNP", "Turtana PCB", "INVALID", "INVALID", "INVALID", "INVALID", "INVALID", "INVALID", "INVALID", "INVALID", "INVALID", "Plazomat I/O 0.1", "INVALID", "INVALID", "INVALID", "INVALID", "INVALID", "INVALID", "INVALID", "INVALID", "INVALID", "Daz V6 Shield 0.1", "INVALID", "INVALID", "INVALID", "INVALID", "INVALID", "INVALID", "INVALID", "INVALID", "INVALID", "NO2C", "UA4C", "INVALID", "INVALID", "INVALID", "INVALID", "INVALID", "INVALID", "INVALID", "INVALID", "dvjcodec Teensy RevA", "dvjcodec Teensy RevB", "INVALID", "INVALID", "INVALID", "INVALID", "INVALID", "INVALID", "INVALID", "INVALID", "INVALID", "INVALID", "INVALID", "INVALID", "INVALID", "INVALID", "INVALID", "INVALID", "INVALID", "INVALID", "INVALID", "INVALID", "INVALID", "INVALID", "INVALID", "INVALID", "INVALID", "INVALID", "INVALID", "INVALID", "INVALID", "INVALID", "INVALID", "INVALID", "INVALID", "INVALID", "INVALID", "INVALID", "INVALID", "INVALID", "INVALID", "INVALID", "INVALID", "INVALID", "INVALID", "INVALID", "INVALID", "INVALID", "INVALID", "INVALID", "INVALID", "INVALID", "INVALID", "INVALID", "INVALID", "INVALID", "INVALID", "INVALID", "INVALID", "INVALID", "INVALID", "INVALID", "INVALID", "INVALID", "INVALID", "INVALID", "INVALID", "INVALID", "INVALID", "INVALID", "INVALID", "INVALID", "INVALID", "INVALID", "INVALID", "INVALID", "INVALID", "INVALID", "INVALID", "INVALID", "INVALID", "INVALID" ] } },
        { tachoPin: { Offset: 16, BitSize: 6, Label: "tachoPin", Type: "uint8", Value: 0, Selections: [ "Board Default", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13", "14", "15", "16", "17", "18", "19", "20", "21", "22", "23", "24", "25", "26", "27", "28", "29", "30", "31", "32", "33", "34", "35", "36", "37", "38", "39", "40", "41", "42", "43", "44", "45", "46", "47", "48", "49", "50", "51", "52", "53", "54", "INVALID", "INVALID", "INVALID", "INVALID", "INVALID", "INVALID", "INVALID", "INVALID", "INVALID" ] } },
        { tachoDiv: { Offset: 16, BitSize: 2, BitOffset: 6, Label: "tachoDiv", Type: "uint8", Value: 0, Selections: [ "Normal", "Half", "INVALID", "INVALID" ] } },
        { unused2_17: { Offset: 17, Type: "uint8", Value: 0, Hidden: true, ValueMultiplier: 100, Units: TimeUnits, UnitIndex: 1 } },
        { unused2_18: { Offset: 18, Type: "uint8", Value: 0, Hidden: true, ValueMultiplier: 100, Units: TimeUnits, UnitIndex: 1 } },
        { tpsThresh: { Offset: 19, Label: "tpsThresh", Type: "uint8", Value: 0, ValueMultiplier: 100, Units: PercentPerSecondUnits } },
        { taeTime: { Offset: 20, Label: "taeTime", Type: "uint8", Value: 0, ValueMultiplier: 10000, Units: TimeUnits, UnitIndex: 1 } },
        { display: { Offset: 21, BitSize: 3, Label: "display", Type: "uint8", Value: 0, Selections: [ "Unused", "Adafruit 128x32", "Generic 128x32", "Adafruit 128x64", "Generic 128x64", "INVALID", "INVALID", "INVALID" ] } },
        { display1: { Offset: 21, BitSize: 3, BitOffset: 3, Label: "display1", Type: "uint8", Value: 0, Selections: [ "RPM", "PW", "Advance", "VE", "GammaE", "TPS", "IAT", "CLT" ] } },
        { display2: { Offset: 21, BitSize: 2, BitOffset: 6, Label: "display2", Type: "uint8", Value: 0, Selections: [ "O2", "Voltage", "CPU", "Mem" ] } },
        { display3: { Offset: 22, BitSize: 3, Label: "display3", Type: "uint8", Value: 0, Selections: [ "RPM", "PW", "Advance", "VE", "GammaE", "TPS", "IAT", "CLT" ] } },
        { display4: { Offset: 22, BitSize: 2, BitOffset: 3, Label: "display4", Type: "uint8", Value: 0, Selections: [ "O2", "Voltage", "CPU", "Mem" ] } },
        { display5: { Offset: 22, BitSize: 3, BitOffset: 5, Label: "display5", Type: "uint8", Value: 0, Selections: [ "RPM", "PW", "Advance", "VE", "GammaE", "TPS", "IAT", "CLT" ] } },
        { displayB1: { Offset: 23, BitSize: 3, Label: "displayB1", Type: "uint8", Value: 0, Selections: [ "RPM", "PW", "Advance", "VE", "GammaE", "TPS", "IAT", "CLT" ] } },
        { displayB2: { Offset: 23, BitSize: 3, BitOffset: 3, Label: "displayB2", Type: "uint8", Value: 0, Selections: [ "RPM", "PW", "Advance", "VE", "GammaE", "TPS", "IAT", "CLT" ] } },
        { reqFuel: { Offset: 24, Label: "reqFuel", Type: "uint8", Value: 0, ValueMultiplier: 100, Units: TimeUnits, UnitIndex: 1 } },
        { divider: { Offset: 25, Label: "divider", Type: "uint8", Value: 0 } },
        { alternate: { Offset: 26, BitSize: 1, Label: "alternate", Type: "uint8", Value: 0, Selections: [ "Simultaneous", "Alternating" ] } },
        { multiplyMAP: { Offset: 26, BitSize: 1, BitOffset: 1, Label: "multiplyMAP", Type: "bool", Value: 0 } },
        { includeAFR: { Offset: 26, BitSize: 1, BitOffset: 2, Label: "includeAFR", Type: "bool", Value: 0 } },
        { hardCutType: { Offset: 26, BitSize: 1, BitOffset: 3, Label: "hardCutType", Type: "uint8", Value: 0, Selections: [ "Full", "Rolling" ] } },
        { ignAlgorithm: { Offset: 26, BitSize: 3, BitOffset: 4, Label: "ignAlgorithm", Type: "uint8", Value: 0, Selections: SpeeduinoIni_loadSourceNames } },
        { indInjAng: { Offset: 26, BitSize: 1, BitOffset: 7, Label: "indInjAng", Type: "bool", Value: 0 } },
        { injOpen: { Offset: 27, Label: "injOpen", Type: "uint8", Value: 0, ValueMultiplier: 100, Units: TimeUnits, UnitIndex: 1 } },
        { inj1Ang: { Offset: 28, Label: "inj1Ang", Type: "uint16", Value: 0, Units: DegreeUnits } },
        { inj2Ang: { Offset: 30, Label: "inj2Ang", Type: "uint16", Value: 0, Units: DegreeUnits } },
        { inj3Ang: { Offset: 32, Label: "inj3Ang", Type: "uint16", Value: 0, Units: DegreeUnits } },
        { inj4Ang: { Offset: 34, Label: "inj4Ang", Type: "uint16", Value: 0, Units: DegreeUnits } },
        { mapSample: { Offset: 36, BitSize: 2, Label: "mapSample", Type: "uint8", Value: 0, Selections: [ "Instantaneous", "Cycle Average", "Cycle Minimum", "INVALID" ] } },
        { twoStroke: { Offset: 36, BitSize: 1, BitOffset: 2, Label: "twoStroke", Type: "uint8", Value: 0, Selections: [ "Four-stroke", "Two-stroke" ] } },
        { injType: { Offset: 36, BitSize: 1, BitOffset: 3, Label: "injType", Type: "uint8", Value: 0, Selections: [ "Port", "Throttle Body" ] } },
        { nCylinders: { Offset: 36, BitSize: 4, BitOffset: 4, Label: "nCylinders", Type: "uint8", Value: 1, Selections: [ "INVALID","1","2","3","4","5","6","INVALID","8","INVALID","INVALID","INVALID","INVALID","INVALID","INVALID","INVALID" ] } },
        { algorithm: { Offset: 37, BitSize: 3, Label: "algorithm", Type: "uint8", Value: 0, Selections: SpeeduinoIni_loadSourceNames } },
        { fixAngEnable: { Offset: 37, BitSize: 1, BitOffset: 3, Label: "fixAngEnable", Type: "bool", Value: 0 } },
        { nInjectors: { Offset: 37, BitSize: 4, BitOffset: 4, Label: "nInjectors", Type: "uint8", Value: 1, Selections: [ "INVALID","1","2","3","4","5","6","INVALID","8","INVALID","INVALID","INVALID","INVALID","INVALID","INVALID","INVALID" ] } },
        { engineType: { Offset: 38, BitSize: 1, Label: "engineType", Type: "uint8", Value: 0, Selections: [ "Even fire", "Odd fire" ] } },
        { flexEnabled: { Offset: 38, BitSize: 1, BitOffset: 1, Label: "flexEnabled", Type: "bool", Value: 0 } },
        { unused2_38c: { Offset: 38, BitSize: 1, BitOffset: 2, Label: "unused2_38c", Type: "uint8", Value: 0, Hidden: true, Selections: [ "Speed Density", "Alpha-N" ] } },
        { baroCorr: { Offset: 38, BitSize: 1, BitOffset: 3, Label: "baroCorr", Type: "bool", Value: 0 } },
        { injLayout: { Offset: 38, BitSize: 2, BitOffset: 4, Label: "injLayout", Type: "uint8", Value: 0, Selections: [ "Paired", "Semi-Sequential", "INVALID", "Sequential" ] } },
        { perToothIgn: { Offset: 38, BitSize: 1, BitOffset: 6, Label: "perToothIgn", Type: "bool", Value: 0 } },
        { dfcoEnabled: { Offset: 38, BitSize: 1, BitOffset: 7, Label: "dfcoEnabled", Type: "bool", Value: 0 } },
        { primePulse: { Offset: 39, Label: "primePulse", Type: "uint8", Value: 0, ValueMultiplier: 100, Units: TimeUnits, UnitIndex: 1 } },
        { dutyLim: { Offset: 40, Label: "dutyLim", Type: "uint8", Value: 0, Max: 95, ValueMultiplier: 100, Units: PercentUnits } },
        { flexFreqLow: { Offset: 41, Label: "flexFreqLow", Type: "uint8", Value: 0, Units: FrequencyUnits } },
        { flexFreqHigh: { Offset: 42, Label: "flexFreqHigh", Type: "uint8", Value: 0, Units: FrequencyUnits } },
        { boostMaxDuty: { Offset: 43, Label: "boostMaxDuty", Type: "uint8", Value: 0, Max: 100, ValueMultiplier: 100, Units: PercentUnits } },
        { tpsMin: { Offset: 44, Label: "tpsMin", Type: "uint8", Value: 0, ValueMultiplier: 51, Units: VoltUnits } },
        { tpsMax: { Offset: 45, Label: "tpsMax", Type: "uint8", Value: 0, ValueMultiplier: 51, Units: VoltUnits } },
        { mapMin: { Offset: 46, Label: "mapMin", Type: "int8", Value: 0, Min: -100, ValueMultiplier: 100, Units: PressureUnits } },
        { mapMax: { Offset: 47, Label: "mapMin", Type: "uint16", Value: 0, ValueMultiplier: 100, Units: PressureUnits } },
        { fpPrime: { Offset: 49, Label: "fpPrime", Type: "uint8", Value: 0, Units: TimeUnits } },
        { stoich: { Offset: 50, Label: "stoich", Type: "uint8", Value: 0, ValueMultiplier: 0.1, Units: [ { Name:":1", DisplayMultiplier: 1} ] } },
        { oddFire2: { Offset: 51, Label: "oddFire2", Type: "uint16", Value: 0, Max: 720, Units: DegreeUnits } },
        { oddFire3: { Offset: 53, Label: "oddFire3", Type: "uint16", Value: 0, Max: 720, Units: DegreeUnits } },
        { oddFire4: { Offset: 55, Label: "oddFire4", Type: "uint16", Value: 0, Max: 720, Units: DegreeUnits } },
        { idleUpPin: { Offset: 57, BitSize: 6, Label: "idleUpPin", Type: "uint8", Value: 0, Selections: [ "Board Default", "INVALID", "INVALID", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13", "14", "15", "16", "17", "18", "19", "20", "21", "22", "23", "24", "25", "26", "27", "28", "29", "30", "31", "32", "33", "34", "35", "36", "37", "38", "39", "40", "41", "42", "43", "44", "45", "46", "47", "48", "49", "50", "51", "52", "53", "54", "A8", "A9", "A10", "A11", "A12", "A13", "A14", "A15", "INVALID" ] } },
        { idleUpPolarity: { Offset: 57, BitSize: 1, BitOffset: 6, Label: "idleUpPolarity", Type: "uint8", Value: 0, Selections: [ "Normal", "Inverted" ] } },
        { idleUpEnabled: { Offset: 57, BitSize: 1, BitOffset: 7, Label: "idleUpEnabled", Type: "bool", Value: 0 } },
        { idleUpAdder: { Offset: 58, Label: "idleUpAdder", Type: "uint8", Value: 0, Units: [ { Name:"% / Steps", DisplayMultiplier: 1} ] } },
        { taeTaperMin: { Offset: 59, Label: "taeTaperMin", Type: "uint8", Value: 0, Min: 1000, Max: 10000, ValueMultiplier: 0.01, Units: RPMUnits } },
        { taeTaperMax: { Offset: 60, Label: "taeTaperMax", Type: "uint8", Value: 0, Min: 2000, Max: 10000, ValueMultiplier: 0.01, Units: RPMUnits } },
        { iacCLminDuty: { Offset: 61, Label: "iacCLminDuty", Type: "uint8", Value: 0, Max: 100, ValueMultiplier: 100, Units: PercentUnits } },
        { iacCLmaxDuty: { Offset: 62, Label: "iacCLmaxDuty", Type: "uint8", Value: 0, Max: 100, ValueMultiplier: 100, Units: PercentUnits } },
        { boostMinDuty: { Offset: 63, Label: "boostMinDuty", Type: "uint8", Value: 0, Max: 100, ValueMultiplier: 100, Units: PercentUnits } },
        { barroMin: { Offset: 64, Label: "barroMin", Type: "int8", Value: 0, Min: -100, ValueMultiplier: 100, Units: PressureUnits } },
        { barroMax: { Offset: 65, Label: "barroMax", Type: "uint16", Value: 0, ValueMultiplier: 100, Units: PressureUnits } },
        { EMAPMin: { Offset: 67, Label: "EMAPMin", Type: "int8", Value: 0, Min: -100, ValueMultiplier: 100, Units: PressureUnits } },
        { EMAPMax: { Offset: 68, Label: "EMAPMax", Type: "uint16", Value: 0, ValueMultiplier: 100, Units: PressureUnits } },
        { fanWhenOff: { Offset: 70, BitSize: 1, Label: "fanWhenOff", Type: "bool", Value: 0 } },
        { unused_fan_bits: { Offset: 70, BitSize: 7, BitOffset: 2, Label: "unused_fan_bits", Hidden: true, Type: "uint8", Value: 0 } },
        { unused2_71: { Offset: 71, Label: "unused2_71", Type: "uint8", Value: 0, XResolution: 56, Dialog: true, Hidden: true } },
    ] },

    Page2: {  Size: 288, Variables: [
        { rpmBins: { Offset: 256, Label: "rpmBins", Type: "uint8", Value: [100, 700, 1300, 1900, 2500, 3100, 3700, 4300, 4900, 5600, 6200, 6800, 7400, 8000, 8600, 9200], Min: 1, XResolution: 16, XMin: 1, XMax:16, Dialog: true, ValueMultiplier: 0.01, Units: RPMUnits } },
        { fuelLoadBins: { Offset: 272, Label: "fuelLoadBins", Type: "uint8", Min: 0, XResolution: 16, XMin: 1, XMax:16, Dialog: true, ValueMultiplier: 0.5 } },
        { veTable: { Offset: 0, Label: "veTable", Type: "uint8", Min: 0, XResolution: 16, YResolution: 16, XAxis: "rpmBins", YAxis:"fuelLoadBins", Dialog: true, ValueMultiplier: 0.5 } },

    ] }
}