#include "IStepperOutputService.h"
//#include "StepperService_StepDirectionControl.h"
//#include "StepperService_CoilControl.h"

#ifdef ISTEPPEROUTPUTSERVICE_H
namespace IOService
{
	IStepperOutputService* IStepperOutputService::CreateStepperOutputService(const HardwareAbstraction::HardwareAbstractionCollection *hardwareAbstractionCollection, void *config, unsigned int *size)
	{
		unsigned char stepperServiceId = *((unsigned char*)config);
		switch (stepperServiceId)
		{
		case 0:
			return 0;
#ifdef STEPPERSERVICE_STEPDIRECTIONCONTROL_H
		case 1:
			return new StepperService_StepDirectionControl((void*)((unsigned char*)config + 1));
#endif
#ifdef STEPPERSERVICE_COILCONTROL_H
		case 2:
			return new StepperService_CoilControl((void*)((unsigned char*)config + 1));
#endif
		}
	}
}
#endif