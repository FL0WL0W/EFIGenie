# DJTuningECU

An open source engine management. It uses a taskmanager and is coded in a service oriented architecture.

The target microcontroller at the moment is the cheap but powerful STM32F103C8 but any microcontroller can be ported by creating just 3 services, AnalogService, DigitalService, PwmService, TimerService. A large benefit to this architecture is that new sensors/abilities/features/etc. can be added very easily and can be chosen between the old and new through the configs. which means decoders can be changed, sensors added or removed all without having to recompile. still have a small list of things to complete but i am at a state where i am going to start testing.

TODO LIST<br>
Create unit tests<br>
Create odd cylinder banks code<br>
Create Throttle Body Injection code<br>
Create Fuel Trim Service<br>
Implement Stm32F10x PWM service<br>
Create Fuel Prime<br>
