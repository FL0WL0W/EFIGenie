EFIGenie

An open source engine management. It uses a taskmanager and is coded in a service oriented architecture.

The target microcontroller at the moment is the cheap but powerful STM32F103C8 but any microcontroller can be ported by creating just 4 services, AnalogService, DigitalService, PwmService, TimerService. Looking at porting to a couple other STM32 platforms. A large benefit to this architecture is that new sensors/abilities/features/etc. can be added very easily and can be chosen between the old and new through the configs. which means decoders can be changed, sensors added or removed, features added or removed. all without having to recompile. There are also some wrapper classes where things like two step rev limiters can be implemented or tri-step or even quad-step. still have a list of things to complete but i am at a state where i am testing the ecu.
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
      <li>GM 24x (Cam + Crank, Crank Only, or Cam only)</li>
      <li>--More to come</li>
    </ul>
  <li>Injector Flow Rate and Dead Time</li>
  <li>Vehicle Speed Sensor</li>
  <li>Firmware features</li>
    <ul>
      <li>Unit Tests to ensure everything works</li>
      <li>Operation Architecture</li>
      <li>Easily add new sensors</li>
    </ul>
</ul>
<br>
TODO LIST<br>
<ul>
  <li>*Logging</li>
  <li>*EFIGenie Editor</li>
    <ul>
      <li>Value Verification and GUI tweaking</li>
      <li>Interface with ECU (UART, USB, WiFi, Bluetooth, and STLink)</li>
    </ul>
  <li>*Idle Control</li>
  <li>*Alpha-N</li>
  <li>*Create unit tests</li>
  <li>Prime</li>
  <li>After Start Enrichment</li>
  <li>Warm Up Enrichment</li>
  <li>Flex fuel</li>
  <li>Rev Limiting (Hard and Soft Spark)</li>
  <li>Launch control (Hard and Soft Spark)</li>
  <li>Customizable(size and seperations) FuelTrim Predictive Multi Channel Historic Table</li>
  <li>Deceleration fuel cut off (DFCO)</li>
  <li>Fuel Trim (Wideband/Pid and Narrowband | predictive based on TPS or MAP)</li>
  <li>Tach Output</li>
  <li>Temperature Bias between ECT and IAT</li>
  <li>TPS and MAP acceleration enrichment</li>
  <li>Individual injector trims</li>
  <li>Transmission Control (Paddle shift transmission solenoid)</li>
  <li>Transmission Control (line pressure control)</li>
  <li>Transmission Control (automatic gear shifts)</li>
  <li>Create odd cylinder banks code</li>
  <li>Electric Fan Control</li>
  <li>Fuel Pump (On/Off, PWM Open loop or PID Control Loop)</li>
  <li>VVT control (PWM - Open loop or PID control loop)</li>
  <li>Boost control (PWM - Open loop or PID control loop)</li>
  <li>CAN Bus/OBD2</li>
  <li>Variable table axis(I.E. RPM 400, 600, 800, 1200, 2400, 3600, 3800, 4000, 4200, 5400, 6600)</li>
</ul><br>
  *High Priority
