#include "TachometerService.h"

#ifdef TACHOMETERSERVICE_H
namespace ApplicationServiceLayer
{
	TachometerService::TachometerService(const IOServiceLayer::IOServiceCollection *iOServiceCollection, const TachometerServiceConfig *config, const bool highZ)
	{
		_IOServiceCollection = iOServiceCollection;
		_config = config;
				
		_ticksPerRpm = (15 * _IOServiceCollection->HardwareAbstractionCollection->TimerService->GetTicksPerSecond()) / _config->PulsesPer2Rpm;
		
		_pinHighZ = highZ;

		_IOServiceCollection->HardwareAbstractionCollection->DigitalService->InitPin(_config->DigitalPin, HardwareAbstraction::Out);
		_IOServiceCollection->HardwareAbstractionCollection->DigitalService->WritePin(_config->DigitalPin, false);
		
		TachometerTask = new HardwareAbstraction::Task(TachometerService::TogglePinTask, this, false);
		_IOServiceCollection->HardwareAbstractionCollection->TimerService->ScheduleTask(TachometerTask, _IOServiceCollection->HardwareAbstractionCollection->TimerService->GetTicksPerSecond() * 2);
	}
	
	void TachometerService::TogglePinTask(void *parameters)
	{
		TachometerService *service = ((TachometerService *) parameters);
		service->_pinStatus = !service->_pinStatus;
		service->_IOServiceCollection->HardwareAbstractionCollection->DigitalService->WritePin(service->_config->DigitalPin, service->_pinStatus);
		if (service->_IOServiceCollection->Decoder->GetRpm() < 1)
			service->_IOServiceCollection->HardwareAbstractionCollection->TimerService->ScheduleTask(service->TachometerTask, service->_ticksPerRpm / service->_IOServiceCollection->Decoder->GetRpm());
		else
			service->_IOServiceCollection->HardwareAbstractionCollection->TimerService->ScheduleTask(service->TachometerTask, service->_ticksPerRpm);
	}
}
#endif