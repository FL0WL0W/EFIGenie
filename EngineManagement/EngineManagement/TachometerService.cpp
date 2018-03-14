#include "Services.h"

#ifdef TachometerServiceExists
namespace EngineManagement
{
	TachometerService::TachometerService(void *config, bool highZ)
	{
		DigitalPin = *(unsigned char *)config;
		config = (void*)((unsigned char *)config + 1);
		
		unsigned char pulsesPer2Rpm = *(unsigned char *)config;
		config = (void*)((unsigned char *)config + 1);
		
		TicksPerRpm = (15 * CurrentTimerService->GetTicksPerSecond()) / pulsesPer2Rpm;
		
		PinHighZ = highZ;

		CurrentDigitalService->InitPin(DigitalPin, HardwareAbstraction::Out);
		CurrentDigitalService->WritePin(DigitalPin, false);
		
		TachometerTask = new HardwareAbstraction::Task(TachometerService::TogglePinTask, this, false);
		CurrentTimerService->ScheduleTask(TachometerTask, CurrentTimerService->GetTicksPerSecond() * 2);
	}
	
	void TachometerService::TogglePinTask(void *parameters)
	{
		TachometerService *service = ((TachometerService *) parameters);
		service->PinStatus = !service->PinStatus;
		CurrentDigitalService->WritePin(service->DigitalPin, service->PinStatus);
		if (CurrentDecoder->GetRpm() < 1)
			CurrentTimerService->ScheduleTask(service->TachometerTask, service->TicksPerRpm / CurrentDecoder->GetRpm());
		else
			CurrentTimerService->ScheduleTask(service->TachometerTask, service->TicksPerRpm);
	}
	
	TachometerService *CurrentTachometerService;
}
#endif