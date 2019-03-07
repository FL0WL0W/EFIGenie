#include "IOServices/FloatInputService/FloatInputService_AnalogInterpolatedTable.h"

#ifdef FLOATINPUTSERVICE_ANALOGINTERPOLATEDTABLE_H
namespace IOServices
{
	FloatInputService_AnalogInterpolatedTable::FloatInputService_AnalogInterpolatedTable(const HardwareAbstractionCollection *hardwareAbstractionCollection, const FloatInputService_AnalogInterpolatedTableConfig *config)
	{
		_hardwareAbstractionCollection = hardwareAbstractionCollection;
		_config = config;

		_hardwareAbstractionCollection->AnalogService->InitPin(_config->AdcPin);
	}

	void FloatInputService_AnalogInterpolatedTable::ReadValue()
	{
		const float adcValue = _hardwareAbstractionCollection->AnalogService->ReadPin(_config->AdcPin);

		Value = Interpolation::InterpolateTable1<const float>(adcValue, _config->MaxInputValue, _config->MinInputValue, _config->Resolution, _config->Table());

		const float elapsedTime = _hardwareAbstractionCollection->TimerService->GetElapsedTime(_lastReadTick);
		if (elapsedTime * _config->DotSampleRate < 1.0)
			return;

		_lastReadTick = _hardwareAbstractionCollection->TimerService->GetTick();
		ValueDot = (Value - _lastValue) / elapsedTime;
		_lastValue = Value;
	}
}
#endif
