#include "stdlib.h"
#include "Service/TransmissionControlServiceBuilder.h"

namespace Service
{
	ServiceLocator *TransmissionControlServiceBuilder::CreateServices(ServiceLocator *serviceLocator, const HardwareAbstractionCollection *hardwareAbstractionCollection, void *config, unsigned int *totalSize)
	{
		if(serviceLocator == 0)
			serviceLocator = new ServiceLocator();

		serviceLocator->Register(HARDWARE_ABSTRACTION_COLLECTION_ID, (void *)hardwareAbstractionCollection);
		serviceLocator->Register(ANALOG_SERVICE_ID, (void *)hardwareAbstractionCollection->AnalogService);
		serviceLocator->Register(DIGITAL_SERVICE_ID, (void *)hardwareAbstractionCollection->DigitalService);
		serviceLocator->Register(PWM_SERVICE_ID, (void *)hardwareAbstractionCollection->PwmService);
		serviceLocator->Register(TIMER_SERVICE_ID, (void *)hardwareAbstractionCollection->TimerService);
		
		//create callback groups
		CallBackGroup *preDecoderCallBackGroup = new CallBackGroup();
		serviceLocator->Register(PRE_DECODER_SYNC_CALL_BACK_GROUP, (void *)preDecoderCallBackGroup);
		CallBackGroup *postDecoderCallBackGroup = new CallBackGroup();
		serviceLocator->Register(POST_DECODER_SYNC_CALL_BACK_GROUP, (void *)postDecoderCallBackGroup);
		CallBackGroup *tickCallBackGroup = new CallBackGroup();
		serviceLocator->Register(TICK_CALL_BACK_GROUP, (void *)tickCallBackGroup);

		*totalSize = 0;
		unsigned int size;
		unsigned short serviceId;

		while ((serviceId = *(unsigned short *)config) != 0)
		{
			config = (void *)((unsigned short *)config + 1);
			*totalSize += 2;

			switch (serviceId)
			{
#if INTAKE_AIR_TEMPERATURE_SERVICE_ID
			case INTAKE_AIR_TEMPERATURE_SERVICE_ID:
#endif
#if ENGINE_COOLANT_TEMPERATURE_SERVICE_ID
			case ENGINE_COOLANT_TEMPERATURE_SERVICE_ID:
#endif
#if MANIFOLD_ABSOLUTE_PRESSURE_SERVICE_ID
			case MANIFOLD_ABSOLUTE_PRESSURE_SERVICE_ID:
#endif
#if VOLTAGE_SERVICE_ID
			case VOLTAGE_SERVICE_ID:
#endif
#if THROTTLE_POSITION_SERVICE_ID
			case THROTTLE_POSITION_SERVICE_ID:
#endif
#if ETHANOL_CONTENT_SERVICE_ID
			case ETHANOL_CONTENT_SERVICE_ID:
#endif
#if VEHICLE_SPEED_SERVICE_ID
			case VEHICLE_SPEED_SERVICE_ID:
#endif
				{
					IFloatInputService *floatInputService = IFloatInputService::CreateFloatInputService(hardwareAbstractionCollection, config, &size);
					tickCallBackGroup->Add(IFloatInputService::ReadValueCallBack, floatInputService);
					serviceLocator->Register(serviceId, floatInputService);
					config = (void *)((unsigned char *)config + size);
					*totalSize += size;
					break;
				}
#if DECODER_SERVICE_ID
			case DECODER_SERVICE_ID:
				{
					serviceLocator->Register(serviceId, CreateDecoderService(serviceLocator, config, &size));
					config = (void *)((unsigned char *)config + size);
					*totalSize += size;
					break;
				}
#endif
			}
		}

		return serviceLocator;
	}
	
	ICrankCamDecoder *TransmissionControlServiceBuilder::CreateDecoderService(ServiceLocator *serviceLocator, void *config, unsigned int *totalSize)
	{
		ICrankCamDecoder *ret = 0;
		
		switch (GetServiceId(&config, totalSize))
		{
#ifdef GM24XDECODER_H
		case 1:
			ret = new Gm24xDecoder((ITimerService*)serviceLocator->Locate(TIMER_SERVICE_ID));
			break;
#endif
		}
		return ret;
	}
}