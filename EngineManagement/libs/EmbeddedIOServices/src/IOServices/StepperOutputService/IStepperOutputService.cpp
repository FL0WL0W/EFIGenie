#include "IOServices/StepperOutputService/IStepperOutputService.h"

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
#ifdef STEPPERSERVICE_STEPDIRECTIONCONTROL_H
		case 1:
			outputService = new StepperService_StepDirectionControl(config);
#endif
			
#ifdef STEPPERSERVICE_COILCONTROL_H
		case 2:
			outputService = new StepperService_CoilControl(config);
#endif
		}
		
		return outputService;
	}
}
#endif