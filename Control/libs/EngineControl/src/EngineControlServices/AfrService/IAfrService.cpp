#include "EngineControlServices/AfrService/IAfrService.h"
#include "Service/EngineControlServiceIds.h"
#include "Service/ServiceBuilder.h"
#include "Service/HardwareAbstractionServiceBuilder.h"
#include "EngineControlServices/AfrService/AfrService_Static.h"
#include "EngineControlServices/AfrService/AfrService_Map_Ethanol.h"

namespace EngineControlServices
{
	void IAfrService::CalculateAfrCallBack(void *afrService)
	{
		((IAfrService*)afrService)->CalculateAfr();
	}
	
	void* IAfrService::CreateAfrService(const ServiceLocator * const &serviceLocator, const void *config, unsigned int &sizeOut)
	{		
		sizeOut = 0;
		IAfrService *ret = 0;
		switch (ServiceBuilder::CastAndOffset<uint8_t>(config, sizeOut))
		{
#ifdef AFRSERVICE_STATIC_H
		case 1:
			sizeOut += sizeof(const float);
			ret = new AfrService_Static(*reinterpret_cast<const float *>(config));
			break;
#endif
#ifdef AFRSERVICE_MAP_ETHANOL_H
		case 2:
			ret = new AfrService_Map_Ethanol(
				ServiceBuilder::CastConfigAndOffset < AfrService_Map_EthanolConfig >(config, sizeOut),  
				serviceLocator->LocateAndCast<ITimerService>(TIMER_SERVICE_ID),
				serviceLocator->LocateAndCast<RpmService>(RPM_SERVICE_ID),
				serviceLocator->LocateAndCast<IFloatInputService>(BUILDER_IFLOATINPUTSERVICE, MANIFOLD_ABSOLUTE_PRESSURE_INSTANCE_ID),
				serviceLocator->LocateAndCast<IFloatInputService>(BUILDER_IFLOATINPUTSERVICE, ENGINE_COOLANT_TEMPERATURE_INSTANCE_ID),
				serviceLocator->LocateAndCast<IFloatInputService>(BUILDER_IFLOATINPUTSERVICE, ETHANOL_CONTENT_INSTANCE_ID),
				serviceLocator->LocateAndCast<IFloatInputService>(BUILDER_IFLOATINPUTSERVICE, THROTTLE_POSITION_INSTANCE_ID));
			break;
#endif
		}
		
		serviceLocator->LocateAndCast<CallBackGroup>(TICK_CALL_BACK_GROUP)->AddIfParametersNotNull( 
			IAfrService::CalculateAfrCallBack,
			ret);
		
		return ret;
	}
}