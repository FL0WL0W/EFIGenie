#include "HardwareAbstractionCollection.h"
#include "IFloatOutputService.h"
#include "FloatOutputService_PwmPolynomial.h"
#include "FloatOutputService_StepperPolynomial.h"

#ifdef IFLOATOUTPUTSERVICE_H
namespace IOServiceLayer
{
	IFloatOutputService* IFloatOutputService::CreateFloatOutputService(const HardwareAbstraction::HardwareAbstractionCollection *hardwareAbstractionCollection, void *config)
	{
		unsigned char idleAirControlValveServiceId = *((unsigned char*)config);
		switch (idleAirControlValveServiceId)
		{
		case 0:
			return 0;
#ifdef IdleAirControlValveService_PwmExists
		case 1:
			return new IdleAirControlValveService_Pwm<3>(IdleAirControlValveService_PwmConfig<3>::Cast((unsigned char*)config + 1));
#endif
#ifdef IdleAirControlValveService_StepperExists
		case 2:
			return new IdleAirControlValveService_Stepper<3>(IdleAirControlValveService_StepperConfig<3>::Cast((unsigned char*)config + 1));
#endif
		}
	}
}
#endif