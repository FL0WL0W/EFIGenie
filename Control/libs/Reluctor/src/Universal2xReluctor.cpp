#include <stdint.h>
#include "Reluctor/Universal2xReluctor.h"

namespace Reluctor
{
	Universal2xReluctor::Universal2xReluctor(const HardwareAbstraction::HardwareAbstractionCollection *hardwareAbstractionCollection, const Universal2xReluctorConfig *config)
	{
		_hardwareAbstractionCollection = hardwareAbstractionCollection;
		_timerService = hardwareAbstractionCollection->TimerService;
		_digitalService = hardwareAbstractionCollection->DigitalService;
		_config = config;
		_pin = _config->Pin;
		_hardwareAbstractionCollection->DigitalService->ScheduleRecurringInterrupt(_config->Pin, new HardwareAbstraction::CallBack(Universal2xReluctor::InterruptCallBack, this));
		_isSynced = false;
		_lastTick = 0;
		_period   = 0;
		_state	  = false;
	}
	
	float Universal2xReluctor::GetPosition()
	{
		float position;
		do
		{
			_interruptCalled = false;

			float degreesSinceLastTick;
			if(_state)
				degreesSinceLastTick = _config->RisingPosition - _config->FallingPosition;
			else
				degreesSinceLastTick = _config->FallingPosition - _config->RisingPosition;

			while(degreesSinceLastTick < 0)
				degreesSinceLastTick += 360;
			//account for negative positions and weird positions > 360
			while(degreesSinceLastTick > 360)
				degreesSinceLastTick -= 360;

			position = (_state? _config->RisingPosition : _config->FallingPosition) + _timerService->GetElapsedTick(_lastTick) * degreesSinceLastTick / _period;
		} while(_interruptCalled);
		
		return position;
	}
	
	float Universal2xReluctor::GetTickPerDegree(void)
	{
		float tickPerDegree;
		do
		{
			_interruptCalled = false;

			float degreesSinceLastTick;
			if(_state)
				degreesSinceLastTick = _config->RisingPosition - _config->FallingPosition;
			else
				degreesSinceLastTick = _config->FallingPosition - _config->RisingPosition;

			while(degreesSinceLastTick < 0)
				degreesSinceLastTick += 360;
			//account for negative positions and weird positions > 360
			while(degreesSinceLastTick > 360)
				degreesSinceLastTick -= 360;

			tickPerDegree = _period / degreesSinceLastTick;
		} while(_interruptCalled);
		
		return tickPerDegree;
	}
	
	uint16_t Universal2xReluctor::GetRpm(void)
	{
		uint16_t rpm;
		do
		{
			_interruptCalled = false;

			float degreesSinceLastTick;
			if(_state)
				degreesSinceLastTick = _config->RisingPosition - _config->FallingPosition;
			else
				degreesSinceLastTick = _config->FallingPosition - _config->RisingPosition;

			while(degreesSinceLastTick < 0)
				degreesSinceLastTick += 360;
			//account for negative positions and weird positions > 360
			while(degreesSinceLastTick > 360)
				degreesSinceLastTick -= 360;

			rpm = (_timerService->GetTicksPerSecond() * degreesSinceLastTick) / static_cast<uint32_t>(60 * _period);
		} while(_interruptCalled);
		
		return rpm;
	}
		
	uint16_t Universal2xReluctor::GetResolution()
	{
		return 2;
	}

	bool Universal2xReluctor::IsSynced()
	{
		uint16_t rpm;
		uint32_t maxPeriod;
		do
		{
			_interruptCalled = false;

			float degreesSinceLastTick;
			if(_state)
				degreesSinceLastTick = _config->RisingPosition - _config->FallingPosition;
			else
				degreesSinceLastTick = _config->FallingPosition - _config->RisingPosition;

			while(degreesSinceLastTick < 0)
				degreesSinceLastTick += 360;
			//account for negative positions and weird positions > 360
			while(degreesSinceLastTick > 360)
				degreesSinceLastTick -= 360;

			rpm = (_timerService->GetTicksPerSecond() * degreesSinceLastTick) / static_cast<uint32_t>(60 * _period);
			maxPeriod = (static_cast<uint32_t>(360 * _period / degreesSinceLastTick) - _period) * 2;
		} while(_interruptCalled);
		
		if(_period == 0 || _period > maxPeriod || rpm < 6 || rpm > 20000)
			_isSynced = false;

		return _isSynced;
	}

	void Universal2xReluctor::InterruptCallBack(void *reluctorPointer)
	{
		Universal2xReluctor *reluctor = reinterpret_cast<Universal2xReluctor *>(reluctorPointer);

		reluctor->_state = reluctor->_digitalService->ReadPin(reluctor->_pin);
		uint32_t tick = reluctor->_timerService->GetTick();
		if(reluctor->_lastTick != 0)
		{
			reluctor->_period = tick - reluctor->_lastTick;
			reluctor->_isSynced = true;
		}
		if(tick == 0)
			reluctor->_lastTick = 1;
		else
			reluctor->_lastTick = tick;
		
		reluctor->_interruptCalled = true;
	}
}