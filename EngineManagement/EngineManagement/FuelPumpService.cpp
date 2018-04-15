#include "FuelPumpService.h"

#ifdef FuelPumpServiceExists
namespace EngineManagement
{
	FuelPumpService::FuelPumpService(const FuelPumpServiceConfig *config, bool highZ)
	{
		_config = config;
		
		_highZ = highZ;

		if (_highZ && _config->NormalOn)
		{
			CurrentDigitalService->InitPin(_config->Pin, HardwareAbstraction::In);
		}
		else
		{
			CurrentDigitalService->InitPin(_config->Pin, HardwareAbstraction::Out);
			
			CurrentDigitalService->WritePin(_config->Pin, _config->NormalOn);
		}
	}
	
	void FuelPumpService::Off()
	{
		if (_highZ && _config->NormalOn)
		{
			CurrentDigitalService->InitPin(_config->Pin, HardwareAbstraction::In);
		}
		else
		{
			if (_highZ)
			{
				CurrentDigitalService->InitPin(_config->Pin, HardwareAbstraction::Out);
			}

			CurrentDigitalService->WritePin(_config->Pin, _config->NormalOn);
		}
	}
	
	void FuelPumpService::On()
	{
		Started = true;
		if (_highZ && !_config->NormalOn)
		{
			CurrentDigitalService->InitPin(_config->Pin, HardwareAbstraction::In);
		}
		else
		{
			if (_highZ)
			{
				CurrentDigitalService->InitPin(_config->Pin, HardwareAbstraction::Out);
			}

			CurrentDigitalService->WritePin(_config->Pin, !_config->NormalOn);
		}
	}
	
	void FuelPumpService::Prime()
	{
		if (_highZ && !_config->NormalOn)
		{
			CurrentDigitalService->InitPin(_config->Pin, HardwareAbstraction::In);
		}
		else
		{
			if (_highZ)
			{
				CurrentDigitalService->InitPin(_config->Pin, HardwareAbstraction::Out);
			}

			CurrentDigitalService->WritePin(_config->Pin, !_config->NormalOn);
		}
		
		CurrentTimerService->ScheduleTask(&FuelPumpService::PrimeTaskOff, this, _config->PrimeTime + CurrentTimerService->GetTick(), true);
	}
	
	void FuelPumpService::PrimeTaskOff(void *parameter)
	{
		FuelPumpService *service = ((FuelPumpService *)parameter);
		if(!service->Started)
			service->Off();
	}
	
	void FuelPumpService::Tick()
	{
		
	}
}
#endif