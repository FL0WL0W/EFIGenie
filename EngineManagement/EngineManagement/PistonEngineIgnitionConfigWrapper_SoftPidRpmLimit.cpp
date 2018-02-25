#include "Services.h"
#include "PistonEngineFactory.h"

namespace EngineManagement
{
	PistonEngineIgnitionConfigWrapper_SoftPidRpmLimit::PistonEngineIgnitionConfigWrapper_SoftPidRpmLimit(void *config)
	{		
		_pinEnable = *(unsigned char *)config;
		config = (void*)((unsigned char *)config + 1);
		
		_pinNormalOn = (bool)(*(unsigned char *)config);
		config = (void*)((unsigned char *)config + 1);
		
		_rpmStart = *(unsigned short *)config;
		config = (void*)((unsigned short *)config + 1);
		
		_rpmLimit = *(unsigned short *)config;
		config = (void*)((unsigned short *)config + 1);
		
		_rpmKp = *(float *)config;
		config = (void*)((float *)config + 1);
		
		_rpmKi = *(float *)config;
		config = (void*)((float *)config + 1);
		
		_rpmKd = *(float *)config;
		config = (void*)((float *)config + 1);
				
		_child = CreatePistonEngineIgnitionConfig(config);
	}
	
	IgnitionTiming PistonEngineIgnitionConfigWrapper_SoftPidRpmLimit::GetIgnitionTiming()
	{
		unsigned short rpm = CurrentDecoder->GetRpm();
		unsigned int rpmTimeOrig = CurrentTimerService->GetTick();
		unsigned int rpmTime = rpmTimeOrig;		
				
		if (rpmTime < _prevRpmTime)
		{
			_prevRpmTime = _prevRpmTime + 2147483647;
			rpmTime += 2147483647;
		}
		
		int error = rpm - _rpmLimit;		
		
		if (rpm < _rpmStart)
		{
			float dt = (rpmTime = _prevRpmTime) / CurrentTimerService->GetTicksPerSecond();
			_integral = error * dt;
			
			if (_pinEnable == 0 || CurrentDigitalService->ReadPin(_pinEnable) != _pinNormalOn)
			{
				IgnitionTiming timing = _child->GetIgnitionTiming();
												
				short IgnitionAdvance64thDegreeError = error * _rpmKp + ((error - _prevError) / dt) * _rpmKd + _integral * _rpmKi;
			
				if (IgnitionAdvance64thDegreeError > 0)
					IgnitionAdvance64thDegreeError = 0;
			
				timing.IgnitionAdvance64thDegree += IgnitionAdvance64thDegreeError;
			
				_prevRpmTime = rpmTimeOrig;
				_prevError = error;
				return timing;
			}
		}
		else
			_integral = 0;
		
		_prevRpmTime = rpmTimeOrig;
		_prevError = error;
		return _child->GetIgnitionTiming();
	}
}