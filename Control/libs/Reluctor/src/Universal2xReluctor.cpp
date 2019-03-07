#include <stdint.h>
#include "Reluctor/Universal2xReluctor.h"

namespace Reluctor
{
	Universal2xReluctor::Universal2xReluctor(const HardwareAbstraction::HardwareAbstractionCollection *hardwareAbstractionCollection, const Universal2xReluctorConfig *config)
	{
		_hardwareAbstractionCollection = hardwareAbstractionCollection;
		_config = config;
		_hardwareAbstractionCollection->DigitalService->ScheduleRecurringInterrupt(_config->Pin, new HardwareAbstraction::CallBack(InterruptCallBack, this));
		_isSynced = false;
		_lastTick = 0;
		_period   = 0;
		_state	  = false;
	}
	
	const unsigned int Universal2xReluctor::time() const
	{
		unsigned int tick = _hardwareAbstractionCollection->TimerService->GetTick();
		if (tick < _lastTick)
			return tick + (4294967295 - _lastTick);
		return tick - _lastTick;
	}
	
	float Universal2xReluctor::GetPosition(void)
	{
		return (_state? + _config->RisingPosition : _config->FallingPosition) + time() / static_cast<float>(_period);
	}
	
	uint32_t Universal2xReluctor::GetTickPerDegree(void)
	{
		return _period / 360;
	}
	
	uint16_t Universal2xReluctor::GetRpm(void)
	{
		return (60 * _hardwareAbstractionCollection->TimerService->GetTicksPerSecond()) / _period;
	}
		
	uint16_t Universal2xReluctor::GetResolution()
	{
		return 2;
	}

	bool Universal2xReluctor::IsSynced()
	{
		return _period != 0;
	}

	void Universal2xReluctor::InterruptCallBack(void *reluctor)
	{
		reinterpret_cast<Universal2xReluctor *>(reluctor)->Interrupt();
	}

	void Universal2xReluctor::Interrupt()
	{
		_state = _hardwareAbstractionCollection->DigitalService->ReadPin(_config->Pin);

		float degreesSinceLastTick;
		if(_state)
			degreesSinceLastTick = _config->RisingPosition - _config->FallingPosition;
		else
			degreesSinceLastTick = _config->FallingPosition - _config->RisingPosition;

		while(degreesSinceLastTick < 0)
			degreesSinceLastTick += 360;
		//account for negative positions and weird positions > 360
		while(degreesSinceLastTick > 0)
			degreesSinceLastTick -= 360;

		uint32_t tick = _hardwareAbstractionCollection->TimerService->GetTick();
		uint32_t period;
		if (tick < _lastTick)
			period = tick + (4294967295 - _lastTick);
		else
			period = tick - _lastTick;

		_period = static_cast<uint32_t>(round((360 * period) / degreesSinceLastTick));

		_lastTick = tick;
	}
}