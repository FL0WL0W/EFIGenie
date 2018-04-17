#include "TachometerService.h"
#include "ServiceBuilder.h"

#ifdef TACHOMETERSERVICE_H
namespace ApplicationService
{
	TachometerService::TachometerService(const TachometerServiceConfig *config, IBooleanOutputService *booleanOutputService, ITimerService *timerService, IDecoder *decoder)
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
	
	TachometerService *TachometerService::CreateTachometerService(ServiceLocator *serviceLocator, void *config, unsigned int *totalSize)
	{
#if defined(HARDWARE_ABSTRACTION_COLLECTION_ID) && defined(DECODER_SERVICE_ID)
		TachometerServiceConfig *tachometerConfig = TachometerServiceConfig::Cast(config);
		config = (void *)((unsigned char *)config + tachometerConfig->Size());
		*totalSize += tachometerConfig->Size();
		
		HardwareAbstractionCollection *hardwareAbstractionCollection = (HardwareAbstractionCollection*)serviceLocator->Locate(HARDWARE_ABSTRACTION_COLLECTION_ID) ;
		if (hardwareAbstractionCollection == 0)
			return 0;
		
		unsigned int size;
		IBooleanOutputService *booleanOutputService = IBooleanOutputService::CreateBooleanOutputService(hardwareAbstractionCollection, config, &size, BOOLEANOUTPUTSERVICE_HIGHZ);
		config = (void *)((unsigned char *)config + size);
		*totalSize += size;
		if (booleanOutputService == 0)
			return 0;
		
		ITimerService *timerService = hardwareAbstractionCollection->TimerService;
		if (timerService == 0)
			return 0;
		
		IDecoder *decoder = (IDecoder *)serviceLocator->Locate(DECODER_SERVICE_ID);
		if (decoder == 0)
			return 0;
		
		return new TachometerService(tachometerConfig, booleanOutputService, timerService, decoder);
#else		return 0
#endif
	}
}
#endif