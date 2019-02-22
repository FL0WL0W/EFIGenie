var IOServicesIni = {
    BlankConfig: { Variables : [
    ] },

    NoneServiceConfig: { Variables : [
        { NoneServiceConfigServiceId: { Type: "uint8", Value: 0, Hidden:true }}
    ] },

    BooleanInputService_StaticConfig: { Variables : [
        { BooleanInputService_StaticConfigTypeId: { Type: "uint8", Value: 1, Hidden: true } },
        { Value: { Type: "bool", Label: "Static Value" } }
    ] },

    BooleanInputServiceConfig: { Variables : [
        { BooleanInputServiceConfigTypeId: { Type: "uint8", Value: 2, Hidden: true } },
        { Pin: { Type: "uint16", Label: "Pin" } },
        { Inverted: { Type: "bool", Label: "Inverted" } }
    ] },

    IBooleanInputServiceConfig: { Variables : [
        { Selection: { Label: "Input", Selections: [
            { Name: "None", ConfigName: "NoneServiceConfig" },
            { Name: "Static", ConfigName: "BooleanInputService_StaticConfig" },
            { Name: "Pin", ConfigName: "BooleanInputServiceConfig" }
        ] } }
    ] },

    ButtonService_PollingConfig : { Variables : [
        { ButtonService_PollingConfigTypeId: { Type: "uint8", Value: 1, Hidden: true } },
        { BooleanInputServiceConfig: { ConfigName: "IBooleanInputServiceConfig" } }
    ] },

    IButtonServiceConfig : { Variables : [
        { Selection: { Label: "Button", Selections: [
            { Name: "None", ConfigName: "NoneServiceConfig" },
            { Name: "Polling", ConfigName: "ButtonService_PollingConfig" }
        ] } }
    ] },

    BooleanOutputServiceConfig: { Variables : [
        { BooleanOutputServiceConfigTypeId: { Type: "uint8", Value: 1, Hidden: true } },
        { Pin: { Type: "uint16", Label: "Pin" } },
        { NormalOn: { Type: "bool", Label: "Normal On" } },
        { HighZ: { Type: "bool", Label: "High Z" } }
    ] },

    IBooleanOutputServiceConfig: { Variables : [
        { Selection: { Label: "Output", Selections: [
            { Name: "None", ConfigName: "NoneServiceConfig" },
            { Name: "Pin", ConfigName: "BooleanOutputServiceConfig" }
        ] } }
    ] },
    
    FloatInputService_StaticConfig: { Variables : [
        { FloatInputService_StaticConfigTypeId: { Type: "uint8", Value: 1, Hidden: true } },
        { Value: { Type: "float", Label: "Static Value" } },
        { ValueDot: { Type: "float", Label: "Static Value Dot" } }
    ] },

    FloatInputService_AnalogPolynomialConfig: { Variables : [
        { FloatInputService_AnalogPolynomialConfigTypeId: { Type: "uint8", Value: 2, Hidden: true } },
        { Pin: { Type: "uint16", Label: "Pin" } },
        { DotSampleRate: { Type: "uint16", Label: "Dot Sample Rate", Value: 1000, Min: 1 } },
        { APA: { Type: "formula", Degree: 4, Label: "Coefficients" } },
        { MinValue: { Type: "float", Label: "Min Value" } },
        { MaxValue: { Type: "float", Label: "Max Value" } }
    ] },

    FloatInputService_AnalogInterpolatedTableConfig: { Variables : [
        { FloatInputService_AnalogInterpolatedTableConfigTypeId: { Type: "uint8", Value: 4, Hidden: true } },
        { Pin: { Type: "uint16", Label: "Pin" } },
        { DotSampleRate: { Type: "uint16", Label: "Dot Sample Rate", Value: 1000, Min: 1 } },
        { AMinInputValue: { Type: "float", Label: "Min Input Voltage"  } },
        { AMaxInputValue: { Type: "float", Label: "Max Input Voltage", Value: 3.3 } },
        { AITResolution: { Type: "uint8", Label: "Resolution", Value: 8, Min: 1, Max: 255 } },
        { TablePointer: { Type: "uint32", Label: "TablePointer", Hidden: true }},
        { AITTable: { Type: "float", XResolution: "AITResolution", Label: "Voltage to Value", XLabel: "Input Voltage", ZLabel: "Value", XMin: "AMinInputValue", XMax: "AMaxInputValue", Dialog: true } }
    ] },

    FloatInputService_FrequencyPolynomialConfig: { Variables : [
        { FloatInputService_FrequencyPolynomialConfigTypeId: { Type: "uint8", Value: 3, Hidden: true } },
        { Pin: { Type: "uint16", Label: "Pin" } },
        { FMinFrequency: { Type: "uint16", Label: "Min Frequency", Value: 50, Min: 1 } },
        { DotSampleRate: { Type: "uint16", Label: "Dot Sample Rate", Value: 1000, Min: 1 } },
        { FPA: { Type: "formula", Degree: 4, Label: "Coefficients" } },
        { MinValue: { Type: "float", Label: "Min Value" } },
        { MaxValue: { Type: "float", Label: "Max Value" } }
    ] },

    FloatInputService_FrequencyInterpolatedTableConfig: { Variables : [
        { FloatInputService_FrequencyInterpolatedTableConfigTypeId: { Type: "uint8", Value: 5, Hidden: true } },
        { Pin: { Type: "uint16", Label: "Pin" } },
        { DotSampleRate: { Type: "uint16", Label: "Dot Sample Rate", Value: 1000, Min: 1 } },
        { FMinFrequency: { Type: "uint16", Label: "Min Frequency", Value: 50, Min: 1 } },
        { FMaxFrequency: { Type: "uint16", Label: "Max Frequency", Value: 100, Min: 1 } },
        { FITResolution: { Type: "uint8", Label: "Resolution", Value: 11, Min: 1, Max: 255 } },
        { TablePointer: { Type: "uint32", Label: "TablePointer", Hidden: true }},
        { FITTable: { Type: "float", XResolution: "FITResolution", Label: "Frequency to Value", XLabel: "Frequency", ZLabel: "Value", XMin: "FMinFrequency", XMax: "FMaxFrequency", Dialog: true } }
    ] },

    FloatInputService_FaultDetectionWrapperConfig: { Variables : [
        { FloatInputService_FaultDetectionWrapperConfigTypeId: { Type: "uint8", Value: 6, Hidden: true } },
        { MinValue: { Type: "float", Label: "Min Value" } },
        { MaxValue: { Type: "float", Label: "Max Value" } },
        { Value: { Type: "float", Label: "Static Value" } },
        { FloatInputService: { ConfigName: "IFloatInputServiceConfig" } }
    ] },

    IFloatInputServiceConfig: { Variables : [
        { Selection: { Label: "Input", Selections: [
            { Name: "None", ConfigName: "NoneServiceConfig" },
            { Name: "Static", ConfigName: "FloatInputService_StaticConfig" },
            { Name: "Analog Pin Polynomial", ConfigName: "FloatInputService_AnalogPolynomialConfig" },
            { Name: "Analog Pin Lookup Table", ConfigName: "FloatInputService_AnalogInterpolatedTableConfig" },
            { Name: "Frequency Pin Polynomial", ConfigName: "FloatInputService_FrequencyPolynomialConfig" },
            { Name: "Frequency Pin Lookup Table", ConfigName: "FloatInputService_FrequencyInterpolatedTableConfig" },
            { Name: "Fault Detection Wrapper", ConfigName: "FloatInputService_FaultDetectionWrapperConfig" }
        ] } }
    ] },

    StepperOutputService_StepDirectionControlConfig: { Variables : [
        { StepperOutputService_StepDirectionControlConfigTypeId: { Type: "uint8", Value: 1, Hidden: true } },
        { MaxStepsPerSecond: { Type: "uint16", Label: "Steps/Second", Value: 100, Min: 1 } },
        { StepWidth: { Type: "float", Label: "Step Pulse Width", Value: 0.005, Max: 1} },
        { StepBooleanOutputServiceConfig: { ConfigName: "IBooleanOutputServiceConfig", Label: "Step Output Config" } },
        { DirectionBooleanOutputServiceConfig: { ConfigName: "IBooleanOutputServiceConfig", Label: "Direction Output Config" } }
    ] },

    StepperOutputService_FullStepControlConfig: { Variables : [
        { StepperOutputService_FullStepControlConfigTypeId: { Type: "uint8", Value: 2, Hidden: true } },
        { MaxStepsPerSecond: { Type: "uint16", Label: "Steps/Second", Value: 100, Min: 1 } },
        { StepWidth: { Type: "float", Label: "Step Pulse Width", Value: 0.005, Max: 1 } },
        { APlusBooleanOutputServiceConfig: { ConfigName: "IBooleanOutputServiceConfig", Label: "A+" } },
        { AMinusBooleanOutputServiceConfig: { ConfigName: "IBooleanOutputServiceConfig", Label: "A-" } },
        { BPlusBooleanOutputServiceConfig: { ConfigName: "IBooleanOutputServiceConfig", Label: "B+" } },
        { BMinusBooleanOutputServiceConfig: { ConfigName: "IBooleanOutputServiceConfig", Label: "B-" } }
    ] },

    StepperOutputService_HalfStepControlConfig: { Variables : [
        {StepperOutputService_HalfStepControlConfigTypeId: { Type: "uint8", Value: 3, Hidden: true } },
        { MaxStepsPerSecond: { Type: "uint16", Label: "Steps/Second", Value: 100, Min: 1 } },
        { StepWidth: { Type: "float", Label: "Step Pulse Width", Value: 0.005, Max: 1 } },
        { APlusBooleanOutputServiceConfig: { ConfigName: "IBooleanOutputServiceConfig", Label: "A+" } },
        { AMinusBooleanOutputServiceConfig: { ConfigName: "IBooleanOutputServiceConfig", Label: "A-" } },
        { BPlusBooleanOutputServiceConfig: { ConfigName: "IBooleanOutputServiceConfig", Label: "B+" } },
        { BMinusBooleanOutputServiceConfig: { ConfigName: "IBooleanOutputServiceConfig", Label: "B-" } }
    ] },

    StepperOutputService_StaticStepCalibrationWrapperConfig: { Variables : [
        { StepperOutputService_StaticStepCalibrationWrapperConfigTypeId: { Type: "uint8", Value: 5, Hidden: true } },
        { StepsOnCalibration: { Type: "int32", Label: "Reset Steps", Value: 300 } },
        { StepperConfig: { ConfigName: "IStepperOutputServiceConfig" } }
    ] },

    IStepperOutputServiceConfig: { Variables : [
        { Selection: { Label: "Input", Selections: [
            { Name: "None", ConfigName: "NoneServiceConfig" },
            { Name: "Step Direction", ConfigName: "StepperOutputService_StepDirectionControlConfig" },
            { Name: "Full Step Coil Control", ConfigName: "StepperOutputService_FullStepControlConfig" },
            { Name: "Half Step Coil Control", ConfigName: "StepperOutputService_HalfStepControlConfig" },
            { Name: "Step Calibration Wrapper", ConfigName: "StepperOutputService_StaticStepCalibrationWrapperConfig" }
        ] } }
    ] },

    FloatOutputService_PwmPolynomialConfig: { Variables : [
        { FloatOutputService_PwmPolynomialConfigTypeId: { Type: "uint8", Value: 1, Hidden: true } },
        { Pin: { Type: "uint16", Label: "Pin" } },
        { PFrequency: { Type: "uint16", Label: "Frequency", Value: 50, Min: 1 } },
        { PA: { Type: "formula", Degree: 4, Label: "Coefficients" } },
        { PMinDutyCycle: { Type: "float", Label: "Min Duty Cycle", Max: 1 } },
        { PMaxDutyCycle: { Type: "float", Label: "Max Duty Cycle", Max: 1 } }
    ] },

    FloatOutputService_PwmInterpolatedTableConfig: { Variables : [
        { FloatOutputService_PwmInterpolatedTableConfigTypeId: { Type: "uint8", Value: 3, Hidden: true } },
        { Pin: { Type: "uint16", Label: "Pin" } },
        { PFrequency: { Type: "uint16", Label: "Frequency", Value: 50, Min: 1 } },
        { MinValue: { Type: "float", Label: "Min Value" } },
        { MaxValue: { Type: "float", Label: "Max Value" } },
        { PResolution: { Type: "uint8", Label: "Resolution", Value: 8, Min: 1, Max: 255 } },
        { PTablePointer: { Type: "uint32", Label: "TablePointer", Hidden: true }},
        { PTable: { Type: "float", XResolution: "PResolution", Label: "Value to Duty Cycle", XLabel: "Value", ZLabel: "Duty Cycle", Max: 1, XMin: "MinValue", XMax: "MaxValue", Dialog: true } }
    ] },

    FloatOutputService_StepperPolynomialConfig: { Variables : [
        { FloatOutputService_StepperPolynomialConfigTypeId: { Type: "uint8", Value: 2, Hidden: true } },
        { SA: { Type: "formula", Degree: 4, Label: "Coefficients" } },
        { SMinStepPosition: { Type: "int32", Label: "Min Step Position" } },
        { SMaxStepPosition: { Type: "int32", Label: "Max Step Position" } },
        { StepperConfig: { ConfigName: "IStepperOutputServiceConfig" } }
    ] },

    FloatOutputService_StepperInterpolatedTableConfig: { Variables : [
        { FloatOutputService_StepperInterpolatedTableConfigTypeId: { Type: "uint8", Value: 4, Hidden: true } },
        { MinValue: { Type: "float", Label: "Min Value" } },
        { MaxValue: { Type: "float", Label: "Max Value" } },
        { SResolution: { Type: "uint8", Label: "Resolution", Value: 8, Min: 1, Max: 255 } },
        { STablePointer: { Type: "uint32", Label: "TablePointer", Hidden: true }},
        { STable: { Type: "float", XResolution: "SResolution", Label: "Value to Steps", XLabel: "Value", ZLabel: "Steps", XMin: "MinValue", XMax: "MaxValue", Dialog: true } },
        { StepperConfig: { ConfigName: "IStepperOutputServiceConfig" } }
    ] },

    IFloatOutputServiceConfig: { Variables : [
        { Selection: { Label: "Output", Selections: [
            { Name: "None", ConfigName: "NoneServiceConfig" },
            { Name: "PWM Pin Polynomial", ConfigName: "FloatOutputService_PwmPolynomialConfig" },
            { Name: "PWM Pin Lookup Table", ConfigName: "FloatOutputService_PwmInterpolatedTableConfig" },
            { Name: "Stepper Polynomial", ConfigName: "FloatOutputService_StepperPolynomialConfig" },
            { Name: "Stepper Lookup Table", ConfigName: "FloatOutputService_StepperInterpolatedTableConfig" }
        ] } }
    ] },

    Main: { Tabbed: true, Variables: [
        { BooleanInputService: { ConfigName: "IBooleanInputServiceConfig", Label: "BooleanInputService" } },
        { ButtonService: { ConfigName: "IButtonServiceConfig", Label: "ButtonService" } },
        { BooleanOutputService: { ConfigName: "IBooleanOutputServiceConfig", Label: "BooleanOutputService" } },
        { FloatInputService: { ConfigName: "IFloatInputServiceConfig", Label: "FloatInputService" } },
        { StepperOutputService: { ConfigName: "IStepperOutputServiceConfig", Label: "StepperOutputService" } },
        { FloatOutputService: { ConfigName: "IFloatOutputServiceConfig", Label: "FloatOutputService" } }
    ] }
};