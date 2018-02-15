DJTuningECU

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
  <li>Build Defines for NOINJECTION Control (Ignition only controller hardware / I.E. PiggyBack or Carburetor)</li>
  <li>Individual injector trims</li>
  <li>Fuel Pump (On/Off)</li>
  <li>Fuel Prime</li>
  <li>After Start Enrichment</li>
  <li>Warm Up Enrichment</li>
  <li>TPS and MAP acceleration enrichment</li>
  <li>Temperature Bias between ECT and IAT</li>
  <li>Voltage and MAP Injector Offset</li>
  <li>Short Pulse Adder</li>
  <li>Flexible Crank Cam Decoder</li>
    <ul>
      <li>GM 24x (Cam + Crank and Crank Only)</li>
      <li>--More to come</li>
    </ul>
  <li>Deceleration fuel cut off (DFCO)</li>
  <li>Flex fuel</li>
  <li>Rev Limiting (Hard and Soft Spark)</li>
  <li>Launch control (Hard and Soft Spark)</li>
</ul>
<br>
TODO LIST<br>
<ul>
  <li>Build defines for NOIGNITION (Injection only hardware / I.E. PiggyBack)</li>
  <li>*Create unit tests</li>
  <li>*Create integration tests with integration test hardware</li>
  <li>Create odd cylinder banks code</li>
  <li>Create Throttle Body Injection code</li>
  <li>*Implement Stm32F10x PWM service</li>
  <li>*Fuel Trim (Wideband and Narrowband)</li>
  <li>*Tach output</li>
  <li>Fuel Pump (PWM)</li>
  <li>*Idle control (PWM/Stepper - PID control loop)</li>
  <li>VVT control (PWM - Open loop or PID control loop)</li>
  <li>Boost control (PWM - Open loop or PID control loop)</li>
  <li>*Logging</li>
  <li>*Tuner Studio</li>
  <li>Alpha-N</li>
  <li>CAN Bus/OBD2</li>
  <li>Vehicle Speed Sensor</li>
  <li>Variable table axis(I.E. RPM 400, 600, 800, 1200, 2400, 3600, 3800, 4000, 4200, 5400, 6600)</li>
</ul><br>
  *High Priority
