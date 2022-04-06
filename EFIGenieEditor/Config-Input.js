var CurrentTickVariableID = 0;
var RawInputConfigs = [];
var InputConfigs = [
    { Group: `Generic Pin Input`, Configs: RawInputConfigs},
    { Group: `Custom Input`, Configs: [ 
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
        Name: `Blue pill: STM32F103C`,
        Overlay: `images/STM32F103C_Overlay.png`,
        OverlayWidth: 844,
        OverlayElementHeight: 24,
        Pins: [
            { Name: `PC_13`, Value: (16*2 + 13), SupportedModes: `digital digitalinterrupt`, OverlayX: 844, OverlayY: 174, Align: `right`},
            { Name: `PC_14`, Value: (16*2 + 14), SupportedModes: `digital digitalinterrupt`, OverlayX: 844, OverlayY: 200, Align: `right`},
            { Name: `PC_15`, Value: (16*2 + 15), SupportedModes: `digital digitalinterrupt`, OverlayX: 844, OverlayY: 226, Align: `right`},
            { Name: `PA_0`,  Value: (16*0 + 0 ), SupportedModes: `digital digitalinterrupt analog`, OverlayX: 844, OverlayY: 252, Align: `right`},
            { Name: `PA_1`,  Value: (16*0 + 1 ), SupportedModes: `digital digitalinterrupt analog pwm` , OverlayX: 844, OverlayY: 278, Align: `right`},
            { Name: `PA_2`,  Value: (16*0 + 2 ), SupportedModes: `digital digitalinterrupt analog pwm` , OverlayX: 844, OverlayY: 304, Align: `right`},
            { Name: `PA_3`,  Value: (16*0 + 3 ), SupportedModes: `digital digitalinterrupt analog pwm` , OverlayX: 844, OverlayY: 330, Align: `right`},
            { Name: `PA_4`,  Value: (16*0 + 4 ), SupportedModes: `digital digitalinterrupt analog`, OverlayX: 844, OverlayY: 356, Align: `right`},
            { Name: `PA_5`,  Value: (16*0 + 5 ), SupportedModes: `digital digitalinterrupt analog`, OverlayX: 844, OverlayY: 382, Align: `right`},
            { Name: `PA_6`,  Value: (16*0 + 6 ), SupportedModes: `digital digitalinterrupt analog pwm` , OverlayX: 844, OverlayY: 408, Align: `right`},
            { Name: `PA_7`,  Value: (16*0 + 7 ), SupportedModes: `digital digitalinterrupt analog pwm` , OverlayX: 844, OverlayY: 434, Align: `right`},
            { Name: `PB_0`,  Value: (16*1 + 0 ), SupportedModes: `digital digitalinterrupt analog pwm` , OverlayX: 844, OverlayY: 460, Align: `right`},
            { Name: `PB_1`,  Value: (16*1 + 1 ), SupportedModes: `digital digitalinterrupt analog pwm` , OverlayX: 844, OverlayY: 486, Align: `right`},
            { Name: `PB_10`, Value: (16*1 + 10), SupportedModes: `digital digitalinterrupt pwm` , OverlayX: 844, OverlayY: 512, Align: `right`},
            { Name: `PB_11`, Value: (16*1 + 11), SupportedModes: `digital digitalinterrupt pwm` , OverlayX: 844, OverlayY: 538, Align: `right`},
            { Name: `PB_9`,  Value: (16*1 + 9 ), SupportedModes: `digital digitalinterrupt`, OverlayX: 844, OverlayY: 226, Align: `left`},
            { Name: `PB_8`,  Value: (16*1 + 8 ), SupportedModes: `digital digitalinterrupt`, OverlayX: 844, OverlayY: 252, Align: `left`},
            { Name: `PB_7`,  Value: (16*1 + 7 ), SupportedModes: `digital digitalinterrupt`, OverlayX: 844, OverlayY: 278, Align: `left`},
            { Name: `PB_6`,  Value: (16*1 + 6 ), SupportedModes: `digital digitalinterrupt`, OverlayX: 844, OverlayY: 304, Align: `left`},
            { Name: `PB_5`,  Value: (16*1 + 5 ), SupportedModes: `digital digitalinterrupt pwm` , OverlayX: 844, OverlayY: 330, Align: `left`},
            { Name: `PB_4`,  Value: (16*1 + 4 ), SupportedModes: `digital digitalinterrupt pwm` , OverlayX: 844, OverlayY: 356, Align: `left`},
            { Name: `PB_3`,  Value: (16*1 + 3 ), SupportedModes: `digital digitalinterrupt pwm` , OverlayX: 844, OverlayY: 382, Align: `left`},
            { Name: `PA_15`, Value: (16*0 + 15), SupportedModes: `digital digitalinterrupt pwm` , OverlayX: 844, OverlayY: 408, Align: `left`},
            { Name: `PA_12`, Value: (16*0 + 12), SupportedModes: `digital digitalinterrupt`, OverlayX: 844, OverlayY: 434, Align: `left`},
            { Name: `PA_11`, Value: (16*0 + 11), SupportedModes: `digital digitalinterrupt pwm` , OverlayX: 844, OverlayY: 460, Align: `left`},
            { Name: `PA_10`, Value: (16*0 + 10), SupportedModes: `digital digitalinterrupt pwm` , OverlayX: 844, OverlayY: 486, Align: `left`},
            { Name: `PA_9`,  Value: (16*0 + 9 ), SupportedModes: `digital digitalinterrupt pwm` , OverlayX: 844, OverlayY: 512, Align: `left`},
            { Name: `PA_8`,  Value: (16*0 + 8 ), SupportedModes: `digital digitalinterrupt pwm` , OverlayX: 844, OverlayY: 538, Align: `left`},
            { Name: `PB_15`, Value: (16*1 + 15), SupportedModes: `digital digitalinterrupt pwm` , OverlayX: 844, OverlayY: 564, Align: `left`},
            { Name: `PB_14`, Value: (16*1 + 14), SupportedModes: `digital digitalinterrupt pwm` , OverlayX: 844, OverlayY: 590, Align: `left`},
            { Name: `PB_13`, Value: (16*1 + 13), SupportedModes: `digital digitalinterrupt pwm` , OverlayX: 844, OverlayY: 616, Align: `left`},
            { Name: `PB_12`, Value: (16*1 + 12), SupportedModes: `digital digitalinterrupt`, OverlayX: 844, OverlayY: 642, Align: `left`},
        ]
    },
    STM32F401C : { 
        Name: `Black pill: STM32F401C/STM32F411C`,
        Overlay: `images/STM32F401C_Overlay.png`,
        OverlayWidth: 577,
        OverlayElementHeight: 22,
        Pins: [
            { Name: `PC_13`, Value: (16*2 + 13), SupportedModes: `digital digitalinterrupt`, OverlayX: 577, OverlayY: 132, Align: `right`},
            { Name: `PC_14`, Value: (16*2 + 14), SupportedModes: `digital digitalinterrupt`, OverlayX: 577, OverlayY: 154, Align: `right`},
            { Name: `PC_15`, Value: (16*2 + 15), SupportedModes: `digital digitalinterrupt`, OverlayX: 577, OverlayY: 176, Align: `right`},
            { Name: `PA_0`,  Value: (16*0 + 0 ), SupportedModes: `digital digitalinterrupt analog`, OverlayX: 577, OverlayY: 220, Align: `right`},
            { Name: `PA_1`,  Value: (16*0 + 1 ), SupportedModes: `digital digitalinterrupt analog pwm` , OverlayX: 577, OverlayY: 242, Align: `right`},
            { Name: `PA_2`,  Value: (16*0 + 2 ), SupportedModes: `digital digitalinterrupt analog pwm` , OverlayX: 577, OverlayY: 264, Align: `right`},
            { Name: `PA_3`,  Value: (16*0 + 3 ), SupportedModes: `digital digitalinterrupt analog pwm` , OverlayX: 577, OverlayY: 286, Align: `right`},
            { Name: `PA_4`,  Value: (16*0 + 4 ), SupportedModes: `digital digitalinterrupt analog`, OverlayX: 577, OverlayY: 308, Align: `right`},
            { Name: `PA_5`,  Value: (16*0 + 5 ), SupportedModes: `digital digitalinterrupt analog`, OverlayX: 577, OverlayY: 330, Align: `right`},
            { Name: `PA_6`,  Value: (16*0 + 6 ), SupportedModes: `digital digitalinterrupt analog pwm` , OverlayX: 577, OverlayY: 352, Align: `right`},
            { Name: `PA_7`,  Value: (16*0 + 7 ), SupportedModes: `digital digitalinterrupt analog pwm` , OverlayX: 577, OverlayY: 374, Align: `right`},
            { Name: `PB_0`,  Value: (16*1 + 0 ), SupportedModes: `digital digitalinterrupt analog pwm` , OverlayX: 577, OverlayY: 396, Align: `right`},
            { Name: `PB_1`,  Value: (16*1 + 1 ), SupportedModes: `digital digitalinterrupt analog pwm` , OverlayX: 577, OverlayY: 418, Align: `right`},
            { Name: `PB_2`,  Value: (16*1 + 2 ), SupportedModes: `digital digitalinterrupt pwm` , OverlayX: 577, OverlayY: 440, Align: `right`},
            { Name: `PB_10`, Value: (16*1 + 10), SupportedModes: `digital digitalinterrupt pwm` , OverlayX: 577, OverlayY: 462, Align: `right`},
            { Name: `PB_9`,  Value: (16*1 + 9 ), SupportedModes: `digital digitalinterrupt`, OverlayX: 577, OverlayY: 176, Align: `left`},
            { Name: `PB_8`,  Value: (16*1 + 8 ), SupportedModes: `digital digitalinterrupt`, OverlayX: 577, OverlayY: 198, Align: `left`},
            { Name: `PB_7`,  Value: (16*1 + 7 ), SupportedModes: `digital digitalinterrupt`, OverlayX: 577, OverlayY: 220, Align: `left`},
            { Name: `PB_6`,  Value: (16*1 + 6 ), SupportedModes: `digital digitalinterrupt`, OverlayX: 577, OverlayY: 242, Align: `left`},
            { Name: `PB_5`,  Value: (16*1 + 5 ), SupportedModes: `digital digitalinterrupt pwm` , OverlayX: 577, OverlayY: 264, Align: `left`},
            { Name: `PB_4`,  Value: (16*1 + 4 ), SupportedModes: `digital digitalinterrupt pwm` , OverlayX: 577, OverlayY: 286, Align: `left`},
            { Name: `PB_3`,  Value: (16*1 + 3 ), SupportedModes: `digital digitalinterrupt pwm` , OverlayX: 577, OverlayY: 308, Align: `left`},
            { Name: `PA_15`, Value: (16*0 + 15), SupportedModes: `digital digitalinterrupt pwm` , OverlayX: 577, OverlayY: 330, Align: `left`},
            { Name: `PA_12`, Value: (16*0 + 12), SupportedModes: `digital digitalinterrupt`, OverlayX: 577, OverlayY: 352, Align: `left`},
            { Name: `PA_11`, Value: (16*0 + 11), SupportedModes: `digital digitalinterrupt pwm` , OverlayX: 577, OverlayY: 374, Align: `left`},
            { Name: `PA_10`, Value: (16*0 + 10), SupportedModes: `digital digitalinterrupt pwm` , OverlayX: 577, OverlayY: 396, Align: `left`},
            { Name: `PA_9`,  Value: (16*0 + 9 ), SupportedModes: `digital digitalinterrupt pwm` , OverlayX: 577, OverlayY: 418, Align: `left`},
            { Name: `PA_8`,  Value: (16*0 + 8 ), SupportedModes: `digital digitalinterrupt pwm` , OverlayX: 577, OverlayY: 440, Align: `left`},
            { Name: `PB_15`, Value: (16*1 + 15), SupportedModes: `digital digitalinterrupt pwm` , OverlayX: 577, OverlayY: 462, Align: `left`},
            { Name: `PB_14`, Value: (16*1 + 14), SupportedModes: `digital digitalinterrupt pwm` , OverlayX: 577, OverlayY: 484, Align: `left`},
            { Name: `PB_13`, Value: (16*1 + 13), SupportedModes: `digital digitalinterrupt pwm` , OverlayX: 577, OverlayY: 506, Align: `left`},
            { Name: `PB_12`, Value: (16*1 + 12), SupportedModes: `digital digitalinterrupt`, OverlayX: 577, OverlayY: 528, Align: `left`},
        ]
    }
};

BooleanOutputConfigs = [];

MapConfigs = [];
InputConfigs.unshift({Group: `MAP Sensors`, Configs: MapConfigs});

ReluctorConfigs = [];
InputConfigs.unshift({Group: `Reluctor Decoders`, Configs: ReluctorConfigs});
ReluctorFactoryIDs = {
    Offset: 30000,
    GM24X: 1,
    Universal1X: 2,
    UniversalMissintTooth: 3
};