#include "EngineControlServices/CylinderAirmassService/ICylinderAirmassService.h"
#include "EngineControlServices/CylinderAirmassService/CylinderAirmassService_SD.h"
#include "Service/EngineControlServiceIds.h"
#include "Service/ServiceBuilder.h"

namespace EngineControlServices
{
	void ICylinderAirmassService::CalculateCylinderAirmassCallBack(void *cylinderAirmassService)
	{
		((ICylinderAirmassService*)cylinderAirmassService)->CalculateCylinderAirmass();
	}
	
	void* ICylinderAirmassService::CreateCylinderAirmassService(const ServiceLocator * const &serviceLocator, const void *config, unsigned int &sizeOut)
	{
		ICylinderAirmassService *ret = 0;
		switch (ServiceBuilder::GetServiceTypeId(config, sizeOut))
		{
#ifdef CYLINDERAIRMASSSERVICE_SD_H
		case 1:
			ret = new CylinderAirmassService_SD(
				ServiceBuilder::CastConfig < CylinderAirmassService_SDConfig >(config, sizeOut),  
				serviceLocator->LocateAndCast<RpmService>(RPM_SERVICE_ID),
				serviceLocator->LocateAndCast<IFloatInputService>(MANIFOLD_ABSOLUTE_PRESSURE_SERVICE_ID),
				serviceLocator->LocateAndCast<IFloatInputService>(INTAKE_AIR_TEMPERATURE_SERVICE_ID),
				serviceLocator->LocateAndCast<IFloatInputService>(ENGINE_COOLANT_TEMPERATURE_SERVICE_ID),
				serviceLocator->LocateAndCast<ICylinderAirTemperatureService>(CYLINDER_AIR_TEMPERATURE_SERVICE_ID));
			break;
#endif
		}
		
		serviceLocator->LocateAndCast<CallBackGroup>(TICK_CALL_BACK_GROUP)->AddIfParametersNotNull( 
			ICylinderAirmassService::CalculateCylinderAirmassCallBack,
			ret);
		
		return ret;
	}
}