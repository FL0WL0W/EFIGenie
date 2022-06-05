var CurrentTickVariableID = 0;
var RawInputConfigs = [];
var InputConfigs = [
    { group: `Generic Pin Input`, calculations: RawInputConfigs},
    { group: `Custom Input`, calculations: [ 
        Calculation_Static,
        Calculation_LookupTable
    ]}
];

EmbeddedOperationsFactoryIDs = {
    Offset: 20000,
    AnalogInput: 1,
    DigitalInput: 2,
    DigitalPinRecord: 3,
    DutyCyclePinRead: 4,
    FrequencyPinRead: 5,
    PulseWidthPinRead: 6,
    DigitalOutput: 7,
    PulseWidthPinWrite: 8,
    GetTick: 9,
    SecondsToTick: 10,
    TickToSeconds: 11
};

PinOuts = {
    STM32F103C: { 
        name: `Blue pill: STM32F103C`,
        Overlay: `images/STM32F103C_Overlay.png`,
        OverlayWidth: 844,
        OverlayElementHeight: 24,
        Pins: [
            { name: `PC_13`, value: (16*2 + 13), supportedModes: `digital digitalinterrupt`, overlayX: 844, overlayY: 174, align: `right`},
            { name: `PC_14`, value: (16*2 + 14), supportedModes: `digital digitalinterrupt`, overlayX: 844, overlayY: 200, align: `right`},
            { name: `PC_15`, value: (16*2 + 15), supportedModes: `digital digitalinterrupt`, overlayX: 844, overlayY: 226, align: `right`},
            { name: `PA_0`,  value: (16*0 + 0 ), supportedModes: `digital digitalinterrupt analog`, overlayX: 844, overlayY: 252, align: `right`},
            { name: `PA_1`,  value: (16*0 + 1 ), supportedModes: `digital digitalinterrupt analog pwm` , overlayX: 844, overlayY: 278, align: `right`},
            { name: `PA_2`,  value: (16*0 + 2 ), supportedModes: `digital digitalinterrupt analog pwm` , overlayX: 844, overlayY: 304, align: `right`},
            { name: `PA_3`,  value: (16*0 + 3 ), supportedModes: `digital digitalinterrupt analog pwm` , overlayX: 844, overlayY: 330, align: `right`},
            { name: `PA_4`,  value: (16*0 + 4 ), supportedModes: `digital digitalinterrupt analog`, overlayX: 844, overlayY: 356, align: `right`},
            { name: `PA_5`,  value: (16*0 + 5 ), supportedModes: `digital digitalinterrupt analog`, overlayX: 844, overlayY: 382, align: `right`},
            { name: `PA_6`,  value: (16*0 + 6 ), supportedModes: `digital digitalinterrupt analog pwm` , overlayX: 844, overlayY: 408, align: `right`},
            { name: `PA_7`,  value: (16*0 + 7 ), supportedModes: `digital digitalinterrupt analog pwm` , overlayX: 844, overlayY: 434, align: `right`},
            { name: `PB_0`,  value: (16*1 + 0 ), supportedModes: `digital digitalinterrupt analog pwm` , overlayX: 844, overlayY: 460, align: `right`},
            { name: `PB_1`,  value: (16*1 + 1 ), supportedModes: `digital digitalinterrupt analog pwm` , overlayX: 844, overlayY: 486, align: `right`},
            { name: `PB_10`, value: (16*1 + 10), supportedModes: `digital digitalinterrupt pwm` , overlayX: 844, overlayY: 512, align: `right`},
            { name: `PB_11`, value: (16*1 + 11), supportedModes: `digital digitalinterrupt pwm` , overlayX: 844, overlayY: 538, align: `right`},
            { name: `PB_9`,  value: (16*1 + 9 ), supportedModes: `digital digitalinterrupt`, overlayX: 844, overlayY: 226, align: `left`},
            { name: `PB_8`,  value: (16*1 + 8 ), supportedModes: `digital digitalinterrupt`, overlayX: 844, overlayY: 252, align: `left`},
            { name: `PB_7`,  value: (16*1 + 7 ), supportedModes: `digital digitalinterrupt`, overlayX: 844, overlayY: 278, align: `left`},
            { name: `PB_6`,  value: (16*1 + 6 ), supportedModes: `digital digitalinterrupt`, overlayX: 844, overlayY: 304, align: `left`},
            { name: `PB_5`,  value: (16*1 + 5 ), supportedModes: `digital digitalinterrupt pwm` , overlayX: 844, overlayY: 330, align: `left`},
            { name: `PB_4`,  value: (16*1 + 4 ), supportedModes: `digital digitalinterrupt pwm` , overlayX: 844, overlayY: 356, align: `left`},
            { name: `PB_3`,  value: (16*1 + 3 ), supportedModes: `digital digitalinterrupt pwm` , overlayX: 844, overlayY: 382, align: `left`},
            { name: `PA_15`, value: (16*0 + 15), supportedModes: `digital digitalinterrupt pwm` , overlayX: 844, overlayY: 408, align: `left`},
            { name: `PA_12`, value: (16*0 + 12), supportedModes: `digital digitalinterrupt`, overlayX: 844, overlayY: 434, align: `left`},
            { name: `PA_11`, value: (16*0 + 11), supportedModes: `digital digitalinterrupt pwm` , overlayX: 844, overlayY: 460, align: `left`},
            { name: `PA_10`, value: (16*0 + 10), supportedModes: `digital digitalinterrupt pwm` , overlayX: 844, overlayY: 486, align: `left`},
            { name: `PA_9`,  value: (16*0 + 9 ), supportedModes: `digital digitalinterrupt pwm` , overlayX: 844, overlayY: 512, align: `left`},
            { name: `PA_8`,  value: (16*0 + 8 ), supportedModes: `digital digitalinterrupt pwm` , overlayX: 844, overlayY: 538, align: `left`},
            { name: `PB_15`, value: (16*1 + 15), supportedModes: `digital digitalinterrupt pwm` , overlayX: 844, overlayY: 564, align: `left`},
            { name: `PB_14`, value: (16*1 + 14), supportedModes: `digital digitalinterrupt pwm` , overlayX: 844, overlayY: 590, align: `left`},
            { name: `PB_13`, value: (16*1 + 13), supportedModes: `digital digitalinterrupt pwm` , overlayX: 844, overlayY: 616, align: `left`},
            { name: `PB_12`, value: (16*1 + 12), supportedModes: `digital digitalinterrupt`, overlayX: 844, overlayY: 642, align: `left`},
        ]
    },
    STM32F401C : { 
        name: `Black pill: STM32F401C/STM32F411C`,
        Overlay: `images/STM32F401C_Overlay.png`,
        OverlayWidth: 577,
        OverlayElementHeight: 22,
        Pins: [
            { name: `PC_13`, value: (16*2 + 13), supportedModes: `digital digitalinterrupt`, overlayX: 577, overlayY: 132, align: `right`},
            { name: `PC_14`, value: (16*2 + 14), supportedModes: `digital digitalinterrupt`, overlayX: 577, overlayY: 154, align: `right`},
            { name: `PC_15`, value: (16*2 + 15), supportedModes: `digital digitalinterrupt`, overlayX: 577, overlayY: 176, align: `right`},
            { name: `PA_0`,  value: (16*0 + 0 ), supportedModes: `digital digitalinterrupt analog`, overlayX: 577, overlayY: 220, align: `right`},
            { name: `PA_1`,  value: (16*0 + 1 ), supportedModes: `digital digitalinterrupt analog pwm` , overlayX: 577, overlayY: 242, align: `right`},
            { name: `PA_2`,  value: (16*0 + 2 ), supportedModes: `digital digitalinterrupt analog pwm` , overlayX: 577, overlayY: 264, align: `right`},
            { name: `PA_3`,  value: (16*0 + 3 ), supportedModes: `digital digitalinterrupt analog pwm` , overlayX: 577, overlayY: 286, align: `right`},
            { name: `PA_4`,  value: (16*0 + 4 ), supportedModes: `digital digitalinterrupt analog`, overlayX: 577, overlayY: 308, align: `right`},
            { name: `PA_5`,  value: (16*0 + 5 ), supportedModes: `digital digitalinterrupt analog`, overlayX: 577, overlayY: 330, align: `right`},
            { name: `PA_6`,  value: (16*0 + 6 ), supportedModes: `digital digitalinterrupt analog pwm` , overlayX: 577, overlayY: 352, align: `right`},
            { name: `PA_7`,  value: (16*0 + 7 ), supportedModes: `digital digitalinterrupt analog pwm` , overlayX: 577, overlayY: 374, align: `right`},
            { name: `PB_0`,  value: (16*1 + 0 ), supportedModes: `digital digitalinterrupt analog pwm` , overlayX: 577, overlayY: 396, align: `right`},
            { name: `PB_1`,  value: (16*1 + 1 ), supportedModes: `digital digitalinterrupt analog pwm` , overlayX: 577, overlayY: 418, align: `right`},
            { name: `PB_2`,  value: (16*1 + 2 ), supportedModes: `digital digitalinterrupt pwm` , overlayX: 577, overlayY: 440, align: `right`},
            { name: `PB_10`, value: (16*1 + 10), supportedModes: `digital digitalinterrupt pwm` , overlayX: 577, overlayY: 462, align: `right`},
            { name: `PB_9`,  value: (16*1 + 9 ), supportedModes: `digital digitalinterrupt`, overlayX: 577, overlayY: 176, align: `left`},
            { name: `PB_8`,  value: (16*1 + 8 ), supportedModes: `digital digitalinterrupt`, overlayX: 577, overlayY: 198, align: `left`},
            { name: `PB_7`,  value: (16*1 + 7 ), supportedModes: `digital digitalinterrupt`, overlayX: 577, overlayY: 220, align: `left`},
            { name: `PB_6`,  value: (16*1 + 6 ), supportedModes: `digital digitalinterrupt`, overlayX: 577, overlayY: 242, align: `left`},
            { name: `PB_5`,  value: (16*1 + 5 ), supportedModes: `digital digitalinterrupt pwm` , overlayX: 577, overlayY: 264, align: `left`},
            { name: `PB_4`,  value: (16*1 + 4 ), supportedModes: `digital digitalinterrupt pwm` , overlayX: 577, overlayY: 286, align: `left`},
            { name: `PB_3`,  value: (16*1 + 3 ), supportedModes: `digital digitalinterrupt pwm` , overlayX: 577, overlayY: 308, align: `left`},
            { name: `PA_15`, value: (16*0 + 15), supportedModes: `digital digitalinterrupt pwm` , overlayX: 577, overlayY: 330, align: `left`},
            { name: `PA_12`, value: (16*0 + 12), supportedModes: `digital digitalinterrupt`, overlayX: 577, overlayY: 352, align: `left`},
            { name: `PA_11`, value: (16*0 + 11), supportedModes: `digital digitalinterrupt pwm` , overlayX: 577, overlayY: 374, align: `left`},
            { name: `PA_10`, value: (16*0 + 10), supportedModes: `digital digitalinterrupt pwm` , overlayX: 577, overlayY: 396, align: `left`},
            { name: `PA_9`,  value: (16*0 + 9 ), supportedModes: `digital digitalinterrupt pwm` , overlayX: 577, overlayY: 418, align: `left`},
            { name: `PA_8`,  value: (16*0 + 8 ), supportedModes: `digital digitalinterrupt pwm` , overlayX: 577, overlayY: 440, align: `left`},
            { name: `PB_15`, value: (16*1 + 15), supportedModes: `digital digitalinterrupt pwm` , overlayX: 577, overlayY: 462, align: `left`},
            { name: `PB_14`, value: (16*1 + 14), supportedModes: `digital digitalinterrupt pwm` , overlayX: 577, overlayY: 484, align: `left`},
            { name: `PB_13`, value: (16*1 + 13), supportedModes: `digital digitalinterrupt pwm` , overlayX: 577, overlayY: 506, align: `left`},
            { name: `PB_12`, value: (16*1 + 12), supportedModes: `digital digitalinterrupt`, overlayX: 577, overlayY: 528, align: `left`},
        ]
    },
    W806 : { 
        name: `Purple pill: W806`,
        Overlay: `images/W806_Overlay.png`,
        OverlayWidth: 577,
        OverlayElementHeight: 22,
        Pins: [
            { name: `PA_0`,  value: (32*0 + 0 ), supportedModes: `digital digitalinterrupt analog pwm`, overlayX: 577, overlayY: 220, align: `right`},
            { name: `PA_1`,  value: (32*0 + 1 ), supportedModes: `digital digitalinterrupt analog pwm`, overlayX: 577, overlayY: 242, align: `right`},
            { name: `PA_2`,  value: (32*0 + 2 ), supportedModes: `digital digitalinterrupt analog pwm`, overlayX: 577, overlayY: 264, align: `right`},
            { name: `PA_3`,  value: (32*0 + 3 ), supportedModes: `digital digitalinterrupt analog pwm`, overlayX: 577, overlayY: 286, align: `right`},
            { name: `PA_4`,  value: (32*0 + 4 ), supportedModes: `digital digitalinterrupt pwm`, overlayX: 577, overlayY: 308, align: `right`},
            { name: `PA_5`,  value: (32*0 + 5 ), supportedModes: `digital digitalinterrupt`, overlayX: 577, overlayY: 330, align: `right`},
            { name: `PA_6`,  value: (32*0 + 6 ), supportedModes: `digital digitalinterrupt`, overlayX: 577, overlayY: 352, align: `right`},
            { name: `PA_7`,  value: (32*0 + 7 ), supportedModes: `digital digitalinterrupt pwm`, overlayX: 577, overlayY: 374, align: `right`},
            { name: `PA_8`,  value: (32*0 + 8 ), supportedModes: `digital digitalinterrupt`, overlayX: 577, overlayY: 440, align: `left`},
            { name: `PA_9`,  value: (32*0 + 9 ), supportedModes: `digital digitalinterrupt`, overlayX: 577, overlayY: 418, align: `left`},
            { name: `PA_10`, value: (32*0 + 10), supportedModes: `digital digitalinterrupt pwm`, overlayX: 577, overlayY: 396, align: `left`},
            { name: `PA_11`, value: (32*0 + 11), supportedModes: `digital digitalinterrupt pwm`, overlayX: 577, overlayY: 374, align: `left`},
            { name: `PA_12`, value: (32*0 + 12), supportedModes: `digital digitalinterrupt pwm`, overlayX: 577, overlayY: 352, align: `left`},
            { name: `PA_13`, value: (32*0 + 13), supportedModes: `digital digitalinterrupt pwm`, overlayX: 577, overlayY: 352, align: `left`},
            { name: `PA_14`, value: (32*0 + 14), supportedModes: `digital digitalinterrupt pwm`, overlayX: 577, overlayY: 352, align: `left`},
            { name: `PA_15`, value: (32*0 + 15), supportedModes: `digital digitalinterrupt`, overlayX: 577, overlayY: 330, align: `left`},
            { name: `PB_0`,  value: (32*1 + 0 ), supportedModes: `digital digitalinterrupt pwm`, overlayX: 577, overlayY: 396, align: `right`},
            { name: `PB_1`,  value: (32*1 + 1 ), supportedModes: `digital digitalinterrupt pwm`, overlayX: 577, overlayY: 418, align: `right`},
            { name: `PB_2`,  value: (32*1 + 2 ), supportedModes: `digital digitalinterrupt pwm`, overlayX: 577, overlayY: 440, align: `right`},
            { name: `PB_3`,  value: (32*1 + 3 ), supportedModes: `digital digitalinterrupt pwm`, overlayX: 577, overlayY: 308, align: `left`},
            { name: `PB_27`, value: (32*1 + 27), supportedModes: `digital digitalinterrupt`, overlayX: 577, overlayY: 462, align: `right`},
            { name: `PB_4`,  value: (32*1 + 4 ), supportedModes: `digital digitalinterrupt`, overlayX: 577, overlayY: 286, align: `left`},
            { name: `PB_5`,  value: (32*1 + 5 ), supportedModes: `digital digitalinterrupt`, overlayX: 577, overlayY: 264, align: `left`},
            { name: `PB_6`,  value: (32*1 + 6 ), supportedModes: `digital digitalinterrupt`, overlayX: 577, overlayY: 242, align: `left`},
            { name: `PB_7`,  value: (32*1 + 7 ), supportedModes: `digital digitalinterrupt`, overlayX: 577, overlayY: 220, align: `left`},
            { name: `PB_8`,  value: (32*1 + 8 ), supportedModes: `digital digitalinterrupt`, overlayX: 577, overlayY: 198, align: `left`},
            { name: `PB_9`,  value: (32*1 + 9 ), supportedModes: `digital digitalinterrupt`, overlayX: 577, overlayY: 176, align: `left`},
            { name: `PB_10`, value: (32*1 + 10), supportedModes: `digital digitalinterrupt`, overlayX: 577, overlayY: 462, align: `right`},
            { name: `PB_12`, value: (32*1 + 12), supportedModes: `digital digitalinterrupt pwm`, overlayX: 577, overlayY: 528, align: `left`},

            { name: `PB_15`, value: (32*1 + 15), supportedModes: `digital digitalinterrupt pwm` , overlayX: 577, overlayY: 462, align: `left`},
            { name: `PB_14`, value: (32*1 + 14), supportedModes: `digital digitalinterrupt pwm` , overlayX: 577, overlayY: 484, align: `left`},
            { name: `PB_13`, value: (32*1 + 13), supportedModes: `digital digitalinterrupt pwm` , overlayX: 577, overlayY: 506, align: `left`},
        ]
    }
};
BooleanOutputConfigs = [];

MapConfigs = [];
InputConfigs.unshift({group: `MAP Sensors`, calculations: MapConfigs});

ReluctorConfigs = [];
InputConfigs.unshift({group: `Reluctor Decoders`, calculations: ReluctorConfigs});
ReluctorFactoryIDs = {
    Offset: 30000,
    GM24X: 1,
    Universal1X: 2,
    UniversalMissintTooth: 3
};

var CylinderAirmassConfigs = [];
CylinderAirmassConfigs.push(Calculation_Static);

var InjectorPulseWidthConfigs = [];
InjectorPulseWidthConfigs.push(Calculation_Static);
// InjectorPulseWidthConfigs.push(Calculation_LookupTable);
// InjectorPulseWidthConfigs.push(Calculation_2AxisTable);