#include "EngineControlServices/CylinderAirTemperatureService/ICylinderAirTemperatureService.h"
#include "EngineControlServices/CylinderAirTemperatureService/CylinderAirTemperatureService_IAT_ECT_Bias.h"
#include "Service/EngineControlServiceIds.h"
#include "Service/ServiceBuilder.h"

namespace EngineControlServices
{
	void ICylinderAirTemperatureService::CalculateCylinderAirTemperatureCallBack(void *cylinderAirTemperatureService)
	{
		((ICylinderAirTemperatureService*)cylinderAirTemperatureService)->CalculateCylinderAirTemperature();
	}
	
	void* ICylinderAirTemperatureService::CreateCylinderAirTemperatureService(const ServiceLocator * const &serviceLocator, const void *config, unsigned int &sizeOut)
	{
		ICylinderAirTemperatureService *ret = 0;
		switch (ServiceBuilder::GetServiceTypeId(config, sizeOut))
		{
#ifdef CYLINDERAIRTEMPERATURESERVICE_IAT_ECT_BIAS_H
		case 1:
			ret = new CylinderAirTemperatureService_IAT_ECT_Bias(
				ServiceBuilder::CastConfig < CylinderAirTemperatureService_IAT_ECT_BiasConfig >(config, sizeOut),  
				serviceLocator->LocateAndCast<RpmService>(RPM_SERVICE_ID),
				serviceLocator->LocateAndCast<IFloatInputService>(INTAKE_AIR_TEMPERATURE_SERVICE_ID),
				serviceLocator->LocateAndCast<IFloatInputService>(ENGINE_COOLANT_TEMPERATURE_SERVICE_ID),
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