#include "Services.h"
#include "EthanolService_Pwm.h"

#ifdef EthanolService_PwmExists
namespace EngineManagement
{	
	EthanolService_Pwm::EthanolService_Pwm(void *config)
	{
		_pwmPin = *((unsigned char *)config);
		config = (void*)((unsigned char *)config + 1);
		
		A0 = *((float *)config);
		config = (void*)((float *)config + 1);
		
		A1 = *((float *)config);
		config = (void*)((float *)config + 1);
		
		A2 = *((float *)config);
		config = (void*)((float *)config + 1);
		
		A3 = *((float *)config);
		config = (void*)((float *)config + 1);
		
		unsigned short minFrequency = *((unsigned short *)config);
		config = (void*)((unsigned short *)config + 1);
		
		CurrentPwmService->InitPin(_pwmPin, HardwareAbstraction::In, minFrequency);
	}
	
	void EthanolService_Pwm::ReadEthanolContent()
	{
		float prevEc = EthanolContent;
		HardwareAbstraction::PwmValue pwmValue = CurrentPwmService->ReadPin(_pwmPin);
		EthanolContent = A3 * pwmValue.Period * pwmValue.Period * pwmValue.Period + A2 * pwmValue.Period * pwmValue.Period + A1 * pwmValue.Period + A0;
	}
}
#endif