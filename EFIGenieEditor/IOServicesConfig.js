var IOServicesIni = {
    BlankConfig: { Variables : [
    ] },

    NoneServiceConfig: { Variables : [
        { NoneServiceConfigServiceId: { Type: "uint8", Value: 0, Static: true }}
    ] },

    BooleanInputService_StaticConfig: { Variables : [
        { BooleanInputService_StaticConfigTypeId: { Type: "uint8", Value: 1, Static: true } },
        { BooleanValue: { Type: "bool", Label: "Static Value" } }
    ] },

    BooleanInputServiceConfig: { Variables : [
        { BooleanInputServiceConfigTypeId: { Type: "uint8", Value: 2, Static: true } },
        { Pin: { Type: "uint16", Label: "Pin" } },
        { Inverted: { Type: "bool", Label: "Inverted" } }
    ] },

    IBooleanInputServiceConfig: { Variables : [
        { BUILDER_IBOOLEANINPUTSERVICE: { Type: "uint16", Value: 2001, Static: true, ExcludeFromBin: "./NoBuilder" } },
        { InstanceId: { Type: "uint8", Value: "./Instance", Static: true, ExcludeFromBin: "./NoBuilder" } },
        { Selection: { Label: "Input", Selections: [
            { Name: "None", IniName: "NoneServiceConfig" },
            { Name: "Static", IniName: "BooleanInputService_StaticConfig" },
            { Name: "Pin", IniName: "BooleanInputServiceConfig" }
        ] } }
    ] },

    ButtonService_PollingConfig : { Variables : [
        { ButtonService_PollingConfigTypeId: { Type: "uint8", Value: 1, Static: true } },
        { BooleanInputServiceConfig: { IniName: "IBooleanInputServiceConfig" } }
    ] },

    IButtonServiceConfig : { Variables : [
        { BUILDER_IBUTTONSERVICE: { Type: "uint16", Value: 2002, Static: true, ExcludeFromBin: "./NoBuilder" } },
        { InstanceId: { Type: "uint8", Value: "./Instance", Static: true, ExcludeFromBin: "./NoBuilder" } },
        { Selection: { Label: "Button", Selections: [
            { Name: "None", IniName: "NoneServiceConfig" },
            { Name: "Polling", IniName: "ButtonService_PollingConfig" }
        ] } }
    ] },

    BooleanOutputServiceConfig: { Variables : [
        { BooleanOutputServiceConfigTypeId: { Type: "uint8", Value: 1, Static: true } },
        { Pin: { Type: "uint16", Label: "Pin" } },
        { NormalOn: { Type: "bool", Label: "Normal On" } },
        { HighZ: { Type: "bool", Label: "High Z" } }
    ] },

    IBooleanOutputServiceConfig: { Variables : [
        { BUILDER_IBOOLEANOUTPUTSERVICE: { Type: "uint16", Value: 3001, Static: true, ExcludeFromBin: "./NoBuilder" } },
        { InstanceId: { Type: "uint8", Value: "./Instance", Static: true, ExcludeFromBin: "./NoBuilder" } },
        { Selection: { Label: "Output", Selections: [
            { Name: "None", IniName: "NoneServiceConfig" },
            { Name: "Pin", IniName: "BooleanOutputServiceConfig" }
        ] } }
    ] },
    
    FloatInputService_StaticConfig: { Variables : [
        { FloatInputService_StaticConfigTypeId: { Type: "uint8", Value: 1, Static: true } },
        { FloatValue: { Type: "float", Label: "Static Value", Units: "./ValueUnits" } },
        { FloatValueDot: { Type: "float", Label: "Static Value Dot", Units: "PerSecond(./ValueUnits)" } }
    ] },

    FloatInputService_AnalogPolynomialConfig: { Variables : [
        { FloatInputService_AnalogPolynomialConfigTypeId: { Type: "uint8", Value: 2, Static: true } },
        { Pin: { Type: "uint16", Label: "Pin" } },
        { DotSampleRate: { Type: "uint16", Label: "Dot Sample Rate", Value: 1000, Min: 1, Units: FrequencyUnits } },
        { APA: { Type: "formula", Degree: 4, Label: "Coefficients", Units: "./ValueUnits" } },
        { MinValue: { Type: "float", Label: "Min Value", Units: "./ValueUnits" } },
        { MaxValue: { Type: "float", Label: "Max Value", Units: "./ValueUnits" } }
    ] },

    FloatInputService_AnalogInterpolatedTableConfig: { Variables : [
        { FloatInputService_AnalogInterpolatedTableConfigTypeId: { Type: "uint8", Value: 4, Static: true } },
        { Pin: { Type: "uint16", Label: "Pin" } },
        { DotSampleRate: { Type: "uint16", Label: "Dot Sample Rate", Value: 1000, Min: 1, Units: FrequencyUnits } },
        { AMinInputValue: { Type: "float", Label: "Min Input", Units: VoltUnits } },
        { AMaxInputValue: { Type: "float", Label: "Max Input", Value: 3.3, Units: VoltUnits } },
        { AITResolution: { Type: "uint8", Label: "Resolution", Value: 8, Min: 1, Max: 255 } },
        { AITTable: { Type: "float", XResolution: ".AITResolution", Label: "Voltage to Value", XLabel: "Input Voltage", ZLabel: "Value", XMin: ".AMinInputValue", XMax: ".AMaxInputValue", XUnits: VoltUnits, ZUnits: "./ValueUnits", Dialog: true } }
    ] },

    FloatInputService_FrequencyPolynomialConfig: { Variables : [
        { FloatInputService_FrequencyPolynomialConfigTypeId: { Type: "uint8", Value: 3, Static: true } },
        { Pin: { Type: "uint16", Label: "Pin" } },
        { FMinFrequency: { Type: "uint16", Label: "Min Frequency", Value: 50, Min: 1, Units: FrequencyUnits } },
        { DotSampleRate: { Type: "uint16", Label: "Dot Sample Rate", Value: 1000, Min: 1, Units: FrequencyUnits } },
        { FPA: { Type: "formula", Degree: 4, Label: "Coefficients" } },
        { MinValue: { Type: "float", Label: "Min Value", Units: "./ValueUnits" } },
        { MaxValue: { Type: "float", Label: "Max Value", Units: "./ValueUnits" } }
    ] },

    FloatInputService_FrequencyInterpolatedTableConfig: { Variables : [
        { FloatInputService_FrequencyInterpolatedTableConfigTypeId: { Type: "uint8", Value: 5, Static: true } },
        { Pin: { Type: "uint16", Label: "Pin" } },
        { DotSampleRate: { Type: "uint16", Label: "Dot Sample Rate", Value: 1000, Min: 1, Units: FrequencyUnits } },
        { FMinFrequency: { Type: "uint16", Label: "Min Frequency", Value: 50, Min: 1, Units: FrequencyUnits } },
        { FMaxFrequency: { Type: "uint16", Label: "Max Frequency", Value: 100, Min: 1, Units: FrequencyUnits } },
        { FITResolution: { Type: "uint8", Label: "Resolution", Value: 11, Min: 1, Max: 255 } },
        { FITTable: { Type: "float", XResolution: "FITResolution", Label: ".Frequency to Value", XLabel: "Frequency", ZLabel: "Value", XMin: ".FMinFrequency", XMax: ".FMaxFrequency", XUnits: FrequencyUnits, ZUnits: "./ValueUnits", Dialog: true } }
    ] },

    FloatInputService_FaultDetectionWrapperConfig: { Variables : [
        { FloatInputService_FaultDetectionWrapperConfigTypeId: { Type: "uint8", Value: 6, Static: true } },
        { MinValue: { Type: "float", Label: "Min Value", Units: "./ValueUnits" } },
        { MaxValue: { Type: "float", Label: "Max Value", Units: "./ValueUnits" } },
        { DefaultValue: { Type: "float", Label: "Default Value", Units: "./ValueUnits" } },
        { FloatInputService: { IniName: "IFloatInputServiceConfig" } }
    ] },

    IFloatInputServiceConfig: { Variables : [
        { BUILDER_IFLOATINPUTSERVICE: { Type: "uint16", Value: 2003, Static: true, ExcludeFromBin: "./NoBuilder" } },
        { InstanceId: { Type: "uint8", Value: "./Instance", Static: true, ExcludeFromBin: "./NoBuilder" } },
        { Selection: { Label: "Input", Selections: [
            { Name: "None", IniName: "NoneServiceConfig" },
            { Name: "Static", IniName: "FloatInputService_StaticConfig" },
            { Name: "Analog Pin Polynomial", IniName: "FloatInputService_AnalogPolynomialConfig" },
            { Name: "Analog Pin Lookup Table", IniName: "FloatInputService_AnalogInterpolatedTableConfig" },
            { Name: "Frequency Pin Polynomial", IniName: "FloatInputService_FrequencyPolynomialConfig" },
            { Name: "Frequency Pin Lookup Table", IniName: "FloatInputService_FrequencyInterpolatedTableConfig" },
            { Name: "Fault Detection Wrapper", IniName: "FloatInputService_FaultDetectionWrapperConfig" }
        ] } }
    ] },

    StepperOutputService_StepDirectionControlConfig: { Variables : [
        { StepperOutputService_StepDirectionControlConfigTypeId: { Type: "uint8", Value: 1, Static: true } },
        { MaxStepsPerSecond: { Type: "uint16", Label: "Steps/Second", Value: 100, Min: 1 } },
        { StepWidth: { Type: "float", Label: "Step Pulse Width", Value: 0.005, Max: 1} },
        { StepBooleanOutputServiceConfig: { IniName: "IBooleanOutputServiceConfig", Label: "Step Output Config" } },
        { DirectionBooleanOutputServiceConfig: { IniName: "IBooleanOutputServiceConfig", Label: "Direction Output Config" } }
    ] },

    StepperOutputService_FullStepControlConfig: { Variables : [
        { StepperOutputService_FullStepControlConfigTypeId: { Type: "uint8", Value: 2, Static: true } },
        { MaxStepsPerSecond: { Type: "uint16", Label: "Steps/Second", Value: 100, Min: 1 } },
        { StepWidth: { Type: "float", Label: "Step Pulse Width", Value: 0.005, Max: 1, Units: TimeUnits } },
        { APlusBooleanOutputServiceConfig: { IniName: "IBooleanOutputServiceConfig", Label: "A+" } },
        { AMinusBooleanOutputServiceConfig: { IniName: "IBooleanOutputServiceConfig", Label: "A-" } },
        { BPlusBooleanOutputServiceConfig: { IniName: "IBooleanOutputServiceConfig", Label: "B+" } },
        { BMinusBooleanOutputServiceConfig: { IniName: "IBooleanOutputServiceConfig", Label: "B-" } }
    ] },

    StepperOutputService_HalfStepControlConfig: { Variables : [
        {StepperOutputService_HalfStepControlConfigTypeId: { Type: "uint8", Value: 3, Static: true } },
        { MaxStepsPerSecond: { Type: "uint16", Label: "Steps/Second", Value: 100, Min: 1 } },
        { StepWidth: { Type: "float", Label: "Step Pulse Width", Value: 0.005, Max: 1, Units: TimeUnits } },
        { APlusBooleanOutputServiceConfig: { IniName: "IBooleanOutputServiceConfig", Label: "A+" } },
        { AMinusBooleanOutputServiceConfig: { IniName: "IBooleanOutputServiceConfig", Label: "A-" } },
        { BPlusBooleanOutputServiceConfig: { IniName: "IBooleanOutputServiceConfig", Label: "B+" } },
        { BMinusBooleanOutputServiceConfig: { IniName: "IBooleanOutputServiceConfig", Label: "B-" } }
    ] },

    StepperOutputService_StaticStepCalibrationWrapperConfig: { Variables : [
        { StepperOutputService_StaticStepCalibrationWrapperConfigTypeId: { Type: "uint8", Value: 4, Static: true } },
        { StepsOnCalibration: { Type: "int32", Label: "Reset Steps", Value: 300 } },
        { StepperConfig: { IniName: "IStepperOutputServiceConfig" } }
    ] },

    IStepperOutputServiceConfig: { Variables : [
        { BUILDER_ISTEPPEROUTPUTSERVICE: { Type: "uint16", Value: 3003, Static: true, ExcludeFromBin: "./NoBuilder" } },
        { InstanceId: { Type: "uint8", Value: "./Instance", Static: true, ExcludeFromBin: "./NoBuilder" } },
        { Selection: { Label: "Input", Selections: [
            { Name: "None", IniName: "NoneServiceConfig" },
            { Name: "Step Direction", IniName: "StepperOutputService_StepDirectionControlConfig" },
            { Name: "Full Step Coil Control", IniName: "StepperOutputService_FullStepControlConfig" },
            { Name: "Half Step Coil Control", IniName: "StepperOutputService_HalfStepControlConfig" },
            { Name: "Step Calibration Wrapper", IniName: "StepperOutputService_StaticStepCalibrationWrapperConfig" }
        ] } }
    ] },

    FloatOutputService_PwmPolynomialConfig: { Variables : [
        { FloatOutputService_PwmPolynomialConfigTypeId: { Type: "uint8", Value: 1, Static: true } },
        { Pin: { Type: "uint16", Label: "Pin" } },
        { PFrequency: { Type: "uint16", Label: "Frequency", Value: 50, Min: 1, FrequencyUnits } },
        { PA: { Type: "formula", Degree: 4, Label: "Coefficients" } },
        { PMinDutyCycle: { Type: "float", Label: "Min Duty Cycle", Max: 1, Units: PercentUnits } },
        { PMaxDutyCycle: { Type: "float", Label: "Max Duty Cycle", Max: 1, Units: PercentUnits } }
    ] },

    FloatOutputService_PwmInterpolatedTableConfig: { Variables : [
        { FloatOutputService_PwmInterpolatedTableConfigTypeId: { Type: "uint8", Value: 3, Static: true } },
        { Pin: { Type: "uint16", Label: "Pin" } },
        { PFrequency: { Type: "uint16", Label: "Frequency", Value: 50, Min: 1, FrequencyUnits } },
        { MinValue: { Type: "float", Label: "Min Value", Units: "./ValueUnits" } },
        { MaxValue: { Type: "float", Label: "Max Value", Units: "./ValueUnits" } },
        { PResolution: { Type: "uint8", Label: "Resolution", Value: 8, Min: 1, Max: 255 } },
        { PTable: { Type: "float", XResolution: ".PResolution", Label: "Value to Duty Cycle", XLabel: "Value", ZLabel: "Duty Cycle", Max: 1, XMin: ".MinValue", XMax: ".MaxValue", XUnits: "./ValueUnits", ZUnits: PercentUnits, Dialog: true } }
    ] },

    FloatOutputService_StepperPolynomialConfig: { Variables : [
        { FloatOutputService_StepperPolynomialConfigTypeId: { Type: "uint8", Value: 2, Static: true } },
        { SA: { Type: "formula", Degree: 4, Label: "Coefficients" } },
        { SMinStepPosition: { Type: "int32", Label: "Min Step Position" } },
        { SMaxStepPosition: { Type: "int32", Label: "Max Step Position" } },
        { StepperConfig: { IniName: "IStepperOutputServiceConfig" } }
    ] },

    FloatOutputService_StepperInterpolatedTableConfig: { Variables : [
        { FloatOutputService_StepperInterpolatedTableConfigTypeId: { Type: "uint8", Value: 4, Static: true } },
        { MinValue: { Type: "float", Label: "Min Value", Units: "./ValueUnits" } },
        { MaxValue: { Type: "float", Label: "Max Value", Units: "./ValueUnits" } },
        { SResolution: { Type: "uint8", Label: "Resolution", Value: 8, Min: 1, Max: 255 } },
        { STable: { Type: "float", XResolution: ".SResolution", Label: "Value to Steps", XLabel: "Value", ZLabel: "Steps", XMin: ".MinValue", XMax: ".MaxValue", XUnits: "./ValueUnits", Dialog: true } },
        { StepperConfig: { IniName: "IStepperOutputServiceConfig" } }
    ] },

    IFloatOutputServiceConfig: { Variables : [
        { BUILDER_IFLOATOUTPUTSERVICE: { Type: "uint16", Value: 3002, Static: true, ExcludeFromBin: "./NoBuilder" } },
        { InstanceId: { Type: "uint8", Value: "./Instance", Static: true, ExcludeFromBin: "./NoBuilder" } },
        { Selection: { Label: "Output", Selections: [
            { Name: "None", IniName: "NoneServiceConfig" },
            { Name: "PWM Pin Polynomial", IniName: "FloatOutputService_PwmPolynomialConfig" },
            { Name: "PWM Pin Lookup Table", IniName: "FloatOutputService_PwmInterpolatedTableConfig" },
            { Name: "Stepper Polynomial", IniName: "FloatOutputService_StepperPolynomialConfig" },
            { Name: "Stepper Lookup Table", IniName: "FloatOutputService_StepperInterpolatedTableConfig" }
        ] } }
    ] },

    Main: { Tabbed: true, Variables: [
        { BooleanInputService: { IniName: "IBooleanInputServiceConfig", Label: "BooleanInputService" } },
        { ButtonService: { IniName: "IButtonServiceConfig", Label: "ButtonService" } },
        { BooleanOutputService: { IniName: "IBooleanOutputServiceConfig", Label: "BooleanOutputService" } },
        { FloatInputService: { IniName: "IFloatInputServiceConfig", Label: "FloatInputService" } },
        { StepperOutputService: { IniName: "IStepperOutputServiceConfig", Label: "StepperOutputService" } },
        { FloatOutputService: { IniName: "IFloatOutputServiceConfig", Label: "FloatOutputService" } }
    ] }
};