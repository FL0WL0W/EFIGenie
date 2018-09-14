#include "IOServices/FloatOutputService/IFloatOutputService.h"
#include "IOServices/FloatOutputService/FloatOutputService_PwmPolynomial.h"
#include "IOServices/FloatOutputService/FloatOutputService_StepperPolynomial.h"

#ifdef IFLOATOUTPUTSERVICE_H
namespace IOServices
{
	IFloatOutputService* IFloatOutputService::CreateFloatOutputService(const HardwareAbstraction::HardwareAbstractionCollection *hardwareAbstractionCollection, void *config, unsigned int *size)
	{
		unsigned char outputServiceId = *((unsigned char*)config);
		config = ((unsigned char *)config + 1);
		*size = sizeof(unsigned char);
		
		IFloatOutputService *outputService = 0;
		
		switch (outputServiceId)
		{
#ifdef FLOATOUTPUTSERVICE_PWMPOLYNOMIAL_H
		case 1:
			{
				FloatOutputService_PwmPolynomialConfig<3> *pwmConfig = FloatOutputService_PwmPolynomialConfig<3>::Cast((unsigned char*)config);
				*size += pwmConfig->Size();
				outputService = new FloatOutputService_PwmPolynomial<3>(hardwareAbstractionCollection, pwmConfig);
				break;
			}
#endif
			
#ifdef FLOATOUTPUTSERVICE_STEPPERPOLYNOMIAL_H
		case 2:
			{
				FloatOutputService_StepperPolynomialConfig<3> *stepperConfig = FloatOutputService_StepperPolynomialConfig<3>::Cast((unsigned char*)config);
				*size += stepperConfig->Size();
				outputService = new FloatOutputService_StepperPolynomial<3>(hardwareAbstractionCollection, stepperConfig);
				break;
			}
#endif
		}
		
		return outputService;
	}
}
#endif