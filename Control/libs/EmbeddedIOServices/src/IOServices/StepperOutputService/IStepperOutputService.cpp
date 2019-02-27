#include "IOServices/StepperOutputService/IStepperOutputService.h"
#include "IOServices/StepperOutputService/StepperOutputService_StepDirectionControl.h"
#include "IOServices/StepperOutputService/StepperOutputService_FullStepControl.h"
#include "IOServices/StepperOutputService/StepperOutputService_HalfStepControl.h"

#ifdef ISTEPPEROUTPUTSERVICE_H
namespace IOServices
{
	IStepperOutputService* IStepperOutputService::CreateStepperOutputService(const HardwareAbstraction::HardwareAbstractionCollection *hardwareAbstractionCollection, const void *config, uint32_t *sizeOut)
	{
		const uint8_t stepperServiceId = *reinterpret_cast<const uint8_t *>(config);
		config = reinterpret_cast<const uint8_t *>(config) + 1;
		*sizeOut = sizeof(uint8_t);
		
		IStepperOutputService *outputService = 0;
		
		switch (stepperServiceId)
		{
#ifdef STEPPEROUTPUTSERVICE_STEPDIRECTIONCONTROL_H
		case 1:
			{
				const StepperOutputService_StepDirectionControlConfig *stepperConfig = reinterpret_cast<const StepperOutputService_StepDirectionControlConfig *>(config);
				*sizeOut += stepperConfig->Size();

				config = reinterpret_cast<const uint8_t *>(config) + stepperConfig->Size();
				uint32_t subSize = 0;
				IBooleanOutputService *stepBooleanOutputService = IBooleanOutputService::CreateBooleanOutputService(hardwareAbstractionCollection, config, &subSize);
				*sizeOut += subSize;

				config = reinterpret_cast<const uint8_t *>(config) + subSize;
				IBooleanOutputService *directionBooleanOutputService = IBooleanOutputService::CreateBooleanOutputService(hardwareAbstractionCollection, config, &subSize);
				*sizeOut += subSize;

				outputService = new StepperOutputService_StepDirectionControl(hardwareAbstractionCollection, stepperConfig, stepBooleanOutputService, directionBooleanOutputService);
				break;
			}
#endif
			
#ifdef STEPPEROUTPUTSERVICE_FULLSTEPCONTROL_H
		case 2:
			{
				const StepperOutputService_FullStepControlConfig *stepperConfig = reinterpret_cast<const StepperOutputService_FullStepControlConfig *>(config);
				*sizeOut += stepperConfig->Size();

				config = reinterpret_cast<const uint8_t *>(config) + stepperConfig->Size();
				uint32_t subSize = 0;
				IBooleanOutputService *coilAPlusBooleanOutputService = IBooleanOutputService::CreateBooleanOutputService(hardwareAbstractionCollection, config, &subSize);
				*sizeOut += subSize;

				config = reinterpret_cast<const uint8_t *>(config) + subSize;
				IBooleanOutputService *coilAMinusBooleanOutputService = IBooleanOutputService::CreateBooleanOutputService(hardwareAbstractionCollection, config, &subSize);
				*sizeOut += subSize;

				config = reinterpret_cast<const uint8_t *>(config) + subSize;
				IBooleanOutputService *coilBPlusBooleanOutputService = IBooleanOutputService::CreateBooleanOutputService(hardwareAbstractionCollection, config, &subSize);
				*sizeOut += subSize;

				config = reinterpret_cast<const uint8_t *>(config) + subSize;
				IBooleanOutputService *coilBMinusBooleanOutputService = IBooleanOutputService::CreateBooleanOutputService(hardwareAbstractionCollection, config, &subSize);
				*sizeOut += subSize;

				outputService = new StepperOutputService_FullStepControl(hardwareAbstractionCollection, stepperConfig, coilAPlusBooleanOutputService, coilAMinusBooleanOutputService, coilBPlusBooleanOutputService, coilBMinusBooleanOutputService);
				break;
			}
#endif
			
#ifdef STEPPEROUTPUTSERVICE_HALFSTEPCONTROL_H
		case 3:
			{
				const StepperOutputService_HalfStepControlConfig *stepperConfig = reinterpret_cast<const StepperOutputService_HalfStepControlConfig *>(config);
				*sizeOut += stepperConfig->Size();

				config = reinterpret_cast<const uint8_t *>(config) + stepperConfig->Size();
				uint32_t subSize = 0;
				IBooleanOutputService *coilAPlusBooleanOutputService = IBooleanOutputService::CreateBooleanOutputService(hardwareAbstractionCollection, config, &subSize);
				*sizeOut += subSize;

				config = reinterpret_cast<const uint8_t *>(config) + subSize;
				IBooleanOutputService *coilAMinusBooleanOutputService = IBooleanOutputService::CreateBooleanOutputService(hardwareAbstractionCollection, config, &subSize);
				*sizeOut += subSize;

				config = reinterpret_cast<const uint8_t *>(config) + subSize;
				IBooleanOutputService *coilBPlusBooleanOutputService = IBooleanOutputService::CreateBooleanOutputService(hardwareAbstractionCollection, config, &subSize);
				*sizeOut += subSize;

				config = reinterpret_cast<const uint8_t *>(config) + subSize;
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
