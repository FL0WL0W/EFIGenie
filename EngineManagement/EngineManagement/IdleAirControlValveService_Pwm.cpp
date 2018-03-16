#include "Services.h"
#include "IdleAirControlValveService_Pwm.h"

#ifdef IdleAirControlValveService_PwmExists
namespace EngineManagement
{
	IdleAirControlValveService_Pwm::IdleAirControlValveService_Pwm(void *config)
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
		
		MaxPwm = *((float *)config);
		config = (void*)((float *)config + 1);
		
		MinPwm = *((float *)config);
		config = (void*)((float *)config + 1);
		
		unsigned short frequency = *((unsigned short *)config);
		config = (void*)((unsigned short *)config + 1);
		
		_period = 1.0f / frequency;
		
		CurrentPwmService->InitPin(_pwmPin, HardwareAbstraction::Out, frequency);
	}
	
	void IdleAirControlValveService_Pwm::SetArea(float area)
	{
		float pwmValue = area * area * area * A3 + area * area * A2 + area * A1 + A0;
		
		if (pwmValue > MaxPwm)
			pwmValue = MaxPwm;
		else if (pwmValue < MinPwm)
			pwmValue = MinPwm;
		
		CurrentPwmService->WritePin(_pwmPin, { _period, _period * pwmValue });
	}
}
#endif