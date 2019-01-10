EFIGenie

An open source engine management. It uses a taskmanager and is coded in a service oriented architecture.

The target microcontroller at the moment is the cheap but powerful STM32F103C8 but any microcontroller can be ported by creating just 4 services, AnalogService, DigitalService, PwmService, TimerService. Looking at porting to a couple other STM32 platforms as well as NOINJECTION on an atmega328p for an ignition controller. A large benefit to this architecture is that new sensors/abilities/features/etc. can be added very easily and can be chosen between the old and new through the configs. which means decoders can be changed, sensors added or removed, features added or removed. all without having to recompile. There are also some wrapper classes where things like two step rev limiters can be implemented or tri-step or even quad-step. still have a small list of things to complete but i am at a state where i am going to start testing.
<br>
<br>
Features<br>
<ul>
  <li>Customizable(size and limits) 3D Fuel and Ignition Maps (Speed Density)</li>
  <li>Unlimited cylinder sequential injection and ignition (Depends on hardware)</li>
    <ul>
      <li>Stm32Devboard - 8 cylinder sequential (10, 12, 14, 16 wasted spark/banked injection)</li>
    </ul>
  <li>Flexible Crank Cam Decoder</li>
    <ul>
      <li>GM 24x (Cam + Crank and Crank Only)</li>
      <li>--More to come</li>
    </ul>
  <li>Individual injector trims</li>
  <li>Injector offset voltage and MAP</li>
  <li>Injector short pulse adder</li>
  <li>TPS and MAP acceleration enrichment</li>
  <li>Temperature Bias between ECT and IAT</li>
  <li>After Start Enrichment</li>
  <li>Warm Up Enrichment</li>
  <li>Fuel Prime</li>
  <li>Fuel Pump (On/Off)</li>
  <li>Fuel Pump (PWM Open Loop TPS or Map tables)</li>
  <li>Deceleration fuel cut off (DFCO)</li>
  <li>Flex fuel</li>
  <li>Rev Limiting (Hard and Soft Spark)</li>
  <li>Launch control (Hard and Soft Spark)</li>
  <li>Fuel Trim (Wideband/Pid and Narrowband | predictive based on TPS or MAP)</li>
  <li>Tach Output</li>
  <li>Vehicle Speed Sensor</li>
  <li>Idle control (PWM and Stepper - PD control loop)</li>
  <li>Customizable(size and seperations) FuelTrim Predictive Multi Channel Historic Table</li>
  <li>Transmission Control (Paddle shift transmission solenoid)</li>
  <li>Firmware features</li>
    <ul>
      <li>Build Defines for NOINJECTION Control (Ignition only controller hardware / I.E. PiggyBack or Carburetor)</li>
      <li>Build Defines for NOIGNITION Control (Injection only hardware / I.E. PiggyBack)</li>
      <li>Unit Tests to ensure everything works</li>
      <li>Service Oriented Architecture</li>
      <li>Ability to easily remove services in order to conserve space</li>
      <li>Easily add new sensors</li>
    </ul>
</ul>
<br>
TODO LIST<br>
<ul>
  <li>*Idle Control Ignition Wrapper</li>
  <li>*Alpha-N</li>
  <li>*Logging</li>
  <li>*EFIGenie Editor</li>
    <ul>
      <li>Create and edit configs</li>
      <li>Output tuner studio configs</li>
      <li>Interface with ECU (UART, USB, WiFi, Bluetooth, and STLink)</li>
    </ul>
  <li>*Tuner Studio (Interface ECU)</li>
  <li>*Speeduino Service Builder</li>
  <li>*Create unit tests</li>
    <ul>
     <li>Idle Air Control Valve Stepper</li>
      <li>AfrService_Static</li>
      <li>FuelPumpService_Analog</li>
      <li>FuelTrimService_InterpolatedTable</li>
      <li>FuelTrimServiceWrapper_MultiChannel</li>
      <li>IdleControlService_Pd</li>
      <li>PrimeService_StaticPulseWidth</li>
      <li>TachometerService</li>
      <li>PistonEngineIgnitionConfig_Map_Ethanol</li>
      <li>PistonEngineIgnitionConfigWrapper_HardRpmLimit</li>
      <li>PistonEngineIgnitionConfigWrapper_SoftRpmLimit</li>
      <li>PistonEngineInjectionConfig_SD</li>
      <li>PistonEngineInjectionConfigWrapper_DFCO</li>
      <li>IgnitionSchedulingService</li>
      <li>InjectionSchedulingService</li>
      <li>ServiceBuilder</li>
    </ul>
  <li>Transmission Control (line pressure control)</li>
  <li>Transmission Control (automatic gear shifts)</li>
  <li>Customizable injection and iginition degree references</li>
  <li>*Config Verification</li>
  <li>Create odd cylinder banks code</li>
  <li>Create Throttle Body Injection code</li>
  <li>Electric Fan Control</li>
  <li>Fuel Pump (PWM PID Control Loop)</li>
  <li>VVT control (PWM - Open loop or PID control loop)</li>
  <li>Boost control (PWM - Open loop or PID control loop)</li>
  <li>CAN Bus/OBD2</li>
  <li>Variable table axis(I.E. RPM 400, 600, 800, 1200, 2400, 3600, 3800, 4000, 4200, 5400, 6600)</li>
</ul><br>
  *High Priority
