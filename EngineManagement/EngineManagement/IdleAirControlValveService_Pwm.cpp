#include "Services.h"
#include "IdleAirControlValveService_Pwm.h"

#ifdef IdleAirControlValveService_PwmExists
namespace EngineManagement
{
	IdleAirControlValveService_Pwm::IdleAirControlValveService_Pwm(const IdleAirControlValveService_PwmConfig *config)
	{
		_config = config;
		
		_period = 1.0f / _config->Frequency;
		
		CurrentPwmService->InitPin(_config->PwmPin, HardwareAbstraction::Out, _config->Frequency);
	}
	
	void IdleAirControlValveService_Pwm::SetArea(float area)
	{
		float pwmValue = area * area * area * _config->A3 + area * area * _config->A2 + area * _config->A1 + _config->A0;
		
		if (pwmValue > _config->MaxPulseWidth)
			pwmValue = _config->MaxPulseWidth;
		else if (pwmValue < _config->MinPulseWidth)
			pwmValue = _config->MinPulseWidth;
		
		CurrentPwmService->WritePin(_config->PwmPin, { _period, _period * pwmValue });
	}
}
#endif