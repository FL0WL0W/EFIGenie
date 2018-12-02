#include "IOServices/FloatOutputService/FloatOutputService_PwmInterpolatedTable.h"
#include "Interpolation.h"

#ifdef FLOATOUTPUTSERVICE_PWMINTERPOLATEDTABLE_H
namespace IOServices
{
	FloatOutputService_PwmInterpolatedTable::FloatOutputService_PwmInterpolatedTable(const HardwareAbstractionCollection *hardwareAbstractionCollection, const FloatOutputService_PwmInterpolatedTableConfig *config)
	{
		_hardwareAbstractionCollection = hardwareAbstractionCollection;
		_config = config;

		_hardwareAbstractionCollection->PwmService->InitPin(_config->PwmPin, HardwareAbstraction::Out, _config->Frequency);
	}

	void FloatOutputService_PwmInterpolatedTable::SetOutput(float value)
	{
		float pwmValue = Interpolation::InterpolateTable1<float>(value, _config->MaxValue, _config->MinValue, _config->Resolution, _config->Table);
		
		_hardwareAbstractionCollection->PwmService->WritePin(_config->PwmPin, { 1.0f / _config->Frequency, pwmValue / _config->Frequency });
	}

	void FloatOutputService_PwmInterpolatedTable::Calibrate() { }
}
#endif