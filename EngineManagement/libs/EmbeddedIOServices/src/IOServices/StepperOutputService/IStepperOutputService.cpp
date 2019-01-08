#include "IOServices/StepperOutputService/IStepperOutputService.h"
#include "IOServices/StepperOutputService/StepperOutputService_StepDirectionControl.h"
#include "IOServices/StepperOutputService/StepperOutputService_FullStepControl.h"
#include "IOServices/StepperOutputService/StepperOutputService_HalfStepControl.h"

#ifdef ISTEPPEROUTPUTSERVICE_H
namespace IOServices
{
	IStepperOutputService* IStepperOutputService::CreateStepperOutputService(const HardwareAbstraction::HardwareAbstractionCollection *hardwareAbstractionCollection, void *config, unsigned int *sizeOut)
	{
		unsigned char stepperServiceId = *((unsigned char*)config);
		config = ((unsigned char *)config + 1);
		*sizeOut = sizeof(unsigned char);
		
		IStepperOutputService *outputService = 0;
		
		switch (stepperServiceId)
		{
#ifdef STEPPEROUTPUTSERVICE_STEPDIRECTIONCONTROL_H
		case 1:
			{
				StepperOutputService_StepDirectionControlConfig *stepperConfig = StepperOutputService_StepDirectionControlConfig::Cast(config);
				*sizeOut += stepperConfig->Size();

				config = (void*)((unsigned char *)config + stepperConfig->Size());
				unsigned int subSize = 0;
				IBooleanOutputService *stepBooleanOutputService = IBooleanOutputService::CreateBooleanOutputService(hardwareAbstractionCollection, config, &subSize);
				*sizeOut += subSize;

				config = (void*)((unsigned char *)config + subSize);
				IBooleanOutputService *directionBooleanOutputService = IBooleanOutputService::CreateBooleanOutputService(hardwareAbstractionCollection, config, &subSize);
				*sizeOut += subSize;

				outputService = new StepperOutputService_StepDirectionControl(hardwareAbstractionCollection, stepperConfig, stepBooleanOutputService, directionBooleanOutputService);
				break;
			}
#endif
			
#ifdef STEPPEROUTPUTSERVICE_FULLSTEPCONTROL_H
		case 2:
			{
				StepperOutputService_FullStepControlConfig *stepperConfig = StepperOutputService_FullStepControlConfig::Cast(config);
				*sizeOut += stepperConfig->Size();

				config = (void*)((unsigned char *)config + stepperConfig->Size());
				unsigned int subSize = 0;
				IBooleanOutputService *coilAPlusBooleanOutputService = IBooleanOutputService::CreateBooleanOutputService(hardwareAbstractionCollection, config, &subSize);
				*sizeOut += subSize;

				config = (void*)((unsigned char *)config + subSize);
				IBooleanOutputService *coilAMinusBooleanOutputService = IBooleanOutputService::CreateBooleanOutputService(hardwareAbstractionCollection, config, &subSize);
				*sizeOut += subSize;

				config = (void*)((unsigned char *)config + subSize);
				IBooleanOutputService *coilBPlusBooleanOutputService = IBooleanOutputService::CreateBooleanOutputService(hardwareAbstractionCollection, config, &subSize);
				*sizeOut += subSize;

				config = (void*)((unsigned char *)config + subSize);
				IBooleanOutputService *coilBMinusBooleanOutputService = IBooleanOutputService::CreateBooleanOutputService(hardwareAbstractionCollection, config, &subSize);
				*sizeOut += subSize;

				outputService = new StepperOutputService_FullStepControl(hardwareAbstractionCollection, stepperConfig, coilAPlusBooleanOutputService, coilAMinusBooleanOutputService, coilBPlusBooleanOutputService, coilBMinusBooleanOutputService);
				break;
			}
#endif
			
#ifdef STEPPEROUTPUTSERVICE_HALFSTEPCONTROL_H
		case 3:
			{
				StepperOutputService_HalfStepControlConfig *stepperConfig = StepperOutputService_HalfStepControlConfig::Cast(config);
				*sizeOut += stepperConfig->Size();

				config = (void*)((unsigned char *)config + stepperConfig->Size());
				unsigned int subSize = 0;
				IBooleanOutputService *coilAPlusBooleanOutputService = IBooleanOutputService::CreateBooleanOutputService(hardwareAbstractionCollection, config, &subSize);
				*sizeOut += subSize;

				config = (void*)((unsigned char *)config + subSize);
				IBooleanOutputService *coilAMinusBooleanOutputService = IBooleanOutputService::CreateBooleanOutputService(hardwareAbstractionCollection, config, &subSize);
				*sizeOut += subSize;

				config = (void*)((unsigned char *)config + subSize);
				IBooleanOutputService *coilBPlusBooleanOutputService = IBooleanOutputService::CreateBooleanOutputService(hardwareAbstractionCollection, config, &subSize);
				*sizeOut += subSize;

				config = (void*)((unsigned char *)config + subSize);
				IBooleanOutputService *coilBMinusBooleanOutputService = IBooleanOutputService::CreateBooleanOutputService(hardwareAbstractionCollection, config, &subSize);
				*sizeOut += subSize;

				outputService = new StepperOutputService_HalfStepControl(hardwareAbstractionCollection, stepperConfig, coilAPlusBooleanOutputService, coilAMinusBooleanOutputService, coilBPlusBooleanOutputService, coilBMinusBooleanOutputService);
				break;
			}
#endif
		}
		
		return outputService;
	}
}
#endif