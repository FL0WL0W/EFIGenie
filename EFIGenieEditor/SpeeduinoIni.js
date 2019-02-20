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
        { asePct: { offset: 2, Label: "asePct", Type: "uint8", Value: 0, Max: 95 } },
        { aseCount: { offset: 3, Label: "aseCount", Type: "uint8", Value: 0 } },
        { wueRate: { offset: 4, Label: "wueRate", Type: "uint8", Value: 0, XResolution: 10, Dialog: true } },
        { crankingPct: { offset: 14, Label: "crankingPct", Type: "uint8", Value: 0 } },
        { pinLayout: { offset: 15, Label: "pinLayout", Type: "uint8", Value: 0, Selections: [ "Speeduino v0.1", "Speeduino v0.2", "Speeduino v0.3", "Speeduino v0.4", "INVALID", "INVALID", "INVALID", "INVALID", "INVALID", "NA6 MX5 PNP", "Turtana PCB", "INVALID", "INVALID", "INVALID", "INVALID", "INVALID", "INVALID", "INVALID", "INVALID", "INVALID", "Plazomat I/O 0.1", "INVALID", "INVALID", "INVALID", "INVALID", "INVALID", "INVALID", "INVALID", "INVALID", "INVALID", "Daz V6 Shield 0.1", "INVALID", "INVALID", "INVALID", "INVALID", "INVALID", "INVALID", "INVALID", "INVALID", "INVALID", "NO2C", "UA4C", "INVALID", "INVALID", "INVALID", "INVALID", "INVALID", "INVALID", "INVALID", "INVALID", "dvjcodec Teensy RevA", "dvjcodec Teensy RevB", "INVALID", "INVALID", "INVALID", "INVALID", "INVALID", "INVALID", "INVALID", "INVALID", "INVALID", "INVALID", "INVALID", "INVALID", "INVALID", "INVALID", "INVALID", "INVALID", "INVALID", "INVALID", "INVALID", "INVALID", "INVALID", "INVALID", "INVALID", "INVALID", "INVALID", "INVALID", "INVALID", "INVALID", "INVALID", "INVALID", "INVALID", "INVALID", "INVALID", "INVALID", "INVALID", "INVALID", "INVALID", "INVALID", "INVALID", "INVALID", "INVALID", "INVALID", "INVALID", "INVALID", "INVALID", "INVALID", "INVALID", "INVALID", "INVALID", "INVALID", "INVALID", "INVALID", "INVALID", "INVALID", "INVALID", "INVALID", "INVALID", "INVALID", "INVALID", "INVALID", "INVALID", "INVALID", "INVALID", "INVALID", "INVALID", "INVALID", "INVALID", "INVALID", "INVALID", "INVALID", "INVALID", "INVALID", "INVALID", "INVALID", "INVALID", "INVALID", "INVALID", "INVALID", "INVALID", "INVALID" ] } },
        { tachoPin: { Offset: 16, BitSize: 6, Label: "tachoPin", Type: "uint8", Value: 0, Selections: [ "Board Default", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13", "14", "15", "16", "17", "18", "19", "20", "21", "22", "23", "24", "25", "26", "27", "28", "29", "30", "31", "32", "33", "34", "35", "36", "37", "38", "39", "40", "41", "42", "43", "44", "45", "46", "47", "48", "49", "50", "51", "52", "53", "54", "INVALID", "INVALID", "INVALID", "INVALID", "INVALID", "INVALID", "INVALID", "INVALID", "INVALID" ] } },
        { tachoDiv: { Offset: 16, BitSize: 2, BitOffset: 6, Label: "tachoDiv", Type: "uint8", Value: 0, Selections: [ "Normal", "Half", "INVALID", "INVALID" ] } },
        //pinLayout
        //tachoPin
        //tachoDiv
        { unused2_17: { offset: 17, Type: "uint8", Value: 0, Hidden: true } },
        { unused2_18: { offset: 18, Type: "uint8", Value: 0, Hidden: true } },
        { tpsThresh: { offset: 19, Label: "tpsThresh", Type: "uint8", Value: 0 } },
        { taeTime: { offset: 20, Label: "taeTime", Type: "uint8", Value: 0 } },
    ]}
}