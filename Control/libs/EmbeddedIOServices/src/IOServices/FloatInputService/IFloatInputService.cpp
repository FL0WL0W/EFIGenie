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
		reinterpret_cast<IFloatInputService *>(floatInputService)->ReadValue();
	}

	IFloatInputService* IFloatInputService::CreateFloatInputService(const HardwareAbstractionCollection *hardwareAbstractionCollection, const void *config, uint32_t *sizeOut)
	{
		const uint8_t inputServiceId = *reinterpret_cast<const uint8_t *>(config);
		config = reinterpret_cast<const uint8_t *>(config) + 1;
		*sizeOut = sizeof(uint8_t);
		
		IFloatInputService *inputService = 0;

		switch (inputServiceId)
		{
#ifdef FLOATINPUTSERVICE_STATIC_H
		case 1:
			*sizeOut += 2 * sizeof(float);
			inputService = new FloatInputService_Static(*reinterpret_cast<const float *>(config), *(reinterpret_cast<const float *>(config) + 1));
			break;
#endif
			
#ifdef FLOATINPUTSERVICE_ANALOGPOLYNOMIAL_H
		case 2:
			{
				const FloatInputService_AnalogPolynomialConfig<4> *analogPolynomialConfig = reinterpret_cast<const FloatInputService_AnalogPolynomialConfig<4> *>(config);
				*sizeOut += analogPolynomialConfig->Size();
				inputService = new FloatInputService_AnalogPolynomial<4>(hardwareAbstractionCollection, analogPolynomialConfig);
				break;
			}
#endif
			
#ifdef FLOATINPUTSERVICE_FREQUENCYPOLYNOMIAL_H
		case 3:
			{
				const FloatInputService_FrequencyPolynomialConfig<4> *frequencyPolynomialConfig = reinterpret_cast<const FloatInputService_FrequencyPolynomialConfig<4> *>(config);
				*sizeOut += frequencyPolynomialConfig->Size();
				inputService = new FloatInputService_FrequencyPolynomial<4>(hardwareAbstractionCollection, frequencyPolynomialConfig);
				break;
			}
#endif

#ifdef FLOATINPUTSERVICE_ANALOGINTERPOLATEDTABLE_H
		case 4:
			{
				const FloatInputService_AnalogInterpolatedTableConfig *analogInterpolatedTableConfig = reinterpret_cast<const FloatInputService_AnalogInterpolatedTableConfig *>(config);
				*sizeOut += analogInterpolatedTableConfig->Size();
				inputService = new FloatInputService_AnalogInterpolatedTable(hardwareAbstractionCollection, analogInterpolatedTableConfig);
				break;
			}
#endif

#ifdef FLOATINPUTSERVICE_FREQUENCYINTERPOLATEDTABLE_H
		case 5:
			{
				const FloatInputService_FrequencyInterpolatedTableConfig *frequencyInterpolatedTableConfig = reinterpret_cast<const FloatInputService_FrequencyInterpolatedTableConfig *>(config);
				*sizeOut += frequencyInterpolatedTableConfig->Size();
				inputService = new FloatInputService_FrequencyInterpolatedTable(hardwareAbstractionCollection, frequencyInterpolatedTableConfig);
				break;
			}
#endif

#ifdef FLOATINPUTSERVICE_FAULTDETECTIONWRAPPER_H
		case 6:
			{
				const FloatInputService_FaultDetectionWrapperConfig *faultDetectionConfig = reinterpret_cast<const FloatInputService_FaultDetectionWrapperConfig *>(config);
				*sizeOut += faultDetectionConfig->Size();
				config = reinterpret_cast<const uint8_t *>(config) + faultDetectionConfig->Size();
				uint32_t childSize = 0;
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
