#include "IOServices/FloatInputService/FloatInputService_FrequencyInterpolatedTable.h"

#ifdef FLOATINPUTSERVICE_FREQUENCYINTERPOLATEDTABLE_H
namespace IOServices
{
	FloatInputService_FrequencyInterpolatedTable::FloatInputService_FrequencyInterpolatedTable(const HardwareAbstractionCollection *hardwareAbstractionCollection, const FloatInputService_FrequencyInterpolatedTableConfig *config)
	{
		_hardwareAbstractionCollection = hardwareAbstractionCollection;
		_config = config;

		_hardwareAbstractionCollection->PwmService->InitPin(_config->PwmPin, HardwareAbstraction::In, _config->MinFrequency);
	}

	void FloatInputService_FrequencyInterpolatedTable::ReadValue()
	{
		HardwareAbstraction::PwmValue pwmValue = _hardwareAbstractionCollection->PwmService->ReadPin(_config->PwmPin);

		if (pwmValue.Period <= 0)
			return;

		const float frequency = 1 / pwmValue.Period;

		Value = Interpolation::InterpolateTable1<float>(frequency, _config->MaxFrequency, _config->MinFrequency, _config->Resolution, _config->Table());

		const float elapsedTime = _hardwareAbstractionCollection->TimerService->GetElapsedTime(_lastReadTick);
		if (elapsedTime * _config->DotSampleRate < 1.0)
			return;

		_lastReadTick = _hardwareAbstractionCollection->TimerService->GetTick();
		ValueDot = (Value - _lastValue) / elapsedTime;
		_lastValue = Value;
	}
}
#endif