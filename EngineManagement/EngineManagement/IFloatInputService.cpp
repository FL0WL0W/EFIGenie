#include "IFloatInputService.h"
#include "FloatInputService_Static.h"
#include "FloatInputService_AnalogPolynomial.h"
#include "FloatInputService_FrequencyPolynomial.h"

#ifdef IFLOATINPUTSERVICE_H
namespace IOService
{
	IFloatInputService* IFloatInputService::CreateFloatInputService(const HardwareAbstraction::HardwareAbstractionCollection *hardwareAbstractionCollection, void *config, unsigned int *size)
	{
		unsigned char inputServiceId = *((unsigned char*)config);
		switch (inputServiceId)
		{
		case 0:
			*size = 1;
			return 0;
#ifdef FLOATINPUTSERVICE_STATIC_H
		case 1:
			*size = 9;
			return new FloatInputService_Static(*((float *)((unsigned char*)config + 1)), *((float *)((unsigned char*)config + 1) + 1));
#endif
#ifdef FLOATINPUTSERVICE_ANALOGPOLYNOMIAL_H
		case 2:
			{
				FloatInputService_AnalogPolynomialConfig<4> *analogPolynomialConfig = FloatInputService_AnalogPolynomialConfig<4>::Cast((unsigned char*)config + 1);
				*size = 1 + analogPolynomialConfig->Size();
				return new FloatInputService_AnalogPolynomial<4>(hardwareAbstractionCollection, analogPolynomialConfig);
			}
#endif
#ifdef FLOATINPUTSERVICE_FREQUENCYPOLYNOMIAL_H
		case 3:
			{
				FloatInputService_FrequencyPolynomialConfig<4> *frequencyPolynomialConfig = FloatInputService_FrequencyPolynomialConfig<4>::Cast((unsigned char*)config + 1);
				*size = 1 + frequencyPolynomialConfig->Size();
				return new FloatInputService_FrequencyPolynomial<4>(hardwareAbstractionCollection, frequencyPolynomialConfig);
			}
#endif
		}
	}
}
#endif