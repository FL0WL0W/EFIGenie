#include <map>
#include <functional>
#include "PistonEngineFactory.h"

namespace EngineManagement
{
	PistonEngineInjectionConfigWrapper_DFCO::PistonEngineInjectionConfigWrapper_DFCO(
			Decoder::IDecoder *decoder,
		IFuelTrimService *fuelTrimService,
		IMapService *mapService,
		ITpsService *tpsService,
		IIntakeAirTemperatureService *iatService,
		IEngineCoolantTemperatureService *ectService,
		IVoltageService *voltageService,
		IAfrService *afrService,
		PistonEngineConfig *pistonEngineConfig,
		void *config)
	{
		_decoder = decoder;
		
		_tpsService = tpsService;
		
		_tpsEnable = *(float *)config;
		config = (void*)((float *)config + 1);
		
		_rpmEnable = *(unsigned short *)config;
		config = (void*)((unsigned short *)config + 1);
		
		_rpmDisable = *(unsigned short *)config;
		config = (void*)((unsigned short *)config + 1);
		
		_child = CreatePistonEngineInjectionConfig(
			decoder, 
			fuelTrimService, 
			mapService, 
			tpsService, 
			iatService, 
			ectService, 
			voltageService, 
			afrService,
			pistonEngineConfig,
			config);
	}
	
	InjectorTiming PistonEngineInjectionConfigWrapper_DFCO::GetInjectorTiming(uint8_t cylinder)
	{
		float tps = _tpsService->Tps;
		unsigned short rpm = _decoder->GetRpm();
		
		if (tps < _tpsEnable && rpm > _rpmEnable)
			_dfcoEnabled = true;
		if (rpm < _rpmDisable)
			_dfcoEnabled = false;
		
		if (_dfcoEnabled)
		{
			InjectorTiming timing = InjectorTiming();
			timing.OpenPosition64thDegree = 0;
			timing.PulseWidth = 0;
			return timing;
		}
		
		return _child->GetInjectorTiming(cylinder);
	}
}