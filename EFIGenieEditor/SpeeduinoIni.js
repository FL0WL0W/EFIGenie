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
        //pinLayout
        //tachoPin
        //tachoDiv
        { unused2_17: { offset: 17, Type: "uint8", Value: 0, Hidden: true } },
        { unused2_18: { offset: 18, Type: "uint8", Value: 0, Hidden: true } },
        { tpsThresh: { offset: 19, Label: "tpsThresh", Type: "uint8", Value: 0 } },
        { taeTime: { offset: 20, Label: "taeTime", Type: "uint8", Value: 0 } },
    ]}
}