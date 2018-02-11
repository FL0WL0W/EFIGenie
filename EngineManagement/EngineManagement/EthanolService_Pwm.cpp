#include <stdint.h>
#include "PinDirection.h"
#include "IEthanolService.h"
#include "IPwmService.h"
#include "EthanolService_Pwm.h"

namespace EngineManagement
{	
	EthanolService_Pwm::EthanolService_Pwm(HardwareAbstraction::IPwmService *pwmService, unsigned char pwmPin, void *config)
	{
		_pwmService = pwmService;
		
		_pwmPin = pwmPin;
		_pwmService->InitPin(_pwmPin, HardwareAbstraction::In);
		
		LoadConfig(config);
	}
	
	void EthanolService_Pwm::LoadConfig(void *config)
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
	
	void EthanolService_Pwm::ReadEthanolContent()
	{
		float prevEc = EthanolContent;
		HardwareAbstraction::PwmValue pwmValue = _pwmService->ReadPin(_pwmPin);
		float pulseWidth = pwmValue.PulseWidth / pwmValue.Period;
		EthanolContent = A3 * pulseWidth * pulseWidth * pulseWidth + A2 * pulseWidth * pulseWidth + A1 * pulseWidth + A0;
	}
}