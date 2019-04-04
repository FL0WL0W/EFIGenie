#include "EngineControlServices/InjectorTimingService/InjectorTimingService.h"

#ifdef INJECTORTIMINGSERVICE_H
namespace EngineControlServices
{
	InjectorTimingService::InjectorTimingService(
		const InjectorTimingServiceConfig *config, 
			IInjectorGramService *injectorGramService,
			IFloatInputService *manifoldAbsolutePressureService,
			IFloatInputService *voltageService)
	{		
		_config = config;
		_injectorGramService = injectorGramService;
		_manifoldAbsolutePressureService = manifoldAbsolutePressureService;
		_voltageService = voltageService;

		InjectorTiming = reinterpret_cast<EngineControlServices::InjectorTiming *>(calloc(sizeof(InjectorTiming) * _config->Injectors, sizeof(InjectorTiming) * _config->Injectors));
		for(uint8_t injector = 0; injector < _config->Injectors; injector++)
		{	
			InjectorTiming[injector].OpenPosition = _config->InjectorOpenPosition;
		}
	}
	
	void InjectorTimingService::CalculateInjectorTiming()
	{		
		float map = _manifoldAbsolutePressureService->Value;
		float voltage = 14;
		if (_voltageService != 0)
			voltage = _voltageService->Value;

		float offset = InterpolateTable2<short>(voltage, _config->VoltageMax, _config->VoltageMin, _config->VoltageResolution, map, _config->MapMax, 0.0f, _config->MapResolution, _config->Offset()) * 0.000001f;

		for(uint8_t injector = 0; injector < _config->Injectors; injector++)
		{	
			float injectorDuration = 0;
			if(_injectorGramService != 0)
			{
				injectorDuration = _injectorGramService->InjectorGrams[injector] * 60.0f / _config->InjectorGramsPerMinute()[injector];
				if(injectorDuration < _config->ShortPulseLimit)
					injectorDuration += InterpolateTable1<short>(injectorDuration, _config->ShortPulseLimit, 0, _config->ShortPulseAdderResolution, _config->ShortPulseAdder()) * 0.000001f;
								
				injectorDuration += offset;
			}
					
			if (injectorDuration <= 0) 
				InjectorTiming[injector].PulseWidth = 0;
			else
				InjectorTiming[injector].PulseWidth = injectorDuration;
		}
	}
}
#endif