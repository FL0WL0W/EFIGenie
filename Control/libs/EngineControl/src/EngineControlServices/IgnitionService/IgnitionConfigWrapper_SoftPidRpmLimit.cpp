#include "EngineControlServices/IgnitionService/IgnitionConfigWrapper_SoftPidRpmLimit.h"

#ifdef IGNITIONCONFIGWRAPPER_SOFTPIDRPMLIMIT_H
namespace EngineControlServices
{
	IgnitionConfigWrapper_SoftPidRpmLimit::IgnitionConfigWrapper_SoftPidRpmLimit(const IgnitionConfigWrapper_SoftPidRpmLimitConfig * config, ITimerService *timerService, ICrankCamDecoder *decoder, IBooleanInputService *booleanInputService, IIgnitionConfig *child)
	{		
		_config = config;
		_timerService = timerService;
		_decoder = decoder;
		_booleanInputService = booleanInputService;
		_child = child;
	}
	
	IgnitionTiming IgnitionConfigWrapper_SoftPidRpmLimit::GetIgnitionTiming()
	{
		_booleanInputService->ReadValue();
		
		unsigned short rpm = _decoder->GetRpm();
		int error = rpm - _config->RpmLimit;		
		
		float dt = _timerService->GetElapsedTime(_prevRpmTime);
		_prevRpmTime = _timerService->GetTick();
		
		if (rpm < _config->RpmStart)
		{
			_integral = error * dt;
			
			if (_booleanInputService == 0 || _booleanInputService->Value)
			{
				IgnitionTiming timing = _child->GetIgnitionTiming();
												
				short IgnitionAdvance64thDegreeError = (short)round(error * _config->RpmKp + ((error - _prevError) / dt) * _config->RpmKd + _integral * _config->RpmKi);
			
				if (IgnitionAdvance64thDegreeError > 0)
					IgnitionAdvance64thDegreeError = 0;
			
				timing.IgnitionAdvance64thDegree += IgnitionAdvance64thDegreeError;
			
				_prevError = error;
				return timing;
			}
		}
		else
			_integral = 0;
		
		_prevError = error;
		return _child->GetIgnitionTiming();
	}
}
#endif