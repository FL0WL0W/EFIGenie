#include "EngineControlServices/TachometerService/TachometerService.h"
#include "Service/EngineControlServicesServiceBuilderRegister.h"
#include "Service/ServiceBuilder.h"
#include "Service/HardwareAbstractionServiceBuilder.h"

#ifdef TACHOMETERSERVICE_H
namespace EngineControlServices
{
	TachometerService::TachometerService(const TachometerServiceConfig *config, IBooleanOutputService *booleanOutputService, ITimerService *timerService, RpmService *rpmService)
	{
		_config = config;
		_booleanOutputService = booleanOutputService;
		_timerService = timerService;
		_rpmService = rpmService;
				
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
		if (service->_rpmService->Rpm < 1)
			service->_timerService->ScheduleTask(service->TachometerTask, service->_ticksPerRpm / service->_rpmService->Rpm);
		else
			service->_timerService->ScheduleTask(service->TachometerTask, service->_ticksPerRpm);
	}
	
	void *TachometerService::CreateTachometerService(const ServiceLocator * const &serviceLocator, const void *config, unsigned int &sizeOut)
	{		
		sizeOut = 0;
				
		return new TachometerService(
			ServiceBuilder::CastConfigAndOffset < TachometerServiceConfig >(config, sizeOut),
			ServiceBuilder::CreateServiceAndOffset<IBooleanOutputService>(IBooleanOutputService::BuildBooleanOutputService, serviceLocator, config, sizeOut),
			serviceLocator->LocateAndCast<ITimerService>(TIMER_SERVICE_ID),
			serviceLocator->LocateAndCast<RpmService>(RPMSERVICE));
	}
}
#endif