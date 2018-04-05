#include "Services.h"
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
		
		unsigned char rpmIndexL = 0;
		unsigned char rpmIndexH = 0;
		float rpmMultiplier = 0;
		if (_config->RpmRes > 1)
		{
			unsigned short rpm = CurrentDecoder->GetRpm();
			unsigned short rpmDivision = _config->MaxRpm / _config->RpmRes;
			unsigned char rpmIndexL = rpm / rpmDivision;
			unsigned char rpmIndexH = rpmIndexL + 1;
			float rpmMultiplier = (rpm + 0.0f) / rpmDivision - rpmIndexL;
			if (rpmIndexL > _config->RpmRes - 1)
			{
				rpmIndexL = rpmIndexH = _config->RpmRes - 1;
			}
			else if (rpmIndexH > _config->RpmRes - 1)
			{
				rpmIndexH = _config->RpmRes - 1;
			}
		}
			
		unsigned char yIndexL = 0;
		unsigned char yIndexH = 0;
		float yMultiplier = 0;
		if (_config->YRes > 1 && CurrentThrottlePositionService != 0 && CurrentManifoldAbsolutePressureService != 0)
		{
			float y = 0;
			if (_config->UseTps && CurrentThrottlePositionService != 0)
			{
				y = CurrentThrottlePositionService->Value;
			}
			else if (CurrentManifoldAbsolutePressureService != 0)
			{
				y = CurrentManifoldAbsolutePressureService->Value;
			}
			float yDivision = _config->MaxY / _config->YRes;
			yIndexL = y / yDivision;
			yIndexH = yIndexL + 1;
			yMultiplier = (y + 0.0f) / yDivision - yIndexL;
			if (yIndexL > _config->YRes - 1)
			{
				yIndexL = yIndexH = _config->YRes - 1;
			}
			else if (yIndexH > _config->YRes - 1)
			{
				yIndexH = _config->YRes - 1;
			}
		}
		
		short _currentPwm = _config->PwmTable[rpmIndexL + _config->RpmRes * yIndexL] * rpmMultiplier * yMultiplier
		+					_config->PwmTable[rpmIndexH + _config->RpmRes * yIndexL] * (1 - rpmMultiplier) * yMultiplier
		+					_config->PwmTable[rpmIndexL + _config->RpmRes * yIndexH] * rpmMultiplier * (1 - yMultiplier)
		+					_config->PwmTable[rpmIndexH + _config->RpmRes * yIndexH] * (1 - rpmMultiplier) * (1 - yMultiplier);
		
		On();
	}
}
#endif