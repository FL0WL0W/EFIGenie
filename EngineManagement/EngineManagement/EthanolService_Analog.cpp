#include "Services.h"
#include "EthanolService_Analog.h"

namespace EngineManagement
{	
	EthanolService_Analog::EthanolService_Analog(unsigned char adcPin, void *config)
	{
		_adcPin = adcPin;
		CurrentAnalogService->InitPin(_adcPin);
		
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
		float adcValue = CurrentAnalogService->ReadPin(_adcPin);
		EthanolContent = A3 * adcValue * adcValue * adcValue + A2 * adcValue * adcValue + A1 * adcValue + A0;
	}
}