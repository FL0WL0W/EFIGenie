// #include "IOServices/StepperOutputService/IStepperOutputService.h"
// #include "IOServices/StepperOutputService/StepperOutputService_StepDirectionControl.h"
// #include "IOServices/StepperOutputService/StepperOutputService_FullStepControl.h"
// #include "IOServices/StepperOutputService/StepperOutputService_HalfStepControl.h"
// #include "IOServices/StepperOutputService/StepperOutputService_StaticStepCalibrationWrapper.h"
// #include "Service/HardwareAbstractionServiceBuilder.h"
// #include "Service/IService.h"

// using namespace HardwareAbstraction;
// using namespace Service;

// #ifdef ISTEPPEROUTPUTSERVICE_H
// namespace IOServices
// {
// 	void IStepperOutputService::BuildStepperOutputService(ServiceLocator * const &serviceLocator, const void *config, unsigned int &sizeOut)
// 	{
// 		uint8_t instanceId = IService::CastAndOffset<uint8_t>(config, sizeOut);

// 		IStepperOutputService *outputService = CreateStepperOutputService(serviceLocator->LocateAndCast<const HardwareAbstractionCollection>(HARDWARE_ABSTRACTION_COLLECTION_ID), config, sizeOut);

// 		serviceLocator->RegisterIfNotNull(2, instanceId, outputService);
// 	}

// 	IStepperOutputService* IStepperOutputService::CreateStepperOutputService(const ServiceLocator * const &serviceLocator, const void *config, unsigned int &sizeOut)
// 	{
// 		return CreateStepperOutputService(serviceLocator->LocateAndCast<const HardwareAbstractionCollection>(HARDWARE_ABSTRACTION_COLLECTION_ID), config, sizeOut);
// 	}
	
// 	IStepperOutputService* IStepperOutputService::CreateStepperOutputService(const HardwareAbstraction::HardwareAbstractionCollection *hardwareAbstractionCollection, const void *config, unsigned int &sizeOut)
// 	{	
// 		IStepperOutputService *outputService = 0;
		
// 		switch (IService::CastAndOffset<uint8_t>(config, sizeOut))
// 		{
// #ifdef STEPPEROUTPUTSERVICE_STEPDIRECTIONCONTROL_H
// 		case 1:
// 			{
// 				const StepperOutputService_StepDirectionControlConfig *stepperConfig = reinterpret_cast<const StepperOutputService_StepDirectionControlConfig *>(config);
// 				sizeOut += stepperConfig->Size();

// 				config = reinterpret_cast<const uint8_t *>(config) + stepperConfig->Size();
// 				unsigned int subSize = 0;
// 				IBooleanOutputService *stepBooleanOutputService = IBooleanOutputService::CreateBooleanOutputService(hardwareAbstractionCollection, config, subSize);
// 				sizeOut += subSize;

// 				config = reinterpret_cast<const uint8_t *>(config) + subSize;
// 				IBooleanOutputService *directionBooleanOutputService = IBooleanOutputService::CreateBooleanOutputService(hardwareAbstractionCollection, config, subSize);
// 				sizeOut += subSize;

// 				outputService = new StepperOutputService_StepDirectionControl(hardwareAbstractionCollection, stepperConfig, stepBooleanOutputService, directionBooleanOutputService);
// 				break;
// 			}
// #endif
			
// #ifdef STEPPEROUTPUTSERVICE_FULLSTEPCONTROL_H
// 		case 2:
// 			{
// 				const StepperOutputService_FullStepControlConfig *stepperConfig = reinterpret_cast<const StepperOutputService_FullStepControlConfig *>(config);
// 				sizeOut += stepperConfig->Size();

// 				config = reinterpret_cast<const uint8_t *>(config) + stepperConfig->Size();
// 				unsigned int subSize = 0;
// 				IBooleanOutputService *coilAPlusBooleanOutputService = IBooleanOutputService::CreateBooleanOutputService(hardwareAbstractionCollection, config, subSize);
// 				sizeOut += subSize;

// 				config = reinterpret_cast<const uint8_t *>(config) + subSize;
// 				IBooleanOutputService *coilAMinusBooleanOutputService = IBooleanOutputService::CreateBooleanOutputService(hardwareAbstractionCollection, config, subSize);
// 				sizeOut += subSize;

// 				config = reinterpret_cast<const uint8_t *>(config) + subSize;
// 				IBooleanOutputService *coilBPlusBooleanOutputService = IBooleanOutputService::CreateBooleanOutputService(hardwareAbstractionCollection, config, subSize);
// 				sizeOut += subSize;

// 				config = reinterpret_cast<const uint8_t *>(config) + subSize;
// 				IBooleanOutputService *coilBMinusBooleanOutputService = IBooleanOutputService::CreateBooleanOutputService(hardwareAbstractionCollection, config, subSize);
// 				sizeOut += subSize;

// 				outputService = new StepperOutputService_FullStepControl(hardwareAbstractionCollection, stepperConfig, coilAPlusBooleanOutputService, coilAMinusBooleanOutputService, coilBPlusBooleanOutputService, coilBMinusBooleanOutputService);
// 				break;
// 			}
// #endif
			
// #ifdef STEPPEROUTPUTSERVICE_HALFSTEPCONTROL_H
// 		case 3:
// 			{
// 				const StepperOutputService_HalfStepControlConfig *stepperConfig = reinterpret_cast<const StepperOutputService_HalfStepControlConfig *>(config);
// 				sizeOut += stepperConfig->Size();

// 				config = reinterpret_cast<const uint8_t *>(config) + stepperConfig->Size();
// 				unsigned int subSize = 0;
// 				IBooleanOutputService *coilAPlusBooleanOutputService = IBooleanOutputService::CreateBooleanOutputService(hardwareAbstractionCollection, config, subSize);
// 				sizeOut += subSize;

// 				config = reinterpret_cast<const uint8_t *>(config) + subSize;
// 				IBooleanOutputService *coilAMinusBooleanOutputService = IBooleanOutputService::CreateBooleanOutputService(hardwareAbstractionCollection, config, subSize);
// 				sizeOut += subSize;

// 				config = reinterpret_cast<const uint8_t *>(config) + subSize;
// 				IBooleanOutputService *coilBPlusBooleanOutputService = IBooleanOutputService::CreateBooleanOutputService(hardwareAbstractionCollection, config, subSize);
// 				sizeOut += subSize;

// 				config = reinterpret_cast<const uint8_t *>(config) + subSize;
// 				IBooleanOutputService *coilBMinusBooleanOutputService = IBooleanOutputService::CreateBooleanOutputService(hardwareAbstractionCollection, config, subSize);
// 				sizeOut += subSize;

// 				outputService = new StepperOutputService_HalfStepControl(hardwareAbstractionCollection, stepperConfig, coilAPlusBooleanOutputService, coilAMinusBooleanOutputService, coilBPlusBooleanOutputService, coilBMinusBooleanOutputService);
// 				break;
// 			}
// #endif
			
// #ifdef STEPPEROUTPUTSERVICE_STEPDIRECTIONCONTROL_H
// 		case 4:
// 			{
// 				const StepperOutputService_StaticStepCalibrationWrapperConfig *stepperConfig = reinterpret_cast<const StepperOutputService_StaticStepCalibrationWrapperConfig *>(config);
// 				sizeOut += stepperConfig->Size();

// 				config = reinterpret_cast<const uint8_t *>(config) + stepperConfig->Size();
// 				unsigned int subSize = 0;
// 				IStepperOutputService *child = IStepperOutputService::CreateStepperOutputService(hardwareAbstractionCollection, config, subSize);
// 				sizeOut += subSize;

// 				outputService = new StepperOutputService_StaticStepCalibrationWrapper(stepperConfig, child);
// 				break;
// 			}
// #endif
// 		}
		
// 		return outputService;
// 	}
// }
// #endif
