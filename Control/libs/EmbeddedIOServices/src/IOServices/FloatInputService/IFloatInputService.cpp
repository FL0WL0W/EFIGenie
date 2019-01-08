#include "IOServices/FloatInputService/IFloatInputService.h"
#include "IOServices/FloatInputService/FloatInputService_Static.h"
#include "IOServices/FloatInputService/FloatInputService_AnalogPolynomial.h"
#include "IOServices/FloatInputService/FloatInputService_AnalogInterpolatedTable.h"
#include "IOServices/FloatInputService/FloatInputService_FrequencyPolynomial.h"
#include "IOServices/FloatInputService/FloatInputService_FrequencyInterpolatedTable.h"
#include "IOServices/FloatInputService/FloatInputService_FaultDetectionWrapper.h"

#ifdef IFLOATINPUTSERVICE_H
namespace IOServices
{
	void IFloatInputService::ReadValueCallBack(void *floatInputService)
	{
		((IFloatInputService *)floatInputService)->ReadValue();
	}

	IFloatInputService* IFloatInputService::CreateFloatInputService(const HardwareAbstractionCollection *hardwareAbstractionCollection, void *config, unsigned int *sizeOut)
	{
		unsigned char inputServiceId = *((unsigned char*)config);
		config = ((unsigned char *)config + 1);
		*sizeOut = sizeof(unsigned char);
		
		IFloatInputService *inputService = 0;

		switch (inputServiceId)
		{
#ifdef FLOATINPUTSERVICE_STATIC_H
		case 1:
			*sizeOut += 2 * sizeof(float);
			inputService = new FloatInputService_Static(*((float *)config), *((float *)config + 1));
			break;
#endif
			
#ifdef FLOATINPUTSERVICE_ANALOGPOLYNOMIAL_H
		case 2:
			{
				FloatInputService_AnalogPolynomialConfig<4> *analogPolynomialConfig = FloatInputService_AnalogPolynomialConfig<4>::Cast(config);
				*sizeOut += analogPolynomialConfig->Size();
				inputService = new FloatInputService_AnalogPolynomial<4>(hardwareAbstractionCollection, analogPolynomialConfig);
				break;
			}
#endif
			
#ifdef FLOATINPUTSERVICE_FREQUENCYPOLYNOMIAL_H
		case 3:
			{
				FloatInputService_FrequencyPolynomialConfig<4> *frequencyPolynomialConfig = FloatInputService_FrequencyPolynomialConfig<4>::Cast(config);
				*sizeOut += frequencyPolynomialConfig->Size();
				inputService = new FloatInputService_FrequencyPolynomial<4>(hardwareAbstractionCollection, frequencyPolynomialConfig);
				break;
			}
#endif

#ifdef FLOATINPUTSERVICE_ANALOGINTERPOLATEDTABLE_H
		case 4:
			{
				FloatInputService_AnalogInterpolatedTableConfig *analogInterpolatedTableConfig = FloatInputService_AnalogInterpolatedTableConfig::Cast(config);
				*sizeOut += analogInterpolatedTableConfig->Size();
				inputService = new FloatInputService_AnalogInterpolatedTable(hardwareAbstractionCollection, analogInterpolatedTableConfig);
				break;
			}
#endif

#ifdef FLOATINPUTSERVICE_FREQUENCYINTERPOLATEDTABLE_H
		case 5:
			{
				FloatInputService_FrequencyInterpolatedTableConfig *frequencyInterpolatedTableConfig = FloatInputService_FrequencyInterpolatedTableConfig::Cast(config);
				*sizeOut += frequencyInterpolatedTableConfig->Size();
				inputService = new FloatInputService_FrequencyInterpolatedTable(hardwareAbstractionCollection, frequencyInterpolatedTableConfig);
				break;
			}
#endif

#ifdef FLOATINPUTSERVICE_FAULTDETECTIONWRAPPER_H
		case 6:
			{
				FloatInputService_FaultDetectionWrapperConfig *faultDetectionConfig = FloatInputService_FaultDetectionWrapperConfig::Cast(config);
				*sizeOut += faultDetectionConfig->Size();
				config = (void*)((unsigned char *)config + faultDetectionConfig->Size());
				unsigned int childSize = 0;
				IFloatInputService *child = CreateFloatInputService(hardwareAbstractionCollection, config, &childSize);
				*sizeOut += childSize;
				inputService = new FloatInputService_FaultDetectionWrapper(faultDetectionConfig, child);
				break;
			}
#endif
		}
		
		return inputService;
	}
}
#endif