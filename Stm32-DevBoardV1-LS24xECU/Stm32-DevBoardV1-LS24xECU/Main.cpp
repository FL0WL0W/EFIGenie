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
#include "IIgnitorService.h"
#include "IgnitorService.h"
#include "IInjectorService.h"
#include "InjectorService.h"
#include "IMapService.h"
#include "IEthanolService.h"
#include "EthanolService_Static.h"
#include "MapService_Analog.h"
#include "IEngineCoolantTemperatureService.h"
#include "EngineCoolantTemperatureService_Static.h"
#include "EngineCoolantTemperatureService_Analog.h"
#include "IIntakeAirTemperatureService.h"
#include "IntakeAirTemperatureService_Static.h"
#include "IntakeAirTemperatureService_Analog.h"
#include "IVoltageService.h"
#include "VoltageService_Static.h"
#include "VoltageService_Analog.h"
#include "IAfrService.h"
#include "AfrService_Static.h"
#include "IDecoder.h"
#include "Gm24xDecoder.h"
#include "IFuelTrimService.h"
#include "PistonEngineConfig.h"
#include "IPistonEngineIgnitionConfig.h"
#include "PistonEngineIgnitionConfig_Map_Ethanol.h"
#include "IPistonEngineInjectionConfig.h"
#include "PistonEngineInjectionConfig_SD.h"
#include "PistonEngineController.h"
#include "EmbeddedResources.h"
#include "stm32f10x_tim.h"
#include "AfrService_Map_Ethanol.h"
#include "EthanolService_Analog.h"

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
#define ECT_PIN 0
#define IAT_PIN 0
#define VOLTAGE_PIN 0
#define ETHANOL_PIN 0

HardwareAbstraction::ITimerService *_timerService;
HardwareAbstraction::IDigitalService *_digitalService;
EngineManagement::IIgnitorService *_ignitorServices[MAX_CYLINDERS];
EngineManagement::IInjectorService *_injectorServices[MAX_CYLINDERS];
HardwareAbstraction::IAnalogService *_analogService;
EngineManagement::IMapService *_mapService;
EngineManagement::IFuelTrimService *_fuelTrimService;
EngineManagement::IEngineCoolantTemperatureService *_engineCoolantTemperatureService;
EngineManagement::IIntakeAirTemperatureService *_intakeAirTemperatureService;
EngineManagement::IVoltageService *_voltageService;
EngineManagement::IAfrService *_afrService;
Decoder::IDecoder *_decoder;
EngineManagement::PistonEngineConfig *_pistonEngineConfig;
EngineManagement::IPistonEngineInjectionConfig *_pistonEngineInjectionConfig;
EngineManagement::IPistonEngineIgnitionConfig *_pistonEngineIgnitionConfig;
EngineManagement::PistonEngineController *_pistonEngineController;
EngineManagement::IEthanolService *_ethanolService;

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
	
	_analogService = new Stm32::Stm32F10xAnalogService();
	
	//TODO: create unit tests
	_pistonEngineConfig = new EngineManagement::PistonEngineConfig(EmbeddedResources::PistonEngineConfigFile_dat.data());
	
	//TODO: create unit tests
	//set all to the same pin for distributor
	if(_pistonEngineConfig->IsDistributor)
	{
		_ignitorServices[0] = new EngineManagement::IgnitorService(_digitalService, IGNITION_PIN_1, false, true); 
		_ignitorServices[1] = new EngineManagement::IgnitorService(_digitalService, IGNITION_PIN_2, false, true); 
		_ignitorServices[2] = new EngineManagement::IgnitorService(_digitalService, IGNITION_PIN_3, false, true); 
		_ignitorServices[3] = new EngineManagement::IgnitorService(_digitalService, IGNITION_PIN_4, false, true); 
		_ignitorServices[4] = new EngineManagement::IgnitorService(_digitalService, IGNITION_PIN_5, false, true); 
		_ignitorServices[5] = new EngineManagement::IgnitorService(_digitalService, IGNITION_PIN_6, false, true); 
		_ignitorServices[6] = new EngineManagement::IgnitorService(_digitalService, IGNITION_PIN_7, false, true); 
		_ignitorServices[7] = new EngineManagement::IgnitorService(_digitalService, IGNITION_PIN_8, false, true); 
	}
	else
	{
		_ignitorServices[0] = new EngineManagement::IgnitorService(_digitalService, IGNITION_PIN_1, false, true); 
		_ignitorServices[1] = new EngineManagement::IgnitorService(_digitalService, IGNITION_PIN_1, false, true); 
		_ignitorServices[2] = new EngineManagement::IgnitorService(_digitalService, IGNITION_PIN_1, false, true); 
		_ignitorServices[3] = new EngineManagement::IgnitorService(_digitalService, IGNITION_PIN_1, false, true); 
		_ignitorServices[4] = new EngineManagement::IgnitorService(_digitalService, IGNITION_PIN_1, false, true); 
		_ignitorServices[5] = new EngineManagement::IgnitorService(_digitalService, IGNITION_PIN_1, false, true); 
		_ignitorServices[6] = new EngineManagement::IgnitorService(_digitalService, IGNITION_PIN_1, false, true); 
		_ignitorServices[7] = new EngineManagement::IgnitorService(_digitalService, IGNITION_PIN_1, false, true); 
	}
	
	//TODO: create unit tests
	_injectorServices[0] = new EngineManagement::InjectorService(_digitalService, INJECTOR_PIN_1, false, false); 
	_injectorServices[1] = new EngineManagement::InjectorService(_digitalService, INJECTOR_PIN_2, false, false); 
	_injectorServices[2] = new EngineManagement::InjectorService(_digitalService, INJECTOR_PIN_3, false, false); 
	_injectorServices[3] = new EngineManagement::InjectorService(_digitalService, INJECTOR_PIN_4, false, false); 
	_injectorServices[4] = new EngineManagement::InjectorService(_digitalService, INJECTOR_PIN_5, false, false); 
	_injectorServices[5] = new EngineManagement::InjectorService(_digitalService, INJECTOR_PIN_6, false, false); 
	_injectorServices[6] = new EngineManagement::InjectorService(_digitalService, INJECTOR_PIN_7, false, false); 
	_injectorServices[7] = new EngineManagement::InjectorService(_digitalService, INJECTOR_PIN_8, false, false); 
		
	//TODO: create unit tests
	unsigned char mapServiceId = *((unsigned char*)EmbeddedResources::MapConfigFile_dat.data());
	switch (mapServiceId)
	{
	case 0:
		_mapService = new EngineManagement::MapService_Analog(_timerService, _analogService, MAP_PIN, ((void *)((unsigned char*)EmbeddedResources::MapConfigFile_dat.data() + 1)));
		break;
	}
  
	switch (_pistonEngineConfig->DecoderId)
	{
	case 0:
		_decoder = new Decoder::Gm24xDecoder(_timerService);
		break;
	}
	
	//TODO: Fuel Trim Service
	unsigned char fuelTrimId =  *((unsigned char*)EmbeddedResources::FuelTrimConfigFile_dat.data());
	switch (fuelTrimId)
	{
	case 0:
		_fuelTrimService = NULL;
		break;
	}
	
	//TODO: Ceate Unit Tests
	unsigned char ectId =  *((unsigned char*)EmbeddedResources::EctConfigFile_dat.data());
	switch (ectId)
	{
	case 0:
		_engineCoolantTemperatureService = new EngineManagement::EngineCoolantTemperatureService_Static(*((float *)((unsigned char*)EmbeddedResources::EctConfigFile_dat.data() + 1)), *((float *)((unsigned char*)EmbeddedResources::EctConfigFile_dat.data() + 1) + 1), *((float *)((unsigned char*)EmbeddedResources::EctConfigFile_dat.data() + 1) + 2));
		break;
	case 1:
		_engineCoolantTemperatureService = new EngineManagement::EngineCoolantTemperatureService_Analog(_timerService, _analogService, ECT_PIN, ((void *)((unsigned char*)EmbeddedResources::EctConfigFile_dat.data() + 1)));
		break;
	}
	
	//TODO: Create Unit Tests
	unsigned char iatId =  *((unsigned char*)EmbeddedResources::IatConfigFile_dat.data());
	switch (iatId)
	{
	case 0:
		_intakeAirTemperatureService = new EngineManagement::IntakeAirTemperatureService_Static(*((float *)((unsigned char*)EmbeddedResources::IatConfigFile_dat.data() + 1)), *((float *)((unsigned char*)EmbeddedResources::IatConfigFile_dat.data() + 1) + 1), *((float *)((unsigned char*)EmbeddedResources::IatConfigFile_dat.data() + 1) + 2));
		break;
	case 1:
		_intakeAirTemperatureService = new EngineManagement::IntakeAirTemperatureService_Analog(_timerService, _analogService, IAT_PIN, ((void *)((unsigned char*)EmbeddedResources::IatConfigFile_dat.data() + 1)));
		break;
	}
	
	//TODO: Create Unit Tests
	unsigned char voltageId =  *((unsigned char*)EmbeddedResources::VoltageConfigFile_dat.data());
	switch (voltageId)
	{
	case 0:
		_voltageService = new EngineManagement::VoltageService_Static(*((float *)((unsigned char*)EmbeddedResources::VoltageConfigFile_dat.data() + 1)), *((float *)((unsigned char*)EmbeddedResources::VoltageConfigFile_dat.data() + 1) + 1), *((float *)((unsigned char*)EmbeddedResources::VoltageConfigFile_dat.data() + 1) + 2));
		break;
	case 1:
		_voltageService = new EngineManagement::VoltageService_Analog(_timerService, _analogService, VOLTAGE_PIN, ((void *)((unsigned char*)EmbeddedResources::VoltageConfigFile_dat.data() + 1)));
		break;
	}
	
	//TODO: Create PWM service
	
	//TODO: Create EthanolService_Pwm
	//Create Unit Tests
	unsigned char ethanolServiceId = *((unsigned char*)EmbeddedResources::EthanolConfigFile_dat.data());
	switch (ethanolServiceId)
	{
	case 0:
		_ethanolService = new EngineManagement::EthanolService_Static(*((float*)((unsigned char*)EmbeddedResources::EthanolConfigFile_dat.data() + 1)));
		break;
	case 1:
		_ethanolService = new EngineManagement::EthanolService_Analog(_analogService, ETHANOL_PIN, (void*)((unsigned char*)EmbeddedResources::EthanolConfigFile_dat.data() + 1));
		break;
	}
	
	//TODO: Create Unit Tests
	//AFR Service to use TPS override and ECT for warm up enrichment
	unsigned char afrServiceId = *((unsigned char*)EmbeddedResources::AfrConfigFile_dat.data());
	switch (afrServiceId)
	{
	case 0:
		_afrService = new EngineManagement::AfrService_Static(*((float*)((unsigned char*)EmbeddedResources::AfrConfigFile_dat.data() + 1)));
		break;
	case 1:
		_afrService = new EngineManagement::AfrService_Map_Ethanol(_decoder, _pistonEngineConfig, _mapService, _ethanolService, (void*)((unsigned char*)EmbeddedResources::AfrConfigFile_dat.data() + 1));
		break;
	}
	
	//TODO: Create TPS Service
	
	//TODO: create unit tests
	//Use TPS for "Accelerator Pump"
	unsigned char pistonEngineInjectionConfigId = *((unsigned char*)EmbeddedResources::PistonEngineInjectionConfigFile_dat.data());
	switch (pistonEngineInjectionConfigId)
	{
	case 1:
		_pistonEngineInjectionConfig = new EngineManagement::PistonEngineInjectionConfig_SD(_decoder, _fuelTrimService, _mapService, _intakeAirTemperatureService, _engineCoolantTemperatureService, _voltageService, _afrService, _pistonEngineConfig, (void*)((unsigned char*)EmbeddedResources::PistonEngineInjectionConfigFile_dat.data() + 1));
		break;
	}
	
	//TODO: create unit tests
	unsigned char pistonEngineIgnitionConfigId = *((unsigned char*)EmbeddedResources::PistonEngineInjectionConfigFile_dat.data());
	switch (pistonEngineIgnitionConfigId)
	{
	case 1:
		_pistonEngineIgnitionConfig = new EngineManagement::PistonEngineIgnitionConfig_Map_Ethanol(_decoder, _mapService, _ethanolService, _intakeAirTemperatureService, _engineCoolantTemperatureService, _voltageService, _afrService, _pistonEngineConfig, (void*)((unsigned char*)EmbeddedResources::PistonEngineIgnitionConfigFile_dat.data() + 1));
		break;
	}
	
	//TODO: create unit tests
	//finish odd cylinder banks
	//finish Throttle Body Injection
	_pistonEngineController = new EngineManagement::PistonEngineController(_timerService, _decoder, _ignitorServices, _injectorServices, _pistonEngineInjectionConfig, _pistonEngineIgnitionConfig, _pistonEngineConfig);
	
	//wait until the decoder is synced before any scheduling
	while (!_decoder->IsSynced()) ;
	
	//TODO: Create Fuel Prime
	
	for (;;)
	{
		_mapService->ReadMap();
		_engineCoolantTemperatureService->ReadEct();
		_intakeAirTemperatureService->ReadIat();
		_voltageService->ReadVoltage();
		_ethanolService->ReadEthanolContent();
		_pistonEngineController->ScheduleEvents();
	}
}

//TODO: create and enable intterupts for decoder

