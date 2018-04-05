#include "Services.h"

#ifdef TachometerServiceExists
namespace EngineManagement
{
	TachometerService::TachometerService(const TachometerServiceConfig *config, bool highZ)
	{
		_config = config;
				
		_ticksPerRpm = (15 * CurrentTimerService->GetTicksPerSecond()) / _config->PulsesPer2Rpm;
		
		_pinHighZ = highZ;

		CurrentDigitalService->InitPin(_config->DigitalPin, HardwareAbstraction::Out);
		CurrentDigitalService->WritePin(_config->DigitalPin, false);
		
		TachometerTask = new HardwareAbstraction::Task(TachometerService::TogglePinTask, this, false);
		CurrentTimerService->ScheduleTask(TachometerTask, CurrentTimerService->GetTicksPerSecond() * 2);
	}
	
	void TachometerService::TogglePinTask(void *parameters)
	{
		TachometerService *service = ((TachometerService *) parameters);
		service->_pinStatus = !service->_pinStatus;
		CurrentDigitalService->WritePin(service->_config->DigitalPin, service -> _pinStatus);
		if (CurrentDecoder->GetRpm() < 1)
			CurrentTimerService->ScheduleTask(service->TachometerTask, service->_ticksPerRpm / CurrentDecoder->GetRpm());
		else
			CurrentTimerService->ScheduleTask(service->TachometerTask, service->_ticksPerRpm);
	}
	
	TachometerService *CurrentTachometerService;
}
#endif