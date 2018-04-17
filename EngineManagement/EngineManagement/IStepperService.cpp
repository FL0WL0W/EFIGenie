#include "IStepperService.h"
//#include "StepperService_StepDirectionControl.h"
//#include "StepperService_CoilControl.h"

#ifdef ISTEPPERSERVICE_H
namespace IOService
{
	IStepperService* IStepperService::CreateStepperService(const HardwareAbstraction::HardwareAbstractionCollection *hardwareAbstractionCollection, void *config)
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