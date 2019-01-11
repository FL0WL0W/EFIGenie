#include "stdlib.h"
#include "Service/TransmissionControlServiceBuilder.h"

namespace Service
{
	ServiceLocator *TransmissionControlServiceBuilder::CreateServices(ServiceLocator *serviceLocator, const HardwareAbstractionCollection *hardwareAbstractionCollection, void *config, unsigned int *totalSize)
	{
		if(serviceLocator == 0)
			serviceLocator = new ServiceLocator();
		
		if(serviceLocator->Locate(HARDWARE_ABSTRACTION_COLLECTION_ID) == 0)
			serviceLocator->Register(HARDWARE_ABSTRACTION_COLLECTION_ID, (void *)hardwareAbstractionCollection);
		if(serviceLocator->Locate(ANALOG_SERVICE_ID) == 0)
			serviceLocator->Register(ANALOG_SERVICE_ID, (void *)hardwareAbstractionCollection->AnalogService);
		if(serviceLocator->Locate(DIGITAL_SERVICE_ID) == 0)
			serviceLocator->Register(DIGITAL_SERVICE_ID, (void *)hardwareAbstractionCollection->DigitalService);
		if(serviceLocator->Locate(PWM_SERVICE_ID) == 0)
			serviceLocator->Register(PWM_SERVICE_ID, (void *)hardwareAbstractionCollection->PwmService);
		if(serviceLocator->Locate(TIMER_SERVICE_ID) == 0)
			serviceLocator->Register(TIMER_SERVICE_ID, (void *)hardwareAbstractionCollection->TimerService);
		
		//create callback groups
		if(serviceLocator->Locate(PRE_DECODER_SYNC_CALL_BACK_GROUP) == 0)
			serviceLocator->Register(PRE_DECODER_SYNC_CALL_BACK_GROUP, (void *)new CallBackGroup());
		if(serviceLocator->Locate(POST_DECODER_SYNC_CALL_BACK_GROUP) == 0)
			serviceLocator->Register(POST_DECODER_SYNC_CALL_BACK_GROUP, (void *)new CallBackGroup());
		if(serviceLocator->Locate(TICK_CALL_BACK_GROUP) == 0)
			serviceLocator->Register(TICK_CALL_BACK_GROUP, (void *)new CallBackGroup());

		CallBackGroup *preDecoderCallBackGroup = (CallBackGroup *)serviceLocator->Locate(PRE_DECODER_SYNC_CALL_BACK_GROUP);
		CallBackGroup *postDecoderCallBackGroup = (CallBackGroup *)serviceLocator->Locate(POST_DECODER_SYNC_CALL_BACK_GROUP);
		CallBackGroup *tickCallBackGroup = (CallBackGroup *)serviceLocator->Locate(TICK_CALL_BACK_GROUP);

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
#if SHIFT_SERVICE_ID
			case SHIFT_SERVICE_ID:
				{
					serviceLocator->Register(serviceId, CreateShiftService(serviceLocator, config, &size)); //needs BooleanOutputService, TimerService and Decoder
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

	IShiftService *TransmissionControlServiceBuilder::CreateShiftService(ServiceLocator *serviceLocator, void *config, unsigned int *totalSize)
	{
		IShiftService *ret = 0;
		
		switch (GetServiceId(&config, totalSize))
		{
#ifdef SHIFTSERVICE_SOLENOID_H
		case 1:
			{
				ShiftService_SolenoidConfig* shiftConfig = (ShiftService_SolenoidConfig *)config;
				config = (void *)((unsigned char *)config + shiftConfig->Size());
				*totalSize+= shiftConfig->Size();

				HardwareAbstractionCollection *hardwareAbstractionCollection = (HardwareAbstractionCollection *)serviceLocator->Locate(HARDWARE_ABSTRACTION_COLLECTION_ID);

				IBooleanOutputService **serviceArray = (IBooleanOutputService **)malloc(sizeof(IBooleanOutputService *)*(shiftConfig->Solenoids));
				for (int i = 0; i < shiftConfig->Solenoids; i++)
				{
					unsigned int size = 0;
					serviceArray[i] = IBooleanOutputService::CreateBooleanOutputService(hardwareAbstractionCollection, config, &size);
					config = (void *)((unsigned char *)config + size);
					*totalSize += size;
				}

				ret = new ShiftService_Solenoid(
					shiftConfig,
					serviceArray);
			}
			break;
#endif
		}
		return ret;
	}

	IGearControlService *TransmissionControlServiceBuilder::CreateGearControlService(ServiceLocator *serviceLocator, void *config, unsigned int *totalSize)
	{
		IGearControlService *ret = 0;
		
		switch (GetServiceId(&config, totalSize))
		{
#ifdef GEARCONTROLSERVICE_BUTTONSHIFT_H
		case 1:
				IButtonService *buttonServiceUp = CreateButtonService(serviceLocator, &config, totalSize);
				IButtonService *buttonServiceDown = CreateButtonService(serviceLocator, &config, totalSize);

				*totalSize += sizeof(unsigned char);
				ret = new GearControlService_ButtonShift(*((unsigned char *)config),(IShiftService*)serviceLocator->Locate(GEAR_CONTROL_SERVICE_ID), buttonServiceUp, buttonServiceDown);
			break;
#endif
		}
		return ret;
	}
}