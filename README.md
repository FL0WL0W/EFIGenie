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
things to complete but i am at a state where i am testing the ecu. At this point it has run an engine https://www.youtube.com/watch?v=jJOaTFBkKEE

## Features
* Customizable(size, limits, and axis) 3D Fuel and Ignition Maps (Speed Density, Alpha N)
* Customizable formulas for all engine parameters
* Cusotmizable inputs and outputs
* Unlimited cylinder sequential injection and ignition (Depends on hardware)
  * Stm32Devboard - 8 cylinder sequential fuel and ignition (10, 12, 14, 16 wasted spark/banked injection)
* Flexible Crank Cam Decoder
  * GM 24x (Cam + Crank, Crank Only, or Cam only)
  * Universal 1X decoder
  * Configurable Missing Tooth Decoder
  * --More to come
* Firmware features
  * Unit Tests to ensure everything works
  * Operation Architecture
  * Easily add new sensors

## Diagnostic data handlers

`CommunicationHandler_OBD2PIDRequester` and `CommunicationHandler_OBD2PIDResponder`
use Service `0x01`/`0x41` and 8-bit PIDs. UDS Service `0x22`/`0x62` uses the separate
`CommunicationHandler_UDSDIDRequester` and `CommunicationHandler_UDSDIDResponder`
with 16-bit DIDs. Move existing 16-bit `RegisterPID`/`RequestPID` calls to
`RegisterDID`/`RequestDID`; the service is no longer selected by identifier size.

To expose a PID responder through a DID range:

```cpp
EFIGenie::CommunicationHandler_OBD2PIDResponder pids(communicationService);
EFIGenie::CommunicationHandler_UDSDIDResponder dids(communicationService);
pids.RegisterPID(0x0c, rpmOperation);
dids.RegisterOBD2PIDMirror(0xf4, &pids);
```

A request `22 F4 0C` calls the PID responder locally with `01 0C`, captures its
`41 0C <payload>` response, and returns `62 F4 0C <payload>`. No OBD request is
sent on the bus. The high byte is configurable; supported-PID bitmap requests
are mirrored too, and later PID registrations/unregistrations are reflected
immediately. Explicit `RegisterDID` entries override mirrored entries. Use
`UnregisterOBD2PIDMirror(highByte)` to remove a mirror. Operations and mirrored
responders are borrowed and must outlive their registrations.

The DID responder accepts framed requests containing one or more DIDs, returning
one combined positive response or a negative response if any requested value is
unavailable. Malformed frames return `7F 22 13`; unavailable values return
`7F 22 31`. The DID requester requests and parses one DID per transaction because
multi-DID response payload lengths require application-specific definitions.

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

## TODO List
* *Idle Control
* After Start Enrichment (Add Engine Time Since Started, AE can be configured in GUI with that variable available)
* Customizable(size and seperations) FuelTrim Predictive Multi Channel Historic Table
* Fuel Trim (Wideband/Pid and Narrowband | predictive based on TPS or MAP)
* Transmission Control (Paddle shift transmission solenoid)
* Transmission Control (line pressure control)
* Transmission Control (automatic gear shifts)
* OBD2

> *High Priority
