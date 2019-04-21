#include "EngineControlServices/CylinderAirmassService/ICylinderAirmassService.h"
#include "EngineControlServices/CylinderAirmassService/CylinderAirmassService_SD.h"
#include "Service/EngineControlServicesServiceBuilderRegister.h"
#include "Service/IOServicesServiceBuilderRegister.h"
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
			{
				const CylinderAirmassService_SDConfig *cylinderAirmassServiceConfig = ServiceBuilder::CastConfigAndOffset < CylinderAirmassService_SDConfig >(config, sizeOut);
				ret = new CylinderAirmassService_SD(
					cylinderAirmassServiceConfig,  
					serviceLocator->LocateAndCast<RpmService>(RPMSERVICE),
					serviceLocator->LocateAndCast<IFloatInputService>(BUILDER_IFLOATINPUTSERVICE, INSTANCE_MANIFOLD_ABSOLUTE_PRESSURE),
					serviceLocator->LocateAndCast<ICylinderAirTemperatureService>(BUILDER_ICYLINDERAIRTEMPERATURESERVICE, 0));
				break;
			}
#endif
		}
		
		serviceLocator->LocateAndCast<CallBackGroup>(TICK_CALL_BACK_GROUP)->AddIfParametersNotNull( 
			ICylinderAirmassService::CalculateCylinderAirmassCallBack,
			ret);
		
		return ret;
	}
}