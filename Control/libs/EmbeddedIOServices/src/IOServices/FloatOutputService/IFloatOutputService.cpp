#include "IOServices/FloatOutputService/IFloatOutputService.h"
#include "IOServices/FloatOutputService/FloatOutputService_PwmPolynomial.h"
#include "IOServices/FloatOutputService/FloatOutputService_PwmInterpolatedTable.h"
#include "IOServices/FloatOutputService/FloatOutputService_StepperPolynomial.h"
#include "IOServices/FloatOutputService/FloatOutputService_StepperInterpolatedTable.h"

#ifdef IFLOATOUTPUTSERVICE_H
namespace IOServices
{
	IFloatOutputService* IFloatOutputService::CreateFloatOutputService(const HardwareAbstraction::HardwareAbstractionCollection *hardwareAbstractionCollection, const void *config, unsigned int *sizeOut)
	{
		const unsigned char outputServiceId = *reinterpret_cast<const unsigned char *>(config);
		config = reinterpret_cast<const unsigned char *>(config) + 1;
		*sizeOut = sizeof(unsigned char);
		
		IFloatOutputService *outputService = 0;
		
		switch (outputServiceId)
		{
#ifdef FLOATOUTPUTSERVICE_PWMPOLYNOMIAL_H
		case 1:
			{
				const FloatOutputService_PwmPolynomialConfig<4> *pwmConfig = reinterpret_cast<const FloatOutputService_PwmPolynomialConfig<4> *>(config);
				*sizeOut += pwmConfig->Size();
				outputService = new FloatOutputService_PwmPolynomial<4>(hardwareAbstractionCollection, pwmConfig);
				break;
			}
#endif
			
#ifdef FLOATOUTPUTSERVICE_STEPPERPOLYNOMIAL_H
		case 2:
			{
				const FloatOutputService_StepperPolynomialConfig<4> *stepperConfig = reinterpret_cast<const FloatOutputService_StepperPolynomialConfig<4> *>(config);
				*sizeOut += stepperConfig->Size();
				config = (void*)((unsigned char *)config + stepperConfig->Size());
				unsigned int stepperSize = 0;
				IStepperOutputService *stepperService = IStepperOutputService::CreateStepperOutputService(hardwareAbstractionCollection, config, &stepperSize);
				*sizeOut += stepperSize;
				outputService = new FloatOutputService_StepperPolynomial<4>(stepperConfig, stepperService);
				break;
			}
#endif

#ifdef FLOATOUTPUTSERVICE_PWMINTERPOLATEDTABLE_H
		case 3:
			{
				const FloatOutputService_PwmInterpolatedTableConfig *pwmConfig = reinterpret_cast<const FloatOutputService_PwmInterpolatedTableConfig *>(config);
				*sizeOut += pwmConfig->Size();
				outputService = new FloatOutputService_PwmInterpolatedTable(hardwareAbstractionCollection, pwmConfig);
				break;
			}
#endif

#ifdef FLOATOUTPUTSERVICE_STEPPERINTERPOLATEDTABLE_H
		case 4:
			{
				const FloatOutputService_StepperInterpolatedTableConfig *stepperConfig = reinterpret_cast<const FloatOutputService_StepperInterpolatedTableConfig *>(config);
				*sizeOut += stepperConfig->Size();
				config = (void*)((unsigned char *)config + stepperConfig->Size());
				unsigned int stepperSize = 0;
				IStepperOutputService *stepperService = IStepperOutputService::CreateStepperOutputService(hardwareAbstractionCollection, config, &stepperSize);
				*sizeOut += stepperSize;
				outputService = new FloatOutputService_StepperInterpolatedTable(stepperConfig, stepperService);
				break;
			}
#endif
		}
		
		return outputService;
	}
}
#endif
