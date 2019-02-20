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
        { Page2: { Label: "Fuel Map Page", ConfigName: "Blank" } },
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
        { unused2_1: { offset: 0, Type: "int8", Value: 0, Hidden: true } },
        { unused2_2: { offset: 1, Type: "int8", Value: 0, Hidden: true } },
        { asePct: { offset: 2, Label: "asePct", Type: "uint8", Value: 0, Max: 95, ValueMultiplier: 100, Units: PercentUnits } },
        { aseCount: { offset: 3, Label: "aseCount", Type: "uint8", Value: 0, Units: TimeUnits } },
        { wueRate: { offset: 4, Label: "wueRate", Type: "uint8", Value: 0, XResolution: 10, Dialog: true, ValueMultiplier: 100, Units: PercentUnits } },
        { crankingPct: { offset: 14, Label: "crankingPct", Type: "uint8", Value: 0, ValueMultiplier: 100, Units: PercentUnits } },
        { pinLayout: { offset: 15, Label: "pinLayout", Type: "uint8", Value: 0, Selections: [ "Speeduino v0.1", "Speeduino v0.2", "Speeduino v0.3", "Speeduino v0.4", "INVALID", "INVALID", "INVALID", "INVALID", "INVALID", "NA6 MX5 PNP", "Turtana PCB", "INVALID", "INVALID", "INVALID", "INVALID", "INVALID", "INVALID", "INVALID", "INVALID", "INVALID", "Plazomat I/O 0.1", "INVALID", "INVALID", "INVALID", "INVALID", "INVALID", "INVALID", "INVALID", "INVALID", "INVALID", "Daz V6 Shield 0.1", "INVALID", "INVALID", "INVALID", "INVALID", "INVALID", "INVALID", "INVALID", "INVALID", "INVALID", "NO2C", "UA4C", "INVALID", "INVALID", "INVALID", "INVALID", "INVALID", "INVALID", "INVALID", "INVALID", "dvjcodec Teensy RevA", "dvjcodec Teensy RevB", "INVALID", "INVALID", "INVALID", "INVALID", "INVALID", "INVALID", "INVALID", "INVALID", "INVALID", "INVALID", "INVALID", "INVALID", "INVALID", "INVALID", "INVALID", "INVALID", "INVALID", "INVALID", "INVALID", "INVALID", "INVALID", "INVALID", "INVALID", "INVALID", "INVALID", "INVALID", "INVALID", "INVALID", "INVALID", "INVALID", "INVALID", "INVALID", "INVALID", "INVALID", "INVALID", "INVALID", "INVALID", "INVALID", "INVALID", "INVALID", "INVALID", "INVALID", "INVALID", "INVALID", "INVALID", "INVALID", "INVALID", "INVALID", "INVALID", "INVALID", "INVALID", "INVALID", "INVALID", "INVALID", "INVALID", "INVALID", "INVALID", "INVALID", "INVALID", "INVALID", "INVALID", "INVALID", "INVALID", "INVALID", "INVALID", "INVALID", "INVALID", "INVALID", "INVALID", "INVALID", "INVALID", "INVALID", "INVALID", "INVALID", "INVALID", "INVALID", "INVALID", "INVALID", "INVALID", "INVALID" ] } },
        { tachoPin: { Offset: 16, BitSize: 6, Label: "tachoPin", Type: "uint8", Value: 0, Selections: [ "Board Default", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13", "14", "15", "16", "17", "18", "19", "20", "21", "22", "23", "24", "25", "26", "27", "28", "29", "30", "31", "32", "33", "34", "35", "36", "37", "38", "39", "40", "41", "42", "43", "44", "45", "46", "47", "48", "49", "50", "51", "52", "53", "54", "INVALID", "INVALID", "INVALID", "INVALID", "INVALID", "INVALID", "INVALID", "INVALID", "INVALID" ] } },
        { tachoDiv: { Offset: 16, BitSize: 2, BitOffset: 6, Label: "tachoDiv", Type: "uint8", Value: 0, Selections: [ "Normal", "Half", "INVALID", "INVALID" ] } },
        { unused2_17: { offset: 17, Type: "uint8", Value: 0, Hidden: true, ValueMultiplier: 100, Units: TimeUnits, UnitIndex: 1 } },
        { unused2_18: { offset: 18, Type: "uint8", Value: 0, Hidden: true, ValueMultiplier: 100, Units: TimeUnits, UnitIndex: 1 } },
        { tpsThresh: { offset: 19, Label: "tpsThresh", Type: "uint8", Value: 0, ValueMultiplier: 100, Units: PercentPerSecondUnits } },
        { taeTime: { offset: 20, Label: "taeTime", Type: "uint8", Value: 0, ValueMultiplier: 10000, Units: TimeUnits, UnitIndex: 1 } },
        { display: { offset: 21, BitSize: 3, Label: "display", Type: "uint8", Value: 0, Selections: [ "Unused", "Adafruit 128x32", "Generic 128x32", "Adafruit 128x64", "Generic 128x64", "INVALID", "INVALID", "INVALID" ] } },
        { display1: { offset: 21, BitSize: 3, BitOffset: 3, Label: "display1", Type: "uint8", Value: 0, Selections: [ "RPM", "PW", "Advance", "VE", "GammaE", "TPS", "IAT", "CLT" ] } },
        { display2: { offset: 21, BitSize: 2, BitOffset: 6, Label: "display2", Type: "uint8", Value: 0, Selections: [ "O2", "Voltage", "CPU", "Mem" ] } },
        { display3: { offset: 22, BitSize: 3, Label: "display3", Type: "uint8", Value: 0, Selections: [ "RPM", "PW", "Advance", "VE", "GammaE", "TPS", "IAT", "CLT" ] } },
        { display4: { offset: 22, BitSize: 2, BitOffset: 3, Label: "display4", Type: "uint8", Value: 0, Selections: [ "O2", "Voltage", "CPU", "Mem" ] } },
        { display5: { offset: 22, BitSize: 3, BitOffset: 5, Label: "display5", Type: "uint8", Value: 0, Selections: [ "RPM", "PW", "Advance", "VE", "GammaE", "TPS", "IAT", "CLT" ] } },
        { displayB1: { offset: 23, BitSize: 3, Label: "displayB1", Type: "uint8", Value: 0, Selections: [ "RPM", "PW", "Advance", "VE", "GammaE", "TPS", "IAT", "CLT" ] } },
        { displayB2: { offset: 23, BitSize: 3, BitOffset: 3, Label: "displayB2", Type: "uint8", Value: 0, Selections: [ "RPM", "PW", "Advance", "VE", "GammaE", "TPS", "IAT", "CLT" ] } },
        { reqFuel: { offset: 24, Label: "reqFuel", Type: "uint8", Value: 0, ValueMultiplier: 100, Units: TimeUnits, UnitIndex: 1 } },
        { divider: { offset: 25, Label: "divider", Type: "uint8", Value: 0 } },
        { alternate: { offset: 26, BitSize: 1, Label: "alternate", Type: "uint8", Value: 0, Selections: [ "Simultaneous", "Alternating" ] } },
        { multiplyMAP: { offset: 26, BitSize: 1, BitOffset: 1, Label: "multiplyMAP", Type: "bool", Value: 0 } },
        { includeAFR: { offset: 26, BitSize: 1, BitOffset: 2, Label: "includeAFR", Type: "bool", Value: 0 } },
        { hardCutType: { offset: 26, BitSize: 1, BitOffset: 3, Label: "hardCutType", Type: "uint8", Value: 0, Selections: [ "Full", "Rolling" ] } },
        { ignAlgorithm: { offset: 26, BitSize: 3, BitOffset: 4, Label: "ignAlgorithm", Type: "uint8", Value: 0, Selections: SpeeduinoIni_loadSourceNames } },
        { indInjAng: { offset: 26, BitSize: 1, BitOffset: 7, Label: "indInjAng", Type: "bool", Value: 0 } },
        { injOpen: { offset: 27, Label: "injOpen", Type: "uint8", Value: 0, ValueMultiplier: 100, Units: TimeUnits, UnitIndex: 1 } },
        { inj1Ang: { offset: 28, Label: "inj1Ang", Type: "uint16", Value: 0, Units: DegreeUnits } },
        { inj2Ang: { offset: 30, Label: "inj2Ang", Type: "uint16", Value: 0, Units: DegreeUnits } },
        { inj3Ang: { offset: 32, Label: "inj3Ang", Type: "uint16", Value: 0, Units: DegreeUnits } },
        { inj4Ang: { offset: 34, Label: "inj4Ang", Type: "uint16", Value: 0, Units: DegreeUnits } },
        { mapSample: { offset: 36, BitSize: 2, Label: "mapSample", Type: "uint8", Value: 0, Selections: [ "Instantaneous", "Cycle Average", "Cycle Minimum", "INVALID" ] } },
        { twoStroke: { offset: 36, BitSize: 1, BitOffset: 2, Label: "twoStroke", Type: "uint8", Value: 0, Selections: [ "Four-stroke", "Two-stroke" ] } },
        { injType: { offset: 36, BitSize: 1, BitOffset: 3, Label: "injType", Type: "uint8", Value: 0, Selections: [ "Port", "Throttle Body" ] } },
        { nCylinders: { offset: 36, BitSize: 4, BitOffset: 4, Label: "nCylinders", Type: "uint8", Value: 1, Selections: [ "INVALID","1","2","3","4","5","6","INVALID","8","INVALID","INVALID","INVALID","INVALID","INVALID","INVALID","INVALID" ] } },
        { algorithm: { offset: 37, BitSize: 3, Label: "algorithm", Type: "uint8", Value: 0, Selections: SpeeduinoIni_loadSourceNames } },
        { fixAngEnable: { offset: 37, BitSize: 1, BitOffset: 3, Label: "fixAngEnable", Type: "bool", Value: 0 } },
        { nInjectors: { offset: 37, BitSize: 4, BitOffset: 4, Label: "nInjectors", Type: "uint8", Value: 1, Selections: [ "INVALID","1","2","3","4","5","6","INVALID","8","INVALID","INVALID","INVALID","INVALID","INVALID","INVALID","INVALID" ] } },
        { engineType: { offset: 38, BitSize: 1, Label: "engineType", Type: "uint8", Value: 0, Selections: [ "Even fire", "Odd fire" ] } },
        { flexEnabled: { offset: 38, BitSize: 1, BitOffset: 1, Label: "flexEnabled", Type: "bool", Value: 0 } },
        { unused2_38c: { offset: 38, BitSize: 1, BitOffset: 2, Label: "unused2_38c", Type: "uint8", Value: 0, Hidden: true, Selections: [ "Speed Density", "Alpha-N" ] } },
        { baroCorr: { offset: 38, BitSize: 1, BitOffset: 3, Label: "baroCorr", Type: "bool", Value: 0 } },
        { injLayout: { offset: 38, BitSize: 2, BitOffset: 4, Label: "injLayout", Type: "uint8", Value: 0, Selections: [ "Paired", "Semi-Sequential", "INVALID", "Sequential" ] } },
        { perToothIgn: { offset: 38, BitSize: 1, BitOffset: 6, Label: "perToothIgn", Type: "bool", Value: 0 } },
        { dfcoEnabled: { offset: 38, BitSize: 1, BitOffset: 7, Label: "dfcoEnabled", Type: "bool", Value: 0 } },
        { primePulse: { offset: 39, Label: "primePulse", Type: "uint8", Value: 0, ValueMultiplier: 100, Units: TimeUnits, UnitIndex: 1 } },
        { dutyLim: { offset: 40, Label: "dutyLim", Type: "uint8", Value: 0, Max: 95, ValueMultiplier: 100, Units: PercentUnits } },
        { flexFreqLow: { offset: 41, Label: "flexFreqLow", Type: "uint8", Value: 0, Units: FrequencyUnits } },
        { flexFreqHigh: { offset: 42, Label: "flexFreqHigh", Type: "uint8", Value: 0, Units: FrequencyUnits } },
        { boostMaxDuty: { offset: 43, Label: "boostMaxDuty", Type: "uint8", Value: 0, Max: 100, ValueMultiplier: 100, Units: PercentUnits } },
        { tpsMin: { offset: 44, Label: "tpsMin", Type: "uint8", Value: 0, ValueMultiplier: 51, Units: VoltUnits } },
        { tpsMax: { offset: 45, Label: "tpsMax", Type: "uint8", Value: 0, ValueMultiplier: 51, Units: VoltUnits } },
        { mapMin: { offset: 46, Label: "mapMin", Type: "int8", Value: 0, Min: -100, ValueMultiplier: 100, Units: PressureUnits } },
        { mapMax: { offset: 47, Label: "mapMin", Type: "uint16", Value: 0, ValueMultiplier: 100, Units: PressureUnits } },
        { fpPrime: { offset: 49, Label: "fpPrime", Type: "uint8", Value: 0, Units: TimeUnits } },
        { stoich: { offset: 50, Label: "stoich", Type: "uint8", Value: 0, ValueMultiplier: 0.1, Units: [ { Name:":1", DisplayMultiplier: 1} ] } },
        { oddFire2: { offset: 51, Label: "oddFire2", Type: "uint16", Value: 0, Max: 720, Units: DegreeUnits } },
        { oddFire3: { offset: 53, Label: "oddFire3", Type: "uint16", Value: 0, Max: 720, Units: DegreeUnits } },
        { oddFire4: { offset: 55, Label: "oddFire4", Type: "uint16", Value: 0, Max: 720, Units: DegreeUnits } },
        { idleUpPin: { offset: 57, BitSize: 6, Label: "idleUpPin", Type: "uint8", Value: 0, Selections: [ "Board Default", "INVALID", "INVALID", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13", "14", "15", "16", "17", "18", "19", "20", "21", "22", "23", "24", "25", "26", "27", "28", "29", "30", "31", "32", "33", "34", "35", "36", "37", "38", "39", "40", "41", "42", "43", "44", "45", "46", "47", "48", "49", "50", "51", "52", "53", "54", "A8", "A9", "A10", "A11", "A12", "A13", "A14", "A15", "INVALID" ] } },
        { idleUpPolarity: { offset: 57, BitSize: 1, BitOffset: 6, Label: "idleUpPolarity", Type: "uint8", Value: 0, Selections: [ "Normal", "Inverted" ] } },
        { idleUpEnabled: { offset: 57, BitSize: 1, BitOffset: 7, Label: "idleUpEnabled", Type: "bool", Value: 0 } },
        { idleUpAdder: { offset: 58, Label: "idleUpAdder", Type: "uint8", Value: 0, Units: [ { Name:"% / Steps", DisplayMultiplier: 1} ] } },
        { taeTaperMin: { offset: 59, Label: "taeTaperMin", Type: "uint8", Value: 0, Min: 1000, Max: 10000, ValueMultiplier: 100, Units: RPMUnits } },
        { taeTaperMax: { offset: 60, Label: "taeTaperMax", Type: "uint8", Value: 0, Min: 2000, Max: 10000, ValueMultiplier: 100, Units: RPMUnits } },
        { iacCLminDuty: { offset: 61, Label: "iacCLminDuty", Type: "uint8", Value: 0, Max: 100, ValueMultiplier: 100, Units: PercentUnits } },
        { iacCLmaxDuty: { offset: 62, Label: "iacCLmaxDuty", Type: "uint8", Value: 0, Max: 100, ValueMultiplier: 100, Units: PercentUnits } },
        { boostMinDuty: { offset: 63, Label: "boostMinDuty", Type: "uint8", Value: 0, Max: 100, ValueMultiplier: 100, Units: PercentUnits } },
        { barroMin: { offset: 64, Label: "barroMin", Type: "int8", Value: 0, Min: -100, ValueMultiplier: 100, Units: PressureUnits } },
        { barroMax: { offset: 65, Label: "barroMax", Type: "uint16", Value: 0, ValueMultiplier: 100, Units: PressureUnits } },
        { EMAPMin: { offset: 67, Label: "EMAPMin", Type: "int8", Value: 0, Min: -100, ValueMultiplier: 100, Units: PressureUnits } },
        { EMAPMax: { offset: 68, Label: "EMAPMax", Type: "uint16", Value: 0, ValueMultiplier: 100, Units: PressureUnits } },
        { fanWhenOff: { offset: 70, BitSize: 1, Label: "fanWhenOff", Type: "bool", Value: 0 } },
        { unused_fan_bits: { offset: 70, BitSize: 7, BitOffset: 2, Label: "unused_fan_bits", Hidden: true, Type: "uint8", Value: 0 } },
        { unused2_71: { offset: 71, Label: "unused2_71", Type: "uint8", Value: 0, XResolution: 56, Dialog: true, Hidden: true } },

        
    ]}
}