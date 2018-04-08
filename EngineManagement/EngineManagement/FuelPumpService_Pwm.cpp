#include "Services.h"
#include "Functions.h"
#include "stdlib.h"
#include "FuelPumpService_Pwm.h"

#ifdef FuelPumpService_PwmExists
namespace EngineManagement
{
	FuelPumpService_Pwm::FuelPumpService_Pwm(const FuelPumpService_PwmConfig *config)
	{
		_config = config;

		CurrentPwmService->InitPin(_config->Pin, HardwareAbstraction::Out, 1 / 1.0f / _config->Frequency);
		
		Off();
	}
	
	void FuelPumpService_Pwm::Off()
	{
		_isOn = false;
		if (_config->NormalOn)
		{
			CurrentPwmService->WritePin(_config->Pin, { 1.0f / _config->Frequency, 1.0f / _config->Frequency });
		}
		else
		{
			CurrentPwmService->WritePin(_config->Pin, { 1.0f / _config->Frequency, 0 });
		}
	}
	
	void FuelPumpService_Pwm::On()
	{
		_isOn = true;
		Started = true;
		if (_config->NormalOn)
		{
			CurrentPwmService->WritePin(_config->Pin, { 1.0f / _config->Frequency, 1.0f / _config->Frequency * (1 - _currentPwm / 255.0f) });
		}
		else
		{
			CurrentPwmService->WritePin(_config->Pin, { 1.0f / _config->Frequency, 1.0f / _config->Frequency * (_currentPwm / 255.0f) });
		}
	}
	
	void FuelPumpService_Pwm::Prime()
	{
		_currentPwm = _config->PrimePwm;
		if (_config->NormalOn)
		{
			CurrentPwmService->WritePin(_config->Pin, { 1.0f / _config->Frequency, 1.0f / _config->Frequency * (1 - _currentPwm / 255.0f) });
		}
		else
		{
			CurrentPwmService->WritePin(_config->Pin, { 1.0f / _config->Frequency, 1.0f / _config->Frequency * (_currentPwm / 255.0f) });
		}
		
		CurrentTimerService->ScheduleTask(&FuelPumpService_Pwm::PrimeTaskOff, this, _config->PrimeTime + CurrentTimerService->GetTick(), true);
	}
	
	void FuelPumpService_Pwm::PrimeTaskOff(void *parameter)
	{
		FuelPumpService_Pwm *service = ((FuelPumpService_Pwm *)parameter);
		if (!service->Started)
			service->Off();
	}
	
	void FuelPumpService_Pwm::Tick()
	{	
		if (!_isOn)
			return;
		
		float y = 0;
		if (CurrentThrottlePositionService != 0 && CurrentManifoldAbsolutePressureService != 0)
		{
			if ((_config->UseTps && CurrentThrottlePositionService != 0) || CurrentManifoldAbsolutePressureService == 0)
			{
				y = CurrentThrottlePositionService->Value;
			}
			else if (CurrentManifoldAbsolutePressureService != 0)
			{
				y = CurrentManifoldAbsolutePressureService->Value;
			}
		}
		
		_currentPwm = InterpolateTable2<unsigned char>(CurrentDecoder->GetRpm(), _config->MaxRpm, 0, _config->RpmRes, y, _config->MaxY, 0, _config->YRes, _config->PwmTable);
		
		On();
	}
}
#endif