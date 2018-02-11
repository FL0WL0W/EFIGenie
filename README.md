DJTuningECU

An open source engine management. It uses a taskmanager and is coded in a service oriented architecture.

The target microcontroller at the moment is the cheap but powerful STM32F103C8 but any microcontroller can be ported by creating just 3 services, AnalogService, DigitalService, PwmService, TimerService. A large benefit to this architecture is that new sensors/abilities/features/etc. can be added very easily and can be chosen between the old and new through the configs. which means decoders can be changed, sensors added or removed all without having to recompile. still have a small list of things to complete but i am at a state where i am going to start testing.

TODO LIST<br>
<ul>
  <li>Create unit tests</li>
  <li>Create odd cylinder banks code</li>
  <li>Create Throttle Body Injection code</li>
  <li>Create Fuel Trim Service</li>
  <li>Implement Stm32F10x PWM service</li>
  <li>Create Fuel Prime</li>
</ul  

Features<br>
Customizable 3D Fuel and Ignition Maps (Speed Density)<br>
Unlimited cylinder sequential injection and ignition (Depends on hardware)<br>
<ul>
  <li>Stm32Devboard - 8 cylinder sequential (10, 12, 14, 16 wasted spark/banked injection)</li>
</ul>
<p>
  Build Defines for NOINJECTION Control (Ignition only controller hardware)<br>
  Individual injector trims<br>
  Warm Up Enrichment<br>
  TPS and MAP acceleration enrichment<br>
  Temperature Bias between ECT and IAT<br>
  Voltage and MAP Injector Offset<br>
  Short Pulse Adder<br>
  Flexible Crank Cam Decoder<br>
</p>
<ul>
  <li>GM 24x</li>
  <li>--More to come</li>
</ul>
Deceleration fuel cut off (DFCO)<br>
Flex fuel<br>
