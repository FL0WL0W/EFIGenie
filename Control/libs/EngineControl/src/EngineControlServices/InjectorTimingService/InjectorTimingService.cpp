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
		for(unsigned char injector; injector < _config->Injectors; injector++)
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

		for(unsigned char injector; injector < _config->Injectors; injector++)
		{	
			float injectorDuration = _injectorGramService->InjectorGrams[injector] * 60.0f / _config->InjectorGramsPerMinute()[injector];
			if(injectorDuration < _config->ShortPulseLimit)
				injectorDuration += InterpolateTable1<short>(injectorDuration, _config->ShortPulseLimit, 0, _config->ShortPulseAdderResolution, _config->ShortPulseAdder()) * 0.000001f;
							
			float offset = InterpolateTable2<short>(voltage, _config->VoltageMax, _config->VoltageMin, _config->OffsetVoltageResolution, map, _config->OffsetMapMax, 0.0f, _config->OffsetMapResolution, _config->Offset()) * 0.000001f;
			
			injectorDuration += offset;
					
			if (injectorDuration <= 0) 
				InjectorTiming[injector].PulseWidth = 0;
			else
				InjectorTiming[injector].PulseWidth = injectorDuration;
		}
	}
}
#endif