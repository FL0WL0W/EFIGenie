#include "EngineControlServices/FuelPumpService/FuelPumpService_Analog.h"

#ifdef FUELPUMPSERVICE_ANALOG_H
namespace EngineControlServices
{
	FuelPumpService_Analog::FuelPumpService_Analog(const FuelPumpService_AnalogConfig *config, ITimerService *timerService, IFloatOutputService *outputService, RpmService *rpmService, IFloatInputService *manifoldAbsolutePressureService, IFloatInputService *throttlePositionService)
	{
		_config = config;
		_timerService = timerService;
		_outputService = outputService;
		_rpmService = rpmService;
		_manifoldAbsolutePressureService = manifoldAbsolutePressureService;
		_throttlePositionService = throttlePositionService;
		
		Off();
	}
	
	void FuelPumpService_Analog::Off()
	{
		_isOn = false;
		_outputService->SetOutput(0);
	}
	
	void FuelPumpService_Analog::On()
	{
		_isOn = true;
		Started = true;
		
		_outputService->SetOutput(_currentValue);
	}
	
	void FuelPumpService_Analog::Prime()
	{
		_currentValue = _config->PrimeValue;
		_outputService->SetOutput(_currentValue);
		
		_timerService->ScheduleTask(&FuelPumpService_Analog::PrimeTaskOff, this, (unsigned int)round(_config->PrimeTime * _timerService->GetTicksPerSecond() + _timerService->GetTick()), true);
	}
	
	void FuelPumpService_Analog::PrimeTaskOff(void *parameter)
	{
		FuelPumpService_Analog *service = ((FuelPumpService_Analog *)parameter);
		if (!service->Started)
			service->Off();
	}
	
	void FuelPumpService_Analog::Tick()
	{	
		if (!_isOn)
			return;
		
		float y = 0;
		if (_throttlePositionService != 0 && _manifoldAbsolutePressureService != 0)
		{
			if ((_config->UseTps && _throttlePositionService != 0) || _manifoldAbsolutePressureService == 0)
			{
				y = _throttlePositionService->Value;
			}
			else if (_manifoldAbsolutePressureService != 0)
			{
				y = _manifoldAbsolutePressureService->Value;
			}
		}
		
		_currentValue = InterpolateTable2<float>(_rpmService->Rpm, _config->MaxRpm, 0, _config->RpmRes, y, _config->MaxY, 0, _config->YRes, _config->AnalogTable());
		
		On();
	}
}
#endif