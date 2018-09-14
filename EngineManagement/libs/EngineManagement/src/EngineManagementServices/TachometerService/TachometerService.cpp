#include "EngineManagementServices/TachometerService/TachometerService.h"

#ifdef TACHOMETERSERVICE_H
namespace EngineManagementServices
{
	TachometerService::TachometerService(const TachometerServiceConfig *config, IBooleanOutputService *booleanOutputService, ITimerService *timerService, ICrankCamDecoder *decoder)
	{
		_config = config;
		_booleanOutputService = booleanOutputService;
		_timerService = timerService;
		_decoder = decoder;
				
		_ticksPerRpm = (15 * _timerService->GetTicksPerSecond()) / _config->PulsesPer2Rpm;
		
		_booleanOutputService = booleanOutputService;
		
		TachometerTask = new HardwareAbstraction::Task(TachometerService::TogglePinTask, this, false);
		_timerService->ScheduleTask(TachometerTask, _timerService->GetTicksPerSecond() * 2);
	}
	
	void TachometerService::TogglePinTask(void *parameters)
	{
		TachometerService *service = ((TachometerService *) parameters);
		service->_pinStatus = !service->_pinStatus;
		service->_booleanOutputService->OutputWrite(service->_pinStatus);
		if (service->_decoder->GetRpm() < 1)
			service->_timerService->ScheduleTask(service->TachometerTask, service->_ticksPerRpm / service->_decoder->GetRpm());
		else
			service->_timerService->ScheduleTask(service->TachometerTask, service->_ticksPerRpm);
	}
}
#endif