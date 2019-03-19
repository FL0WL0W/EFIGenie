#include <stdint.h>
#include "Reluctor/Gm24xReluctor.h"

namespace Reluctor
{
	Gm24xReluctor::Gm24xReluctor(const HardwareAbstraction::HardwareAbstractionCollection *hardwareAbstractionCollection, const uint16_t pin)
	{
		_hardwareAbstractionCollection = hardwareAbstractionCollection;
		_pin = pin;
		_hardwareAbstractionCollection->DigitalService->ScheduleRecurringInterrupt(_pin, new HardwareAbstraction::CallBack(Gm24xReluctor::InterruptCallBack, this));
		_isSynced = false;
		_lastTick = 0;
		_period   = 0;
		_state	  = 0;
		_subState = 0;
	}
	
	float Gm24xReluctor::GetPosition()
	{
		float position;
		do
		{
			_interruptCalled = false;
			position = _state * 15 + (_hardwareAbstractionCollection->TimerService->GetElapsedTick(_lastTick) * 15) / static_cast<float>(_period);
		} while(_interruptCalled);
		
		return position;
	}
	
	float Gm24xReluctor::GetTickPerDegree(void)
	{
		return _period / 15.0f;
	}
	
	uint16_t Gm24xReluctor::GetRpm(void)
	{
		return ((60 * _hardwareAbstractionCollection->TimerService->GetTicksPerSecond()) / 24) / _period;
	}
		
	uint16_t Gm24xReluctor::GetResolution()
	{
		return 24;
	}

	bool Gm24xReluctor::IsSynced()
	{
		if(_isSynced && _hardwareAbstractionCollection->TimerService->GetElapsedTick(_lastTick) > _period * 2)
			_isSynced = false;
		return _isSynced;
	}

	void Gm24xReluctor::InterruptCallBack(void *reluctorPointer)
	{
		Gm24xReluctor *reluctor = reinterpret_cast<Gm24xReluctor *>(reluctorPointer);
		bool rising = reluctor->_hardwareAbstractionCollection->DigitalService->ReadPin(reluctor->_pin);
		uint32_t tick = reluctor->_hardwareAbstractionCollection->TimerService->GetTick();

		int32_t elapsedTick = tick - reluctor->_lastTick;

		if(reluctor->_isSynced && elapsedTick < 0)
			return;

		if (!rising)
		{
			reluctor->_period = elapsedTick;
			
			reluctor->_state++;
			if (reluctor->_state > 23)
				reluctor->_state = 0;
			
			if(tick == 0)
				reluctor->_lastTick = 1;
			else
				reluctor->_lastTick = tick;
		}
		else if(reluctor->_period != 0)
		{
			uint32_t interumPeriod = elapsedTick;
			
			if (interumPeriod > reluctor->_period * 0.6)
			{
				//short pulse
				//    _
				//|__| |
				//   ^
				reluctor->_subState = 0;
			}
			else
			{
				//long pulse
				//   __
				//|_|  |
				//  ^
				reluctor->_subState++;
				if (reluctor->_subState == 5)
				{
					reluctor->_state = 5;
					reluctor->_isSynced = true;
				}
			}
		}
		
		reluctor->_interruptCalled = true;
	}
}