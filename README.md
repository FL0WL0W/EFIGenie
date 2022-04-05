# EFIGenie

An open source engine management. It uses a taskmanager and is coded in a
operation oriented architecture.

The target microcontroller at the moment are the cheap but powerful STM32 line of processors
but any microcontroller can be ported by creating just 4 services,
AnalogService, DigitalService, PwmService, TimerService that can be found in the https://github.com/FL0WL0W/EmbeddedIOServices
repository. A large benefit to this architecture is that new sensors/abilities/features/etc.
can be added very easily and can be chosen between the old and new through the configs.
which means decoders can be changed, sensors added or removed, features added or removed.
all without having to recompile. There are also some wrapper classes where things like
two step rev limiters can be implemented or tri-step or even quad-step. still have a list of
things to complete but i am at a state where i am testing the ecu.

## Features
* Customizable(size and limits) 3D Fuel and Ignition Maps (Speed Density)
* Unlimited cylinder sequential injection and ignition (Depends on hardware)
  * Stm32Devboard - 8 cylinder sequential fuel and ignition (10, 12, 14, 16 wasted spark/banked injection)
* Flexible Crank Cam Decoder
  * GM 24x (Cam + Crank, Crank Only, or Cam only)
  * Configurable Missing Tooth Decoder
  * --More to come
* Injector Flow Rate and Dead Time
* Firmware features
  * Unit Tests to ensure everything works
  * Operation Architecture
  * Easily add new sensors

## Building
After trying with a few different toolchains the tool chain that seemed to work the best is GCC/G++9.

* Ubuntu 20.04
* GCC/G++9
* CMake

VSCode Extensions:
* C/C++
* CMake
* CMake Tools
* Cortex-Debug
* GoogleTest Adapter

```
sudo apt-get install cmake gcc g++ gdb
```

### Building the Tests
Make

## EFIGenieEditor

### Development

```bash
cd EFIGenieEditor/
```

```bash
npm install
npm start
```

### Building

Output directory is set to: `/dist`. Assets are also compressed using `gzip`.

```bash
npm run build
npm run preview
```


## TODO List
* *Logging
* *EFIGenie Viewer
* *Idle Control
* *Alpha-N
* *Create unit tests
* Prime
* After Start Enrichment
* Warm Up Enrichment
* Flex fuel
* Rev Limiting (Hard and Soft Spark)
* Launch control (Hard and Soft Spark)
* Customizable(size and seperations) FuelTrim Predictive Multi Channel Historic Table
* Deceleration fuel cut off (DFCO)
* Fuel Trim (Wideband/Pid and Narrowband | predictive based on TPS or MAP)
* Tach Output
* Temperature Bias between ECT and IAT
* TPS and MAP acceleration enrichment
* Individual injector trims
* Transmission Control (Paddle shift transmission solenoid)
* Transmission Control (line pressure control)
* Transmission Control (automatic gear shifts)
* Electric Fan Control
* Fuel Pump (On/Off, PWM Open loop or PID Control Loop)
* VVT control (PWM - Open loop or PID control loop)
* Boost control (PWM - Open loop or PID control loop)
* CAN Bus/OBD2
* Variable table axis(I.E. RPM 400, 600, 800, 1200, 2400, 3600, 3800, 4000, 4200, 5400, 6600)

> *High Priority
