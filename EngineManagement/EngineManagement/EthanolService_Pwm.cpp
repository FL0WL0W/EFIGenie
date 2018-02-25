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
		
		CurrentPwmService->InitPin(_pwmPin, HardwareAbstraction::In);
	}
	
	void EthanolService_Pwm::ReadEthanolContent()
	{
		float prevEc = EthanolContent;
		HardwareAbstraction::PwmValue pwmValue = CurrentPwmService->ReadPin(_pwmPin);
		float pulseWidth = pwmValue.PulseWidth / pwmValue.Period;
		EthanolContent = A3 * pulseWidth * pulseWidth * pulseWidth + A2 * pulseWidth * pulseWidth + A1 * pulseWidth + A0;
	}
}
#endif