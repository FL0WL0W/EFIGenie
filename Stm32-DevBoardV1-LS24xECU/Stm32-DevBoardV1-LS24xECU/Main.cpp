#include <stm32f10x_rcc.h>
#include <stm32f10x_flash.h>
#include <map>
#include <functional>
#include "ITimerService.h"
#include "Stm32F10xTimerService.h"
#include "IDigitalService.h"
#include "Stm32F10xDigitalService.h"
#include "IAnalogService.h"
#include "Stm32F10xAnalogService.h"
#include "IIgnitionService.h"
#include "IgnitionService.h"
#include "IInjectorService.h"
#include "InjectorService.h"
#include "IMapService.h"
#include "IEngineCoolantTemperatureService.h"
#include "IIntakeAirTemperatureService.h"
#include "IVoltageService.h"
#include "IAfrService.h"
#include "MapServiceLinear.h"
#include "IDecoder.h"
#include "Gm24xDecoder.h"
#include "IFuelTrimService.h"
#include "IPistonEngineConfig.h"
#include "PistonEngineSDConfig.h"
#include "PistonEngineController.h"
#include "EmbeddedResources.h"
#include "stm32f10x_tim.h"

#define INJECTOR_PIN_1 0
#define INJECTOR_PIN_2 0
#define INJECTOR_PIN_3 0
#define INJECTOR_PIN_4 0
#define INJECTOR_PIN_5 0
#define INJECTOR_PIN_6 0
#define INJECTOR_PIN_7 0
#define INJECTOR_PIN_8 0

#define IGNITION_PIN_1 0
#define IGNITION_PIN_2 0
#define IGNITION_PIN_3 0
#define IGNITION_PIN_4 0
#define IGNITION_PIN_5 0
#define IGNITION_PIN_6 0
#define IGNITION_PIN_7 0
#define IGNITION_PIN_8 0

#define MAP_PIN 0

HardwareAbstraction::ITimerService *_timerService;
HardwareAbstraction::IDigitalService *_digitalService;
EngineManagement::IIgnitionService *_ignitionServices[MAX_CYLINDERS];
EngineManagement::IInjectorService *_injectorServices[MAX_CYLINDERS];
HardwareAbstraction::IAnalogService *_analogService;
EngineManagement::IMapService *_mapService;
EngineManagement::IFuelTrimService *_fuelTrimService;
EngineManagement::IEngineCoolantTemperatureService *_engineCoolantTemperatureService;
EngineManagement::IIntakeAirTemperatureService *_intakeAirTemperatureService;
EngineManagement::IVoltageService *_voltageService;
EngineManagement::IAfrService *_afrService;
Decoder::IDecoder *_decoder;
EngineManagement::IPistonEngineConfig *_pistonEngineConfig;
EngineManagement::PistonEngineController *_pistonEngineController;

void clock_init() {
  /*Configure all clocks to max for best performance.
   * If there are EMI, power, or noise problems, try slowing the clocks*/

  /* First set the flash latency to work with our clock*/
  /*000 Zero wait state, if 0  MHz < SYSCLK <= 24 MHz
    001 One wait state, if  24 MHz < SYSCLK <= 48 MHz
    010 Two wait states, if 48 MHz < SYSCLK <= 72 MHz */
	FLASH_SetLatency(FLASH_Latency_2);

	  /* Start with HSI clock (internal 8mhz), divide by 2 and multiply by 9 to
	   * get maximum allowed frequency: 36Mhz
	   * Enable PLL, wait till it's stable, then select it as system clock*/
	RCC_PLLConfig(RCC_PLLSource_HSE_Div1, RCC_PLLMul_9);
	RCC_PLLCmd(ENABLE);
	while (RCC_GetFlagStatus(RCC_FLAG_PLLRDY) == RESET) {}
	RCC_SYSCLKConfig(RCC_SYSCLKSource_PLLCLK);

	  /* Set HCLK, PCLK1, and PCLK2 to SCLK (these are default */
	RCC_HCLKConfig(RCC_SYSCLK_Div1);
	RCC_PCLK1Config(RCC_HCLK_Div1);
	RCC_PCLK2Config(RCC_HCLK_Div1);

	  /* Set ADC clk to 12MHz (14MHz max, 18MHz default)*/
	RCC_ADCCLKConfig(RCC_PCLK2_Div6);
	
	SystemCoreClockUpdate();
}

int main()
{
	clock_init();
	
	_timerService = new Stm32::Stm32F10xTimerService();
		
	_digitalService = new Stm32::Stm32F10xDigitalService();
	
	//TODO: create unit tests
	_ignitionServices[0] = new EngineManagement::IgnitionService(_digitalService, IGNITION_PIN_1, false, true); 
	_ignitionServices[1] = new EngineManagement::IgnitionService(_digitalService, IGNITION_PIN_2, false, true); 
	_ignitionServices[2] = new EngineManagement::IgnitionService(_digitalService, IGNITION_PIN_3, false, true); 
	_ignitionServices[3] = new EngineManagement::IgnitionService(_digitalService, IGNITION_PIN_4, false, true); 
	_ignitionServices[4] = new EngineManagement::IgnitionService(_digitalService, IGNITION_PIN_5, false, true); 
	_ignitionServices[5] = new EngineManagement::IgnitionService(_digitalService, IGNITION_PIN_6, false, true); 
	_ignitionServices[6] = new EngineManagement::IgnitionService(_digitalService, IGNITION_PIN_7, false, true); 
	_ignitionServices[7] = new EngineManagement::IgnitionService(_digitalService, IGNITION_PIN_8, false, true); 
	
	//TODO: create unit tests
	_injectorServices[0] = new EngineManagement::InjectorService(_digitalService, INJECTOR_PIN_1, false, false); 
	_injectorServices[1] = new EngineManagement::InjectorService(_digitalService, INJECTOR_PIN_2, false, false); 
	_injectorServices[2] = new EngineManagement::InjectorService(_digitalService, INJECTOR_PIN_3, false, false); 
	_injectorServices[3] = new EngineManagement::InjectorService(_digitalService, INJECTOR_PIN_4, false, false); 
	_injectorServices[4] = new EngineManagement::InjectorService(_digitalService, INJECTOR_PIN_5, false, false); 
	_injectorServices[5] = new EngineManagement::InjectorService(_digitalService, INJECTOR_PIN_6, false, false); 
	_injectorServices[6] = new EngineManagement::InjectorService(_digitalService, INJECTOR_PIN_7, false, false); 
	_injectorServices[7] = new EngineManagement::InjectorService(_digitalService, INJECTOR_PIN_8, false, false); 
	
	_analogService = new Stm32::Stm32F10xAnalogService();
	
	//TODO: create unit tests
	_mapService = new EngineManagement::MapServiceLinear(_timerService, _analogService, MAP_PIN, EmbeddedResources::MapLinearConfigFile_dat.data());
  
	_decoder = new Decoder::Gm24xDecoder(_timerService);
	
	//TODO: Finish fuel trim
	_fuelTrimService = NULL;
	
	//TODO: Finish Engine Coolant Temperature Service
	_engineCoolantTemperatureService = NULL;
	
	//TODO: Finish Intake Air Temperature Service
	_intakeAirTemperatureService = NULL;
	
	//TODO: Voltage Service
	_voltageService = NULL;
	
	//TODO: Afr Service
	_afrService = NULL;
	
	//TODO: create unit tests
	//interpolate short pulse adder
	_pistonEngineConfig = new EngineManagement::PistonEngineSDConfig(_decoder, _fuelTrimService, _mapService, _intakeAirTemperatureService, _engineCoolantTemperatureService, _voltageService, _afrService, EmbeddedResources::PistonEngineSDConfigFile_dat.data());
	
	//TODO: create unit tests
	//finish odd cylinder banks
	_pistonEngineController = new EngineManagement::PistonEngineController(_timerService, _decoder, _ignitionServices, _injectorServices, _pistonEngineConfig);
	
	for (;;)
	{
		_mapService->ReadMap();
		_engineCoolantTemperatureService->ReadEct();
		_intakeAirTemperatureService->ReadIat();
		_voltageService->ReadVoltage();
		_pistonEngineController->ScheduleEvents();
	}
}

//TODO: create and enable intterupts for decoder

