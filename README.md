DJTuningECU

An open source engine management. It uses a taskmanager and is coded in a service oriented architecture.

The target microcontroller at the moment is the cheap but powerful STM32F103C8 but any microcontroller can be ported by creating just 3 services, AnalogService, DigitalService, PwmService, TimerService. A large benefit to this architecture is that new sensors/abilities/features/etc. can be added very easily and can be chosen between the old and new through the configs. which means decoders can be changed, sensors added or removed all without having to recompile. still have a small list of things to complete but i am at a state where i am going to start testing.
<br>
<br>
Features<br>
<ul>
  <li>Customizable(size and limits) 3D Fuel and Ignition Maps (Speed Density)</li>
  <li>Unlimited cylinder sequential injection and ignition (Depends on hardware)</li>
    <ul>
      <li>Stm32Devboard - 8 cylinder sequential (10, 12, 14, 16 wasted spark/banked injection)</li>
    </ul>
  <li>Build Defines for NOINJECTION Control (Ignition only controller hardware)</li>
  <li>Individual injector trims</li>
  <li>Warm Up Enrichment</li>
  <li>TPS and MAP acceleration enrichment</li>
  <li>Temperature Bias between ECT and IAT</li>
  <li>Voltage and MAP Injector Offset</li>
  <li>Short Pulse Adder</li>
  <li>Flexible Crank Cam Decoder</li>
    <ul>
      <li>GM 24x (Cam + Crank and Crank Only</li>
      <li>--More to come</li>
    </ul>
  <li>Deceleration fuel cut off (DFCO)</li>
  <li>Flex fuel</li>
</ul>
<br>
TODO LIST<br>
<ul>
  <li>Create unit tests</li>
  <li>Create integration tests with integration test hardware</li>
  <li>Create odd cylinder banks code</li>
  <li>Create Throttle Body Injection code</li>
  <li>Implement Stm32F10x PWM service</li>
  <li>Fuel Prime</li>
  <li>Fuel Trim (Wideband and Narrowband)</li>
  <li>Rev Limiting</li>
  <li>After Start Enrichment</li>
  <li>Launch control (Wrapper)</li>
  <li>Tach output</li>
  <li>Fuel Pump (On/Off)</li>
  <li>Fuel Pump (PWM)</li>
  <li>Idle control</li>
  <li>VVT control</li>
  <li>Boost control</li>
  <li>Logging</li>
  <li>Tuner Studio</li>
  <li>Alpha-N</li>
  <li>CAN Bus/OBD2</li>
  <li>Vehicle Speed Sensor</li>
</ul  
