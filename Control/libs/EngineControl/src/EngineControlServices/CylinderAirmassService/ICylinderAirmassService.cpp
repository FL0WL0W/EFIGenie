#include "EngineControlServices/CylinderAirmassService/ICylinderAirmassService.h"
#include "EngineControlServices/CylinderAirmassService/CylinderAirmassService_SD.h"
#include "Service/EngineControlServiceIds.h"
#include "Service/ServiceBuilder.h"
#include "Service/HardwareAbstractionServiceBuilder.h"

namespace EngineControlServices
{
	void ICylinderAirmassService::CalculateCylinderAirmassCallBack(void *cylinderAirmassService)
	{
		((ICylinderAirmassService*)cylinderAirmassService)->CalculateCylinderAirmass();
	}
	
	void* ICylinderAirmassService::CreateCylinderAirmassService(const ServiceLocator * const &serviceLocator, const void *config, unsigned int &sizeOut)
	{
		sizeOut = 0;
		ICylinderAirmassService *ret = 0;
		switch (ServiceBuilder::CastAndOffset<uint8_t>(config, sizeOut))
		{
#ifdef CYLINDERAIRMASSSERVICE_SD_H
		case 1:
			ret = new CylinderAirmassService_SD(
				ServiceBuilder::CastConfigAndOffset < CylinderAirmassService_SDConfig >(config, sizeOut),  
				serviceLocator->LocateAndCast<RpmService>(RPM_SERVICE_ID),
				serviceLocator->LocateAndCast<IFloatInputService>(BUILDER_IFLOATINPUTSERVICE, MANIFOLD_ABSOLUTE_PRESSURE_INSTANCE_ID),
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