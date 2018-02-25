#include "Services.h"
#include "EthanolService_Analog.h"

#ifdef EthanolService_AnalogExists
namespace EngineManagement
{	
	EthanolService_Analog::EthanolService_Analog(void *config)
	{
		_adcPin = *((unsigned char *)config);
		config = (void*)((unsigned char *)config + 1);
		
		A0 = *((float *)config);
		config = (void*)((float *)config + 1);
		
		A1 = *((float *)config);
		config = (void*)((float *)config + 1);
		
		A2 = *((float *)config);
		config = (void*)((float *)config + 1);
		
		A3 = *((float *)config);
		config = (void*)((float *)config + 1);
		
		CurrentAnalogService->InitPin(_adcPin);
	}
	
	void EthanolService_Analog::ReadEthanolContent()
	{
		float prevEc = EthanolContent;
		float adcValue = CurrentAnalogService->ReadPin(_adcPin);
		EthanolContent = A3 * adcValue * adcValue * adcValue + A2 * adcValue * adcValue + A1 * adcValue + A0;
	}
}
#endif