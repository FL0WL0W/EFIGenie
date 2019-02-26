#include "EngineControlServices/FuelPumpService/FuelPumpService.h"

#ifdef FUELPUMPSERVICE_H
namespace EngineControlServices
{
	FuelPumpService::FuelPumpService(const FuelPumpServiceConfig *config, ITimerService *timerService, IBooleanOutputService *outputService)
	{
		_config = config;
		_timerService = timerService;
		_outputService = outputService;
	}
	
	void FuelPumpService::Off()
	{
		_outputService->OutputReset();
	}
	
	void FuelPumpService::On()
	{
		Started = true;
		_outputService->OutputSet();
	}
	
	void FuelPumpService::Prime()
	{
		_outputService->OutputSet();
		
		_timerService->ScheduleTask(&FuelPumpService::PrimeTaskOff, this, (unsigned int)round(_config->PrimeTime * _timerService->GetTicksPerSecond() + _timerService->GetTick()), true);
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