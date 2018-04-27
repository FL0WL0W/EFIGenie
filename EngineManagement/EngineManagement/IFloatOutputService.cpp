#include "HardwareAbstractionCollection.h"
#include "IFloatOutputService.h"
#include "FloatOutputService_PwmPolynomial.h"
#include "FloatOutputService_StepperPolynomial.h"

#ifdef IFLOATOUTPUTSERVICE_H
namespace IOService
{
	IFloatOutputService* IFloatOutputService::CreateFloatOutputService(const HardwareAbstraction::HardwareAbstractionCollection *hardwareAbstractionCollection, void *config, unsigned int *size)
	{
		unsigned char idleAirControlValveServiceId = *((unsigned char*)config);
		config = ((unsigned char *)config + 1);
		*size = sizeof(unsigned char);
		
		switch (idleAirControlValveServiceId)
		{
		case 0:
			return 0;
			
#ifdef FLOATOUTPUTSERVICE_PWMPOLYNOMIAL_H
		case 1:
			{
				FloatOutputService_PwmPolynomialConfig<3> *pwmConfig = FloatOutputService_PwmPolynomialConfig<3>::Cast((unsigned char*)config);
				*size += pwmConfig->Size();
				return new FloatOutputService_PwmPolynomial<3>(hardwareAbstractionCollection, pwmConfig);
			}
#endif
			
#ifdef FLOATOUTPUTSERVICE_STEPPERPOLYNOMIAL_H
		case 2:
			{
				FloatOutputService_StepperPolynomialConfig<3> *stepperConfig = FloatOutputService_StepperPolynomialConfig<3>::Cast((unsigned char*)config);
				*size += stepperConfig->Size();
				return new FloatOutputService_StepperPolynomial<3>(hardwareAbstractionCollection, stepperConfig);
			}
#endif
		}
		
		return 0;
	}
}
#endif