#include <stdint.h>
#include "IEthanolService.h"
#include "IAnalogService.h"
#include "EthanolService_Analog.h"

namespace EngineManagement
{	
	EthanolService_Analog::EthanolService_Analog(HardwareAbstraction::IAnalogService *analogService, unsigned char adcPin, void *config)
	{
		_analogService = analogService;
		
		_adcPin = adcPin;
		_analogService->InitPin(_adcPin);
		
		LoadConfig(config);
	}
	
	void EthanolService_Analog::LoadConfig(void *config)
	{		
		A0 = *((float *)config);
		config = (void*)((float *)config + 1);
		
		A1 = *((float *)config);
		config = (void*)((float *)config + 1);
		
		A2 = *((float *)config);
		config = (void*)((float *)config + 1);
		
		A3 = *((float *)config);
		config = (void*)((float *)config + 1);
	}
	
	void EthanolService_Analog::ReadEthanolContent()
	{
		float prevEc = EthanolContent;
		float adcValue = _analogService->ReadPin(_adcPin);
		EthanolContent = A3 * adcValue * adcValue * adcValue + A2 * adcValue * adcValue + A1 * adcValue + A0;
	}
}