#include "IOServices/FloatInputService/IFloatInputService.h"
#include "IOServices/FloatInputService/FloatInputService_Static.h"
#include "IOServices/FloatInputService/FloatInputService_AnalogPolynomial.h"
#include "IOServices/FloatInputService/FloatInputService_FrequencyPolynomial.h"

#ifdef IFLOATINPUTSERVICE_H
namespace IOServices
{
	void IFloatInputService::ReadValueCallBack(void *floatInputService)
	{
		((IFloatInputService *)floatInputService)->ReadValue();
	}

	IFloatInputService* IFloatInputService::CreateFloatInputService(const HardwareAbstractionCollection *hardwareAbstractionCollection, void *config, unsigned int *size)
	{
		unsigned char inputServiceId = *((unsigned char*)config);
		config = ((unsigned char *)config + 1);
		*size = sizeof(unsigned char);
		
		IFloatInputService *inputService = 0;

		switch (inputServiceId)
		{
#ifdef FLOATINPUTSERVICE_STATIC_H
		case 1:
			*size += 2 * sizeof(float);
			inputService = new FloatInputService_Static(*((float *)config), *((float *)config + 1));
			break;
#endif
			
#ifdef FLOATINPUTSERVICE_ANALOGPOLYNOMIAL_H
		case 2:
			{
				FloatInputService_AnalogPolynomialConfig<4> *analogPolynomialConfig = FloatInputService_AnalogPolynomialConfig<4>::Cast(config);
				*size += analogPolynomialConfig->Size();
				inputService = new FloatInputService_AnalogPolynomial<4>(hardwareAbstractionCollection, analogPolynomialConfig);
				break;
			}
#endif
			
#ifdef FLOATINPUTSERVICE_FREQUENCYPOLYNOMIAL_H
		case 3:
			{
				FloatInputService_FrequencyPolynomialConfig<4> *frequencyPolynomialConfig = FloatInputService_FrequencyPolynomialConfig<4>::Cast(config);
				*size += frequencyPolynomialConfig->Size();
				inputService = new FloatInputService_FrequencyPolynomial<4>(hardwareAbstractionCollection, frequencyPolynomialConfig);
				break;
			}
#endif
		}
		
		return inputService;
	}
}
#endif