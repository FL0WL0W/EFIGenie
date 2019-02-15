var IOServicesIni = {
    BooleanInputService_StaticConfig: [
        { BooleanInputServiceTypeId: { Type: "uint8", Value: 1, Hidden: true } },
        { Value: { Type: "bool", Label: "Static Value" } }
    ],

    BooleanInputServiceConfig: [
        { BooleanInputServiceTypeId: { Type: "uint8", Value: 2, Hidden: true } },
        { Pin: { Type: "uint16", Label: "Pin" } },
        { Inverted: { Type: "bool", Label: "Inverted" } }
    ],

    IBooleanInputServiceConfig: [
        { Selection: { Label: "Input", Index: 1, Selections: [
             { Name: "Static", ConfigName: "BooleanInputService_StaticConfig"},
             { Name: "Pin", ConfigName: "BooleanInputServiceConfig"}
        ] } }
    ],

    ButtonService_PollingConfig : [
        { ButtonServiceTypeId: { Type: "uint8", Value: 1, Hidden: true } },
        { BooleanInputServiceConfig: { ConfigName: "IBooleanInputServiceConfig" } }
    ],

    IButtonServiceConfig : [
        { Selection: { Label: "Button", Selections: [
             { Name: "Polling", ConfigName: "ButtonService_PollingConfig"}
        ] } }
    ],

    BooleanOutputServiceConfig: [
        { BooleanOutputServiceTypeId: { Type: "uint8", Value: 1, Hidden: true } },
        { Pin: { Type: "uint16", Label: "Pin" } },
        { NormalOn: { Type: "bool", Label: "Normal On" } },
        { HighZ: { Type: "bool", Label: "High Z" } }
    ],

    IBooleanOutputServiceConfig: [
        { Selection: { Label: "Output", Selections: [
             { Name: "Pin", ConfigName: "BooleanOutputServiceConfig"}
        ] } }
    ],
    
    FloatInputService_StaticConfig: [
        { FloatInputServiceTypeId: { Type: "uint8", Value: 1, Hidden: true } },
        { Value: { Type: "float", Label: "Static Value" } },
        { ValueDot: { Type: "float", Label: "Static Value Dot" } }
    ],

    FloatInputService_AnalogPolynomialConfig: [
        { FloatInputServiceTypeId: { Type: "uint8", Value: 2, Hidden: true } },
        { AdcPin: { LType: "uint16", Label: "Pin" } },
        { DotSampleRate: { Type: "uint16", Label: "Dot Sample Rate", Value: 1000, Min: 1 } },
        { A: { Type: "formula", Degree: 4, Degree: 4, Label: "Coefficients" } },
        { MinValue: { Type: "float", Label: "Min Value" } },
        { MaxValue: { Type: "float", Label: "Max Value" } }
    ],

    FloatInputService_AnalogInterpolatedTableConfig: [
        { FloatInputServiceTypeId: { Type: "uint8", Value: 4, Hidden: true } },
        { AdcPin: { Type: "uint16", Label: "Pin" } },
        { DotSampleRate: { Type: "uint16", Label: "Dot Sample Rate", Value: 1000, Min: 1 } },
        { MinInputValue: { Type: "float", Label: "Min Input Voltage"  } },
        { MaxInputValue: { LType: "float", Label: "Max Input Voltage", Value: 3.3 } },
        { Resolution: { Type: "uint8", Label: "Resolution", Value: 8, Min: 1, Max: 255 } },
        { TablePointer: { Type: "uint32", Label: "TablePointer", Hidden: true }},
        { Table: { Type: "float", XResolution: "Resolution", Label: "Voltage to Value", XLabel: "Input Voltage", ZLabel: "Value", XMin: "MinInputValue", XMax: "MaxInputValue", Dialog: true } }
    ],

    FloatInputService_FrequencyPolynomialConfig: [
        { FloatInputServiceTypeId: { Type: "uint8", Value: 3, Hidden: true } },
        { PwmPin: { Type: "uint16", Label: "Pin" } },
        { MinFrequency: { Type: "uint16", Label: "Min Frequency", Value: 50, Min: 1 } },
        { DotSampleRate: { Type: "uint16", Label: "Dot Sample Rate", Value: 1000, Min: 1 } },
        { A: { Type: "formula", Degree: 4, Label: "Coefficients" } },
        { MinValue: { Type: "float", Label: "Min Value" } },
        { MaxValue: { Type: "float", Label: "Max Value" } }
    ],

    FloatInputService_FrequencyInterpolatedTableConfig: [
        { FloatInputServiceTypeId: { Type: "uint8", Value: 5, Hidden: true } },
        { PwmPin: { Type: "uint16", Label: "Pin" } },
        { DotSampleRate: { Type: "uint16", Label: "Dot Sample Rate", Value: 1000, Min: 1 } },
        { MinFrequency: { Type: "uint16", Label: "Min Frequency", Value: 50, Min: 1 } },
        { MaxFrequency: { Type: "uint16", Label: "Max Frequency", Value: 100, Min: 1 } },
        { Resolution: { Type: "uint8", Label: "Resolution", Value: 11, Min: 1, Max: 255 } },
        { TablePointer: { Type: "uint32", Label: "TablePointer", Hidden: true }},
        { Table: { Type: "float", XResolution: "Resolution", Label: "Duty Cycle to Value", XLabel: "Duty Cycle", ZLabel: "Value", XMin: "MinFrequency", XMax: "MaxFrequency", Dialog: true } }
    ],

    IFloatInputServiceConfig: [
        { Selection: { Label: "Input", Index: 4, Selections: [
             { Name: "Static", ConfigName: "FloatInputService_StaticConfig"},
             { Name: "Analog Pin Polynomial", ConfigName: "FloatInputService_AnalogPolynomialConfig"},
             { Name: "Analog Pin Lookup Table", ConfigName: "FloatInputService_AnalogInterpolatedTableConfig"},
             { Name: "Frequency Pin Polynomial", ConfigName: "FloatInputService_FrequencyPolynomialConfig"},
             { Name: "Frequency Pin Lookup Table", ConfigName: "FloatInputService_FrequencyInterpolatedTableConfig"}
        ] } }
    ],

    StepperOutputService_StepDirectionControlConfig: [
        { StepperOutputServiceTypeId: { Type: "uint8", Value: 1, Hidden: true } },
        { MaxStepsPerSecond: { Type: "uint16", Label: "Steps/Second", Value: 100, Min: 1 } },
        { StepWidth: { Type: "float", Label: "Step Pulse Width (ms)", Value: 0.005, Max: 1, DisplayMultiplier: 1000 } },
        { StepBooleanOutputServiceConfig: { ConfigName: "IBooleanOutputServiceConfig", Label: "Step Output Config"} },
        { DirectionBooleanOutputServiceConfig: { ConfigName: "IBooleanOutputServiceConfig", Label: "Direction Output Config"} }
    ],

    StepperOutputService_FullStepControlConfig: [
        { StepperOutputServiceTypeId: { Type: "uint8", Value: 2, Hidden: true } },
        { MaxStepsPerSecond: { Type: "uint16", Label: "Steps/Second", Value: 100, Min: 1 } },
        { StepWidth: { Type: "float", Label: "Step Pulse Width (ms)", Value: 0.005, Max: 1, DisplayMultiplier: 1000 } },
        { APlusBooleanOutputServiceConfig: { ConfigName: "IBooleanOutputServiceConfig", Label: "A+"} },
        { AMinusBooleanOutputServiceConfig: { ConfigName: "IBooleanOutputServiceConfig", Label: "A-"} },
        { BPlusBooleanOutputServiceConfig: { ConfigName: "IBooleanOutputServiceConfig", Label: "B+"} },
        { BMinusBooleanOutputServiceConfig: { ConfigName: "IBooleanOutputServiceConfig", Label: "B-"} }
    ],

    StepperOutputService_HalfStepControlConfig: [
        { StepperOutputServiceTypeId: { Type: "uint8", Value: 3, Hidden: true } },
        { MaxStepsPerSecond: { Type: "uint16", Label: "Steps/Second", Value: 100, Min: 1 } },
        { StepWidth: { Type: "float", Label: "Step Pulse Width (ms)", Value: 0.005, Max: 1, DisplayMultiplier: 1000 } },
        { APlusBooleanOutputServiceConfig: { ConfigName: "IBooleanOutputServiceConfig", Label: "A+"} },
        { AMinusBooleanOutputServiceConfig: { ConfigName: "IBooleanOutputServiceConfig", Label: "A-"} },
        { BPlusBooleanOutputServiceConfig: { ConfigName: "IBooleanOutputServiceConfig", Label: "B+"} },
        { BMinusBooleanOutputServiceConfig: { ConfigName: "IBooleanOutputServiceConfig", Label: "B-"} }
    ],

    StepperOutputService_StaticStepCalibrationWrapperConfig: [
        { StepperOutputServiceTypeId: { Type: "uint8", Value: 5, Hidden: true } },
        { StepsOnCalibration: { Type: "int32", Label: "Reset Steps", Value: 300 } },
        { StepperConfig: { ConfigName: "IStepperOutputServiceConfig" } }
    ],

    IStepperOutputServiceConfig: [
        { Selection: { Label: "Input", Selections: [
             { Name: "Step Direction", ConfigName: "StepperOutputService_StepDirectionControlConfig"},
             { Name: "Full Step Coil Control", ConfigName: "StepperOutputService_FullStepControlConfig"},
             { Name: "Half Step Coil Control", ConfigName: "StepperOutputService_HalfStepControlConfig"},
             { Name: "Step Calibration Wrapper", ConfigName: "StepperOutputService_StaticStepCalibrationWrapperConfig"}
        ] } }
    ],

    FloatOutputService_PwmPolynomialConfig: [
        { FloatOutputServiceTypeId: { Type: "uint8", Value: 1, Hidden: true } },
        { PwmPin: { Type: "uint16", Label: "Pin" } },
        { Frequency: { Type: "uint16", Label: "Frequency", Value: 50, Min: 1 } },
        { A: { Type: "formula", Degree: 4, Label: "Coefficients", DisplayMultiplier: 100 } },
        { MinDutyCycle: { Type: "float", Label: "Min Duty Cycle", Max: 100, DisplayMultiplier: 100 } },
        { MaxDutyCycle: { Type: "float", Label: "Max Duty Cycle", Max: 100, DisplayMultiplier: 100 } }
    ],

    FloatOutputService_PwmInterpolatedTableConfig: [
        { FloatOutputServiceTypeId: { Type: "uint8", Value: 3, Hidden: true } },
        { PwmPin: { Type: "uint16", Label: "Pin" } },
        { Frequency: { Type: "uint16", Label: "Frequency", Value: 50, Min: 1 } },
        { MinValue: { Type: "float", Label: "Min Value" } },
        { MaxValue: { Type: "float", Label: "Max Value" } },
        { Resolution: { Type: "uint8", Label: "Resolution", Value: 8, Min: 1, Max: 255 } },
        { TablePointer: { Type: "uint32", Label: "TablePointer", Hidden: true }},
        { Table: { Type: "float", XResolution: "Resolution", Label: "Value to Duty Cycle", XLabel: "Value", ZLabel: "Duty Cycle", Max: 100, XMin: "MinValue", XMax: "MaxValue", DisplayMultiplier: 100, Dialog: true } }
    ],

    FloatOutputService_StepperPolynomialConfig: [
        { FloatOutputServiceTypeId: { Type: "uint8", Value: 2, Hidden: true } },
        { A: { Type: "formula", Degree: 4, Label: "Coefficients" } },
        { MinStepPosition: { Type: "int32", Label: "Min Step Position" } },
        { MaxStepPosition: { Type: "int32", Label: "Max Step Position" } },
        { StepperConfig: { ConfigName: "IStepperOutputServiceConfig" } }
    ],

    FloatOutputService_StepperInterpolatedTableConfig: [
        { FloatOutputServiceTypeId: { Type: "uint8", Value: 4, Hidden: true } },
        { MinValue: { Type: "float", Label: "Min Value" } },
        { MaxValue: { Type: "float", Label: "Max Value" } },
        { Resolution: { Type: "uint8", Label: "Resolution", Value: 8, Min: 1, Max: 255 } },
        { TablePointer: { Type: "uint32", Label: "TablePointer", Hidden: true }},
        { Table: { Type: "float", XResolution: "Resolution", Label: "Value to Steps", XLabel: "Value", ZLabel: "Steps", XMin: "MinValue", XMax: "MaxValue", Dialog: true } },
        { StepperConfig: { ConfigName: "IStepperOutputServiceConfig" } }
    ],

    IFloatOutputServiceConfig: [
        { Selection: { Label: "Output", Index: 1, Selections: [
             { Name: "PWM Pin Polynomial", ConfigName: "FloatOutputService_PwmPolynomialConfig"},
             { Name: "PWM Pin Lookup Table", ConfigName: "FloatOutputService_PwmInterpolatedTableConfig"},
             { Name: "Stepper Polynomial", ConfigName: "FloatOutputService_StepperPolynomialConfig"},
             { Name: "Stepper Lookup Table", ConfigName: "FloatOutputService_StepperInterpolatedTableConfig"}
        ] } }
    ],

    Main: [
        { BooleanInputService: { ConfigName: "IBooleanInputServiceConfig", Label: "BooleanInputService", WrapInConfigContainer: true } },
        { ButtonService: { ConfigName: "IButtonServiceConfig", Label: "ButtonService", WrapInConfigContainer: true } },
        { BooleanOutputService: { ConfigName: "IBooleanOutputServiceConfig", Label: "BooleanOutputService", WrapInConfigContainer: true } },
        { FloatInputService: { ConfigName: "IFloatInputServiceConfig", Label: "FloatInputService", WrapInConfigContainer: true } },
        { StepperOutputService: { ConfigName: "IStepperOutputServiceConfig", Label: "StepperOutputService", WrapInConfigContainer: true } },
        { FloatOutputService: { ConfigName: "IFloatOutputServiceConfig", Label: "FloatOutputService", WrapInConfigContainer: true } }
    ],
};