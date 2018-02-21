#ifndef NOINJECTION
#include "Services.h"
#include "FuelPumpService.h"

namespace EngineManagement
{
	FuelPumpService::FuelPumpService(void *config, bool highZ)
	{
		_pin = *(unsigned char *)config;
		config = (void*)((unsigned char *)config + 1);
		
		_primeTime = *(float *)config * CurrentTimerService->GetTicksPerSecond();
		config = (void*)((float *)config + 1);
		
		_normalOn = (bool)(*(unsigned char *)config);
		config = (void*)((unsigned char *)config + 1);
		
		_highZ = highZ;

		if (_highZ && _normalOn)
		{
			CurrentDigitalService->InitPin(_pin, HardwareAbstraction::In);
		}
		else
		{
			CurrentDigitalService->InitPin(_pin, HardwareAbstraction::Out);
			
			CurrentDigitalService->WritePin(_pin, _normalOn);
		}
	}
	
	void FuelPumpService::Off()
	{
		if (_highZ && _normalOn)
		{
			CurrentDigitalService->InitPin(_pin, HardwareAbstraction::In);
		}
		else
		{
			if (_highZ)
			{
				CurrentDigitalService->InitPin(_pin, HardwareAbstraction::Out);
			}

			CurrentDigitalService->WritePin(_pin, _normalOn);
		}
	}
	
	void FuelPumpService::On()
	{
		Started = true;
		if (_highZ && !_normalOn)
		{
			CurrentDigitalService->InitPin(_pin, HardwareAbstraction::In);
		}
		else
		{
			if (_highZ)
			{
				CurrentDigitalService->InitPin(_pin, HardwareAbstraction::Out);
			}

			CurrentDigitalService->WritePin(_pin, !_normalOn);
		}
	}
	
	void FuelPumpService::Prime()
	{
		if (_highZ && !_normalOn)
		{
			CurrentDigitalService->InitPin(_pin, HardwareAbstraction::In);
		}
		else
		{
			if (_highZ)
			{
				CurrentDigitalService->InitPin(_pin, HardwareAbstraction::Out);
			}

			CurrentDigitalService->WritePin(_pin, !_normalOn);
		}
		
		CurrentTimerService->ScheduleTask(&FuelPumpService::PrimeTaskOff, this, _primeTime + CurrentTimerService->GetTick(), 10, true);
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