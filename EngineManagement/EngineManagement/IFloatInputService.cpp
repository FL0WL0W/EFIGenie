#include "IFloatInputService.h"
#include "FloatInputService_Static.h"
#include "FloatInputService_AnalogPolynomial.h"
#include "FloatInputService_FrequencyPolynomial.h"

#ifdef IFLOATINPUTSERVICE_H
namespace IOService
{
	IFloatInputService* IFloatInputService::CreateFloatInputService(const HardwareAbstractionCollection *hardwareAbstractionCollection, void *config, unsigned int *size)
	{
		unsigned char inputServiceId = *((unsigned char*)config);
		config = ((unsigned char *)config + 1);
		*size = sizeof(unsigned char);
		
		switch (inputServiceId)
		{
		case 0:
			return 0;
			
#ifdef FLOATINPUTSERVICE_STATIC_H
		case 1:
			*size += 2 * sizeof(float);
			return new FloatInputService_Static(*((float *)config), *((float *)config + 1));
#endif
			
#ifdef FLOATINPUTSERVICE_ANALOGPOLYNOMIAL_H
		case 2:
			{
				FloatInputService_AnalogPolynomialConfig<4> *analogPolynomialConfig = FloatInputService_AnalogPolynomialConfig<4>::Cast(config);
				*size += analogPolynomialConfig->Size();
				return new FloatInputService_AnalogPolynomial<4>(hardwareAbstractionCollection, analogPolynomialConfig);
			}
#endif
			
#ifdef FLOATINPUTSERVICE_FREQUENCYPOLYNOMIAL_H
		case 3:
			{
				FloatInputService_FrequencyPolynomialConfig<4> *frequencyPolynomialConfig = FloatInputService_FrequencyPolynomialConfig<4>::Cast(config);
				*size += frequencyPolynomialConfig->Size();
				return new FloatInputService_FrequencyPolynomial<4>(hardwareAbstractionCollection, frequencyPolynomialConfig);
			}
#endif
		}
		
		return 0;
	}
}
#endif