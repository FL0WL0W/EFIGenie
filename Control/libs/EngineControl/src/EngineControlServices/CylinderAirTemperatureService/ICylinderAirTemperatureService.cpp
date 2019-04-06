#include "EngineControlServices/CylinderAirTemperatureService/ICylinderAirTemperatureService.h"
#include "EngineControlServices/CylinderAirTemperatureService/CylinderAirTemperatureService_IAT_ECT_Bias.h"
#include "Service/EngineControlServiceIds.h"
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
			ret = new CylinderAirTemperatureService_IAT_ECT_Bias(
				ServiceBuilder::CastConfigAndOffset < CylinderAirTemperatureService_IAT_ECT_BiasConfig >(config, sizeOut),  
				serviceLocator->LocateAndCast<RpmService>(RPM_SERVICE_ID),
				serviceLocator->LocateAndCast<IFloatInputService>(BUILDER_IFLOATINPUTSERVICE, INTAKE_AIR_TEMPERATURE_INSTANCE_ID),
				serviceLocator->LocateAndCast<IFloatInputService>(BUILDER_IFLOATINPUTSERVICE, ENGINE_COOLANT_TEMPERATURE_INSTANCE_ID),
				serviceLocator);//try to avoid passing in serviceLocator. This means circular dependency which is bad. allowed here till i find a better solution/model
			break;
#endif
		}
		
		serviceLocator->LocateAndCast<CallBackGroup>(TICK_CALL_BACK_GROUP)->AddIfParametersNotNull( 
			ICylinderAirTemperatureService::CalculateCylinderAirTemperatureCallBack,
			ret);
		
		return ret;
	}
}