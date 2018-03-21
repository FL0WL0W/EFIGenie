#include "Services.h"
//#include "StepperService_StepDirectionControl.h"
//#include "StepperService_CoilControl.h"

#ifdef IStepperServiceExists
namespace EngineManagement
{
	IStepperService* CreateStepperService(void *config)
	{
		unsigned char stepperServiceId = *((unsigned char*)config);
		switch (stepperServiceId)
		{
		case 0:
			return 0;
#ifdef StepperService_StepDirectionControlExists
		case 1:
			return new StepperService_StepDirectionControl((void*)((unsigned char*)config + 1));
#endif
#ifdef StepperService_CoilControlExists
		case 2:
			return new StepperService_CoilControl((void*)((unsigned char*)config + 1));
#endif
		}
	}
}
#endif