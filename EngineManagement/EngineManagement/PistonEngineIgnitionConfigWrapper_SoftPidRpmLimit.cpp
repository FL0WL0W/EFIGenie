#include "PistonEngineIgnitionConfigWrapper_SoftPidRpmLimit.h"

#ifdef PISTONENGINEIGNITIONCONFIGWRAPPER_SOFTPIDRPMLIMIT_H
namespace EngineManagement
{
	PistonEngineIgnitionConfigWrapper_SoftPidRpmLimit::PistonEngineIgnitionConfigWrapper_SoftPidRpmLimit(PistonEngineIgnitionConfigWrapper_SoftPidRpmLimitConfig * config, ITimerService *timerService, IDecoder *decoder, IBooleanInputService *booleanInputService, IPistonEngineIgnitionConfig *child)
	{		
		_config = config;
		_timerService = timerService;
		_decoder = decoder;
		_booleanInputService = booleanInputService;
		_child = child;
	}
	
	IgnitionTiming PistonEngineIgnitionConfigWrapper_SoftPidRpmLimit::GetIgnitionTiming()
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
												
				short IgnitionAdvance64thDegreeError = error * _config->RpmKp + ((error - _prevError) / dt) * _config->RpmKd + _integral * _config->RpmKi;
			
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