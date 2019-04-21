#include "EngineControlServices/CylinderAirTemperatureService/ICylinderAirTemperatureService.h"
#include "EngineControlServices/CylinderAirTemperatureService/CylinderAirTemperatureService_IAT_ECT_Bias.h"
#include "Service/EngineControlServicesServiceBuilderRegister.h"
#include "Service/IOServicesServiceBuilderRegister.h"
#include "Service/ServiceBuilder.h"
#include "Service/HardwareAbstractionServiceBuilder.h"

namespace EngineControlServices
{
	void ICylinderAirTemperatureService::CalculateCylinderAirTemperatureCallBack(void *cylinderAirTemperatureService)
	{
		((ICylinderAirTemperatureService*)cylinderAirTemperatureService)->CalculateCylinderAirTemperature();
	}
	
	void* ICylinderAirTemperatureService::CreateCylinderAirTemperatureService(const ServiceLocator * const &serviceLocator, const void *config, unsigned int &sizeOut)
	{
		sizeOut = 0;
		ICylinderAirTemperatureService *ret = 0;
		switch (ServiceBuilder::CastAndOffset<uint8_t>(config, sizeOut))
		{
#ifdef CYLINDERAIRTEMPERATURESERVICE_IAT_ECT_BIAS_H
		case 1:
			{
				const CylinderAirTemperatureService_IAT_ECT_BiasConfig *cylinderAirTemperatureServiceConfig = ServiceBuilder::CastConfigAndOffset < CylinderAirTemperatureService_IAT_ECT_BiasConfig >(config, sizeOut);
				ret = new CylinderAirTemperatureService_IAT_ECT_Bias(
					cylinderAirTemperatureServiceConfig,  
					serviceLocator->LocateAndCast<RpmService>(RPMSERVICE),
					serviceLocator->LocateAndCast<IFloatInputService>(BUILDER_IFLOATINPUTSERVICE, INSTANCE_INTAKE_AIR_TEMPERATURE),
					serviceLocator->LocateAndCast<IFloatInputService>(BUILDER_IFLOATINPUTSERVICE, INSTANCE_ENGINE_COOLANT_TEMPERATURE),
					serviceLocator);//try to avoid passing in serviceLocator. This means circular dependency which is bad. allowed here till i find a better solution/model
				break;
			}
#endif
		}
		
		serviceLocator->LocateAndCast<CallBackGroup>(TICK_CALL_BACK_GROUP)->AddIfParametersNotNull( 
			ICylinderAirTemperatureService::CalculateCylinderAirTemperatureCallBack,
			ret);
		
		return ret;
	}
}